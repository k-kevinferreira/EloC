import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { normalizeCode, normalizeOptionalText, normalizeText } from 'src/common/utils/normalizers';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ListShipmentsQueryDto } from './dto/list-shipments-query.dto';
import { ShipmentItemInputDto } from './dto/shipment-item-input.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

const shipmentInclude = {
  items: {
    include: {
      product: {
        include: {
          category: true,
          subcategory: true,
          images: {
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  },
  expenses: {
    orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
  },
} satisfies Prisma.ShipmentInclude;

@Injectable()
export class ShipmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(query: ListShipmentsQueryDto) {
    const where: Prisma.ShipmentWhereInput = {};

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { supplier: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prismaService.shipment.findMany({
      where,
      include: shipmentInclude,
      orderBy: [{ shipmentDate: 'desc' }, { createdAt: 'desc' }],
      take: query.limit ?? 50,
      skip: query.offset ?? 0,
    });
  }

  async create(createShipmentDto: CreateShipmentDto) {
    await this.assertCodeAvailable(createShipmentDto.code);
    const normalizedItems = await this.normalizeItems(createShipmentDto.items);

    return this.prismaService.shipment.create({
      data: {
        code: normalizeCode(createShipmentDto.code),
        supplier: normalizeText(createShipmentDto.supplier),
        shipmentDate: this.toDateOnly(createShipmentDto.shipmentDate),
        totalCost: this.calculateShipmentTotal(normalizedItems),
        notes: normalizeOptionalText(createShipmentDto.notes),
        items: {
          create: normalizedItems,
        },
      },
      include: shipmentInclude,
    });
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto) {
    const shipment = await this.findByIdOrThrow(id);

    if (
      updateShipmentDto.code !== undefined &&
      normalizeCode(updateShipmentDto.code) !== shipment.code
    ) {
      await this.assertCodeAvailable(updateShipmentDto.code, shipment.id);
    }

    const normalizedItems =
      updateShipmentDto.items !== undefined
        ? await this.normalizeItems(updateShipmentDto.items)
        : null;

    return this.prismaService.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id },
        data: {
          ...(updateShipmentDto.code !== undefined && {
            code: normalizeCode(updateShipmentDto.code),
          }),
          ...(updateShipmentDto.supplier !== undefined && {
            supplier: normalizeText(updateShipmentDto.supplier),
          }),
          ...(updateShipmentDto.shipmentDate !== undefined && {
            shipmentDate: this.toDateOnly(updateShipmentDto.shipmentDate),
          }),
          ...(Object.prototype.hasOwnProperty.call(updateShipmentDto, 'notes') && {
            notes: normalizeOptionalText(updateShipmentDto.notes),
          }),
          ...(normalizedItems !== null && {
            totalCost: this.calculateShipmentTotal(normalizedItems),
          }),
        },
      });

      if (normalizedItems !== null) {
        await tx.shipmentItem.deleteMany({
          where: { shipmentId: id },
        });

        await tx.shipmentItem.createMany({
          data: normalizedItems.map((item) => ({
            shipmentId: id,
            ...item,
          })),
        });
      }

      return tx.shipment.findUniqueOrThrow({
        where: { id },
        include: shipmentInclude,
      });
    });
  }

  async remove(id: string) {
    const shipment = await this.prismaService.shipment.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with id "${id}" was not found.`);
    }

    if (shipment._count.expenses > 0) {
      throw new ConflictException(
        'Shipment cannot be removed while it still has related expenses.',
      );
    }

    await this.prismaService.shipment.delete({
      where: { id },
    });
  }

  private async findByIdOrThrow(id: string) {
    const shipment = await this.prismaService.shipment.findUnique({
      where: { id },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with id "${id}" was not found.`);
    }

    return shipment;
  }

  private async assertCodeAvailable(code: string, currentShipmentId?: string) {
    const existingShipment = await this.prismaService.shipment.findUnique({
      where: { code: normalizeCode(code) },
      select: { id: true },
    });

    if (existingShipment && existingShipment.id !== currentShipmentId) {
      throw new ConflictException(`Shipment code "${code}" is already in use.`);
    }
  }

  private async normalizeItems(items: ShipmentItemInputDto[]): Promise<NormalizedShipmentItem[]> {
    if (items.length === 0) {
      throw new BadRequestException('Provide at least one shipment item.');
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await this.prismaService.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
      },
    });
    const existingProductIds = new Set(products.map((product) => product.id));
    const missingProductId = productIds.find((productId) => !existingProductIds.has(productId));

    if (missingProductId) {
      throw new NotFoundException(`Product with id "${missingProductId}" was not found.`);
    }

    return items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: this.calculateItemTotal(item.quantity, item.unitCost),
    }));
  }

  private calculateItemTotal(quantity: number, unitCost: number) {
    return Number((quantity * unitCost).toFixed(2));
  }

  private calculateShipmentTotal(items: NormalizedShipmentItem[]) {
    return Number(
      items.reduce((total, item) => total + Number(item.totalCost), 0).toFixed(2),
    );
  }

  private toDateOnly(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }
}

type NormalizedShipmentItem = {
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};
