import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFeatureConfigSchema = z.object({
  primaryProviderId: z.string().optional().nullable(),
  secondaryProviderId: z.string().optional().nullable(),
  settings: z.record(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { featureCode: string } }
) {
  try {
    await requireAdmin();

    const feature = await prisma.aiFeatureConfig.findUnique({
      where: { featureCode: params.featureCode },
      include: {
        primaryProvider: true,
        secondaryProvider: true,
      },
    });

    if (!feature) {
      return NextResponse.json(
        { error: "Feature config not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ feature });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching feature:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { featureCode: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updateFeatureConfigSchema.parse(body);

    const feature = await prisma.aiFeatureConfig.update({
      where: { featureCode: params.featureCode },
      data: {
        primaryProviderId: data.primaryProviderId ?? undefined,
        secondaryProviderId: data.secondaryProviderId ?? undefined,
        settings: data.settings,
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

    return NextResponse.json({ feature });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating feature:", error);
    return NextResponse.json(
      { error: "Failed to update feature" },
      { status: 500 }
    );
  }
}

