export type TMacronutrients = {
  protein: number;
  carbs: number;
  fat: number;
};

export type TMacronutrientsVariants = {
  moderateCarbs: TMacronutrients;
  lowerCarbs: TMacronutrients;
  higherCarbs: TMacronutrients;
};

export type TMacronutrientsForGoal = {
  maintenance: TMacronutrientsVariants;
  cutting: TMacronutrientsVariants;
  bulking: TMacronutrientsVariants;
};
