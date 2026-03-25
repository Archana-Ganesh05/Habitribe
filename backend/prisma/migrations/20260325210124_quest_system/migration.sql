-- CreateTable
CREATE TABLE "QuestParticipation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "QuestParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestParticipation_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
