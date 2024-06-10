-- CreateTable
CREATE TABLE "NotificationOnPost" (
    "id" SERIAL NOT NULL,
    "post_notification_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "NotificationOnPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "post_notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationOnPost" ADD CONSTRAINT "NotificationOnPost_post_notification_id_fkey" FOREIGN KEY ("post_notification_id") REFERENCES "post_notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationOnPost" ADD CONSTRAINT "NotificationOnPost_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
