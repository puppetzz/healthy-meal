/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_key_key" ON "categories"("key");
