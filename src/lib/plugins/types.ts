/**
 * Plugin System Type Definitions
 * 
 * Core types and interfaces for the CrackGov.ai plugin architecture.
 * This enables modular, plug-and-play features that can be independently
 * enabled, disabled, and configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { ReactNode } from "react";

/**
 * Plugin lifecycle states
 */
export type PluginStatus = "installed" | "enabled" | "disabled" | "error";

/**
 * Plugin metadata and manifest
 */
export interface PluginManifest {
  /** Unique plugin identifier (kebab-case) */
  name: string;
  
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  
  /** Human-readable display name */
  displayName: string;
  
  /** Plugin description */
  description: string;
  
  /** Plugin author/organization */
  author: string;
  
  /** License type (e.g., "MIT", "Proprietary") */
  license: string;
  
  /** Plugin icon (lucide-react icon name) */
  icon?: string;
  
  /** Plugin category for organization */
  category?: "core" | "ai" | "assessment" | "collaboration" | "analytics" | "content" | "integration";
  
  /** Minimum core version required */
  dependencies?: {
    core?: string;
    [key: string]: string | undefined;
  };
  
  /** Required plugins that must be enabled */
  requiredPlugins?: string[];
  
  /** Optional plugins that enhance functionality */
  optionalPlugins?: string[];
  
  /** Permissions required by this plugin */
  permissions?: PluginPermission[];
  
  /** API routes registered by this plugin */
  routes?: PluginRoute[];
  
  /** Navigation items added by this plugin */
  navigation?: PluginNavigation[];
  
  /** Admin navigation items */
  adminNavigation?: PluginNavigation[];
  
  /** Configuration schema */
  config?: {
    schema: string; // Path to Zod schema
    defaults: Record<string, any>;
  };
  
  /** Database models used by this plugin */
  models?: string[];
  
  /** Background jobs registered by this plugin */
  jobs?: PluginJob[];
  
  /** Webhooks registered by this plugin */
  webhooks?: PluginWebhook[];
}

/**
 * Plugin permission definition
 */
export interface PluginPermission {
  /** Permission identifier (e.g., "study-plan:create") */
  permission: string;
  
  /** Human-readable description */
  description: string;
  
  /** Permission scope */
  scope?: "user" | "admin" | "system";
}

/**
 * Plugin API route definition
 */
export interface PluginRoute {
  /** HTTP method */
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  
  /** Route path (e.g., "/api/study-plan/generate") */
  path: string;
  
  /** Handler function path relative to plugin root */
  handler: string;
  
  /** Middleware to apply */
  middleware?: string[];
  
  /** Rate limit override */
  rateLimit?: {
    requests: number;
    window: number; // milliseconds
  };
  
  /** Authentication required */
  auth?: boolean;
  
  /** Required permissions */
  permissions?: string[];
}

/**
 * Plugin navigation item
 */
export interface PluginNavigation {
  /** Display label */
  label: string;
  
  /** Navigation href */
  href: string;
  
  /** Icon name (lucide-react) */
  icon?: string;
  
  /** Navigation order/priority */
  order?: number;
  
  /** Show only for specific roles */
  roles?: string[];
  
  /** Child navigation items */
  children?: PluginNavigation[];
}

/**
 * Plugin background job definition
 */
export interface PluginJob {
  /** Job name */
  name: string;
  
  /** Job handler path */
  handler: string;
  
  /** Job schedule (cron expression) */
  schedule?: string;
  
  /** Queue name */
  queue?: string;
}

/**
 * Plugin webhook definition
 */
export interface PluginWebhook {
  /** Webhook event name */
  event: string;
  
  /** Webhook handler path */
  handler: string;
  
  /** Webhook description */
  description?: string;
}

/**
 * Plugin context provided to plugins
 * Gives access to core services and utilities
 */
export interface PluginContext {
  /** Plugin name */
  pluginName: string;
  
  /** Plugin configuration */
  config: Record<string, any>;
  
