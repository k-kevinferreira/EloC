import { registerAs } from '@nestjs/config';

export const telegramConfig = registerAs('telegram', () => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN ?? null,
  allowedChatIds: (process.env.TELEGRAM_ALLOWED_CHAT_IDS ?? '')
    .split(',')
    .map((chatId) => chatId.trim())
    .filter((chatId) => chatId.length > 0),
  webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET ?? null,
}));
