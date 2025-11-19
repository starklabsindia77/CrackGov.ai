import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting cleanup of dummy data (including user accounts)...");

  try {
    // Delete in order to respect foreign key constraints
    // Start with the most dependent records first

    console.log("📝 Deleting test-related data...");
    await prisma.testAttempt.deleteMany();
    await prisma.testQuestion.deleteMany();
    await prisma.test.deleteMany();
    console.log("✅ Test data deleted");

    console.log("📝 Deleting question attempts...");
    await prisma.questionAttempt.deleteMany();
    console.log("✅ Question attempts deleted");

    console.log("📋 Deleting daily tasks...");
    await prisma.dailyTask.deleteMany();
    console.log("✅ Daily tasks deleted");

    console.log("📈 Deleting PYQ analysis...");
    await prisma.pyqAnalysis.deleteMany();
    console.log("✅ PYQ analysis deleted");

    console.log("📊 Deleting subscription usage...");
    await prisma.subscriptionUsage.deleteMany();
    console.log("✅ Subscription usage deleted");

    console.log("🎴 Deleting flashcard reviews...");
    await prisma.flashcardReview.deleteMany();
    console.log("✅ Flashcard reviews deleted");

    console.log("🎴 Deleting flashcards...");
    await prisma.flashcard.deleteMany();
    console.log("✅ Flashcards deleted");

    console.log("🔖 Deleting bookmarks...");
    await prisma.bookmark.deleteMany();
    console.log("✅ Bookmarks deleted");

    console.log("📝 Deleting notes...");
    await prisma.note.deleteMany();
    console.log("✅ Notes deleted");

    console.log("🔥 Deleting study streaks...");
    await prisma.studyStreak.deleteMany();
    console.log("✅ Study streaks deleted");

    console.log("🏆 Deleting leaderboard entries...");
    await prisma.leaderboardEntry.deleteMany();
    console.log("✅ Leaderboard entries deleted");

    console.log("📋 Deleting study plans...");
    await prisma.studyPlan.deleteMany();
    console.log("✅ Study plans deleted");

    console.log("🔔 Deleting notifications...");
    await prisma.notification.deleteMany();
    console.log("✅ Notifications deleted");

    console.log("⏰ Deleting study reminders...");
    await prisma.studyReminder.deleteMany();
    console.log("✅ Study reminders deleted");

    console.log("📚 Deleting question bank...");
    await prisma.questionBank.deleteMany();
    console.log("✅ Question bank deleted");

    console.log("📖 Deleting previous year questions...");
    await prisma.previousYearQuestion.deleteMany();
    console.log("✅ Previous year questions deleted");

    // Study Groups and related
    console.log("👥 Deleting study group posts...");
    await prisma.groupPost.deleteMany();
    console.log("✅ Group posts deleted");

    console.log("👥 Deleting group members...");
    await prisma.groupMember.deleteMany();
    console.log("✅ Group members deleted");

    console.log("👥 Deleting study groups...");
    await prisma.studyGroup.deleteMany();
    console.log("✅ Study groups deleted");

    // User Segmentation
    console.log("👥 Deleting user segment memberships...");
    await prisma.userSegmentMembership.deleteMany();
    console.log("✅ User segment memberships deleted");

    console.log("📧 Deleting campaign recipients...");
    await prisma.campaignRecipient.deleteMany();
    console.log("✅ Campaign recipients deleted");

    console.log("📧 Deleting email campaigns...");
    await prisma.emailCampaign.deleteMany();
    console.log("✅ Email campaigns deleted");

    console.log("👥 Deleting user segments...");
    await prisma.userSegment.deleteMany();
    console.log("✅ User segments deleted");

    // Exam-related
    console.log("📝 Deleting exam attempts...");
    await prisma.examAttempt.deleteMany();
    console.log("✅ Exam attempts deleted");

    console.log("📝 Deleting exam sessions...");
    await prisma.examSession.deleteMany();
    console.log("✅ Exam sessions deleted");

    console.log("📝 Deleting generated exams...");
    await prisma.generatedExam.deleteMany();
    console.log("✅ Generated exams deleted");

    console.log("📝 Deleting exam templates...");
    await prisma.examTemplate.deleteMany();
    console.log("✅ Exam templates deleted");

    // Tokens (these are typically not dummy data, but cleaning them up)
    console.log("🔑 Deleting OTP tokens...");
    await prisma.otpToken.deleteMany();
    console.log("✅ OTP tokens deleted");

    console.log("🔑 Deleting password reset tokens...");
    await prisma.passwordResetToken.deleteMany();
    console.log("✅ Password reset tokens deleted");

    console.log("🔑 Deleting email verification tokens...");
    await prisma.emailVerificationToken.deleteMany();
    console.log("✅ Email verification tokens deleted");

    console.log("👤 Deleting user accounts...");
    await prisma.user.deleteMany();
    console.log("✅ User accounts deleted");

    // Note: We're NOT deleting:
    // - AiProvider, AiProviderKey, AiFeatureConfig (system configs)
    // - PaymentConfig (system config)
    // - Page, Post, Faq, Announcement, Banner (CMS content - may not be dummy data)

    console.log("\n✅ Cleanup completed successfully!");
    
    const userCount = await prisma.user.count();
    console.log(`📊 Remaining users: ${userCount}`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Error cleaning up database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

