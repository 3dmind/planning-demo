-- CreateTable
CREATE TABLE "Comment" (
    "commentId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    PRIMARY KEY ("commentId")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD FOREIGN KEY ("authorId") REFERENCES "Member"("memberId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD FOREIGN KEY ("taskId") REFERENCES "Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;
