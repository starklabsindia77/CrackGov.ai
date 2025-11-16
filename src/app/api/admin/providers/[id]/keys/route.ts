import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

const createKeySchema = z.object({
  label: z.string().optional(),
  apiKey: z.string().min(1),
  priority: z.number().int().min(0).max(9).default(0),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const keys = await prisma.aiProviderKey.findMany({
      where: { providerId: params.id },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        label: true,
        status: true,
        priority: true,
        lastUsedAt: true,
        lastErrorAt: true,
        failureCount: true,
        createdAt: true,
        updatedAt: true,
        // Don't return encrypted key
      },
    });

    return NextResponse.json({ keys });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch keys" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = createKeySchema.parse(body);

    // Check key limit (10 keys per provider)
    const keyCount = await prisma.aiProviderKey.count({
      where: { providerId: params.id },
    });

    if (keyCount >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 keys allowed per provider" },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await prisma.aiProvider.findUnique({
      where: { id: params.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const encryptedKey = encrypt(data.apiKey);

    const key = await prisma.aiProviderKey.create({
      data: {
        providerId: params.id,
        label: data.label,
        apiKeyEnc: encryptedKey,
        priority: data.priority,
        status: "healthy",
      },
    });

    return NextResponse.json(
      {
        key: {
          id: key.id,
          label: key.label,
          status: key.status,
          priority: key.priority,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating key:", error);
    return NextResponse.json(
      { error: "Failed to create key" },
      { status: 500 }
    );
  }
}

