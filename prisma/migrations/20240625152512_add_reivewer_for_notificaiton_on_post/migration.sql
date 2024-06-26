-- AlterTable
ALTER TABLE "NotificationOnPost" ADD COLUMN     "reviewer_id" TEXT;

-- AddForeignKey
ALTER TABLE "NotificationOnPost" ADD CONSTRAINT "NotificationOnPost_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
