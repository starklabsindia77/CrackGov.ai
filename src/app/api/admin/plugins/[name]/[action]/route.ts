/**
 * Plugin Enable/Disable/Install/Uninstall API
 * 
 * POST /api/admin/plugins/[name]/[action]
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { pluginManager } from "@/lib/plugins";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: { name: string; action: string } }
) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { name, action } = params;

        switch (action) {
            case "install":
                await pluginManager.install(name);
                return NextResponse.json({
                    success: true,
                    message: `Plugin ${name} installed successfully`,
                });

            case "uninstall":
                await pluginManager.uninstall(name);
                return NextResponse.json({
                    success: true,
                    message: `Plugin ${name} uninstalled successfully`,
                });

            case "enable":
                await pluginManager.enable(name);
                return NextResponse.json({
                    success: true,
                    message: `Plugin ${name} enabled successfully`,
                });

            case "disable":
                await pluginManager.disable(name);
                return NextResponse.json({
                    success: true,
                    message: `Plugin ${name} disabled successfully`,
                });

            case "reload":
                await pluginManager.reload(name);
                return NextResponse.json({
                    success: true,
                    message: `Plugin ${name} reloaded successfully`,
                });

            default:
                return NextResponse.json(
                    { error: `Invalid action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error(`Error performing action ${params.action} on plugin ${params.name}:`, error);
        return NextResponse.json(
            { error: error.message || "Failed to perform action" },
            { status: 500 }
        );
    }
}

// Update plugin configuration
export async function PUT(
    request: NextRequest,
    { params }: { params: { name: string; action: string } }
) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { name, action } = params;

        if (action !== "config") {
            return NextResponse.json(
                { error: "Invalid action for PUT method" },
                { status: 400 }
            );
        }

        const body = await request.json();
        await pluginManager.updateConfig(name, body.config);

        return NextResponse.json({
            success: true,
            message: `Plugin ${name} configuration updated successfully`,
        });
    } catch (error: any) {
        console.error(`Error updating plugin ${params.name} configuration:`, error);
        return NextResponse.json(
            { error: error.message || "Failed to update configuration" },
            { status: 500 }
        );
    }
}
