-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentType" ADD VALUE 'TASK';
ALTER TYPE "ContentType" ADD VALUE 'DELIVERABLE';
ALTER TYPE "ContentType" ADD VALUE 'LINK';
ALTER TYPE "ContentType" ADD VALUE 'CROSS_CLASSROOM';
ALTER TYPE "ContentType" ADD VALUE 'SURVEY';
ALTER TYPE "ContentType" ADD VALUE 'GALLERY';

-- AlterTable
ALTER TABLE "Cohort" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "facilitator" TEXT,
ADD COLUMN     "facilitatorEmail" TEXT,
ADD COLUMN     "padletLink" TEXT,
ADD COLUMN     "sessionDay" TEXT,
ADD COLUMN     "sessionTime" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "zoomLink" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "schoolName" TEXT;

-- AlterTable
ALTER TABLE "Week" ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "unlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PartnerSchool" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "PartnerSchool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PartnerSchool" ADD CONSTRAINT "PartnerSchool_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerSchool" ADD CONSTRAINT "PartnerSchool_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
