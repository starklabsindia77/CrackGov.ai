import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample data generators
const exams = ["UPSC", "SSC CGL", "SSC CHSL", "Banking", "Railway", "Defense"];
const subjects = ["Mathematics", "English", "General Knowledge", "Reasoning", "Current Affairs"];
const topics = [
  "Algebra", "Geometry", "Trigonometry", "Grammar", "Vocabulary", 
  "History", "Geography", "Science", "Logical Reasoning", "Data Interpretation"
];

const difficulties = ["easy", "medium", "hard"];

// Generate random date within last N days
function randomDate(daysAgo: number = 30): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// Generate random question
function generateQuestion(exam: string, topic?: string): {
  question: string;
  options: string[];
  correctOption: string;
  explanation: string;
} {
  const questionTemplates = [
    `What is the capital of India?`,
    `Which of the following is a prime number?`,
    `Who wrote the book "Discovery of India"?`,
    `What is the chemical formula of water?`,
    `Which river is known as the Ganga of the South?`,
    `What is the square root of 144?`,
    `Which planet is closest to the Sun?`,
    `Who is known as the Father of the Nation?`,
    `What is the largest ocean in the world?`,
    `Which is the smallest state in India?`,
  ];

  const question = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
  const options = [
    "Option A",
    "Option B", 
    "Option C",
    "Option D"
  ];
  const correctOption = options[Math.floor(Math.random() * options.length)];
  const explanation = `This is the correct answer because it matches the standard definition and facts.`;

  return { question, options, correctOption, explanation };
}

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

  // Create Question Bank
  console.log("📚 Creating question bank...");
  const questionBank = [];
  for (let i = 0; i < 200; i++) {
    const exam = exams[Math.floor(Math.random() * exams.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const q = generateQuestion(exam, topic);

    const question = await prisma.questionBank.create({
      data: {
        exam,
        subject,
        topic,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        difficulty,
        source: Math.random() > 0.5 ? "Previous Year" : "AI Generated",
        year: Math.random() > 0.7 ? 2020 + Math.floor(Math.random() * 4) : null,
        tags: [topic, subject],
        usageCount: Math.floor(Math.random() * 50),
      },
    });
    questionBank.push(question);
  }
  console.log(`✅ Created ${questionBank.length} questions in question bank`);

  // Create Previous Year Questions
  console.log("📖 Creating previous year questions...");
  for (let i = 0; i < 100; i++) {
    const exam = exams[Math.floor(Math.random() * exams.length)];
    const year = 2020 + Math.floor(Math.random() * 4);
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const q = generateQuestion(exam, topic);

    await prisma.previousYearQuestion.create({
      data: {
        exam,
        year,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        topic,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        paperType: Math.random() > 0.5 ? "prelims" : "mains",
      },
    });
  }
  console.log(`✅ Created 100 previous year questions`);

  // Create Tests and Test Attempts for each user
  console.log("📝 Creating tests and test attempts...");
  for (const user of allUsers) {
    const userExam = user.preferredExams[0] || exams[0];
    
    // Create 3-10 tests per user
    const numTests = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < numTests; i++) {
      const testDate = randomDate(30);
      const questionCount = user.subscriptionStatus === "free" ? 20 : Math.random() > 0.5 ? 20 : 100;
      
      // Select random questions
      const selectedQuestions = questionBank
        .filter(q => q.exam === userExam)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(questionCount, questionBank.length));

      if (selectedQuestions.length === 0) continue;

      const test = await prisma.test.create({
        data: {
          userId: user.id,
          exam: userExam,
          timeLimit: questionCount === 100 ? 120 : 30,
          createdAt: testDate,
          questions: {
            create: selectedQuestions.map(q => ({
              question: q.question,
              options: q.options,
              correctOption: q.correctOption,
              explanation: q.explanation,
              topic: q.topic || undefined,
            })),
          },
        },
      });

      // Create test attempt (completed test)
      if (Math.random() > 0.3) { // 70% of tests are completed
        const score = Math.floor(selectedQuestions.length * (0.5 + Math.random() * 0.4)); // 50-90% accuracy
        const accuracy = (score / selectedQuestions.length) * 100;
        
        const topicBreakdown: Record<string, { correct: number; total: number }> = {};
        selectedQuestions.forEach((q, idx) => {
          const topic = q.topic || "General";
          if (!topicBreakdown[topic]) {
            topicBreakdown[topic] = { correct: 0, total: 0 };
          }
          topicBreakdown[topic].total++;
          if (idx < score) {
            topicBreakdown[topic].correct++;
          }
        });

        await prisma.testAttempt.create({
          data: {
            testId: test.id,
            userId: user.id,
            score,
            total: selectedQuestions.length,
            accuracy,
            details: {
              topicBreakdown,
              timeSpent: questionCount === 100 ? Math.floor(Math.random() * 60) + 60 : Math.floor(Math.random() * 20) + 10,
            },
            createdAt: new Date(testDate.getTime() + Math.random() * 3600000), // Within 1 hour of test creation
          },
        });
      }
    }
  }
  console.log(`✅ Created tests and attempts for all users`);

  // Create Study Plans
  console.log("📋 Creating study plans...");
  for (const user of allUsers) {
    const numPlans = user.subscriptionStatus === "free" ? 1 : Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numPlans; i++) {
      const exam = user.preferredExams[0] || exams[0];
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + Math.floor(Math.random() * 6) + 3);

      await prisma.studyPlan.create({
        data: {
          userId: user.id,
          exam,
          targetDate: targetDate.toISOString().split("T")[0],
          hoursPerDay: user.dailyStudyGoal || 4,
          weakTopics: topics.slice(0, Math.floor(Math.random() * 3) + 1),
          planData: {
            weeks: Array.from({ length: 12 }, (_, week) => ({
              week: week + 1,
              topics: topics.slice(week * 2, (week + 1) * 2),
              hours: user.dailyStudyGoal || 4,
            })),
          },
          createdAt: randomDate(60),
        },
      });
    }
  }
  console.log(`✅ Created study plans for all users`);

  // Create Flashcards
  console.log("🎴 Creating flashcards...");
  for (const user of allUsers.filter(u => u.subscriptionStatus !== "free")) {
    const numFlashcards = Math.floor(Math.random() * 30) + 10;
    for (let i = 0; i < numFlashcards; i++) {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const exam = user.preferredExams[0] || exams[0];
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + Math.floor(Math.random() * 7));

      await prisma.flashcard.create({
        data: {
          userId: user.id,
          front: `What is ${topic}?`,
          back: `This is a detailed explanation about ${topic} and its key concepts.`,
          topic,
          exam,
          tags: [topic, exam],
          difficulty: Math.floor(Math.random() * 6),
          reviewCount: Math.floor(Math.random() * 10),
          correctCount: Math.floor(Math.random() * 8),
          nextReview,
          lastReviewed: randomDate(7),
        },
      });
    }
  }
  console.log(`✅ Created flashcards for pro/topper users`);

  // Create Daily Tasks
  console.log("✅ Creating daily tasks...");
  for (const user of allUsers) {
    const today = new Date();
    for (let day = 0; day < 7; day++) {
      const taskDate = new Date(today);
      taskDate.setDate(taskDate.getDate() - day);

      const taskTypes = ["study_plan", "mock_test", "flashcard", "doubt", "notes"];
      const numTasks = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numTasks; i++) {
        const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
        const completed = Math.random() > 0.3;

        await prisma.dailyTask.create({
          data: {
            userId: user.id,
            date: taskDate,
            taskType,
            title: `${taskType.replace("_", " ")} task`,
            description: `Complete your ${taskType.replace("_", " ")} for today`,
            priority: Math.floor(Math.random() * 6),
            completed,
            completedAt: completed ? taskDate : null,
          },
        });
      }
    }
  }
  console.log(`✅ Created daily tasks for all users`);

  // Create Study Streaks
  console.log("🔥 Creating study streaks...");
  for (const user of allUsers) {
    const today = new Date();
    let streakDays = Math.floor(Math.random() * 15) + 1;
    
    for (let day = 0; day < streakDays; day++) {
      const streakDate = new Date(today);
      streakDate.setDate(streakDate.getDate() - day);
      streakDate.setHours(0, 0, 0, 0);

      await prisma.studyStreak.create({
        data: {
          userId: user.id,
          date: streakDate,
          activityType: "all",
        },
      });
    }
  }
  console.log(`✅ Created study streaks for all users`);

  // Create Leaderboard Entries
  console.log("🏆 Creating leaderboard entries...");
  for (const user of allUsers) {
    const periods = ["daily", "weekly", "monthly", "all-time"];
    for (const period of periods) {
      const periodStart = new Date();
      if (period === "daily") {
        periodStart.setHours(0, 0, 0, 0);
      } else if (period === "weekly") {
        periodStart.setDate(periodStart.getDate() - periodStart.getDay());
      } else if (period === "monthly") {
        periodStart.setDate(1);
      } else {
        periodStart.setFullYear(2020);
      }

      await prisma.leaderboardEntry.create({
        data: {
          userId: user.id,
          exam: user.preferredExams[0] || null,
          period,
          score: Math.floor(Math.random() * 5000) + 100,
          rank: null, // Will be calculated by application
          metadata: {
            testsTaken: Math.floor(Math.random() * 20) + 5,
            accuracy: Math.floor(Math.random() * 30) + 60,
            averageScore: Math.floor(Math.random() * 20) + 70,
          },
          periodStart,
        },
      });
    }
  }
  console.log(`✅ Created leaderboard entries for all users`);

  // Create Notifications
  console.log("🔔 Creating notifications...");
  for (const user of allUsers) {
    const numNotifications = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < numNotifications; i++) {
      const types = ["info", "success", "warning"];
      const type = types[Math.floor(Math.random() * types.length)];
      
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `Notification ${i + 1}`,
          message: `This is a ${type} notification for ${user.name}`,
          type,
          read: Math.random() > 0.5,
          link: Math.random() > 0.5 ? "/app/dashboard" : null,
          createdAt: randomDate(7),
        },
      });
    }
  }
  console.log(`✅ Created notifications for all users`);

  // Create Bookmarks
  console.log("🔖 Creating bookmarks...");
  for (const user of allUsers) {
    const numBookmarks = Math.floor(Math.random() * 10) + 3;
    for (let i = 0; i < numBookmarks; i++) {
      const types = ["question", "test", "study_plan"];
      const type = types[Math.floor(Math.random() * types.length)];

      await prisma.bookmark.create({
        data: {
          userId: user.id,
          type,
          itemId: `item-${i}`,
          title: `Bookmarked ${type} ${i + 1}`,
          metadata: {
            exam: user.preferredExams[0] || exams[0],
          },
          createdAt: randomDate(30),
        },
      });
    }
  }
  console.log(`✅ Created bookmarks for all users`);

  // Create Notes
  console.log("📝 Creating notes...");
  for (const user of allUsers) {
    const numNotes = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < numNotes; i++) {
      const types = ["general", "question", "test"];
      const type = types[Math.floor(Math.random() * types.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];

      await prisma.note.create({
        data: {
          userId: user.id,
          type,
          title: `Note about ${topic}`,
          content: `This is a detailed note about ${topic}. It contains important information and key points that the user wants to remember.`,
          tags: [topic, user.preferredExams[0] || exams[0]],
          createdAt: randomDate(30),
        },
      });
    }
  }
  console.log(`✅ Created notes for all users`);

  // Create Subscription Usage
  console.log("📊 Creating subscription usage data...");
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  for (const user of allUsers) {
    await prisma.subscriptionUsage.create({
      data: {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
        aiCallsCount: user.subscriptionStatus === "free" ? 1 : Math.floor(Math.random() * 50) + 10,
        mockTestsCount: user.subscriptionStatus === "free" ? 1 : Math.floor(Math.random() * 20) + 5,
        studyPlansCount: user.subscriptionStatus === "free" ? 1 : Math.floor(Math.random() * 5) + 1,
        doubtsCount: user.subscriptionStatus === "free" ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 100) + 20,
        notesGenerated: user.subscriptionStatus === "topper" ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 10),
        flashcardsGenerated: user.subscriptionStatus === "free" ? 0 : Math.floor(Math.random() * 50) + 10,
      },
    });
  }
  console.log(`✅ Created subscription usage data for all users`);

  // Create PYQ Analysis for Pro/Topper users
  console.log("📈 Creating PYQ analysis...");
  for (const user of allUsers.filter(u => u.subscriptionStatus !== "free")) {
    const exam = user.preferredExams[0] || exams[0];
    const year = 2020 + Math.floor(Math.random() * 4);

    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    topics.slice(0, 5).forEach(topic => {
      topicBreakdown[topic] = {
        correct: Math.floor(Math.random() * 8) + 2,
        total: Math.floor(Math.random() * 5) + 10,
      };
    });

    const difficultyBreakdown: Record<string, { correct: number; total: number }> = {};
    difficulties.forEach(diff => {
      difficultyBreakdown[diff] = {
        correct: Math.floor(Math.random() * 5) + 3,
        total: Math.floor(Math.random() * 3) + 8,
      };
    });

    const weakAreas = topics.slice(0, Math.floor(Math.random() * 3) + 1);
    const strongAreas = topics.slice(3, 3 + Math.floor(Math.random() * 2) + 1);

    await prisma.pyqAnalysis.create({
      data: {
        userId: user.id,
        exam,
        year,
        topicBreakdown,
        difficultyBreakdown,
        weakAreas,
        strongAreas,
        recommendations: {
          text: `Focus on improving ${weakAreas.join(", ")}. Continue practicing ${strongAreas.join(", ")} to maintain your strength.`,
        },
      },
    });
  }
  console.log(`✅ Created PYQ analysis for pro/topper users`);

  // Create Study Reminders
  console.log("⏰ Creating study reminders...");
  for (const user of allUsers) {
    const exam = user.preferredExams[0] || exams[0];
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + Math.floor(Math.random() * 6) + 3);

    await prisma.studyReminder.create({
      data: {
        userId: user.id,
        exam,
        targetDate,
        message: `Your ${exam} exam is coming up! Keep studying regularly.`,
        enabled: true,
      },
    });
  }
  console.log(`✅ Created study reminders for all users`);

  // Create Question Attempts
  console.log("📝 Creating question attempts...");
  for (const user of allUsers) {
    const userQuestions = questionBank
      .filter(q => q.exam === (user.preferredExams[0] || exams[0]))
      .slice(0, Math.min(50, questionBank.length));

    for (const question of userQuestions) {
      if (Math.random() > 0.3) { // 70% attempt rate
        const isCorrect = Math.random() > 0.3; // 70% accuracy
        await prisma.questionAttempt.create({
          data: {
            userId: user.id,
            questionId: question.id,
            selectedOption: isCorrect ? question.correctOption : question.options[0],
            isCorrect,
            timeSpent: Math.floor(Math.random() * 60) + 10,
            createdAt: randomDate(30),
          },
        });
      }
    }
  }
  console.log(`✅ Created question attempts for all users`);

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Admin users: 1`);
  console.log(`   - Free users: ${freeUsers.length}`);
  console.log(`   - Pro users: ${proUsers.length}`);
  console.log(`   - Topper users: ${topperUsers.length}`);
  console.log(`   - Total users: ${allUsers.length}`);
  console.log(`   - Question bank: ${questionBank.length} questions`);
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

