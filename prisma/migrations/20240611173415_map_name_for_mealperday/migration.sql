/*
  Warnings:

  - You are about to drop the column `mealPerDay` on the `meal_plans` table. All the data in the column will be lost.
  - Added the required column `meal_per_day` to the `meal_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "meal_plans" DROP COLUMN "mealPerDay",
ADD COLUMN     "meal_per_day" INTEGER NOT NULL;
