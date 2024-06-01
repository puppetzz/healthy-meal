import { Module } from '@nestjs/common';
import { HealthMetricsCalculatorController } from './health-metrics-calculator.controller';
import { HealthMetricsCalculatorService } from './health-metrics-calculator.service';
import { PrismaService } from '../../services/database/prisma.service';

@Module({
  controllers: [HealthMetricsCalculatorController],
  providers: [HealthMetricsCalculatorService, PrismaService],
})
export class HealthMetricsCalculatorModule {}
