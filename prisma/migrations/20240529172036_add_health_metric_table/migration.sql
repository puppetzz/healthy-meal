-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateTable
CREATE TABLE "health_metrics" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "bmi" DOUBLE PRECISION NOT NULL,
    "bmr" DOUBLE PRECISION NOT NULL,
    "tdee" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "health_metrics_user_id_key" ON "health_metrics"("user_id");

-- AddForeignKey
ALTER TABLE "health_metrics" ADD CONSTRAINT "health_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
