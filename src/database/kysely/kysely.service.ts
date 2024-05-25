import { Provider } from '@nestjs/common';
import { KYSELY_PROVIDER } from '../../common/constants/general';
import { Kysely, PostgresDialect } from 'kysely';

import { DB } from '../types';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const KyselyProvider: Provider = {
  provide: KYSELY_PROVIDER,
  useFactory: async (configService: ConfigService) => {
    return new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new Pool({
          database: configService.get('DATABASE_NAME'),
          host: configService.get('DATABASE_HOST'),
          user: configService.get('DATABASE_USER'),
          port: configService.get('DATABASE_PORT'),
          password: configService.get('DATABASE_PASSWORD'),
          max: 10,
        }),
      }),
    });
  },
  inject: [ConfigService],
};
