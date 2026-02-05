-- CreateTable
CREATE TABLE "CohortTeacher" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CohortTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CohortTeacher_cohortId_teacherId_key" ON "CohortTeacher"("cohortId", "teacherId");

-- AddForeignKey
ALTER TABLE "CohortTeacher" ADD CONSTRAINT "CohortTeacher_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortTeacher" ADD CONSTRAINT "CohortTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing teacherId data to CohortTeacher table
INSERT INTO "CohortTeacher" ("id", "cohortId", "teacherId", "createdAt")
SELECT
    'ct_' || substr(md5(random()::text), 1, 25) as id,
    "id" as "cohortId",
    "teacherId",
    CURRENT_TIMESTAMP as "createdAt"
FROM "Cohort"
WHERE "teacherId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Cohort" DROP CONSTRAINT "Cohort_teacherId_fkey";

-- DropColumn
ALTER TABLE "Cohort" DROP COLUMN "teacherId";
