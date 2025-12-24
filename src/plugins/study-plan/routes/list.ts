/**
 * Study Plan List Route Handler
 * 
 * Handles GET /api/study-plan
 * Returns all study plans for the authenticated user.
 */

import { NextRequest, NextResponse } from "next/server";
import { PluginContext } from "../../../lib/plugins/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";

export default async function listHandler(
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

        // Get all study plans for user
        const studyPlans = await context.services.db.studyPlan.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            success: true,
            studyPlans,
            count: studyPlans.length,
        });
    } catch (error) {
        context.services.logger.error("Error fetching study plans", error as Error);
        return NextResponse.json(
            { error: "Failed to fetch study plans" },
            { status: 500 }
        );
    }
}
