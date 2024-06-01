/*
  Warnings:

  - The primary key for the `meal_plan_recipes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "meal_plan_recipes" DROP CONSTRAINT "meal_plan_recipes_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "meal_plan_recipes_pkey" PRIMARY KEY ("id");
