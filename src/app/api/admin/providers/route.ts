import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProviderSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).toUpperCase(),
  status: z.enum(["active", "inactive"]).default("active"),
  defaultModel: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export async function GET() {
  try {
    await requireAdmin();

    const providers = await prisma.aiProvider.findMany({
      include: {
        keys: {
          select: {
            id: true,
            label: true,
            status: true,
            priority: true,
            lastUsedAt: true,
            lastErrorAt: true,
            failureCount: true,
          },
        },
        _count: {
          select: {
            keys: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ providers });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = createProviderSchema.parse(body);

    // Check if code already exists
    const existing = await prisma.aiProvider.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Provider code already exists" },
        { status: 400 }
      );
    }

    const provider = await prisma.aiProvider.create({
      data: {
        name: data.name,
        code: data.code,
        status: data.status,
        defaultModel: data.defaultModel,
        config: data.config || {},
      },
    });

    return NextResponse.json({ provider }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating provider:", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

