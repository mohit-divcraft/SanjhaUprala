-- AlterTable
ALTER TABLE "Village" ADD COLUMN     "mostEffected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needsHelp" BOOLEAN NOT NULL DEFAULT false;
