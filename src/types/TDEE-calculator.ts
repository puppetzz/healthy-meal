import { TMacronutrientsForGoal } from './macronutrients';

export type TTDEECalculator = {
  height: number;
  weight: number;
  age: number;
  gender: string;
  activityLevel: string;
  bmi: number;
  bmr: number;
  tdee: number;
  mealCaloriesRecommendation: TMealCaloriesRecommendation;
  idealWeight: TIdealWeight;
  anotherTDEE: TAnotherTDEE;
  macronutrients: TMacronutrientsForGoal;
};

export type TMealPerDay = {
  threeMealPerDay: number[];
  fourMealPerDay: number[];
  fiveMealPerDay: number[];
};

export type TMealCaloriesRecommendation = {
  maintenance: TMealPerDay;
  cutting: TMealPerDay;
  bulking: TMealPerDay;
};

export type TAnotherTDEE = {
  basalMetabolicRate?: number;
  sedentary?: number;
  lightExercise?: number;
  moderateExercise?: number;
  heavyExercise?: number;
  athlete?: number;
};

export type TIdealWeight = {
  hamwi: number;
  devine: number;
  robinson: number;
  miller: number;
};
