/**
 * Plugin Management API
 * 
 * Admin endpoints for managing plugins.
 * GET /api/admin/plugins - List all plugins
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { pluginRegistry, pluginLoader } from "@/lib/plugins";
import { prisma } from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";

export async function GET(request: NextRequest) {
    try {
        // Check admin authentication (bypass in development mode)
        const isDevelopment = process.env.NODE_ENV === "development";
        console.log("[Plugin API] NODE_ENV:", process.env.NODE_ENV, "isDevelopment:", isDevelopment);

        if (!isDevelopment) {
            const session = await getServerSession(authOptions);
            if (!session?.user?.email) {
                console.log("[Plugin API] No session found, returning 401");
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            if (!user || user.role !== "admin") {
                console.log("[Plugin API] User not admin, returning 403");
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        } else {
            console.log("[Plugin API] Development mode - bypassing authentication");
        }

        // Get all registered plugins
        const registeredPlugins = Array.from(pluginRegistry.getAll().values());
        console.log("[Plugin API] Registered plugins count:", registeredPlugins.length);

        // Discover available plugins
        const availablePlugins = await pluginLoader.discover();
        console.log("[Plugin API] Discovered plugins:", availablePlugins.length, availablePlugins);

        // Get plugin statistics
        const stats = pluginRegistry.getStats();
        console.log("[Plugin API] Stats:", stats);

        // Format response
        const plugins = registeredPlugins.map((rp) => ({
            name: rp.plugin.manifest.name,
            version: rp.plugin.manifest.version,
            displayName: rp.plugin.manifest.displayName,
            description: rp.plugin.manifest.description,
            author: rp.plugin.manifest.author,
            category: rp.plugin.manifest.category,
            icon: rp.plugin.manifest.icon,
            status: rp.status,
            enabled: rp.status === "enabled",
            installed: true,
            config: rp.config,
            dependencies: rp.plugin.manifest.requiredPlugins || [],
            permissions: rp.plugin.manifest.permissions || [],
            routes: rp.plugin.manifest.routes || [],
            navigation: rp.plugin.manifest.navigation || [],
            installedAt: rp.installedAt,
            enabledAt: rp.enabledAt,
            error: rp.error,
        }));

        // Add available but not installed plugins
        console.log("[Plugin API] Processing", availablePlugins.length, "discovered plugins");
        for (const pluginName of availablePlugins) {
            if (!registeredPlugins.find((rp) => rp.plugin.manifest.name === pluginName)) {
                console.log("[Plugin API] Loading manifest for plugin:", pluginName);
                try {
                    // Read manifest.json directly instead of trying to import the TypeScript module
                    const manifestPath = path.join(process.cwd(), "src", "plugins", pluginName, "manifest.json");
                    const manifestContent = await fs.readFile(manifestPath, "utf-8");
                    const manifest = JSON.parse(manifestContent);

                    console.log("[Plugin API] Successfully loaded manifest for:", pluginName);
                    plugins.push({
                        name: manifest.name,
                        version: manifest.version,
                        displayName: manifest.displayName,
                        description: manifest.description,
                        author: manifest.author,
                        category: manifest.category,
                        icon: manifest.icon,
                        status: "disabled",
                        enabled: false,
                        installed: false,
                        config: manifest.config?.defaults || {},
                        dependencies: manifest.requiredPlugins || [],
                        permissions: manifest.permissions || [],
                        routes: manifest.routes || [],
                        navigation: manifest.navigation || manifest.adminNavigation || [],
                        installedAt: undefined,
                        enabledAt: undefined,
                        error: undefined,
                    });
                } catch (error) {
                    console.error(`[Plugin API] Error loading manifest for ${pluginName}:`, error);
                    console.error(`[Plugin API] Error details:`, {
                        message: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined
                    });
                }
            }
        }

        console.log("[Plugin API] Final plugins count:", plugins.length);

        return NextResponse.json({
            success: true,
            plugins,
            stats,
        });
    } catch (error) {
        console.error("Error fetching plugins:", error);
        return NextResponse.json(
            { error: "Failed to fetch plugins" },
            { status: 500 }
        );
    }
}
