-- AlterTable
ALTER TABLE "meal_plans" ADD COLUMN     "number_of_comments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "number_of_reviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
