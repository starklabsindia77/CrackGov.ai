/**
 * Plugin Manager
 * 
 * Orchestrates the plugin lifecycle: installation, enabling, disabling, and configuration.
 * Manages plugin dependencies and ensures proper initialization order.
 */

import {
    PluginManager as IPluginManager,
    PluginStatus,
    PluginContext,
    PluginNotFoundError,
    PluginDependencyError,
    PluginError,
} from "./types";
import { pluginRegistry } from "./registry";
import { pluginLoader } from "./loader";
import { pluginEvents, PLUGIN_EVENTS } from "./events";
import { prisma } from "../prisma";
import { redis } from "../redis";
import { aiQueue, emailQueue, leaderboardQueue, notificationQueue } from "../queue";
import { callAI } from "../ai-orchestrator";
import { logger } from "../logger";
import { sendEmail } from "../email";
import { uploadFile } from "../storage";

class PluginManagerImpl implements IPluginManager {
    private initialized = false;

    /**
     * Initialize the plugin system
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.warn("Plugin manager already initialized");
            return;
        }

        logger.info("Initializing plugin system...");

        try {
            // Load plugins from database
            await this.loadPlugins();

            // Emit startup event
            pluginEvents.emit(PLUGIN_EVENTS.SYSTEM_STARTUP);

            this.initialized = true;
            logger.info("Plugin system initialized successfully");
        } catch (error) {
            logger.error("Failed to initialize plugin system", error as Error);
            throw error;
        }
    }

    /**
     * Load all plugins from database and filesystem
     */
    async loadPlugins(): Promise<void> {
        try {
            // Discover available plugins
            const availablePlugins = await pluginLoader.discover();
            logger.info(`Found ${availablePlugins.length} available plugins`);

            // Get plugin records from database
            const pluginRecords = await prisma.plugin.findMany({
                where: { installed: true },
            });

            // Load each installed plugin
            for (const record of pluginRecords) {
                try {
                    // Load plugin module
                    const plugin = await pluginLoader.load(record.name);

                    // Register plugin
                    await pluginRegistry.register(plugin);

                    // Update configuration
                    if (record.config) {
                        pluginRegistry.updateConfig(record.name, record.config as Record<string, any>);
                    }

                    // Create plugin context
                    const context = this.createPluginContext(record.name);
                    const registeredPlugin = pluginRegistry.get(record.name);
                    if (registeredPlugin) {
                        registeredPlugin.context = context;
                    }

                    // If plugin is enabled, enable it
                    if (record.enabled) {
                        await this.enablePlugin(record.name, false); // Don't save to DB (already enabled)
                    }

                    logger.info(`Loaded plugin: ${record.name}`);
                } catch (error) {
                    logger.error(`Failed to load plugin ${record.name}`, error as Error);
                    pluginRegistry.setError(record.name, error as Error);
                }
            }

            logger.info(`Loaded ${pluginRecords.length} plugins from database`);
        } catch (error) {
            logger.error("Error loading plugins", error as Error);
            throw error;
        }
    }

    /**
     * Install a plugin
     */
    async install(pluginName: string): Promise<void> {
        logger.info(`Installing plugin: ${pluginName}`);

        try {
            // Load plugin
            const plugin = await pluginLoader.load(pluginName);

            // Check if already installed
            const existing = await prisma.plugin.findUnique({
                where: { name: pluginName },
            });

            if (existing && existing.installed) {
                throw new PluginError(
                    `Plugin ${pluginName} is already installed`,
                    pluginName,
                    "ALREADY_INSTALLED"
                );
            }

            // Register plugin
            await pluginRegistry.register(plugin);

            // Create plugin context
            const context = this.createPluginContext(pluginName);
            const registeredPlugin = pluginRegistry.get(pluginName);
            if (registeredPlugin) {
                registeredPlugin.context = context;
            }

            // Run onInstall hook
            if (plugin.hooks?.onInstall) {
                await plugin.hooks.onInstall(context);
            }

            // Save to database
            await prisma.plugin.upsert({
                where: { name: pluginName },
                create: {
                    name: pluginName,
                    version: plugin.manifest.version,
                    installed: true,
                    enabled: false,
                    config: plugin.manifest.config?.defaults || {},
                    dependencies: plugin.manifest.requiredPlugins || [],
                    priority: 0,
                },
                update: {
                    version: plugin.manifest.version,
                    installed: true,
                    config: plugin.manifest.config?.defaults || {},
                    dependencies: plugin.manifest.requiredPlugins || [],
                },
            });

            // Register routes
            if (plugin.manifest.routes) {
                await this.registerRoutes(pluginName, plugin.manifest.routes);
            }

            // Register permissions
            if (plugin.manifest.permissions) {
                await this.registerPermissions(pluginName, plugin.manifest.permissions);
            }

            pluginRegistry.updateStatus(pluginName, "installed");
            pluginEvents.emit(PLUGIN_EVENTS.PLUGIN_INSTALLED, { pluginName });

            logger.info(`Plugin installed successfully: ${pluginName}`);
        } catch (error) {
            logger.error(`Failed to install plugin ${pluginName}`, error as Error);
            throw error;
        }
    }

