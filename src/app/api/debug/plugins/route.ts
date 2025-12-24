/**
 * Debug endpoint to check plugin discovery
 */

import { NextRequest, NextResponse } from "next/server";
import { pluginLoader } from "@/lib/plugins";
import path from "path";
import { promises as fs } from "fs";

export async function GET(request: NextRequest) {
    try {
        const PLUGINS_DIR = path.join(process.cwd(), "src", "plugins");

        // Check if directory exists
        let dirExists = false;
        try {
            await fs.access(PLUGINS_DIR);
            dirExists = true;
        } catch {
            dirExists = false;
        }

        // Get directory contents
        let entries: any[] = [];
        if (dirExists) {
            const dirEntries = await fs.readdir(PLUGINS_DIR, { withFileTypes: true });
            entries = dirEntries.map(e => ({
                name: e.name,
                isDirectory: e.isDirectory(),
                isFile: e.isFile()
            }));
        }

        // Try to discover plugins
        const discoveredPlugins = await pluginLoader.discover();

        return NextResponse.json({
            success: true,
            debug: {
                pluginsDir: PLUGINS_DIR,
                dirExists,
                entriesCount: entries.length,
                entries,
                discoveredPluginsCount: discoveredPlugins.length,
                discoveredPlugins,
                cwd: process.cwd(),
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
