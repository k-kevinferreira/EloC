import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: Number.parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10),
}));
