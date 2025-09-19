-- CreateTable
CREATE TABLE "SchoolStationeryRequirement" (
    "id" TEXT NOT NULL,
    "srNo" INTEGER,
    "blockName" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "studentStrength" INTEGER,
    "requirementCount" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolStationeryRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolStationeryRequirement_blockName_idx" ON "SchoolStationeryRequirement"("blockName");
