import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "@/lib/otp";
import { authRateLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const sendOTPSchema = z.object({
  identifier: z.string().min(1), // Email or phone
  type: z.enum(["email", "phone", "login"]),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await authRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { identifier, type } = sendOTPSchema.parse(body);

    // Generate and send OTP
    await generateOTP(identifier, type);

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${type === "email" ? "email" : "phone"}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

