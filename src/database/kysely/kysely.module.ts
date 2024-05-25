import { Module } from '@nestjs/common';
import { KyselyProvider } from './kysely.service';

@Module({
  providers: [KyselyProvider],
  exports: [KyselyProvider],
})
export class KyselyModule {}
