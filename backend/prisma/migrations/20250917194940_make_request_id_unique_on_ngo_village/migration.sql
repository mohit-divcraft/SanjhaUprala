-- CreateTable
CREATE TABLE "NgoVillage" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT,

    CONSTRAINT "NgoVillage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NgoVillage_requestId_key" ON "NgoVillage"("requestId");

-- CreateIndex
CREATE INDEX "NgoVillage_villageId_idx" ON "NgoVillage"("villageId");

-- CreateIndex
CREATE INDEX "NgoVillage_ngoId_idx" ON "NgoVillage"("ngoId");

-- AddForeignKey
ALTER TABLE "NgoVillage" ADD CONSTRAINT "NgoVillage_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NgoVillage" ADD CONSTRAINT "NgoVillage_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NgoVillage" ADD CONSTRAINT "NgoVillage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "NGORequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