    /**
     * Uninstall a plugin
     */
    async uninstall(pluginName: string): Promise<void> {
        logger.info(`Uninstalling plugin: ${pluginName}`);

        try {
            const registeredPlugin = pluginRegistry.get(pluginName);
            if (!registeredPlugin) {
                throw new PluginNotFoundError(pluginName);
            }

            // Disable first if enabled
            if (registeredPlugin.status === "enabled") {
                await this.disable(pluginName);
            }

            // Run onUninstall hook
            if (registeredPlugin.plugin.hooks?.onUninstall) {
                await registeredPlugin.plugin.hooks.onUninstall(registeredPlugin.context);
            }

            // Remove from database
            await prisma.plugin.update({
                where: { name: pluginName },
                data: { installed: false, enabled: false },
            });

            // Remove routes
            await prisma.pluginRoute.deleteMany({
                where: { pluginName },
            });

            // Remove permissions
            await prisma.pluginPermission.deleteMany({
                where: { pluginName },
            });

            // Unregister plugin
            await pluginRegistry.unregister(pluginName);
            await pluginLoader.unload(pluginName);

            pluginEvents.emit(PLUGIN_EVENTS.PLUGIN_UNINSTALLED, { pluginName });

            logger.info(`Plugin uninstalled successfully: ${pluginName}`);
        } catch (error) {
            logger.error(`Failed to uninstall plugin ${pluginName}`, error as Error);
            throw error;
        }
    }

    /**
     * Enable a plugin
     */
    async enable(pluginName: string): Promise<void> {
        await this.enablePlugin(pluginName, true);
    }

    /**
     * Internal enable method
     */
    private async enablePlugin(pluginName: string, saveToDb: boolean = true): Promise<void> {
        logger.info(`Enabling plugin: ${pluginName}`);

        try {
            const registeredPlugin = pluginRegistry.get(pluginName);
            if (!registeredPlugin) {
                throw new PluginNotFoundError(pluginName);
            }

            if (registeredPlugin.status === "enabled") {
                logger.warn(`Plugin ${pluginName} is already enabled`);
                return;
            }

            // Check dependencies
            const manifest = registeredPlugin.plugin.manifest;
            if (manifest.requiredPlugins && manifest.requiredPlugins.length > 0) {
                for (const requiredPlugin of manifest.requiredPlugins) {
                    const dep = pluginRegistry.get(requiredPlugin);
                    if (!dep || dep.status !== "enabled") {
                        throw new PluginDependencyError(pluginName, [requiredPlugin]);
                    }
                }
            }

            // Run onEnable hook
            if (registeredPlugin.plugin.hooks?.onEnable) {
                await registeredPlugin.plugin.hooks.onEnable(registeredPlugin.context);
            }

            // Run onStartup hook
            if (registeredPlugin.plugin.hooks?.onStartup) {
                await registeredPlugin.plugin.hooks.onStartup(registeredPlugin.context);
            }

            // Update status
            pluginRegistry.updateStatus(pluginName, "enabled");

            // Save to database
            if (saveToDb) {
                await prisma.plugin.update({
                    where: { name: pluginName },
                    data: { enabled: true },
                });
            }

            pluginEvents.emit(PLUGIN_EVENTS.PLUGIN_ENABLED, { pluginName });

            logger.info(`Plugin enabled successfully: ${pluginName}`);
        } catch (error) {
            logger.error(`Failed to enable plugin ${pluginName}`, error as Error);
            pluginRegistry.setError(pluginName, error as Error);
            throw error;
        }
    }

    /**
     * Disable a plugin
     */
    async disable(pluginName: string): Promise<void> {
        logger.info(`Disabling plugin: ${pluginName}`);

        try {
            const registeredPlugin = pluginRegistry.get(pluginName);
            if (!registeredPlugin) {
                throw new PluginNotFoundError(pluginName);
            }

            if (registeredPlugin.status === "disabled") {
                logger.warn(`Plugin ${pluginName} is already disabled`);
                return;
            }

            // Run onDisable hook
            if (registeredPlugin.plugin.hooks?.onDisable) {
                await registeredPlugin.plugin.hooks.onDisable(registeredPlugin.context);
            }

            // Run onShutdown hook
            if (registeredPlugin.plugin.hooks?.onShutdown) {
                await registeredPlugin.plugin.hooks.onShutdown(registeredPlugin.context);
            }

            // Update status
            pluginRegistry.updateStatus(pluginName, "disabled");

            // Save to database
            await prisma.plugin.update({
                where: { name: pluginName },
                data: { enabled: false },
            });

            pluginEvents.emit(PLUGIN_EVENTS.PLUGIN_DISABLED, { pluginName });

            logger.info(`Plugin disabled successfully: ${pluginName}`);
        } catch (error) {
            logger.error(`Failed to disable plugin ${pluginName}`, error as Error);
            throw error;
        }
    }

