/*
  Warnings:

  - A unique constraint covering the columns `[reviewerId]` on the table `posts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "reviewerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "posts_reviewerId_key" ON "posts"("reviewerId");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
