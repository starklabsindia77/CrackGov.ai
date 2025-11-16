import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import crypto from "crypto";
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
        { error: "Payment gateway not configured. Please contact administrator." },
        { status: 503 }
      );
    }

    // Initialize Razorpay with database config
    const razorpay = new Razorpay({
      key_id: paymentConfig.keyId,
      key_secret: paymentConfig.keySecret,
    });

    const body = await request.json();
    const { plan = "pro", currency = "INR" } = body;
    
    // Validate plan
    if (!["pro", "topper"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'pro' or 'topper'" },
        { status: 400 }
      );
    }
    
    // Set amount based on plan (in paise)
    const planAmounts: Record<string, number> = {
      pro: 19900,    // ₹199/month
      topper: 34900, // ₹349/month
    };
    const amount = planAmounts[plan];

    // Create Razorpay order
    const options = {
      amount: amount, // amount in smallest currency unit (paise for INR)
      currency: currency,
      receipt: `order_${session.user.id}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        email: session.user.email,
        plan: plan,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store order in database (optional, for tracking)
    // You can create an Order model if needed

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: paymentConfig.keyId,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

