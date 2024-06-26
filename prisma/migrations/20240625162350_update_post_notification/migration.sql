/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationOnPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationExternalTable" AS ENUM ('MEAL_PLAN', 'POST');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "NotificationOnPost" DROP CONSTRAINT "NotificationOnPost_post_id_fkey";

-- DropForeignKey
ALTER TABLE "NotificationOnPost" DROP CONSTRAINT "NotificationOnPost_post_notification_id_fkey";

-- DropForeignKey
ALTER TABLE "NotificationOnPost" DROP CONSTRAINT "NotificationOnPost_reviewer_id_fkey";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "NotificationOnPost";

-- CreateTable
CREATE TABLE "notification_on_post" (
    "id" SERIAL NOT NULL,
    "post_notification_id" INTEGER NOT NULL,
    "external_id" INTEGER NOT NULL,
    "external_table" "NotificationExternalTable" NOT NULL,
    "reviewer_id" TEXT,

    CONSTRAINT "notification_on_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceType" TEXT,
    "sourceId" INTEGER,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification_on_post" ADD CONSTRAINT "notification_on_post_post_notification_id_fkey" FOREIGN KEY ("post_notification_id") REFERENCES "post_notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_on_post" ADD CONSTRAINT "notification_on_post_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
