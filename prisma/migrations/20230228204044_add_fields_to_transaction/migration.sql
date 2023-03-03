/*
  Warnings:

  - You are about to drop the column `transaction_id` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transaction_id",
ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "perform_time" DROP NOT NULL,
ALTER COLUMN "cancel_time" DROP NOT NULL,
ALTER COLUMN "state" SET DEFAULT 1;
