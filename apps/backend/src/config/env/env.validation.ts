type EnvConfig = Record<string, unknown>;

export function validateEnv(config: EnvConfig) {
  const portValue = config.PORT ?? '3001';
  const port = Number.parseInt(String(portValue), 10);

  if (!config.DATABASE_URL || typeof config.DATABASE_URL !== 'string') {
    throw new Error('DATABASE_URL is required to start the backend.');
  }

  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid TCP port.');
  }

  return {
    ...config,
    PORT: port,
  };
}
