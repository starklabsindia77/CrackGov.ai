/**
 * Admin Navigation API
 * 
 * Returns dynamic navigation items based on enabled plugins
 */

import { NextRequest, NextResponse } from "next/server";
import { pluginRegistry } from "@/lib/plugins";
import { PluginNavigation } from "@/lib/plugins/types";

// Core navigation items that are always present
const coreNavigation: PluginNavigation[] = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: "LayoutDashboard",
        order: 0,
    },
    {
        label: "Plugins",
        href: "/admin/plugins",
        icon: "Puzzle",
        order: 1,
    },
    {
        label: "Users",
        href: "/admin/users",
        icon: "Users",
        order: 100,
    },
];

export async function GET(request: NextRequest) {
    try {
        // Get all enabled plugins
        const enabledPlugins = pluginRegistry.getEnabled();

        // Collect navigation items from enabled plugins
        const pluginNavItems: PluginNavigation[] = [];

        for (const registeredPlugin of enabledPlugins) {
            const { plugin } = registeredPlugin;

            // Check for adminNavigation in manifest
            if (plugin.manifest.adminNavigation && Array.isArray(plugin.manifest.adminNavigation)) {
                pluginNavItems.push(...plugin.manifest.adminNavigation);
            }
        }

        // Merge core navigation with plugin navigation
        const allNavigation = [...coreNavigation, ...pluginNavItems];

        // Sort by order (lower numbers first)
        allNavigation.sort((a, b) => {
            const orderA = a.order ?? 999;
            const orderB = b.order ?? 999;
            return orderA - orderB;
        });

        return NextResponse.json({
            success: true,
            navigation: allNavigation,
        });
    } catch (error) {
        console.error("Error fetching navigation:", error);
        return NextResponse.json(
            { error: "Failed to fetch navigation" },
            { status: 500 }
        );
    }
}
