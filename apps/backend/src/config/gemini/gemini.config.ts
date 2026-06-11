import { registerAs } from '@nestjs/config';

export const geminiConfig = registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_API_KEY ?? null,
  model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
}));
