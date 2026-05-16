import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';

import { UploadedFile } from './interfaces/uploaded-file.interface';
import { UploadedProductImage } from './interfaces/uploaded-product-image.interface';
import {
  PRODUCT_IMAGE_STORAGE,
  ProductImageStorage,
} from './storage/product-image-storage.interface';

const allowedProductImageTypes = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
} as const;

@Injectable()
export class UploadsService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(PRODUCT_IMAGE_STORAGE)
    private readonly productImageStorage: ProductImageStorage,
  ) {}

  async saveProductImage(file?: UploadedFile): Promise<UploadedProductImage> {
    this.assertProductImageFile(file);

    const extension = this.resolveAllowedExtension(file);
    const filename = `product-image-${Date.now()}-${randomUUID()}${extension}`;
    const relativePath = this.buildProductImagePath(filename);

    return this.productImageStorage.saveProductImage({
      buffer: file.buffer,
      filename,
      relativePath,
      mimeType: file.mimetype,
      size: file.size,
    });
  }

  private assertProductImageFile(
    file?: UploadedFile,
  ): asserts file is UploadedFile & { buffer: Buffer } {
    if (!file) {
      throw new BadRequestException('Product image file is required.');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Product image file is empty.');
    }

    const fileWithBuffer = file as UploadedFile & { buffer: Buffer };
    const maxSize = this.configService.get<number>(
      'uploads.maxProductImageSizeInBytes',
      5 * 1024 * 1024,
    );

    if (file.size > maxSize || fileWithBuffer.buffer.length > maxSize) {
      throw new BadRequestException(
        `Product image must be smaller than ${maxSize} bytes.`,
      );
    }

    if (!this.isAllowedMimeType(file.mimetype)) {
      throw new BadRequestException(
        'Product image must be a JPEG, PNG, or WebP file.',
      );
    }

    if (!this.hasValidFileSignature(fileWithBuffer)) {
      throw new BadRequestException(
        'Product image content does not match an allowed image format.',
      );
    }
  }

  private resolveAllowedExtension(file: UploadedFile) {
    if (!this.isAllowedMimeType(file.mimetype)) {
      throw new BadRequestException(
        'Product image must be a JPEG, PNG, or WebP file.',
      );
    }

    const originalExtension = extname(file.originalname).toLowerCase();
    const allowedExtensions = allowedProductImageTypes[file.mimetype];

    if (!(allowedExtensions as readonly string[]).includes(originalExtension)) {
      throw new BadRequestException(
        'Product image extension must match the uploaded image type.',
      );
    }

    return originalExtension;
  }

  private isAllowedMimeType(
    mimeType: string,
  ): mimeType is keyof typeof allowedProductImageTypes {
    return Object.prototype.hasOwnProperty.call(allowedProductImageTypes, mimeType);
  }

  private hasValidFileSignature(file: UploadedFile & { buffer: Buffer }) {
    if (file.mimetype === 'image/jpeg') {
      return (
        file.buffer[0] === 0xff &&
        file.buffer[1] === 0xd8 &&
        file.buffer[2] === 0xff
      );
    }

    if (file.mimetype === 'image/png') {
      return (
        file.buffer[0] === 0x89 &&
        file.buffer[1] === 0x50 &&
        file.buffer[2] === 0x4e &&
        file.buffer[3] === 0x47 &&
        file.buffer[4] === 0x0d &&
        file.buffer[5] === 0x0a &&
        file.buffer[6] === 0x1a &&
        file.buffer[7] === 0x0a
      );
    }

    if (file.mimetype === 'image/webp') {
      return (
        file.buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        file.buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    }

    return false;
  }

  private buildProductImagePath(filename: string) {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');

    return join('products', year, month, filename);
  }
}
