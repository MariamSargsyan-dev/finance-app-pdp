export function validateConfig(config: Record<string, unknown>) {
  const required = [
    'DATABASE_HOST',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  for (const key of required) {
    if (!config[key] || typeof config[key] !== 'string') {
      throw new Error(`Missing or invalid required environment variable: ${key}`);
    }
  }

  const port = config.PORT ? Number(config.PORT) : 3000;
  if (isNaN(port) || port < 1) {
    throw new Error('PORT must be a valid number >= 1');
  }

  const dbPort = config.DATABASE_PORT ? Number(config.DATABASE_PORT) : 5432;
  if (isNaN(dbPort) || dbPort < 1) {
    throw new Error('DATABASE_PORT must be a valid number >= 1');
  }

  const nodeEnv = config.NODE_ENV || 'development';
  if (!['development', 'production', 'test'].includes(nodeEnv as string)) {
    throw new Error('NODE_ENV must be one of: development, production, test');
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_HOST: config.DATABASE_HOST as string,
    DATABASE_PORT: dbPort,
    DATABASE_USER: config.DATABASE_USER as string,
    DATABASE_PASSWORD: config.DATABASE_PASSWORD as string,
    DATABASE_NAME: config.DATABASE_NAME as string,
    JWT_SECRET: config.JWT_SECRET as string,
    JWT_EXPIRES_IN: (config.JWT_EXPIRES_IN as string) || '15m',
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES_IN: (config.JWT_REFRESH_EXPIRES_IN as string) || '7d',
    FRONTEND_URL: config.FRONTEND_URL as string | undefined,
  };
}

export type EnvConfig = ReturnType<typeof validateConfig>;
