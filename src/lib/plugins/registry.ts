/**
 * Plugin Registry
 * 
 * Central registry for all plugins in the system.
 * Manages plugin registration, lookup, and state.
 */

import {
    Plugin,
    PluginRegistry as IPluginRegistry,
    RegisteredPlugin,
    PluginStatus,
    PluginNotFoundError,
} from "./types";
import { logger } from "../logger";

class PluginRegistryImpl implements IPluginRegistry {
    private plugins: Map<string, RegisteredPlugin> = new Map();

    /**
     * Get all registered plugins
     */
    getAll(): Map<string, RegisteredPlugin> {
        return new Map(this.plugins);
    }

    /**
     * Get a specific plugin
     */
    get(name: string): RegisteredPlugin | undefined {
        return this.plugins.get(name);
    }

    /**
     * Check if plugin is registered
     */
    has(name: string): boolean {
        return this.plugins.has(name);
    }

    /**
     * Get all enabled plugins
     */
    getEnabled(): RegisteredPlugin[] {
        return Array.from(this.plugins.values()).filter(
            (p) => p.status === "enabled"
        );
    }

    /**
     * Get plugins by category
     */
    getByCategory(category: string): RegisteredPlugin[] {
        return Array.from(this.plugins.values()).filter(
            (p) => p.plugin.manifest.category === category
        );
    }

    /**
     * Register a plugin
     */
    async register(plugin: Plugin): Promise<void> {
        const name = plugin.manifest.name;

        if (this.plugins.has(name)) {
            logger.warn(`Plugin ${name} is already registered. Updating...`);
        }

        // Create registered plugin entry
        const registeredPlugin: RegisteredPlugin = {
            plugin,
            status: "installed",
            config: plugin.manifest.config?.defaults || {},
            context: {} as any, // Will be set by plugin manager
        };

        this.plugins.set(name, registeredPlugin);
        logger.info(`Plugin registered: ${name} v${plugin.manifest.version}`);
    }

    /**
     * Unregister a plugin
     */
    async unregister(name: string): Promise<void> {
        if (!this.plugins.has(name)) {
            throw new PluginNotFoundError(name);
        }

        this.plugins.delete(name);
        logger.info(`Plugin unregistered: ${name}`);
    }

    /**
     * Update plugin status
     */
    updateStatus(name: string, status: PluginStatus): void {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new PluginNotFoundError(name);
        }

        plugin.status = status;

        if (status === "enabled") {
            plugin.enabledAt = new Date();
        }

        logger.info(`Plugin ${name} status updated to: ${status}`);
    }

    /**
     * Update plugin configuration
     */
    updateConfig(name: string, config: Record<string, any>): void {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new PluginNotFoundError(name);
        }

        plugin.config = { ...plugin.config, ...config };
        logger.info(`Plugin ${name} configuration updated`);
    }

    /**
     * Set plugin error
     */
    setError(name: string, error: Error): void {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new PluginNotFoundError(name);
        }

        plugin.status = "error";
        plugin.error = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date(),
        };

        logger.error(`Plugin ${name} encountered an error`, error);
    }

    /**
     * Clear plugin error
     */
    clearError(name: string): void {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new PluginNotFoundError(name);
        }

        delete plugin.error;
        logger.info(`Plugin ${name} error cleared`);
    }

    /**
     * Get plugin statistics
     */
    getStats() {
        const all = Array.from(this.plugins.values());
        return {
            total: all.length,
            enabled: all.filter((p) => p.status === "enabled").length,
            disabled: all.filter((p) => p.status === "disabled").length,
            installed: all.filter((p) => p.status === "installed").length,
            error: all.filter((p) => p.status === "error").length,
            byCategory: this.getStatsByCategory(),
        };
    }

    /**
     * Get statistics by category
     */
    private getStatsByCategory() {
        const stats: Record<string, number> = {};
        for (const plugin of this.plugins.values()) {
            const category = plugin.plugin.manifest.category || "uncategorized";
            stats[category] = (stats[category] || 0) + 1;
        }
        return stats;
    }

    /**
     * Clear all plugins (for testing)
     */
    clear(): void {
        this.plugins.clear();
        logger.warn("Plugin registry cleared");
    }
}

// Singleton instance
export const pluginRegistry = new PluginRegistryImpl();
