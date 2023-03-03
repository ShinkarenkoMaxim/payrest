-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "account" JSONB NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL,
    "perform_time" TIMESTAMP(3) NOT NULL,
    "cancel_time" TIMESTAMP(3) NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "reasonId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reason" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "code" INTEGER NOT NULL,

    CONSTRAINT "Reason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "cart" JSONB NOT NULL,
    "location" JSONB NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "Reason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