  /** Core services */
  services: {
    /** Prisma database client */
    db: any;
    
    /** Redis cache client */
    cache: any;
    
    /** Job queue */
    queue: any;
    
    /** Logger */
    logger: any;
    
    /** AI orchestrator */
    ai: any;
    
    /** Email service */
    email: any;
    
    /** Storage service */
    storage: any;
  };
  
  /** Plugin registry for accessing other plugins */
  registry: PluginRegistry;
  
  /** Event emitter for plugin communication */
  events: PluginEventEmitter;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
  /**
   * Called when plugin is first installed
   * Use for initial setup, database migrations, etc.
   */
  onInstall?: (context: PluginContext) => Promise<void>;
  
  /**
   * Called when plugin is enabled
   * Use for starting services, registering routes, etc.
   */
  onEnable?: (context: PluginContext) => Promise<void>;
  
  /**
   * Called when plugin is disabled
   * Use for cleanup, stopping services, etc.
   */
  onDisable?: (context: PluginContext) => Promise<void>;
  
  /**
   * Called when plugin is uninstalled
   * Use for removing data, cleanup, etc.
   */
  onUninstall?: (context: PluginContext) => Promise<void>;
  
  /**
   * Called when plugin configuration is updated
   */
  onConfigUpdate?: (context: PluginContext, newConfig: Record<string, any>) => Promise<void>;
  
  /**
   * Called on application startup (if plugin is enabled)
   */
  onStartup?: (context: PluginContext) => Promise<void>;
  
  /**
   * Called on application shutdown (if plugin is enabled)
   */
  onShutdown?: (context: PluginContext) => Promise<void>;
}

/**
 * Main plugin interface
 */
export interface Plugin {
  /** Plugin manifest */
  manifest: PluginManifest;
  
  /** Plugin lifecycle hooks */
  hooks?: PluginHooks;
  
  /** Plugin initialization function */
  initialize?: (context: PluginContext) => Promise<void>;
  
  /** Plugin route handlers */
  handlers?: Record<string, PluginRouteHandler>;
  
  /** Plugin React components */
  components?: Record<string, React.ComponentType<any>>;
  
  /** Plugin utilities */
  utils?: Record<string, any>;
}

/**
 * Plugin route handler function
 */
export type PluginRouteHandler = (
  request: NextRequest,
  context: PluginContext,
  params?: Record<string, string>
) => Promise<NextResponse> | NextResponse;

/**
 * Plugin registry interface
 */
export interface PluginRegistry {
  /** Get all registered plugins */
  getAll(): Map<string, RegisteredPlugin>;
  
  /** Get a specific plugin */
  get(name: string): RegisteredPlugin | undefined;
  
  /** Check if plugin is registered */
  has(name: string): boolean;
  
  /** Get all enabled plugins */
  getEnabled(): RegisteredPlugin[];
  
  /** Get plugins by category */
  getByCategory(category: string): RegisteredPlugin[];
  
  /** Register a plugin */
  register(plugin: Plugin): Promise<void>;
  
  /** Unregister a plugin */
  unregister(name: string): Promise<void>;
}

/**
 * Registered plugin with runtime state
 */
export interface RegisteredPlugin {
  /** Plugin instance */
  plugin: Plugin;
  
  /** Plugin status */
  status: PluginStatus;
  
  /** Plugin configuration */
  config: Record<string, any>;
  
  /** Plugin context */
  context: PluginContext;
  
  /** Installation timestamp */
  installedAt?: Date;
  
  /** Last enabled timestamp */
  enabledAt?: Date;
  
  /** Error information if status is "error" */
  error?: {
    message: string;
    stack?: string;
    timestamp: Date;
  };
}

/**
 * Plugin event emitter for inter-plugin communication
 */
export interface PluginEventEmitter {
  /** Emit an event */
  emit(event: string, data?: any): void;
  
  /** Listen to an event */
  on(event: string, handler: (data: any) => void): void;
  
  /** Listen to an event once */
  once(event: string, handler: (data: any) => void): void;
  
