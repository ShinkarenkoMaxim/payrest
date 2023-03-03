/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Reason` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reason_code_key" ON "Reason"("code");
