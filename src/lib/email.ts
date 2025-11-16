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

