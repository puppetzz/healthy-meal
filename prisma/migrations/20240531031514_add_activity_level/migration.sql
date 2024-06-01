/*
  Warnings:

  - Added the required column `activity_level` to the `health_metrics` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_EXERCISE', 'MODERATELY_EXERCISE', 'HEAVY_EXERCISE', 'ATHLETE');

-- AlterTable
ALTER TABLE "health_metrics" ADD COLUMN     "activity_level" INTEGER NOT NULL;
