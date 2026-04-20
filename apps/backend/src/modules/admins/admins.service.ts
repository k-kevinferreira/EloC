import { Injectable } from '@nestjs/common';
import { Admin } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

export type SafeAdmin = Omit<Admin, 'passwordHash'>;

const safeAdminSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AdminsService {
  constructor(private readonly prismaService: PrismaService) {}

  findByEmail(email: string) {
    return this.prismaService.admin.findUnique({
      where: { email },
    });
  }

  findSafeById(id: string) {
    return this.prismaService.admin.findUnique({
      where: { id },
      select: safeAdminSelect,
    });
  }

  toSafeAdmin(admin: Admin): SafeAdmin {
    const { passwordHash, ...safeAdmin } = admin;

    return safeAdmin;
  }
}
