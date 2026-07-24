-- AlterTable
ALTER TABLE "MockExam" ADD COLUMN     "answers" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "currentIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionIds" JSONB NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "domainFilter" "DomainKey",
    "scenarioFilter" "ScenarioKey",
    "difficultyFilter" "Difficulty",
    "completedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeSession_userId_completedAt_idx" ON "PracticeSession"("userId", "completedAt");

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
