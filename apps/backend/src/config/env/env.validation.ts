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

  return {
    ...config,
    JWT_EXPIRES_IN: jwtExpiresIn,
    PORT: port,
    UPLOADS_MAX_PRODUCT_IMAGE_SIZE_BYTES: maxProductImageSize,
  };
}
