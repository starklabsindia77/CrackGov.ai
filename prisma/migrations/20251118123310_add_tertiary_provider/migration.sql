-- AlterTable
ALTER TABLE "AiFeatureConfig" ADD COLUMN     "tertiaryProviderId" TEXT;

-- CreateIndex
CREATE INDEX "LeaderboardEntry_userId_period_idx" ON "LeaderboardEntry"("userId", "period");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_period_exam_score_idx" ON "LeaderboardEntry"("period", "exam", "score");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "QuestionBank_exam_topic_difficulty_idx" ON "QuestionBank"("exam", "topic", "difficulty");

-- CreateIndex
CREATE INDEX "QuestionBank_createdAt_idx" ON "QuestionBank"("createdAt");

-- CreateIndex
CREATE INDEX "QuestionBank_usageCount_idx" ON "QuestionBank"("usageCount");

-- CreateIndex
CREATE INDEX "Test_userId_idx" ON "Test"("userId");

-- CreateIndex
CREATE INDEX "Test_userId_createdAt_idx" ON "Test"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Test_exam_idx" ON "Test"("exam");

-- CreateIndex
CREATE INDEX "TestAttempt_userId_createdAt_idx" ON "TestAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TestAttempt_testId_score_idx" ON "TestAttempt"("testId", "score");

-- CreateIndex
CREATE INDEX "TestAttempt_createdAt_idx" ON "TestAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "AiFeatureConfig" ADD CONSTRAINT "AiFeatureConfig_tertiaryProviderId_fkey" FOREIGN KEY ("tertiaryProviderId") REFERENCES "AiProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
