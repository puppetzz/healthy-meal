import type { Config } from 'drizzle-kit';
import { envs } from 'src/envs';

export default {
  schema: './src/schema',
  out: './database/migrations',
  driver: 'pg',
  dbCredentials: {
    host: envs.DATABASE_HOST,
    port: Number(envs.DATABASE_PORT),
    user: envs.DATABASE_USER,
    password: envs.DATABASE_PASSWORD,
    database: envs.DATABASE_NAME,
  },
} satisfies Config;
