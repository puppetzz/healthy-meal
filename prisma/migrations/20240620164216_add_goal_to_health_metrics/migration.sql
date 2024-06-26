-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('CUTTING', 'MAINTENANCE', 'BULKING');

-- AlterTable
ALTER TABLE "health_metrics" ADD COLUMN     "goal" "Goal" NOT NULL DEFAULT 'MAINTENANCE';
