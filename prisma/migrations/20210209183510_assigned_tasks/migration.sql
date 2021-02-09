/*
  Warnings:

  - Added the required column `assigneeId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assigneeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD FOREIGN KEY ("assigneeId") REFERENCES "Member"("memberId") ON DELETE CASCADE ON UPDATE CASCADE;
