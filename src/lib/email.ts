// Email service - stubbed for MVP
// In production, integrate with SendGrid, Resend, or similar service

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  // TODO: Integrate with real email service
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  
  console.log("Password reset email (stubbed):");
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  
  // In production, use:
  // await emailService.send({
  //   to: email,
  //   subject: "Reset Your Password",
  //   html: `Click here to reset your password: ${resetUrl}`,
  // });
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<void> {
  // TODO: Integrate with email service (SendGrid, Resend, etc.)
  const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/verify-email?token=${verificationToken}`;
  
  console.log("Email verification email (stubbed):");
  console.log(`To: ${email}`);
  console.log(`Verification URL: ${verifyUrl}`);
  
  // In production, use:
  // await sendEmail({
  //   to: email,
  //   subject: "Verify your email address",
  //   html: `Click here to verify your email: ${verifyUrl}`,
  // });
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  const welcomeUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/app/dashboard`;
  
  console.log("Welcome email (stubbed):");
  console.log(`To: ${email}`);
  console.log(`Welcome URL: ${welcomeUrl}`);
  
  // In production, use:
  // await sendEmail({
  //   to: email,
  //   subject: "Welcome to CrackGov.ai!",
  //   html: `
  //     <h1>Welcome${name ? ` ${name}` : ""}!</h1>
  //     <p>Thank you for joining CrackGov.ai. Start your journey to ace your government exams!</p>
  //     <a href="${welcomeUrl}">Get Started</a>
  //   `,
  // });
}

export async function sendTestResultEmail(
  email: string,
  testResult: {
    exam: string;
    score: number;
    total: number;
    accuracy: number;
    weakTopics?: string[];
  }
): Promise<void> {
  const resultUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/app/test-history`;
  
  console.log("Test result email (stubbed):");
  console.log(`To: ${email}`);
  console.log(`Test: ${testResult.exam}`);
  console.log(`Score: ${testResult.score}/${testResult.total} (${testResult.accuracy.toFixed(1)}%)`);
  if (testResult.weakTopics && testResult.weakTopics.length > 0) {
    console.log(`Weak Topics: ${testResult.weakTopics.join(", ")}`);
  }
  console.log(`View Results: ${resultUrl}`);
  
  // In production, use:
  // await sendEmail({
  //   to: email,
  //   subject: `Test Results: ${testResult.exam}`,
  //   html: `
  //     <h2>Your Test Results</h2>
  //     <p><strong>Exam:</strong> ${testResult.exam}</p>
  //     <p><strong>Score:</strong> ${testResult.score}/${testResult.total}</p>
  //     <p><strong>Accuracy:</strong> ${testResult.accuracy.toFixed(1)}%</p>
  //     ${testResult.weakTopics && testResult.weakTopics.length > 0 ? `
  //       <h3>Areas to Improve:</h3>
  //       <ul>${testResult.weakTopics.map(topic => `<li>${topic}</li>`).join("")}</ul>
  //     ` : ""}
  //     <a href="${resultUrl}">View Detailed Results</a>
  //   `,
  // });
}

export async function sendStudyReminderEmail(
  email: string,
  reminder: {
    exam: string;
    targetDate: string;
    daysRemaining: number;
  }
): Promise<void> {
  const studyPlanUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/app/study-plan`;
  
  console.log("Study reminder email (stubbed):");
  console.log(`To: ${email}`);
  console.log(`Exam: ${reminder.exam}`);
  console.log(`Target Date: ${reminder.targetDate}`);
  console.log(`Days Remaining: ${reminder.daysRemaining}`);
  console.log(`Study Plan: ${studyPlanUrl}`);
  
  // In production, use:
  // await sendEmail({
  //   to: email,
  //   subject: `Study Reminder: ${reminder.daysRemaining} days until ${reminder.exam}`,
  //   html: `
  //     <h2>Study Reminder</h2>
  //     <p>You have <strong>${reminder.daysRemaining} days</strong> until your ${reminder.exam} exam.</p>
  //     <p>Keep up the great work! Review your study plan and continue practicing.</p>
  //     <a href="${studyPlanUrl}">View Study Plan</a>
  //   `,
  // });
}

export async function sendWeeklyProgressEmail(
  email: string,
  progress: {
    testsTaken: number;
    avgAccuracy: number;
    improvement: number;
    topTopics: string[];
  }
): Promise<void> {
  const dashboardUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/app/dashboard`;
  
  console.log("Weekly progress email (stubbed):");
  console.log(`To: ${email}`);
  console.log(`Tests Taken: ${progress.testsTaken}`);
  console.log(`Average Accuracy: ${progress.avgAccuracy.toFixed(1)}%`);
  console.log(`Improvement: ${progress.improvement > 0 ? "+" : ""}${progress.improvement.toFixed(1)}%`);
  console.log(`Top Topics: ${progress.topTopics.join(", ")}`);
  console.log(`Dashboard: ${dashboardUrl}`);
  
  // In production, use:
  // await sendEmail({
  //   to: email,
  //   subject: "Your Weekly Progress Report",
  //   html: `
  //     <h2>Weekly Progress Report</h2>
  //     <p><strong>Tests Taken:</strong> ${progress.testsTaken}</p>
  //     <p><strong>Average Accuracy:</strong> ${progress.avgAccuracy.toFixed(1)}%</p>
  //     <p><strong>Improvement:</strong> ${progress.improvement > 0 ? "+" : ""}${progress.improvement.toFixed(1)}%</p>
  //     <h3>Top Performing Topics:</h3>
  //     <ul>${progress.topTopics.map(topic => `<li>${topic}</li>`).join("")}</ul>
  //     <a href="${dashboardUrl}">View Full Dashboard</a>
  //   `,
  // });
}

export async function sendEmailCampaign(
  campaignId: string,
  userIds: string[]
): Promise<void> {
  // TODO: Integrate with email service
  // This would fetch campaign details, user emails, and send emails
  console.log(`Email campaign (stubbed): Campaign ${campaignId}`);
  console.log(`Sending to ${userIds.length} users`);
  // In production, batch send emails and update recipient status
}

