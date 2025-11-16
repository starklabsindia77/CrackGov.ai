import { prisma } from "@/lib/prisma";
import { sendOTPEmail, sendOTPSMS } from "@/lib/email";

export async function generateOTP(identifier: string, type: "email" | "phone" | "login"): Promise<string> {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Delete old unused OTPs for this identifier
  await prisma.otpToken.deleteMany({
    where: {
      identifier,
      type,
      OR: [
        { used: true },
        { expiresAt: { lt: new Date() } },
      ],
    },
  });

  // Create new OTP
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

  await prisma.otpToken.create({
    data: {
      identifier,
      otp,
      type,
      expiresAt,
    },
  });

  // Send OTP
  if (type === "email") {
    await sendOTPEmail(identifier, otp);
  } else if (type === "phone") {
    await sendOTPSMS(identifier, otp);
  }

  return otp;
}

export async function verifyOTP(identifier: string, otp: string, type: "email" | "phone" | "login"): Promise<boolean> {
  const token = await prisma.otpToken.findFirst({
    where: {
      identifier,
      otp,
      type,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return false;
  }

  // Mark as used
  await prisma.otpToken.update({
    where: { id: token.id },
    data: { used: true },
  });

  return true;
}

