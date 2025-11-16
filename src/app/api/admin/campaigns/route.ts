import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmailCampaign } from "@/lib/email";

const createCampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  segmentId: z.string().optional(),
  targetUsers: z.array(z.string()).optional(), // Specific user IDs
  scheduledAt: z.string().optional(), // ISO date string
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        segment: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { recipients: true },
        },
      },
    });

    return NextResponse.json({
      campaigns: campaigns.map((c) => ({
        ...c,
        recipientCount: c._count.recipients,
      })),
    });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: error.status });
    }
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = createCampaignSchema.parse(body);

    // Get target users
    let userIds: string[] = [];
    if (data.segmentId) {
      const memberships = await prisma.userSegmentMembership.findMany({
        where: { segmentId: data.segmentId },
        select: { userId: true },
      });
      userIds = memberships.map((m) => m.userId);
    } else if (data.targetUsers) {
      userIds = data.targetUsers;
    } else {
      // All users
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    }

    // Create campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        segmentId: data.segmentId,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: data.scheduledAt ? "scheduled" : "draft",
        recipients: {
          create: userIds.map((userId) => ({
            userId,
            status: "pending",
          })),
        },
      },
    });

    // Send immediately if not scheduled
    if (!data.scheduledAt) {
      // Send emails (async, don't wait)
      sendEmailCampaign(campaign.id, userIds).catch((error) => {
        console.error("Error sending campaign:", error);
      });
    }

    return NextResponse.json({ campaign }, { status: 201 });
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
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

