-- AlterTable
ALTER TABLE "NgoVillage" ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "scaleId" TEXT,
ADD COLUMN     "supportTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "NgoVillage" ADD CONSTRAINT "NgoVillage_supportTypeId_fkey" FOREIGN KEY ("supportTypeId") REFERENCES "SupportType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NgoVillage" ADD CONSTRAINT "NgoVillage_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
