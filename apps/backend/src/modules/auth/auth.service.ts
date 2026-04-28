import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

import { AdminsService } from '../admins/admins.service';

import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const admin = await this.adminsService.findByEmail(loginDto.email);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await compare(loginDto.password, admin.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      admin: this.adminsService.toSafeAdmin(admin),
    };
  }

  async getAuthenticatedAdminProfile(adminId: string) {
    const admin = await this.adminsService.findSafeById(adminId);

    if (!admin) {
      throw new UnauthorizedException('Authenticated admin no longer exists.');
    }

    return admin;
  }
}
