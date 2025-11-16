import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Find verification token
    const verification = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Check if already verified
    if (verification.user.emailVerified) {
      await prisma.emailVerificationToken.delete({
        where: { token },
      });
      return NextResponse.json({ message: "Email already verified" });
    }

    // Verify email
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    // Delete verification token
    await prisma.emailVerificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}

