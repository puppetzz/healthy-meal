/*
  Warnings:

  - Added the required column `mealPerDay` to the `meal_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "meal_plans" ADD COLUMN     "mealPerDay" INTEGER NOT NULL;
