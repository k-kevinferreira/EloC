import { registerAs } from '@nestjs/config';

const defaultUploadSizeLimitInBytes = 5 * 1024 * 1024;

export const uploadsConfig = registerAs('uploads', () => ({
  storageProvider: process.env.UPLOADS_STORAGE_PROVIDER ?? 'local',
  localRoot: process.env.UPLOADS_LOCAL_ROOT ?? 'uploads',
  publicBaseUrl: process.env.UPLOADS_PUBLIC_BASE_URL ?? null,
  maxProductImageSizeInBytes: Number.parseInt(
    process.env.UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES ??
      String(defaultUploadSizeLimitInBytes),
    10,
  ),
  supabase: {
    url: process.env.SUPABASE_URL ?? null,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
    bucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images',
    publicBaseUrl: process.env.SUPABASE_STORAGE_PUBLIC_BASE_URL ?? null,
  },
}));
