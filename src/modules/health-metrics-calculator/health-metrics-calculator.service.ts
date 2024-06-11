import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { ActivityLevel } from '../../common/enums/activity-level.enum';
import { PrismaService } from '../../services/database/prisma.service';
import { TDEECalculatorDTO } from '../../common/dto/health-metrics/calculator-TDEE.dto';
import {
  TIdealWeight as IdealWeight,
  TMealCaloriesRecommendation,
  TTDEECalculator,
} from '../../types/TDEE-calculator';
import { TResponse } from '../../types/response-type';
import { Gender } from '@prisma/client';
import { MacronutrientsRates } from '../../common/constants/macronutrients';
import {
  TMacronutrientsForGoal,
  TMacronutrientsVariants,
} from '../../types/macronutrients';

@Injectable()
export class HealthMetricsCalculatorService {
  constructor(private readonly prismaService: PrismaService) {}

  public async calculateTDEEForUser(
    userId: string | null,
    tdeeCalculatorDTO: TDEECalculatorDTO,
  ): Promise<TResponse<TTDEECalculator>> {
    const { weight, height, age, gender, activityLevel } = tdeeCalculatorDTO;

    const bmi = Math.round(
      this.calculateBMI(tdeeCalculatorDTO.weight, tdeeCalculatorDTO.height),
    );

    const bmr = Math.round(this.calculateBMR(weight, height, age, gender));

    const tdee = Math.round(
      this.calculateTDEE(bmr, ActivityLevel[activityLevel]),
    );

    const anotherTDEE = {
      basalMetabolicRate: bmr,
      sedentary: Math.round(this.calculateTDEE(bmr, ActivityLevel.SEDENTARY)),
      lightExercise: Math.round(
        this.calculateTDEE(bmr, ActivityLevel.LIGHTLY_EXERCISE),
      ),
      moderateExercise: Math.round(
        this.calculateTDEE(bmr, ActivityLevel.MODERATELY_EXERCISE),
      ),
      heavyExercise: Math.round(
        this.calculateTDEE(bmr, ActivityLevel.HEAVY_EXERCISE),
      ),
      athlete: Math.round(this.calculateTDEE(bmr, ActivityLevel.ATHLETE)),
    };

    const mealCaloriesRecommendation: TMealCaloriesRecommendation = {
      maintenance: {
        threeMealPerDay: this.getRecommendedCaloriesPerMeal(3, tdee),
        fourMealPerDay: this.getRecommendedCaloriesPerMeal(4, tdee),
        fiveMealPerDay: this.getRecommendedCaloriesPerMeal(5, tdee),
      },
      cutting: {
        threeMealPerDay: this.getRecommendedCaloriesPerMeal(3, tdee - 500),
        fourMealPerDay: this.getRecommendedCaloriesPerMeal(4, tdee - 500),
        fiveMealPerDay: this.getRecommendedCaloriesPerMeal(5, tdee - 500),
      },
      bulking: {
        threeMealPerDay: this.getRecommendedCaloriesPerMeal(3, tdee + 500),
        fourMealPerDay: this.getRecommendedCaloriesPerMeal(4, tdee + 500),
        fiveMealPerDay: this.getRecommendedCaloriesPerMeal(5, tdee + 500),
      },
    };

    const idealWeight = this.calculateIdealWeightRange(height, gender);

    const macronutrients: TMacronutrientsForGoal = this.getMacronutrients(tdee);

    if (userId) {
      await this.prismaService.healthMetric.upsert({
        where: {
          userId: userId,
        },
        create: {
          userId,
          weight,
          height,
          age,
          gender,
          activityLevel,
          bmi,
          bmr,
          tdee,
        },
        update: {
          weight,
          height,
          age,
          gender,
          activityLevel,
          bmi,
          bmr,
          tdee,
        },
      });
    }

    return {
      data: {
        height,
        weight,
        age,
        gender,
        activityLevel,
        bmi,
        bmr,
        tdee,
        mealCaloriesRecommendation,
        idealWeight,
        anotherTDEE,
        macronutrients,
      },
      message: 'TDEE calculated successfully!',
      status: HttpStatus.OK,
    };
  }

  public async getHealthMetricsForUser(userId: string) {
    const healthMetrics = await this.prismaService.healthMetric.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!healthMetrics)
      throw new BadRequestException('The user has no calculated TDEE yet!');

