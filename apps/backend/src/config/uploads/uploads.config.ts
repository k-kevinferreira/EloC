import { registerAs } from '@nestjs/config';

const defaultUploadSizeLimitInBytes = 5 * 1024 * 1024;

export const uploadsConfig = registerAs('uploads', () => ({
  localRoot: process.env.UPLOADS_LOCAL_ROOT ?? 'uploads',
  publicBaseUrl: process.env.UPLOADS_PUBLIC_BASE_URL ?? null,
  maxProductImageSizeInBytes: Number.parseInt(
    process.env.UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES ??
      String(defaultUploadSizeLimitInBytes),
    10,
  ),
}));
