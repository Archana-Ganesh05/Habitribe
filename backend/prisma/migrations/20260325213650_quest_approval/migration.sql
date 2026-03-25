-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "factionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdBy" TEXT,
    CONSTRAINT "Quest_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Quest" ("description", "factionId", "id", "reward", "title") SELECT "description", "factionId", "id", "reward", "title" FROM "Quest";
DROP TABLE "Quest";
ALTER TABLE "new_Quest" RENAME TO "Quest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
