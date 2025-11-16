import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  type: z.enum(["pages", "faqs", "announcements", "banners"]),
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { type, items } = reorderSchema.parse(body);

    // Update all items in a transaction
    await prisma.$transaction(
      items.map((item) => {
        if (type === "pages") {
          return prisma.page.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        } else if (type === "faqs") {
          return prisma.faq.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        } else if (type === "announcements") {
          return prisma.announcement.update({
            where: { id: item.id },
            data: { priority: item.order }, // Announcements use priority
          });
        } else {
          return prisma.banner.update({
            where: { id: item.id },
            data: { priority: item.order }, // Banners use priority
          });
        }
      })
    );

    return NextResponse.json({ message: "Order updated successfully" });
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
    console.error("Error reordering items:", error);
    return NextResponse.json(
      { error: "Failed to reorder items" },
      { status: 500 }
    );
  }
}

