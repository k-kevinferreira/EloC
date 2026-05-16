import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketLikeConstructor } from '@supabase/realtime-js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

import {
  ProductImageStorage,
  ProductImageStorageInput,
  StoredProductImage,
} from './product-image-storage.interface';

@Injectable()
export class SupabaseProductImageStorage implements ProductImageStorage {
  private readonly logger = new Logger(SupabaseProductImageStorage.name);
  private readonly client: SupabaseClient;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.getRequiredConfig('uploads.supabase.url');
    const serviceRoleKey = this.getRequiredConfig(
      'uploads.supabase.serviceRoleKey',
    );

    this.bucket = this.getRequiredConfig('uploads.supabase.bucket');
    this.publicBaseUrl = this.getRequiredConfig(
      'uploads.supabase.publicBaseUrl',
    );
    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        transport: WebSocket as unknown as WebSocketLikeConstructor,
      },
    });
  }

  async saveProductImage(
    input: ProductImageStorageInput,
  ): Promise<StoredProductImage> {
    const storagePath = input.relativePath.replace(/\\/g, '/');
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(storagePath, input.buffer, {
        contentType: input.mimeType,
        upsert: false,
      });

    if (error) {
      this.logger.error(
        `Could not upload product image to Supabase Storage. Bucket="${this.bucket}" Path="${storagePath}" Status="${'statusCode' in error ? error.statusCode : 'unknown'}" Error="${error.message}"`,
      );

      throw new InternalServerErrorException(
        'Could not upload product image to storage.',
      );
    }

    return {
      filename: input.filename,
      url: this.resolvePublicUrl(storagePath),
      mimeType: input.mimeType,
      size: input.size,
    };
  }

  private resolvePublicUrl(storagePath: string) {
    return `${this.publicBaseUrl.replace(/\/$/, '')}/${storagePath}`;
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string | null>(key, null);

    if (!value) {
      throw new Error(`${key} must be configured.`);
    }

    return value;
  }
}
