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

    // TODO: In production, integrate with Razorpay or similar payment gateway
    // For MVP, we just update the subscription status directly

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionStatus: "pro" },
    });

    return NextResponse.json({
      message: "Subscription upgraded successfully",
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    console.error("Subscription upgrade error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}

