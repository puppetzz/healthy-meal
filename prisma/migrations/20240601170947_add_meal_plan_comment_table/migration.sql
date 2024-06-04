-- CreateTable
CREATE TABLE "meal_plan_comments" (
    "id" SERIAL NOT NULL,
    "meal_plan_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_plan_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "meal_plan_comments" ADD CONSTRAINT "meal_plan_comments_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_comments" ADD CONSTRAINT "meal_plan_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_comments" ADD CONSTRAINT "meal_plan_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "meal_plan_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
