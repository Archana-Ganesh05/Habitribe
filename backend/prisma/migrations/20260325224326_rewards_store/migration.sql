-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    CONSTRAINT "UserReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
