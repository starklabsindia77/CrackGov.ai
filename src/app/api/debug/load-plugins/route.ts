/**
 * Debug endpoint to test plugin loading
 */

import { NextRequest, NextResponse } from "next/server";
import { pluginLoader } from "@/lib/plugins";

export async function GET(request: NextRequest) {
    try {
        // Discover plugins
        const discoveredPlugins = await pluginLoader.discover();

        const loadResults = [];

        // Try to load each plugin and capture errors
        for (const pluginName of discoveredPlugins) {
            try {
                const plugin = await pluginLoader.load(pluginName);
                loadResults.push({
                    name: pluginName,
                    success: true,
                    manifest: plugin.manifest
                });
            } catch (error) {
                loadResults.push({
                    name: pluginName,
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                        code: (error as any).code
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            discoveredCount: discoveredPlugins.length,
            loadResults,
            successCount: loadResults.filter(r => r.success).length,
            failureCount: loadResults.filter(r => !r.success).length
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
