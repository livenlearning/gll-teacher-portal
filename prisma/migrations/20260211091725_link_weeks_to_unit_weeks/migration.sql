-- AlterTable
ALTER TABLE "Week" ADD COLUMN "unitWeekId" TEXT;

-- AddForeignKey
ALTER TABLE "Week" ADD CONSTRAINT "Week_unitWeekId_fkey" FOREIGN KEY ("unitWeekId") REFERENCES "UnitWeek"("id") ON DELETE SET NULL ON UPDATE CASCADE;
