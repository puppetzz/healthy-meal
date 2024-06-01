import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { HealthMetricsCalculatorService } from './health-metrics-calculator.service';
import { PermissiveAuthGuard } from '../auth/guards/auth.guard';
import { TDEECalculatorDTO } from '../../common/dto/health-metrics/calculator-TDEE.dto';
import { AuthUser } from '../../decorators/auth.decorator';

@Controller('health-metrics')
export class HealthMetricsCalculatorController {
  constructor(
    private readonly healthMetricsCalculatorService: HealthMetricsCalculatorService,
  ) {}

  @Post('calculate-tdee')
  @UseGuards(PermissiveAuthGuard)
  public async calculateTDEE(
    @AuthUser('uid') userId: string | null,
    @Body() tdeeCalculatorDTO: TDEECalculatorDTO,
  ) {
    return this.healthMetricsCalculatorService.calculateTDEEForUser(
      userId,
      tdeeCalculatorDTO,
    );
  }
}
