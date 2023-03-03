/*
  Warnings:

  - A unique constraint covering the columns `[payme_transaction_id]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payme_transaction_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "payme_transaction_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_payme_transaction_id_key" ON "Transaction"("payme_transaction_id");
