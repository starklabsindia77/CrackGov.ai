import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";
import { getPaymentConfig } from "@/lib/payment-config";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get payment config from database
    const paymentConfig = await getPaymentConfig();
    if (!paymentConfig) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;
    
    // Validate plan
    const validPlans = ["pro", "topper"];
    const selectedPlan = plan || "pro"; // Default to pro for backward compatibility
    if (!validPlans.includes(selectedPlan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", paymentConfig.keySecret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update user subscription
    await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionStatus: selectedPlan },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription upgraded",
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

