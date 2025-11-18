import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authRateLimiter } from "@/lib/rate-limit-redis";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await authRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (resetToken.used) {
      return NextResponse.json(
        { error: "This reset token has already been used" },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

