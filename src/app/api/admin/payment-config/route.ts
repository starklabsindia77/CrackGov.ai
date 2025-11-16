import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { z } from "zod";

const updatePaymentConfigSchema = z.object({
  keyId: z.string().min(1),
  keySecret: z.string().min(1),
  isActive: z.boolean().optional(),
  environment: z.enum(["test", "production"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const config = await prisma.paymentConfig.findFirst({
      where: { provider: "razorpay" },
    });

    if (!config) {
      return NextResponse.json({
        config: null,
        message: "No payment configuration found",
      });
    }

    // Decrypt keys for display (only keyId, not secret)
    return NextResponse.json({
      config: {
        id: config.id,
        provider: config.provider,
        keyId: decrypt(config.keyId),
        keySecret: "***hidden***", // Never expose secret
        isActive: config.isActive,
        environment: config.environment,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error fetching payment config:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment config" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updatePaymentConfigSchema.parse(body);

    // Encrypt keys before storing
    const encryptedKeyId = encrypt(data.keyId);
    const encryptedKeySecret = encrypt(data.keySecret);

    // Upsert payment config
    const config = await prisma.paymentConfig.upsert({
      where: {
        provider_environment: {
          provider: "razorpay",
          environment: data.environment || "test",
        },
      },
      update: {
        keyId: encryptedKeyId,
        keySecret: encryptedKeySecret,
        isActive: data.isActive ?? true,
      },
      create: {
        provider: "razorpay",
        keyId: encryptedKeyId,
        keySecret: encryptedKeySecret,
        isActive: data.isActive ?? true,
        environment: data.environment || "test",
      },
    });

    return NextResponse.json({
      config: {
        id: config.id,
        provider: config.provider,
        keyId: data.keyId, // Return decrypted for confirmation
        keySecret: "***hidden***",
        isActive: config.isActive,
        environment: config.environment,
      },
      message: "Payment configuration updated successfully",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error updating payment config:", error);
    return NextResponse.json(
      { error: "Failed to update payment config" },
      { status: 500 }
    );
  }
}

