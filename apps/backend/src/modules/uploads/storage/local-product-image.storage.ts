import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import {
  ProductImageStorage,
  ProductImageStorageInput,
  StoredProductImage,
} from './product-image-storage.interface';

@Injectable()
export class LocalProductImageStorage implements ProductImageStorage {
  constructor(private readonly configService: ConfigService) {}

  async saveProductImage(
    input: ProductImageStorageInput,
  ): Promise<StoredProductImage> {
    const storageRoot = this.getStorageRoot();
    const destinationPath = join(storageRoot, input.relativePath);

    await mkdir(dirname(destinationPath), { recursive: true });
    await writeFile(destinationPath, input.buffer);

    return {
      filename: input.filename,
      url: this.resolvePublicUrl(input.relativePath),
      mimeType: input.mimeType,
      size: input.size,
    };
  }

  getStorageRoot() {
    const configuredRoot = this.configService.get<string>(
      'uploads.localRoot',
      'uploads',
    );

    return resolve(process.cwd(), configuredRoot);
  }

  private resolvePublicUrl(relativePath: string) {
    const configuredBaseUrl = this.configService.get<string | null>(
      'uploads.publicBaseUrl',
      null,
    );
    const publicBaseUrl =
      configuredBaseUrl ??
      `http://localhost:${this.configService.get<number>('app.port', 3001)}/uploads`;

    return `${publicBaseUrl.replace(/\/$/, '')}/${relativePath.replace(/\\/g, '/')}`;
  }
}
