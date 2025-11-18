import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { authRateLimiter } from "@/lib/rate-limit-redis";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await authRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send reset email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      message: "If an account exists, a password reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

