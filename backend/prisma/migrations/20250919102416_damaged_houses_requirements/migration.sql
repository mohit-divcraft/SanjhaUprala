-- CreateTable
CREATE TABLE "HouseDamageRequirement" (
    "id" TEXT NOT NULL,
    "claimID" TEXT NOT NULL,
    "claimantName" TEXT NOT NULL,
    "fatherName" TEXT,
    "gender" TEXT,
    "age" INTEGER,
    "mobileNumber" TEXT,
    "district" TEXT,
    "tehsil" TEXT,
    "village" TEXT,
    "fullAddress" TEXT,
    "surveyType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseDamageRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseDamageRequirement_claimID_key" ON "HouseDamageRequirement"("claimID");
