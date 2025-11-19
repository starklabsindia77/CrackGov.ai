import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const exams = ["UPSC", "SSC CGL", "SSC CHSL", "Banking", "Railway", "Defense"];

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...");
  await prisma.testAttempt.deleteMany();
  await prisma.testQuestion.deleteMany();
  await prisma.test.deleteMany();
  await prisma.questionAttempt.deleteMany();
  await prisma.dailyTask.deleteMany();
  await prisma.pyqAnalysis.deleteMany();
  await prisma.subscriptionUsage.deleteMany();
  await prisma.flashcardReview.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.note.deleteMany();
  await prisma.studyStreak.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.studyReminder.deleteMany();
  await prisma.previousYearQuestion.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Data cleaned");

  // Create Admin User
  console.log("👤 Creating admin user...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@crackgov.ai",
      passwordHash: adminPassword,
      name: "Admin User",
      role: "admin",
      subscriptionStatus: "topper",
      emailVerified: true,
      dailyStudyGoal: 8,
      preferredExams: ["UPSC", "SSC CGL"],
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create Free Plan Users
  console.log("👥 Creating free plan users...");
  const freeUsers = [];
  for (let i = 1; i <= 5; i++) {
    const password = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: `free${i}@example.com`,
        passwordHash: password,
        name: `Free User ${i}`,
        role: "user",
        subscriptionStatus: "free",
        emailVerified: true,
        dailyStudyGoal: Math.floor(Math.random() * 4) + 2,
        preferredExams: [exams[Math.floor(Math.random() * exams.length)]],
      },
    });
    freeUsers.push(user);
  }
  console.log(`✅ Created ${freeUsers.length} free users`);

  // Create Pro Plan Users
  console.log("👥 Creating pro plan users...");
  const proUsers = [];
  for (let i = 1; i <= 5; i++) {
    const password = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: `pro${i}@example.com`,
        passwordHash: password,
        name: `Pro User ${i}`,
        role: "user",
        subscriptionStatus: "pro",
        emailVerified: true,
        dailyStudyGoal: Math.floor(Math.random() * 6) + 4,
        preferredExams: [exams[Math.floor(Math.random() * exams.length)]],
      },
    });
    proUsers.push(user);
  }
  console.log(`✅ Created ${proUsers.length} pro users`);

  // Create Topper Plan Users
  console.log("👥 Creating topper plan users...");
  const topperUsers = [];
  for (let i = 1; i <= 3; i++) {
    const password = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: `topper${i}@example.com`,
        passwordHash: password,
        name: `Topper User ${i}`,
        role: "user",
        subscriptionStatus: "topper",
        emailVerified: true,
        dailyStudyGoal: Math.floor(Math.random() * 4) + 6,
        preferredExams: exams.slice(0, 2),
      },
    });
    topperUsers.push(user);
  }
  console.log(`✅ Created ${topperUsers.length} topper users`);

  const allUsers = [admin, ...freeUsers, ...proUsers, ...topperUsers];

  console.log("\n🎉 User seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Admin users: 1`);
  console.log(`   - Free users: ${freeUsers.length}`);
  console.log(`   - Pro users: ${proUsers.length}`);
  console.log(`   - Topper users: ${topperUsers.length}`);
  console.log(`   - Total users: ${allUsers.length}`);
  console.log("\n🔑 Login Credentials:");
  console.log(`   Admin: admin@crackgov.ai / admin123`);
  console.log(`   Free: free1@example.com / password123`);
  console.log(`   Pro: pro1@example.com / password123`);
  console.log(`   Topper: topper1@example.com / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

