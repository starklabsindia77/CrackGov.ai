import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFeatureConfigSchema = z.object({
  primaryProviderId: z.string().optional().nullable(),
  secondaryProviderId: z.string().optional().nullable(),
  settings: z.record(z.any()).optional(),
});

export async function GET() {
  try {
    await requireAdmin();

    const features = await prisma.aiFeatureConfig.findMany({
      include: {
        primaryProvider: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
        secondaryProvider: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
      },
      orderBy: { featureCode: "asc" },
    });

    return NextResponse.json({ features });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { featureCode, ...data } = updateFeatureConfigSchema.parse(body);

    if (!featureCode) {
      return NextResponse.json(
        { error: "featureCode is required" },
        { status: 400 }
      );
    }

    // Upsert feature config
    const feature = await prisma.aiFeatureConfig.upsert({
      where: { featureCode },
      update: {
        primaryProviderId: data.primaryProviderId || null,
        secondaryProviderId: data.secondaryProviderId || null,
        settings: data.settings || {},
      },
      create: {
        featureCode,
        primaryProviderId: data.primaryProviderId || null,
        secondaryProviderId: data.secondaryProviderId || null,
        settings: data.settings || {},
      },
      include: {
        primaryProvider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        secondaryProvider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({ feature }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating feature config:", error);
    return NextResponse.json(
      { error: "Failed to update feature config" },
      { status: 500 }
    );
  }
}

