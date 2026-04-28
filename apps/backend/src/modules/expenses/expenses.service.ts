import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { normalizeOptionalText, normalizeText } from 'src/common/utils/normalizers';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

const expenseInclude = {
  shipment: true,
} satisfies Prisma.ExpenseInclude;

@Injectable()
export class ExpensesService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(query: ListExpensesQueryDto) {
    const where: Prisma.ExpenseWhereInput = {
      shipmentId: query.shipmentId,
      type: query.type,
    };

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        { shipment: { code: { contains: query.search, mode: 'insensitive' } } },
        { shipment: { supplier: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prismaService.expense.findMany({
      where,
      include: expenseInclude,
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
      take: query.limit ?? 50,
      skip: query.offset ?? 0,
    });
  }

  async create(createExpenseDto: CreateExpenseDto) {
    const shipmentId = await this.resolveShipmentId(createExpenseDto.shipmentId);

    return this.prismaService.expense.create({
      data: {
        shipmentId,
        type: normalizeText(createExpenseDto.type),
        description: normalizeText(createExpenseDto.description),
        amount: createExpenseDto.amount,
        expenseDate: this.toDateOnly(createExpenseDto.expenseDate),
        notes: normalizeOptionalText(createExpenseDto.notes),
      },
      include: expenseInclude,
    });
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findByIdOrThrow(id);
    const shipmentId = Object.prototype.hasOwnProperty.call(updateExpenseDto, 'shipmentId')
      ? await this.resolveShipmentId(updateExpenseDto.shipmentId)
      : undefined;

    return this.prismaService.expense.update({
      where: { id },
      data: {
        ...(Object.prototype.hasOwnProperty.call(updateExpenseDto, 'shipmentId') && {
          shipmentId,
        }),
        ...(updateExpenseDto.type !== undefined && {
          type: normalizeText(updateExpenseDto.type),
        }),
        ...(updateExpenseDto.description !== undefined && {
          description: normalizeText(updateExpenseDto.description),
        }),
        ...(updateExpenseDto.amount !== undefined && {
          amount: updateExpenseDto.amount,
        }),
        ...(updateExpenseDto.expenseDate !== undefined && {
          expenseDate: this.toDateOnly(updateExpenseDto.expenseDate),
        }),
        ...(Object.prototype.hasOwnProperty.call(updateExpenseDto, 'notes') && {
          notes: normalizeOptionalText(updateExpenseDto.notes),
        }),
      },
      include: expenseInclude,
    });
  }

  async remove(id: string) {
    await this.findByIdOrThrow(id);

    await this.prismaService.expense.delete({
      where: { id },
    });
  }

  private async findByIdOrThrow(id: string) {
    const expense = await this.prismaService.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with id "${id}" was not found.`);
    }

    return expense;
  }

  private async resolveShipmentId(shipmentId: string | null | undefined) {
    const normalizedShipmentId = normalizeOptionalText(shipmentId);

    if (!normalizedShipmentId) {
      return null;
    }

    const shipment = await this.prismaService.shipment.findUnique({
      where: { id: normalizedShipmentId },
      select: { id: true },
    });

    if (!shipment) {
      throw new NotFoundException(
        `Shipment with id "${normalizedShipmentId}" was not found.`,
      );
    }

    return shipment.id;
  }

  private toDateOnly(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }
}
