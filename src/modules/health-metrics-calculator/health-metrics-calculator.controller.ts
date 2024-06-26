import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { HealthMetricsCalculatorService } from './health-metrics-calculator.service';
import { PermissiveAuthGuard } from '../auth/guards/auth.guard';
import { TDEECalculatorDTO } from '../../common/dto/health-metrics/calculator-TDEE.dto';
import { AuthUser } from '../../decorators/auth.decorator';
import { FirebaseGuard } from '../auth/guards/firebase.guard';

@Controller('health-metrics')
export class HealthMetricsCalculatorController {
  constructor(
    private readonly healthMetricsCalculatorService: HealthMetricsCalculatorService,
  ) {}

  @Post('calculate-tdee')
  @UseGuards(PermissiveAuthGuard)
  public async calculateTDEE(@Body() tdeeCalculatorDTO: TDEECalculatorDTO) {
    return this.healthMetricsCalculatorService.calculateHealthMetricForUser(
      tdeeCalculatorDTO,
    );
  }

  @Get()
  @UseGuards(FirebaseGuard)
  public async getHealthMetrics(@AuthUser('uid') userId: string) {
    return this.healthMetricsCalculatorService.getHealthMetricsForUser(userId);
  }

  @Post()
  @UseGuards(FirebaseGuard)
  public async updateUserHealthMetricForUser(
    @AuthUser('uid') userId: string,
    @Body() tdeeCalculatorDTO: TDEECalculatorDTO,
  ) {
    return this.healthMetricsCalculatorService.updateHealthMetricsForUser(
      userId,
      tdeeCalculatorDTO,
    );
  }
}
