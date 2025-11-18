import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { authRateLimiter } from "@/lib/rate-limit-redis";
import { z } from "zod";

const verifyOTPSchema = z.object({
  identifier: z.string().min(1),
  otp: z.string().length(6),
  type: z.enum(["email", "phone", "login"]),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await authRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { identifier, otp, type } = verifyOTPSchema.parse(body);

    // Verify OTP
    const isValid = await verifyOTP(identifier, otp, type);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // For login type, find or create user
    if (type === "login") {
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier },
          ],
        },
      });

      if (!user) {
        // Create new user with OTP login
        user = await prisma.user.create({
          data: {
            email: type === "email" ? identifier : undefined,
            phone: type === "phone" ? identifier : undefined,
            passwordHash: "", // OTP users don't need password
            emailVerified: type === "email",
            phoneVerified: type === "phone",
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        userId: user.id,
        requiresRegistration: !user.name, // If no name, needs registration
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

