import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export interface PaymentCredentials {
  keyId: string;
  keySecret: string;
}

/**
 * Get active payment configuration from database
 * Falls back to environment variables if no DB config exists
 */
export async function getPaymentConfig(): Promise<PaymentCredentials | null> {
  try {
    const config = await prisma.paymentConfig.findFirst({
      where: {
        provider: "razorpay",
        isActive: true,
      },
      orderBy: {
        environment: "desc", // Prefer production over test
      },
    });

    if (config) {
      return {
        keyId: decrypt(config.keyId),
        keySecret: decrypt(config.keySecret),
      };
    }

    // Fallback to environment variables (for backward compatibility)
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      return {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching payment config:", error);
    // Fallback to environment variables
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      return {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
      };
    }
    return null;
  }
}

