import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { normalizeOptionalText, normalizeText } from 'src/common/utils/normalizers';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateEntryDto } from './dto/create-entry.dto';
import { ListEntriesQueryDto } from './dto/list-entries-query.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

const entryInclude = {
  product: {
    include: {
      category: true,
      subcategory: true,
      images: {
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      },
    },
  },
} satisfies Prisma.SaleEntryInclude;

@Injectable()
export class EntriesService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(query: ListEntriesQueryDto) {
    const where: Prisma.SaleEntryWhereInput = {
      productId: query.productId,
      paymentMethod: query.paymentMethod,
      status: query.status,
    };

    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        { product: { title: { contains: query.search, mode: 'insensitive' } } },
        { product: { code: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prismaService.saleEntry.findMany({
      where,
      include: entryInclude,
      orderBy: [{ soldAt: 'desc' }, { createdAt: 'desc' }],
      take: query.limit ?? 50,
      skip: query.offset ?? 0,
    });
  }

  async create(createEntryDto: CreateEntryDto) {
    await this.assertProductExists(createEntryDto.productId);

    return this.prismaService.saleEntry.create({
      data: {
        productId: createEntryDto.productId,
        quantity: createEntryDto.quantity,
        unitPrice: createEntryDto.unitPrice,
        totalAmount: this.calculateTotal(createEntryDto.quantity, createEntryDto.unitPrice),
        paymentMethod: normalizeText(createEntryDto.paymentMethod),
        status: normalizeOptionalText(createEntryDto.status) ?? 'paid',
        customerName: normalizeOptionalText(createEntryDto.customerName),
        notes: normalizeOptionalText(createEntryDto.notes),
        soldAt: new Date(createEntryDto.soldAt),
      },
      include: entryInclude,
    });
  }

  async update(id: string, updateEntryDto: UpdateEntryDto) {
    const entry = await this.findByIdOrThrow(id);

    if (updateEntryDto.productId !== undefined) {
      await this.assertProductExists(updateEntryDto.productId);
    }

    const quantity = updateEntryDto.quantity ?? entry.quantity;
    const unitPrice = updateEntryDto.unitPrice ?? Number(entry.unitPrice);

    return this.prismaService.saleEntry.update({
      where: { id },
      data: {
        ...(updateEntryDto.productId !== undefined && {
          productId: updateEntryDto.productId,
        }),
        ...(updateEntryDto.quantity !== undefined && {
          quantity: updateEntryDto.quantity,
        }),
        ...(updateEntryDto.unitPrice !== undefined && {
          unitPrice: updateEntryDto.unitPrice,
        }),
        ...(updateEntryDto.quantity !== undefined || updateEntryDto.unitPrice !== undefined
          ? { totalAmount: this.calculateTotal(quantity, unitPrice) }
          : {}),
        ...(updateEntryDto.paymentMethod !== undefined && {
          paymentMethod: normalizeText(updateEntryDto.paymentMethod),
        }),
        ...(updateEntryDto.status !== undefined && {
          status: normalizeText(updateEntryDto.status),
        }),
        ...(Object.prototype.hasOwnProperty.call(updateEntryDto, 'customerName') && {
          customerName: normalizeOptionalText(updateEntryDto.customerName),
        }),
        ...(Object.prototype.hasOwnProperty.call(updateEntryDto, 'notes') && {
          notes: normalizeOptionalText(updateEntryDto.notes),
        }),
        ...(updateEntryDto.soldAt !== undefined && {
          soldAt: new Date(updateEntryDto.soldAt),
        }),
      },
      include: entryInclude,
    });
  }

  async remove(id: string) {
    await this.findByIdOrThrow(id);

    await this.prismaService.saleEntry.delete({
      where: { id },
    });
  }

  private async findByIdOrThrow(id: string) {
    const entry = await this.prismaService.saleEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(`Sale entry with id "${id}" was not found.`);
    }

    return entry;
  }

  private async assertProductExists(productId: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" was not found.`);
    }
  }

  private calculateTotal(quantity: number, unitPrice: number) {
    return Number((quantity * unitPrice).toFixed(2));
  }
}
