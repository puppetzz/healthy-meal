/*
  Warnings:

  - You are about to alter the column `bmi` on the `health_metrics` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `bmr` on the `health_metrics` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `tdee` on the `health_metrics` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "health_metrics" ALTER COLUMN "bmi" SET DATA TYPE INTEGER,
ALTER COLUMN "bmr" SET DATA TYPE INTEGER,
ALTER COLUMN "tdee" SET DATA TYPE INTEGER;
