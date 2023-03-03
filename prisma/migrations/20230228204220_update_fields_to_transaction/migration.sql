-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_reasonId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "reasonId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "Reason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
