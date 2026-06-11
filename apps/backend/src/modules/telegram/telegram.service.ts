import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { basename, extname } from 'node:path';

import { GeminiService } from '../ai/gemini.service';
import { ProductsService } from '../products/products.service';
import { UploadsService } from '../uploads/uploads.service';

import { PrismaService } from 'src/prisma/prisma.service';

import {
  TelegramGetFileResponse,
  TelegramMessage,
  TelegramPhotoSize,
  TelegramSendMessageResponse,
  TelegramUpdate,
} from './telegram.types';

const waitingPriceMessage =
  'Imagem recebida. Agora me envie o valor do produto para continuar o cadastro. Exemplo: 89,90';
const invalidPriceMessage =
  'Não consegui identificar o valor. Envie apenas o preço do produto. Exemplo: 89,90';
const startMessage =
  'Envie uma foto do produto para começar. Se quiser, envie o valor na legenda da imagem. Exemplo: 89,90';
const processingMessage =
  'Valor recebido. Estou analisando a imagem e cadastrando o produto...';
const errorMessage =
  'Não consegui concluir o cadastro desse produto. Tente novamente ou verifique no painel.';

const reviewOptionsMessage =
  'Digite 1 para confirmar, 2 para editar o nome, 3 para editar a descricao ou 4 para editar a categoria sugerida.';

