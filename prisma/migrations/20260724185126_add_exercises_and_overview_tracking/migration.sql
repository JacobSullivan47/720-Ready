-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('CONFIG_BUILDER', 'ANTI_PATTERN_SPOTTER', 'SEQUENCING');

-- CreateEnum
CREATE TYPE "OverviewItemType" AS ENUM ('DOMAIN', 'SCENARIO');

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseType" "ExerciseType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "domainKey" "DomainKey" NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverviewView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" "OverviewItemType" NOT NULL,
    "domainKey" "DomainKey",
    "scenarioKey" "ScenarioKey",
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OverviewView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_domainKey_idx" ON "ExerciseAttempt"("userId", "domainKey");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_itemId_idx" ON "ExerciseAttempt"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "OverviewView_userId_domainKey_key" ON "OverviewView"("userId", "domainKey");

-- CreateIndex
CREATE UNIQUE INDEX "OverviewView_userId_scenarioKey_key" ON "OverviewView"("userId", "scenarioKey");

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverviewView" ADD CONSTRAINT "OverviewView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
