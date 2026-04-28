import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number.parseInt(process.env.PORT ?? '3001', 10),
  globalPrefix: process.env.API_PREFIX ?? 'api',
}));
