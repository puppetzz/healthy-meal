import { Provider } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from 'src/common/constants/general';
import { Pool } from 'pg';
import config from '../../database/drizzle.config';
import * as schema from '../schema';
import { drizzle } from 'drizzle-orm/node-postgres';

export const DrizzleProvider: Provider = {
  provide: DRIZZLE_PROVIDER,
  useFactory: () => {
    const pool = new Pool(config.dbCredentials);
    const db = drizzle(pool, { schema });

    return db;
  },
};