    /**
     * Update plugin configuration
     */
    async updateConfig(pluginName: string, config: Record<string, any>): Promise<void> {
        logger.info(`Updating configuration for plugin: ${pluginName}`);

        try {
            const registeredPlugin = pluginRegistry.get(pluginName);
            if (!registeredPlugin) {
                throw new PluginNotFoundError(pluginName);
            }

            // Merge with existing config
            const newConfig = { ...registeredPlugin.config, ...config };

            // Run onConfigUpdate hook
            if (registeredPlugin.plugin.hooks?.onConfigUpdate) {
                await registeredPlugin.plugin.hooks.onConfigUpdate(
                    registeredPlugin.context,
                    newConfig
                );
            }

            // Update in registry
            pluginRegistry.updateConfig(pluginName, newConfig);

            // Save to database
            await prisma.plugin.update({
                where: { name: pluginName },
                data: { config: newConfig },
            });

            pluginEvents.emit(PLUGIN_EVENTS.PLUGIN_CONFIG_UPDATED, { pluginName, config: newConfig });

            logger.info(`Plugin configuration updated: ${pluginName}`);
        } catch (error) {
            logger.error(`Failed to update plugin configuration ${pluginName}`, error as Error);
            throw error;
        }
    }

    /**
     * Get plugin status
     */
    getStatus(pluginName: string): PluginStatus | undefined {
        const plugin = pluginRegistry.get(pluginName);
        return plugin?.status;
    }

    /**
     * Check if plugin is enabled
     */
    isEnabled(pluginName: string): boolean {
        const plugin = pluginRegistry.get(pluginName);
        return plugin?.status === "enabled";
    }

    /**
     * Get plugin configuration
     */
    getConfig(pluginName: string): Record<string, any> | undefined {
        const plugin = pluginRegistry.get(pluginName);
        return plugin?.config;
    }

    /**
     * Reload a plugin
     */
    async reload(pluginName: string): Promise<void> {
        logger.info(`Reloading plugin: ${pluginName}`);

        const wasEnabled = this.isEnabled(pluginName);

        // Disable if enabled
        if (wasEnabled) {
            await this.disable(pluginName);
        }

        // Unload from loader cache
        await pluginLoader.unload(pluginName);

        // Reload
        const plugin = await pluginLoader.load(pluginName);
        await pluginRegistry.register(plugin);

        // Re-enable if was enabled
        if (wasEnabled) {
            await this.enable(pluginName);
        }

        logger.info(`Plugin reloaded: ${pluginName}`);
    }

    /**
     * Create plugin context
     */
    private createPluginContext(pluginName: string): PluginContext {
        const plugin = pluginRegistry.get(pluginName);
        const config = plugin?.config || {};

        return {
            pluginName,
            config,
            services: {
                db: prisma,
                cache: redis,
                queue: {
                    ai: aiQueue,
                    email: emailQueue,
                    leaderboard: leaderboardQueue,
                    notification: notificationQueue,
                },
                logger,
                ai: { callAI },
                email: { sendEmail },
                storage: { uploadFile },
            },
            registry: pluginRegistry,
            events: pluginEvents,
        };
    }

    /**
     * Register plugin routes
     */
    private async registerRoutes(pluginName: string, routes: any[]): Promise<void> {
        for (const route of routes) {
            await prisma.pluginRoute.upsert({
                where: {
                    pluginName_method_path: {
                        pluginName,
                        method: route.method,
                        path: route.path,
                    },
                },
                create: {
                    pluginName,
                    method: route.method,
                    path: route.path,
                    handler: route.handler,
                    middleware: route.middleware || [],
                    enabled: true,
                },
                update: {
                    handler: route.handler,
                    middleware: route.middleware || [],
                },
            });
        }
    }

    /**
     * Register plugin permissions
     */
    private async registerPermissions(pluginName: string, permissions: any[]): Promise<void> {
        for (const perm of permissions) {
            await prisma.pluginPermission.upsert({
                where: {
                    pluginName_permission: {
                        pluginName,
                        permission: perm.permission,
                    },
                },
                create: {
                    pluginName,
                    permission: perm.permission,
                    description: perm.description || null,
                },
                update: {
                    description: perm.description || null,
                },
            });
        }
    }

    /**
     * Shutdown plugin system
     */
    async shutdown(): Promise<void> {
        logger.info("Shutting down plugin system...");

        // Emit shutdown event
        pluginEvents.emit(PLUGIN_EVENTS.SYSTEM_SHUTDOWN);

        // Run onShutdown hooks for all enabled plugins
        const enabledPlugins = pluginRegistry.getEnabled();
        for (const registeredPlugin of enabledPlugins) {
            if (registeredPlugin.plugin.hooks?.onShutdown) {
                try {
                    await registeredPlugin.plugin.hooks.onShutdown(registeredPlugin.context);
                } catch (error) {
                    logger.error(
                        `Error in onShutdown hook for plugin ${registeredPlugin.plugin.manifest.name}`,
                        error as Error
                    );
                }
            }
        }

        this.initialized = false;
        logger.info("Plugin system shut down");
    }
}

// Singleton instance
export const pluginManager = new PluginManagerImpl();
