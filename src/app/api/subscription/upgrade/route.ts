import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // Fallback to stub if Razorpay not configured
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { subscriptionStatus: "pro" },
      });

      return NextResponse.json({
        message: "Subscription upgraded successfully (demo mode - Razorpay not configured)",
        subscriptionStatus: user.subscriptionStatus,
      });
    }

    // If Razorpay is configured, redirect to payment flow
    return NextResponse.json({
      message: "Please use the payment flow",
      requiresPayment: true,
    });
  } catch (error) {
    console.error("Subscription upgrade error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}

