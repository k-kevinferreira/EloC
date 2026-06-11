import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.types';

@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly configService: ConfigService,
    private readonly telegramService: TelegramService,
  ) {}

  @Post('webhook')
  handleWebhook(
    @Body() update: TelegramUpdate,
    @Headers('x-telegram-bot-api-secret-token') secretToken?: string,
  ) {
    const configuredSecret = this.configService.get<string | null>(
      'telegram.webhookSecret',
      null,
    );

    if (configuredSecret && secretToken !== configuredSecret) {
      throw new UnauthorizedException('Invalid Telegram webhook secret.');
    }

    void this.telegramService.handleUpdate(update);

    return { ok: true };
  }
}
