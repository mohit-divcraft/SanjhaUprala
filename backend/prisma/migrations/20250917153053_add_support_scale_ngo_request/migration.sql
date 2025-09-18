/*
  Warnings:

  - You are about to drop the column `coverImage` on the `Village` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Village" DROP COLUMN "coverImage";

-- CreateTable
CREATE TABLE "SupportType" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scale" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NGO" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NGO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NGORequest" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT,
    "ngoName" TEXT,
    "ngoType" TEXT,
    "contactPerson" TEXT NOT NULL,
    "designation" TEXT,
    "contactPhone" TEXT NOT NULL,
    "supportTypeId" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "remarks" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NGORequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportType_key_key" ON "SupportType"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Scale_key_key" ON "Scale"("key");

-- AddForeignKey
ALTER TABLE "NGORequest" ADD CONSTRAINT "NGORequest_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGORequest" ADD CONSTRAINT "NGORequest_supportTypeId_fkey" FOREIGN KEY ("supportTypeId") REFERENCES "SupportType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGORequest" ADD CONSTRAINT "NGORequest_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGORequest" ADD CONSTRAINT "NGORequest_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
