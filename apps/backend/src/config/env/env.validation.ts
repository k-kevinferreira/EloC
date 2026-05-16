type EnvConfig = Record<string, unknown>;

export function validateEnv(config: EnvConfig) {
  const portValue = config.PORT ?? '3001';
  const jwtExpiresInValue = config.JWT_EXPIRES_IN ?? '3600';
  const maxProductImageSizeValue =
    config.UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES ?? String(5 * 1024 * 1024);
  const port = Number.parseInt(String(portValue), 10);
  const jwtExpiresIn = Number.parseInt(String(jwtExpiresInValue), 10);
  const maxProductImageSize = Number.parseInt(
    String(maxProductImageSizeValue),
    10,
  );
  const uploadsPublicBaseUrl =
    typeof config.UPLOADS_PUBLIC_BASE_URL === 'string'
      ? config.UPLOADS_PUBLIC_BASE_URL.trim()
      : undefined;
  const storageProvider =
    typeof config.UPLOADS_STORAGE_PROVIDER === 'string'
      ? config.UPLOADS_STORAGE_PROVIDER.trim()
      : 'local';
  const nodeEnv =
    typeof config.NODE_ENV === 'string' ? config.NODE_ENV.trim() : undefined;
  const supabaseUrl =
    typeof config.SUPABASE_URL === 'string'
      ? config.SUPABASE_URL.trim()
      : undefined;
  const supabaseServiceRoleKey =
    typeof config.SUPABASE_SERVICE_ROLE_KEY === 'string'
      ? config.SUPABASE_SERVICE_ROLE_KEY.trim()
      : undefined;
  const supabaseStorageBucket =
    typeof config.SUPABASE_STORAGE_BUCKET === 'string'
      ? config.SUPABASE_STORAGE_BUCKET.trim()
      : 'product-images';
  const supabaseStoragePublicBaseUrl =
    typeof config.SUPABASE_STORAGE_PUBLIC_BASE_URL === 'string'
      ? config.SUPABASE_STORAGE_PUBLIC_BASE_URL.trim()
      : undefined;

  if (!config.DATABASE_URL || typeof config.DATABASE_URL !== 'string') {
    throw new Error('DATABASE_URL is required to start the backend.');
  }

  if (!config.JWT_SECRET || typeof config.JWT_SECRET !== 'string') {
    throw new Error('JWT_SECRET is required to start the backend.');
  }

  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid TCP port.');
  }

  if (Number.isNaN(jwtExpiresIn) || jwtExpiresIn <= 0) {
    throw new Error('JWT_EXPIRES_IN must be a positive integer in seconds.');
  }

  if (Number.isNaN(maxProductImageSize) || maxProductImageSize <= 0) {
    throw new Error(
      'UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES must be a positive integer in bytes.',
    );
  }

  if (uploadsPublicBaseUrl) {
    try {
      const parsedUploadsPublicBaseUrl = new URL(uploadsPublicBaseUrl);

      if (!['http:', 'https:'].includes(parsedUploadsPublicBaseUrl.protocol)) {
        throw new Error();
      }
    } catch {
      throw new Error(
        'UPLOADS_PUBLIC_BASE_URL must be a valid http(s) URL when provided.',
      );
    }
  }

  if (!['local', 'supabase'].includes(storageProvider)) {
    throw new Error('UPLOADS_STORAGE_PROVIDER must be either local or supabase.');
  }

  if (nodeEnv === 'production' && storageProvider !== 'supabase') {
    throw new Error(
      'UPLOADS_STORAGE_PROVIDER must be supabase when NODE_ENV is production.',
    );
  }

  if (storageProvider === 'supabase') {
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is required when using Supabase Storage.');
    }

    if (!supabaseServiceRoleKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY is required when using Supabase Storage.',
      );
    }

    if (!supabaseStorageBucket) {
      throw new Error(
        'SUPABASE_STORAGE_BUCKET is required when using Supabase Storage.',
      );
    }

    if (!supabaseStoragePublicBaseUrl) {
      throw new Error(
        'SUPABASE_STORAGE_PUBLIC_BASE_URL is required when using Supabase Storage.',
      );
    }

    assertHttpUrl(supabaseUrl, 'SUPABASE_URL');
    assertHttpUrl(
      supabaseStoragePublicBaseUrl,
      'SUPABASE_STORAGE_PUBLIC_BASE_URL',
    );
  }

  return {
    ...config,
    JWT_EXPIRES_IN: jwtExpiresIn,
    PORT: port,
    UPLOADS_STORAGE_PROVIDER: storageProvider,
    ...(uploadsPublicBaseUrl && {
      UPLOADS_PUBLIC_BASE_URL: uploadsPublicBaseUrl,
    }),
    UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES: maxProductImageSize,
    ...(supabaseUrl && { SUPABASE_URL: supabaseUrl }),
    ...(supabaseServiceRoleKey && {
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
    }),
    SUPABASE_STORAGE_BUCKET: supabaseStorageBucket,
    ...(supabaseStoragePublicBaseUrl && {
      SUPABASE_STORAGE_PUBLIC_BASE_URL: supabaseStoragePublicBaseUrl,
    }),
  };
}

function assertHttpUrl(value: string, envName: string) {
  try {
    const parsedUrl = new URL(value);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error(`${envName} must be a valid http(s) URL.`);
  }
}
