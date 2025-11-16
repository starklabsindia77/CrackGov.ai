import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const providers = await prisma.aiProvider.findMany({
      include: {
        keys: {
          select: {
            id: true,
            status: true,
            failureCount: true,
            lastUsedAt: true,
            lastErrorAt: true,
          },
        },
      },
    });

    const health = providers.map((provider) => {
      const healthyKeys = provider.keys.filter((k) => k.status === "healthy")
        .length;
      const failingKeys = provider.keys.filter((k) => k.status === "failing")
        .length;
      const disabledKeys = provider.keys.filter((k) => k.status === "disabled")
        .length;

      return {
        providerId: provider.id,
        providerCode: provider.code,
        providerName: provider.name,
        status: provider.status,
        totalKeys: provider.keys.length,
        healthyKeys,
        failingKeys,
        disabledKeys,
        keys: provider.keys.map((k) => ({
          id: k.id,
          status: k.status,
          failureCount: k.failureCount,
          lastUsedAt: k.lastUsedAt,
          lastErrorAt: k.lastErrorAt,
        })),
      };
    });

    return NextResponse.json({ health });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching health:", error);
    return NextResponse.json(
      { error: "Failed to fetch health" },
      { status: 500 }
    );
  }
}