    return await this.calculateTDEEForUser(null, {
      weight: healthMetrics.weight,
      height: healthMetrics.height,
      age: healthMetrics.age,
      gender: healthMetrics.gender,
      activityLevel: healthMetrics.activityLevel as keyof typeof ActivityLevel,
    });
  }

  public calculateBMI(weight: number, height: number) {
    const bmi = weight / Math.pow(height / 100, 2);

    return bmi;
  }

  public calculateBMR(
    weight: number,
    height: number,
    age: number,
    gender: Gender,
  ) {
    if (gender == Gender.MALE) {
      const bmr = 10 * weight + 6.25 * height - 5 * age + 5;

      return bmr;
    } else {
      const bmr = 10 * weight + 6.25 * height - 5 * age - 161;

      return bmr;
    }
  }

  public calculateTDEE(bmr: number, activityLevel: ActivityLevel) {
    const tdee = bmr * activityLevel;

    return tdee;
  }

  private getRecommendedCaloriesPerMeal(
    mealsPerDay: number,
    tdee: number,
  ): number[] {
    const mealPortions = {
      3: [0.3, 0.4, 0.3],
      4: [0.25, 0.35, 0.3, 0.1],
      5: [0.2, 0.3, 0.25, 0.1, 0.15],
    };

    const portions = mealPortions[mealsPerDay];

    return portions.map((portion) => Math.round(tdee * portion));
  }

  private calculateIdealWeightRange(
    height: number,
    gender: Gender,
  ): IdealWeight {
    const heightInInches = height / 2.54; // Convert height from cm to inches
    const heightOver5Feet = heightInInches - 60; // Subtract 60 inches (5 feet)

    const formulas = {
      hamwi: {
        MALE: 48 + 2.7 * heightOver5Feet,
        FEMALE: 45.5 + 2.2 * heightOver5Feet,
      },
      devine: {
        MALE: 50 + 2.3 * heightOver5Feet,
        FEMALE: 45.5 + 2.3 * heightOver5Feet,
      },
      robinson: {
        MALE: 52 + 1.9 * heightOver5Feet,
        FEMALE: 49 + 1.7 * heightOver5Feet,
      },
      miller: {
        MALE: 56.2 + 1.41 * heightOver5Feet,
        FEMALE: 53.1 + 1.36 * heightOver5Feet,
      },
    };

    return {
      hamwi: Math.round(formulas.hamwi[gender]),
      devine: Math.round(formulas.devine[gender]),
      robinson: Math.round(formulas.robinson[gender]),
      miller: Math.round(formulas.miller[gender]),
    };
  }

  private getMacronutrients(tdee: number): TMacronutrientsForGoal {
    const cuttingTDEE = tdee - 500;
    const bulkingTDEE = tdee + 500;

    const maintenance: TMacronutrientsVariants = {
      moderateCarbs: {
        protein: this.getProteinsFromCalories(
          tdee,
          MacronutrientsRates.MODERATE_CARBS[0],
        ),
        fat: this.getFatsFromCalories(
          tdee,
          MacronutrientsRates.MODERATE_CARBS[1],
        ),
        carbs: this.getCarbsFromCalories(
          tdee,
          MacronutrientsRates.MODERATE_CARBS[2],
        ),
      },
      lowerCarbs: {
        protein: this.getProteinsFromCalories(
          tdee,
          MacronutrientsRates.LOWER_CARBS[0],
        ),
        fat: this.getFatsFromCalories(tdee, MacronutrientsRates.LOWER_CARBS[1]),
        carbs: this.getCarbsFromCalories(
          tdee,
          MacronutrientsRates.LOWER_CARBS[2],
        ),
      },
      higherCarbs: {
        protein: this.getProteinsFromCalories(
          tdee,
          MacronutrientsRates.HIGHER_CARBS[0],
        ),
        fat: this.getFatsFromCalories(
          tdee,
          MacronutrientsRates.HIGHER_CARBS[1],
        ),
        carbs: this.getCarbsFromCalories(
          tdee,
          MacronutrientsRates.HIGHER_CARBS[2],
        ),
      },
    };

    const cutting: TMacronutrientsVariants = {
      moderateCarbs: {
        protein: this.getProteinsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.MODERATE_CARBS[0],
        ),
        fat: this.getFatsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.MODERATE_CARBS[1],
        ),
        carbs: this.getCarbsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.MODERATE_CARBS[2],
        ),
      },
      lowerCarbs: {
        protein: this.getProteinsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.LOWER_CARBS[0],
        ),
        fat: this.getFatsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.LOWER_CARBS[1],
        ),
        carbs: this.getCarbsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.LOWER_CARBS[2],
        ),
      },
      higherCarbs: {
        protein: this.getProteinsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.HIGHER_CARBS[0],
        ),
        fat: this.getFatsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.HIGHER_CARBS[1],
        ),
        carbs: this.getCarbsFromCalories(
          cuttingTDEE,
          MacronutrientsRates.HIGHER_CARBS[2],
        ),
      },
    };

    const bulking: TMacronutrientsVariants = {
      moderateCarbs: {
        protein: this.getProteinsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.MODERATE_CARBS[0],
        ),
        fat: this.getFatsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.MODERATE_CARBS[1],
        ),
        carbs: this.getCarbsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.MODERATE_CARBS[2],
        ),
      },
      lowerCarbs: {
        protein: this.getProteinsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.LOWER_CARBS[0],
        ),
        fat: this.getFatsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.LOWER_CARBS[1],
        ),
        carbs: this.getCarbsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.LOWER_CARBS[2],
        ),
      },
      higherCarbs: {
        protein: this.getProteinsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.HIGHER_CARBS[0],
        ),
        fat: this.getFatsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.HIGHER_CARBS[1],
        ),
        carbs: this.getCarbsFromCalories(
          bulkingTDEE,
          MacronutrientsRates.HIGHER_CARBS[2],
        ),
      },
    };

    return { maintenance, cutting, bulking };
  }

  private getProteinsFromCalories(calories: number, percent: number) {
    return Math.round((calories * percent) / 4);
  }

  private getCarbsFromCalories(calories: number, percent: number) {
    return Math.round((calories * percent) / 4);
  }

  private getFatsFromCalories(calories: number, percent: number) {
    return Math.round((calories * percent) / 9);
  }
}
