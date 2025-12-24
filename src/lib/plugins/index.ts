/**
 * Plugin System Entry Point
 * 
 * Exports all plugin system components for easy importing.
 */

export * from "./types";
export { pluginRegistry } from "./registry";
export { pluginLoader } from "./loader";
export { pluginManager } from "./manager";
export { pluginEvents, PLUGIN_EVENTS } from "./events";

// Re-export for convenience
export type { PluginManager } from "./types";
