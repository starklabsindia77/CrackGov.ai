/**
 * Study Plan Plugin
 * 
 * AI-powered study plan generation plugin.
 * Generates personalized study plans based on exam type, target date, and weak areas.
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import { PLUGIN_EVENTS } from "../../lib/plugins/events";
import manifest from "./manifest.json";

// Plugin hooks
const hooks: PluginHooks = {
    async onInstall(context: PluginContext) {
        context.services.logger.info("Study Plan plugin installed");

        // Initialize plugin-specific data
        // Could create default templates, etc.
    },

    async onEnable(context: PluginContext) {
        context.services.logger.info("Study Plan plugin enabled");

        // Listen to relevant events
        context.events.on(PLUGIN_EVENTS.USER_CREATED, async (data) => {
            // Could create a welcome study plan for new users
            context.services.logger.debug("New user created, could generate welcome plan", data);
        });
    },

    async onDisable(context: PluginContext) {
        context.services.logger.info("Study Plan plugin disabled");

        // Cleanup event listeners
        context.events.removeAllListeners(PLUGIN_EVENTS.USER_CREATED);
    },

    async onUninstall(context: PluginContext) {
        context.services.logger.warn("Study Plan plugin uninstalled");

        // Note: We don't delete user data on uninstall
        // Data remains in database for potential reinstall
    },

    async onConfigUpdate(context: PluginContext, newConfig: Record<string, any>) {
        context.services.logger.info("Study Plan plugin configuration updated", { newConfig });

        // Handle configuration changes
        if (newConfig.cacheResults !== context.config.cacheResults) {
            // Clear cache if caching was disabled
            if (!newConfig.cacheResults && context.services.cache) {
                await context.services.cache.del("study-plan:*");
            }
        }
    },

    async onStartup(context: PluginContext) {
        context.services.logger.info("Study Plan plugin starting up");

        // Perform startup tasks
        // Could warm up cache, etc.
    },

    async onShutdown(context: PluginContext) {
        context.services.logger.info("Study Plan plugin shutting down");

        // Cleanup resources
    },
};

// Plugin definition
const studyPlanPlugin: Plugin = {
    manifest: manifest as any,
    hooks,

    async initialize(context: PluginContext) {
        context.services.logger.info("Initializing Study Plan plugin");

        // Perform any initialization
        // Load configuration, setup services, etc.
    },
};

export default studyPlanPlugin;
