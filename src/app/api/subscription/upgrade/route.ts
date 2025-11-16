import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getPaymentConfig } from "@/lib/payment-config";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { plan } = body;
    const selectedPlan = plan || "pro";
    
    // Validate plan
    if (!["pro", "topper"].includes(selectedPlan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'pro' or 'topper'" },
        { status: 400 }
      );
    }

    // Check if Razorpay is configured in database
    const paymentConfig = await getPaymentConfig();
    if (!paymentConfig) {
      // Fallback to stub if Razorpay not configured
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { subscriptionStatus: selectedPlan },
      });

      return NextResponse.json({
        message: `Subscription upgraded to ${selectedPlan} successfully (demo mode - Razorpay not configured)`,
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