  /** Remove event listener */
  off(event: string, handler: (data: any) => void): void;
  
  /** Remove all listeners for an event */
  removeAllListeners(event?: string): void;
}

/**
 * Plugin manager interface
 */
export interface PluginManager {
  /** Initialize the plugin system */
  initialize(): Promise<void>;
  
  /** Load all plugins */
  loadPlugins(): Promise<void>;
  
  /** Install a plugin */
  install(pluginName: string): Promise<void>;
  
  /** Uninstall a plugin */
  uninstall(pluginName: string): Promise<void>;
  
  /** Enable a plugin */
  enable(pluginName: string): Promise<void>;
  
  /** Disable a plugin */
  disable(pluginName: string): Promise<void>;
  
  /** Update plugin configuration */
  updateConfig(pluginName: string, config: Record<string, any>): Promise<void>;
  
  /** Get plugin status */
  getStatus(pluginName: string): PluginStatus | undefined;
  
  /** Check if plugin is enabled */
  isEnabled(pluginName: string): boolean;
  
  /** Get plugin configuration */
  getConfig(pluginName: string): Record<string, any> | undefined;
  
  /** Reload a plugin */
  reload(pluginName: string): Promise<void>;
}

/**
 * Plugin loader interface
 */
export interface PluginLoader {
  /** Discover available plugins */
  discover(): Promise<string[]>;
  
  /** Load a plugin by name */
  load(pluginName: string): Promise<Plugin>;
  
  /** Unload a plugin */
  unload(pluginName: string): Promise<void>;
  
  /** Validate plugin manifest */
  validateManifest(manifest: PluginManifest): boolean;
  
  /** Check plugin dependencies */
  checkDependencies(manifest: PluginManifest): Promise<boolean>;
}

/**
 * Plugin configuration validator
 */
export interface PluginConfigValidator {
  /** Validate configuration against schema */
  validate(config: Record<string, any>, schema: any): boolean;
  
  /** Get validation errors */
  getErrors(): string[];
  
  /** Merge configuration with defaults */
  mergeWithDefaults(config: Record<string, any>, defaults: Record<string, any>): Record<string, any>;
}

/**
 * Plugin database record (matches Prisma schema)
 */
export interface PluginRecord {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  installed: boolean;
  config: any;
  dependencies: string[];
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plugin route record (matches Prisma schema)
 */
export interface PluginRouteRecord {
  id: string;
  pluginName: string;
  method: string;
  path: string;
  handler: string;
  middleware: string[];
  enabled: boolean;
  createdAt: Date;
}

/**
 * Plugin permission record (matches Prisma schema)
 */
export interface PluginPermissionRecord {
  id: string;
  pluginName: string;
  permission: string;
  description: string | null;
  createdAt: Date;
}

/**
 * Plugin error types
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public pluginName: string,
    public code: string
  ) {
    super(message);
    this.name = "PluginError";
  }
}

export class PluginNotFoundError extends PluginError {
  constructor(pluginName: string) {
    super(`Plugin not found: ${pluginName}`, pluginName, "PLUGIN_NOT_FOUND");
    this.name = "PluginNotFoundError";
  }
}

export class PluginDependencyError extends PluginError {
  constructor(pluginName: string, missingDependencies: string[]) {
    super(
      `Plugin ${pluginName} has missing dependencies: ${missingDependencies.join(", ")}`,
      pluginName,
      "PLUGIN_DEPENDENCY_ERROR"
    );
    this.name = "PluginDependencyError";
  }
}

export class PluginConfigError extends PluginError {
  constructor(pluginName: string, message: string) {
    super(`Plugin ${pluginName} configuration error: ${message}`, pluginName, "PLUGIN_CONFIG_ERROR");
    this.name = "PluginConfigError";
  }
}

export class PluginLoadError extends PluginError {
  constructor(pluginName: string, message: string) {
    super(`Failed to load plugin ${pluginName}: ${message}`, pluginName, "PLUGIN_LOAD_ERROR");
    this.name = "PluginLoadError";
  }
}
