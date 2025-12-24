/**
 * Study Plan Generation Route Handler
 * 
 * Handles POST /api/study-plan/generate
 * Generates a personalized AI study plan based on user inputs.
 */

import { NextRequest, NextResponse } from "next/server";
import { PluginContext } from "../../../lib/plugins/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Request validation schema
const generateRequestSchema = z.object({
    exam: z.string().min(1, "Exam type is required"),
    targetDate: z.string().min(1, "Target date is required"),
    hoursPerDay: z.number().int().min(1).max(24).optional(),
    weakTopics: z.array(z.string()).optional().default([]),
});

export default async function generateHandler(
    request: NextRequest,
    context: PluginContext
) {
    try {
        // Get user session
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await context.services.db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = generateRequestSchema.parse(body);

        // Check if user has reached max plans limit
        const config = context.config;
        const existingPlansCount = await context.services.db.studyPlan.count({
            where: { userId: user.id },
        });

        if (existingPlansCount >= config.maxPlansPerUser) {
            return NextResponse.json(
                { error: `Maximum ${config.maxPlansPerUser} study plans allowed` },
                { status: 400 }
            );
        }

        // Check cache if enabled
        const cacheKey = `study-plan:${user.id}:${validatedData.exam}:${validatedData.targetDate}`;
        if (config.cacheResults && context.services.cache) {
            const cached = await context.services.cache.get(cacheKey);
            if (cached) {
                context.services.logger.info("Returning cached study plan", { userId: user.id });
                return NextResponse.json(JSON.parse(cached as string));
            }
        }

        // Generate study plan using AI
        const hoursPerDay = validatedData.hoursPerDay || config.defaultHoursPerDay;

        const prompt = `Generate a comprehensive study plan for the ${validatedData.exam} exam.
Target Date: ${validatedData.targetDate}
Hours per day available: ${hoursPerDay}
Weak topics to focus on: ${validatedData.weakTopics.join(", ") || "None specified"}

Please provide a structured study plan with:
1. Daily schedule breakdown
2. Topic-wise allocation
3. Revision strategy
4. Mock test schedule
5. Important milestones

Format the response as JSON with the following structure:
{
  "overview": "Brief overview",
  "dailySchedule": [...],
  "topicAllocation": {...},
  "revisionStrategy": "...",
  "mockTestSchedule": [...],
  "milestones": [...]
}`;

        const aiResult = await context.services.ai.callAI({
            featureCode: "STUDY_PLAN",
            prompt,
            temperature: 0.7,
            maxTokens: 2000,
            responseFormat: { type: "json_object" },
        });

        if (!aiResult.success || !aiResult.content) {
            throw new Error("Failed to generate study plan");
        }

        // Parse AI response
        const planData = JSON.parse(aiResult.content);

        // Save to database
        const studyPlan = await context.services.db.studyPlan.create({
            data: {
                userId: user.id,
                exam: validatedData.exam,
                targetDate: validatedData.targetDate,
                hoursPerDay,
                weakTopics: validatedData.weakTopics,
                planData,
            },
        });

        // Cache the result
        if (config.cacheResults && context.services.cache) {
            await context.services.cache.setEx(
                cacheKey,
                config.cacheTTL,
                JSON.stringify(studyPlan)
            );
        }

        // Emit event
        context.events.emit("study-plan:created", {
            userId: user.id,
            planId: studyPlan.id,
            exam: validatedData.exam,
        });

        // Send notification if enabled
        if (config.enableNotifications) {
            await context.services.queue.notification?.add("send-notification", {
                userId: user.id,
                title: "Study Plan Created",
                message: `Your study plan for ${validatedData.exam} has been created successfully!`,
                type: "success",
                link: `/app/study-plan/${studyPlan.id}`,
            });
        }

        context.services.logger.info("Study plan generated successfully", {
            userId: user.id,
            planId: studyPlan.id,
        });

        return NextResponse.json({
            success: true,
            studyPlan,
        });
    } catch (error) {
        context.services.logger.error("Error generating study plan", error as Error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate study plan" },
            { status: 500 }
        );
    }
}
