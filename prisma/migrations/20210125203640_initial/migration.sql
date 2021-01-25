-- CreateTable
CREATE TABLE "BaseUser" (
    "baseUserId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "userPassword" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("baseUserId")
);

-- CreateTable
CREATE TABLE "Member" (
    "memberId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "memberBaseId" TEXT NOT NULL,

    PRIMARY KEY ("memberId")
);

-- CreateTable
CREATE TABLE "Task" (
    "taskId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "tickedOff" BOOLEAN NOT NULL,
    "tickedOffAt" TIMESTAMP(3),
    "resumedAt" TIMESTAMP(3),
    "editedAt" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "discarded" BOOLEAN NOT NULL,
    "discardedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,

    PRIMARY KEY ("taskId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BaseUser.userEmail_unique" ON "BaseUser"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberBaseId_unique" ON "Member"("memberBaseId");

-- AddForeignKey
ALTER TABLE "Member" ADD FOREIGN KEY ("memberBaseId") REFERENCES "BaseUser"("baseUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD FOREIGN KEY ("ownerId") REFERENCES "Member"("memberId") ON DELETE CASCADE ON UPDATE CASCADE;
