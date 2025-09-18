/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `NGO` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NGO_name_key" ON "NGO"("name");
