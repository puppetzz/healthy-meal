import { z } from 'zod';

const configSchema = z.object({
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  S3_REGION: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
});

export const validateEnvironment = (config: Record<string, string>) => {
  const result = configSchema.parse(config);
  return result;
};
