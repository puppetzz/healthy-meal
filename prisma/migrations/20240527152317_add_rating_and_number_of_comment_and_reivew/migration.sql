-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "rating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "number_of_comments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "number_of_reviews" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;