type TelegramImageFile = {
  buffer: Buffer;
  filename: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  size: number;
};

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly geminiService: GeminiService,
    private readonly prismaService: PrismaService,
    private readonly productsService: ProductsService,
    private readonly uploadsService: UploadsService,
  ) {}

  async handleUpdate(update: TelegramUpdate) {
    try {
      const message = update.message;

      if (!message) {
        return;
      }

      const chatId = String(message.chat.id);

      if (!this.isChatAllowed(chatId)) {
        this.logger.warn(`Ignoring Telegram update from unauthorized chat "${chatId}".`);
        return;
      }

      if (message.photo?.length) {
        await this.handlePhotoMessage(chatId, message);
        return;
      }

      if (message.text) {
        await this.handleTextMessage(chatId, message.text);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Telegram error.';
      this.logger.error(`Could not handle Telegram update. ${message}`);
    }
  }

  private async handlePhotoMessage(chatId: string, message: TelegramMessage) {
    const photo = this.resolveBestPhoto(message.photo);

    if (!photo) {
      await this.sendMessage(chatId, 'Envie uma foto do produto para iniciar o cadastro.');
      return;
    }

    const parsedPrice = this.parsePrice(message.caption ?? '');
    const draft = await this.prismaService.telegramProductDraft.create({
      data: {
        chatId,
        telegramFileId: photo.file_id,
        caption: message.caption?.trim() || null,
        price: parsedPrice.ok ? parsedPrice.value : null,
        status: 'WAITING_PRICE',
      },
      select: {
        id: true,
      },
    });

    if (!message.caption?.trim()) {
      await this.sendMessage(chatId, waitingPriceMessage);
      return;
    }

    if (!parsedPrice.ok) {
      await this.sendMessage(chatId, invalidPriceMessage);
      return;
    }

    await this.processDraft(chatId, draft.id, parsedPrice.value);
  }

  private async handleTextMessage(chatId: string, text: string) {
    const normalizedText = text.trim();

    if (normalizedText === '/start') {
      await this.sendMessage(chatId, startMessage);
      return;
    }

    if (normalizedText === '/cancelar') {
      await this.cancelLatestDraft(chatId);
      await this.sendMessage(chatId, 'Cadastro cancelado.');
      return;
    }

    const draft = await this.findLatestWaitingDraft(chatId);

    if (draft) {
      const parsedPrice = this.parsePrice(normalizedText);

      if (!parsedPrice.ok) {
        await this.sendMessage(chatId, invalidPriceMessage);
        return;
      }

      await this.processDraft(chatId, draft.id, parsedPrice.value);
      return;
    }

    const reviewDraft = await this.findLatestReviewDraft(chatId);

    if (reviewDraft) {
      await this.handleReviewTextMessage(chatId, normalizedText, reviewDraft);
      return;
    }

    await this.sendMessage(chatId, 'Envie uma foto do produto para iniciar o cadastro.');
  }

  private async processDraft(chatId: string, draftId: string, price: number) {
    const draft = await this.prismaService.telegramProductDraft.update({
      where: {
        id: draftId,
      },
      data: {
        price,
        status: 'PROCESSING',
      },
      select: {
        id: true,
        telegramFileId: true,
      },
    });

    await this.sendMessage(chatId, processingMessage);

    try {
      const image = await this.downloadTelegramImage(draft.telegramFileId);
      const aiDescription = await this.geminiService.describeProductImage(
        image.buffer,
        image.mimeType,
      );
      const uploadedImage = await this.uploadsService.saveProductImage({
        buffer: image.buffer,
        originalname: image.filename,
        mimetype: image.mimeType,
        size: image.size,
      });
      const product = await this.productsService.createTelegramAiProduct({
        title: aiDescription.name,
        shortDescription: aiDescription.shortDescription,
        description: aiDescription.description,
        suggestedCategory: aiDescription.suggestedCategory,
        aiTags: aiDescription.tags,
        price,
        imageUrl: uploadedImage.url,
      });

      await this.prismaService.telegramProductDraft.update({
        where: {
          id: draft.id,
        },
        data: {
          status: 'COMPLETED',
          productId: product.id,
          completedAt: new Date(),
        },
      });

      await this.sendMessage(
        chatId,
        [
          'Produto cadastrado como pendente de revisão.',
          '',
          `Nome sugerido: ${product.title}`,
          `Descrição: ${product.shortDescription ?? aiDescription.shortDescription}`,
          `Categoria sugerida: ${product.suggestedCategory ?? aiDescription.suggestedCategory}`,
          `Valor: R$ ${this.formatPrice(price)}`,
          'Status: Pendente',
          '',
          reviewOptionsMessage,
        ].join('\n'),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error.';
      this.logger.error(`Could not process Telegram product draft "${draft.id}". ${message}`);

      await this.prismaService.telegramProductDraft.update({
        where: {
          id: draft.id,
        },
        data: {
          status: 'ERROR',
          errorMessage: message.slice(0, 2000),
        },
      });

      await this.sendMessage(chatId, errorMessage);
    }
  }

  private async cancelLatestDraft(chatId: string) {
    const draft = await this.findLatestCancellableDraft(chatId);

    if (!draft) {
      return;
    }

    await this.prismaService.telegramProductDraft.update({
      where: {
        id: draft.id,
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  private findLatestWaitingDraft(chatId: string) {
    return this.prismaService.telegramProductDraft.findFirst({
      where: {
        chatId,
        status: 'WAITING_PRICE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
      },
    });
  }

  private findLatestReviewDraft(chatId: string) {
    return this.prismaService.telegramProductDraft.findFirst({
      where: {
        chatId,
        status: {
          in: [
            'COMPLETED',
            'WAITING_NAME_EDIT',
            'WAITING_DESCRIPTION_EDIT',
            'WAITING_CATEGORY_EDIT',
          ],
        },
        productId: {
          not: null,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        productId: true,
        status: true,
      },
    });
  }

  private findLatestCancellableDraft(chatId: string) {
    return this.prismaService.telegramProductDraft.findFirst({
      where: {
        chatId,
        status: {
          in: [
            'WAITING_PRICE',
            'WAITING_NAME_EDIT',
            'WAITING_DESCRIPTION_EDIT',
            'WAITING_CATEGORY_EDIT',
          ],
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
      },
    });
  }

  private async handleReviewTextMessage(
    chatId: string,
    text: string,
    draft: {
      id: string;
      productId: string | null;
      status: string;
    },
  ) {
    if (!draft.productId) {
      await this.sendMessage(chatId, 'Envie uma foto do produto para iniciar o cadastro.');
      return;
    }

    if (draft.status === 'WAITING_NAME_EDIT') {
      const product = await this.productsService.updateTelegramAiProductTitle(
        draft.productId,
        text,
      );

      await this.prismaService.telegramProductDraft.update({
        where: {
          id: draft.id,
        },
        data: {
          status: 'COMPLETED',
        },
      });

      await this.sendProductReviewSummary(chatId, product, 'Nome atualizado.');
      return;
    }

    if (draft.status === 'WAITING_DESCRIPTION_EDIT') {
      const product = await this.productsService.updateTelegramAiProductShortDescription(
        draft.productId,
        text,
      );

      await this.prismaService.telegramProductDraft.update({
        where: {
          id: draft.id,
        },
        data: {
          status: 'COMPLETED',
        },
      });

      await this.sendProductReviewSummary(chatId, product, 'Descricao atualizada.');
      return;
    }

    if (draft.status === 'WAITING_CATEGORY_EDIT') {
      const product = await this.productsService.updateTelegramAiProductSuggestedCategory(
        draft.productId,
        text,
      );

      await this.prismaService.telegramProductDraft.update({
        where: {
          id: draft.id,
        },
        data: {
          status: 'COMPLETED',
        },
      });

      await this.sendProductReviewSummary(chatId, product, 'Categoria sugerida atualizada.');
      return;
    }

    if (text === '1') {
      try {
        const product = await this.productsService.activateTelegramAiProduct(
          draft.productId,
        );

        await this.sendMessage(
          chatId,
          [
            'Cadastro confirmado e produto ativado no catalogo.',
            '',
            `Nome: ${product.title}`,
            `Categoria: ${product.category.name}`,
            `Valor: R$ ${this.formatPrice(Number(product.price))}`,
            'Status: Ativo',
          ].join('\n'),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';

        this.logger.warn(`Could not activate Telegram product. ${message}`);
        await this.sendMessage(
          chatId,
          [
            'Antes de ativar no catalogo, edite a categoria sugerida.',
            '',
            'Digite 4 e informe uma categoria real, como Brincos, Aneis, Colares ou Pulseiras.',
          ].join('\n'),
        );
      }
      return;
    }

    if (text === '2') {
      await this.prismaService.telegramProductDraft.update({
        where: {
          id: draft.id,
        },
        data: {
          status: 'WAITING_NAME_EDIT',
        },
      });

      await this.sendMessage(chatId, 'Envie o novo nome do produto.');
      return;
    }

    if (text === '3') {
      await this.prismaService.telegramProductDraft.update({
        where: {
          id: draft.id,
        },
        data: {
          status: 'WAITING_DESCRIPTION_EDIT',
        },
      });

      await this.sendMessage(chatId, 'Envie a nova descricao curta do produto.');
      return;
    }

    if (text === '4') {
      await this.prismaService.telegramProductDraft.update({
        where: {
          id: draft.id,
        },
        data: {
          status: 'WAITING_CATEGORY_EDIT',
        },
      });

      await this.sendMessage(
        chatId,
        'Envie a categoria sugerida. Exemplo: Aneis, Brincos, Colares ou Pulseiras.',
      );
      return;
    }

    await this.sendMessage(chatId, reviewOptionsMessage);
  }

  private async sendProductReviewSummary(
    chatId: string,
    product: {
      title: string;
      shortDescription: string | null;
      suggestedCategory?: string | null;
      price: unknown;
    },
    heading: string,
  ) {
    await this.sendMessage(
      chatId,
      [
        heading,
        '',
        `Nome sugerido: ${product.title}`,
        `Descricao: ${product.shortDescription ?? 'Pendente de revisao'}`,
        `Categoria sugerida: ${product.suggestedCategory ?? 'Revisar'}`,
        `Valor: R$ ${this.formatPrice(Number(product.price))}`,
        'Status: Pendente',
        '',
        reviewOptionsMessage,
      ].join('\n'),
    );
  }

  private resolveBestPhoto(photos: TelegramPhotoSize[] | undefined) {
    if (!photos?.length) {
      return null;
    }

    return [...photos].sort((left, right) => {
      const leftSize = left.file_size ?? left.width ?? 0;
      const rightSize = right.file_size ?? right.width ?? 0;

      return rightSize - leftSize;
    })[0];
  }

  private parsePrice(text: string):
    | {
        ok: true;
        value: number;
      }
    | {
        ok: false;
      } {
    const matches = text.match(/-?\d+(?:[,.]\d{1,2})?/g) ?? [];

    if (matches.length !== 1) {
      return { ok: false };
    }

    const normalizedValue = matches[0].replace(',', '.');
    const value = Number(normalizedValue);

    if (!Number.isFinite(value) || value <= 0) {
      return { ok: false };
    }

    return {
      ok: true,
      value: Math.round(value * 100) / 100,
    };
  }

  private async downloadTelegramImage(fileId: string): Promise<TelegramImageFile> {
    const botToken = this.getRequiredBotToken();
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(botToken)}/getFile?file_id=${encodeURIComponent(
        fileId,
      )}`,
    );

    if (!fileResponse.ok) {
      throw new Error(`Telegram getFile failed with status ${fileResponse.status}.`);
    }

    const fileBody = (await fileResponse.json()) as TelegramGetFileResponse;
    const filePath = fileBody.result?.file_path;

    if (!fileBody.ok || !filePath) {
      throw new Error(fileBody.description ?? 'Telegram did not return a file path.');
    }

    const imageResponse = await fetch(
      `https://api.telegram.org/file/bot${encodeURIComponent(botToken)}/${filePath}`,
    );

    if (!imageResponse.ok) {
      throw new Error(`Telegram file download failed with status ${imageResponse.status}.`);
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const mimeType = this.resolveImageMimeType(
      imageResponse.headers.get('content-type'),
      buffer,
      filePath,
    );
    const extension = this.resolveExtension(mimeType);
    const rawFilename = basename(filePath);
    const filename = extname(rawFilename).toLowerCase() === extension
      ? rawFilename
      : `telegram-product-${Date.now()}${extension}`;

    return {
      buffer,
      filename,
      mimeType,
      size: buffer.length,
    };
  }

  private resolveImageMimeType(
    contentType: string | null,
    buffer: Buffer,
    filePath: string,
  ): TelegramImageFile['mimeType'] {
    const normalizedContentType = contentType?.split(';')[0]?.trim().toLowerCase();

    if (
      normalizedContentType === 'image/jpeg' ||
      normalizedContentType === 'image/png' ||
      normalizedContentType === 'image/webp'
    ) {
      return normalizedContentType;
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }

    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return 'image/png';
    }

    if (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return 'image/webp';
    }

    const extension = extname(filePath).toLowerCase();

    if (extension === '.jpg' || extension === '.jpeg') {
      return 'image/jpeg';
    }

    if (extension === '.png') {
      return 'image/png';
    }

    if (extension === '.webp') {
      return 'image/webp';
    }

    throw new Error('Telegram file is not a supported product image.');
  }

  private resolveExtension(mimeType: TelegramImageFile['mimeType']) {
    if (mimeType === 'image/png') {
      return '.png';
    }

    if (mimeType === 'image/webp') {
      return '.webp';
    }

    return '.jpg';
  }

  private async sendMessage(chatId: string, text: string) {
    const botToken = this.getRequiredBotToken();
    const response = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      },
    );

    if (!response.ok) {
      this.logger.error(`Telegram sendMessage failed with status ${response.status}.`);
      return;
    }

    const body = (await response.json()) as TelegramSendMessageResponse;

    if (!body.ok) {
      this.logger.error(body.description ?? 'Telegram sendMessage returned ok=false.');
    }
  }

  private isChatAllowed(chatId: string) {
    const allowedChatIds = this.configService.get<string[]>(
      'telegram.allowedChatIds',
      [],
    );

    return allowedChatIds.includes(chatId);
  }

  private getRequiredBotToken() {
    const botToken = this.configService.get<string | null>('telegram.botToken', null);

    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN must be configured.');
    }

    return botToken;
  }

  private formatPrice(price: number) {
    return price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
