/**
 * Plugin Loader
 * 
 * Handles discovery and loading of plugins from the filesystem.
 * Validates plugin manifests and checks dependencies.
 */

import { promises as fs } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import {
    Plugin,
    PluginLoader as IPluginLoader,
    PluginManifest,
    PluginLoadError,
    PluginDependencyError,
} from "./types";
import { logger } from "../logger";
import * as semver from "semver";

const PLUGINS_DIR = path.join(process.cwd(), "src", "plugins");
const CORE_VERSION = "1.0.0"; // Should be imported from package.json

class PluginLoaderImpl implements IPluginLoader {
    private loadedPlugins: Map<string, Plugin> = new Map();

    /**
     * Discover available plugins in the plugins directory
     */
    async discover(): Promise<string[]> {
        console.log("[PluginLoader] Starting discovery, PLUGINS_DIR:", PLUGINS_DIR);
        try {
            // Check if plugins directory exists
            try {
                await fs.access(PLUGINS_DIR);
                console.log("[PluginLoader] Plugins directory exists");
            } catch {
                console.log("[PluginLoader] Plugins directory NOT found:", PLUGINS_DIR);
                logger.warn(`Plugins directory not found: ${PLUGINS_DIR}`);
                return [];
            }

            const entries = await fs.readdir(PLUGINS_DIR, { withFileTypes: true });
            console.log("[PluginLoader] Found entries:", entries.length, entries.map(e => e.name));
            const pluginNames: string[] = [];

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    // Check if directory has a manifest.json
                    const manifestPath = path.join(PLUGINS_DIR, entry.name, "manifest.json");
                    try {
                        await fs.access(manifestPath);
                        console.log("[PluginLoader] Found plugin:", entry.name);
                        pluginNames.push(entry.name);
                    } catch {
                        console.log("[PluginLoader] No manifest.json in:", entry.name);
                        logger.warn(`Plugin directory ${entry.name} missing manifest.json`);
                    }
                }
            }

            console.log("[PluginLoader] Discovered plugins:", pluginNames.length, pluginNames);
            logger.info(`Discovered ${pluginNames.length} plugins: ${pluginNames.join(", ")}`);
            return pluginNames;
        } catch (error) {
            console.error("[PluginLoader] Error during discovery:", error);
            logger.error("Error discovering plugins", error as Error);
            return [];
        }
    }

    /**
     * Load a plugin by name
     */
    async load(pluginName: string): Promise<Plugin> {
        // Check if already loaded
        if (this.loadedPlugins.has(pluginName)) {
            return this.loadedPlugins.get(pluginName)!;
        }

        try {
            const pluginDir = path.join(PLUGINS_DIR, pluginName);

            // Load manifest
            const manifestPath = path.join(pluginDir, "manifest.json");
            const manifestContent = await fs.readFile(manifestPath, "utf-8");
            const manifest: PluginManifest = JSON.parse(manifestContent);

            // Validate manifest
            if (!this.validateManifest(manifest)) {
                throw new PluginLoadError(pluginName, "Invalid manifest");
            }

            // Check dependencies
            const depsOk = await this.checkDependencies(manifest);
            if (!depsOk) {
                throw new PluginDependencyError(
                    pluginName,
                    Object.keys(manifest.dependencies || {})
                );
            }

            // Load plugin module
            let indexPath = path.join(pluginDir, "index.ts");
            try {
                await fs.access(indexPath);
            } catch {
                indexPath = path.join(pluginDir, "index.js");
            }

            // On Windows, import() with absolute path fails, so we use file:// URL
            // However, for .ts files in Next.js dev, require() often works better if the environment is CJS
            // const importPath = pathToFileURL(indexPath).href;
            // const pluginModule = await import(importPath);

            // Use require() instead
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const pluginModule = require(indexPath);
            const plugin: Plugin = pluginModule.default || pluginModule;

            // Ensure plugin has manifest
            if (!plugin.manifest) {
                plugin.manifest = manifest;
            }

            // Cache loaded plugin
            this.loadedPlugins.set(pluginName, plugin);

            logger.info(`Plugin loaded: ${pluginName} v${manifest.version}`);
            return plugin;
        } catch (error) {
            if (error instanceof PluginLoadError || error instanceof PluginDependencyError) {
                throw error;
            }
            throw new PluginLoadError(
                pluginName,
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    /**
     * Unload a plugin
     */
    async unload(pluginName: string): Promise<void> {
        if (this.loadedPlugins.has(pluginName)) {
            this.loadedPlugins.delete(pluginName);
            logger.info(`Plugin unloaded: ${pluginName}`);
        }
    }

    /**
     * Validate plugin manifest
     */
    validateManifest(manifest: PluginManifest): boolean {
        // Required fields
        const required = ["name", "version", "displayName", "description", "author"];
        for (const field of required) {
            if (!(field in manifest)) {
                logger.error(`Plugin manifest missing required field: ${field}`);
                return false;
            }
        }

        // Validate version format
        if (!semver.valid(manifest.version)) {
            logger.error(`Invalid plugin version: ${manifest.version}`);
            return false;
        }

        // Validate name format (kebab-case)
        if (!/^[a-z0-9-]+$/.test(manifest.name)) {
            logger.error(`Invalid plugin name format: ${manifest.name}. Use kebab-case.`);
            return false;
        }

        return true;
    }

    /**
     * Check plugin dependencies
     */
    async checkDependencies(manifest: PluginManifest): Promise<boolean> {
        if (!manifest.dependencies) {
            return true;
        }

        // Check core version
        if (manifest.dependencies.core) {
            const requiredVersion = manifest.dependencies.core;
            if (!semver.satisfies(CORE_VERSION, requiredVersion)) {
                logger.error(
                    `Plugin ${manifest.name} requires core version ${requiredVersion}, but current version is ${CORE_VERSION}`
                );
                return false;
            }
        }

        // Check required plugins
        if (manifest.requiredPlugins && manifest.requiredPlugins.length > 0) {
            const { pluginRegistry } = await import("./registry");
            for (const requiredPlugin of manifest.requiredPlugins) {
                if (!pluginRegistry.has(requiredPlugin)) {
                    logger.error(
                        `Plugin ${manifest.name} requires plugin ${requiredPlugin} which is not installed`
                    );
                    return false;
                }

                const plugin = pluginRegistry.get(requiredPlugin);
                if (plugin && plugin.status !== "enabled") {
                    logger.error(
                        `Plugin ${manifest.name} requires plugin ${requiredPlugin} which is not enabled`
                    );
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Get loaded plugin
     */
    getLoaded(pluginName: string): Plugin | undefined {
        return this.loadedPlugins.get(pluginName);
    }

    /**
     * Clear loaded plugins cache
     */
    clear(): void {
        this.loadedPlugins.clear();
    }
}

// Singleton instance
export const pluginLoader = new PluginLoaderImpl();
