import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

const updateKeySchema = z.object({
  label: z.string().optional(),
  apiKey: z.string().min(1).optional(),
  priority: z.number().int().min(0).max(9).optional(),
  status: z.enum(["healthy", "failing", "disabled"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; keyId: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updateKeySchema.parse(body);

    const updateData: any = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.apiKey) {
      updateData.apiKeyEnc = encrypt(data.apiKey);
      // Reset health when updating key
      updateData.status = "healthy";
      updateData.failureCount = 0;
      updateData.lastErrorAt = null;
    }

    const key = await prisma.aiProviderKey.update({
      where: { id: params.keyId },
      data: updateData,
      select: {
        id: true,
        label: true,
        status: true,
        priority: true,
        lastUsedAt: true,
        lastErrorAt: true,
        failureCount: true,
      },
    });

    return NextResponse.json({ key });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating key:", error);
    return NextResponse.json(
      { error: "Failed to update key" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; keyId: string } }
) {
  try {
    await requireAdmin();

    await prisma.aiProviderKey.delete({
      where: { id: params.keyId },
    });

    return NextResponse.json({ message: "Key deleted" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error deleting key:", error);
    return NextResponse.json(
      { error: "Failed to delete key" },
      { status: 500 }
    );
  }
}

