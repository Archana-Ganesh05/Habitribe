-- CreateTable
CREATE TABLE "Faction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "description" TEXT,
    "maxMembers" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Membership_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "factionId" TEXT NOT NULL,
    CONSTRAINT "Quest_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
