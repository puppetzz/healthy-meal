/*
  Warnings:

  - You are about to drop the column `Potassium` on the `nutritions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `food_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "nutritions" DROP COLUMN "Potassium",
ADD COLUMN     "potassium" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "food_categories_key_key" ON "food_categories"("key");
