/**
 * Plugin Event Emitter
 * 
 * Enables inter-plugin communication through events.
 * Plugins can emit and listen to events for loose coupling.
 */

import { EventEmitter } from "events";
import { PluginEventEmitter as IPluginEventEmitter } from "./types";
import { logger } from "../logger";

class PluginEventEmitterImpl extends EventEmitter implements IPluginEventEmitter {
    constructor() {
        super();
        this.setMaxListeners(100); // Allow many plugins to listen
    }

    /**
     * Emit an event with optional data
     */
    emit(event: string, data?: any): boolean {
        logger.debug(`Plugin event emitted: ${event}`, { event, data });
        return super.emit(event, data);
    }

    /**
     * Listen to an event
     */
    on(event: string, handler: (data: any) => void): this {
        logger.debug(`Plugin event listener added: ${event}`);
        return super.on(event, handler);
    }

    /**
     * Listen to an event once
     */
    once(event: string, handler: (data: any) => void): this {
        logger.debug(`Plugin event listener added (once): ${event}`);
        return super.once(event, handler);
    }

    /**
     * Remove event listener
     */
    off(event: string, handler: (data: any) => void): this {
        logger.debug(`Plugin event listener removed: ${event}`);
        return super.off(event, handler);
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: string): this {
        if (event) {
            logger.debug(`All plugin event listeners removed for: ${event}`);
        } else {
            logger.debug("All plugin event listeners removed");
        }
        return super.removeAllListeners(event);
    }
}

// Singleton instance
export const pluginEvents = new PluginEventEmitterImpl();

// Common plugin events
export const PLUGIN_EVENTS = {
    // Lifecycle events
    PLUGIN_INSTALLED: "plugin:installed",
    PLUGIN_UNINSTALLED: "plugin:uninstalled",
    PLUGIN_ENABLED: "plugin:enabled",
    PLUGIN_DISABLED: "plugin:disabled",
    PLUGIN_CONFIG_UPDATED: "plugin:config:updated",

    // System events
    SYSTEM_STARTUP: "system:startup",
    SYSTEM_SHUTDOWN: "system:shutdown",

    // User events
    USER_CREATED: "user:created",
    USER_UPDATED: "user:updated",
    USER_DELETED: "user:deleted",

    // Feature events (plugins can emit these)
    STUDY_PLAN_CREATED: "study-plan:created",
    TEST_COMPLETED: "test:completed",
    DOUBT_ASKED: "doubt:asked",
    FLASHCARD_REVIEWED: "flashcard:reviewed",
} as const;
