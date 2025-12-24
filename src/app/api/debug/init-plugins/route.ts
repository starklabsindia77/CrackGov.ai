/**
 * Debug endpoint to initialize and enable plugins for testing
 */

import { NextRequest, NextResponse } from "next/server";
import { pluginLoader, pluginRegistry } from "@/lib/plugins";
import path from "path";
import { promises as fs } from "fs";

export async function GET(request: NextRequest) {
    try {
        console.log("[Init Plugins] Starting plugin initialization...");

        // Discover all available plugins
        const availablePlugins = await pluginLoader.discover();
        console.log("[Init Plugins] Discovered plugins:", availablePlugins);

        // Plugins to enable for testing
        const pluginsToEnable = ["analytics", "question-bank"];

        const results = [];

        for (const pluginName of pluginsToEnable) {
            try {
                // Read manifest
                const manifestPath = path.join(process.cwd(), "src", "plugins", pluginName, "manifest.json");
                const manifestContent = await fs.readFile(manifestPath, "utf-8");
                const manifest = JSON.parse(manifestContent);

                // Create a minimal plugin object
                const plugin = {
                    manifest,
                };

                // Register the plugin
                await pluginRegistry.register(plugin);
                console.log(`[Init Plugins] Registered: ${pluginName}`);

                // Enable the plugin
                pluginRegistry.updateStatus(pluginName, "enabled");
                console.log(`[Init Plugins] Enabled: ${pluginName}`);

                results.push({
                    plugin: pluginName,
                    status: "enabled",
                    success: true,
                });
            } catch (error) {
                console.error(`[Init Plugins] Error with ${pluginName}:`, error);
                results.push({
                    plugin: pluginName,
                    status: "error",
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        // Get registry stats
        const stats = pluginRegistry.getStats();
        const enabledPlugins = pluginRegistry.getEnabled();

        return NextResponse.json({
            success: true,
            message: "Plugins initialized",
            results,
            stats,
            enabledPlugins: enabledPlugins.map(p => ({
                name: p.plugin.manifest.name,
                displayName: p.plugin.manifest.displayName,
                status: p.status,
                hasAdminNav: !!p.plugin.manifest.adminNavigation,
                adminNavItems: p.plugin.manifest.adminNavigation?.length || 0,
            })),
        });
    } catch (error) {
        console.error("[Init Plugins] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
