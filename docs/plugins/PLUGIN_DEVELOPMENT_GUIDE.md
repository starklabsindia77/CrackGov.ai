# Plugin Development Guide

Complete guide for developing plugins for CrackGov.ai.

## Table of Contents

1. [Introduction](#introduction)
2. [Plugin Structure](#plugin-structure)
3. [Creating a Plugin](#creating-a-plugin)
4. [Plugin Lifecycle](#plugin-lifecycle)
5. [API Routes](#api-routes)
6. [Configuration](#configuration)
7. [Events](#events)
8. [Best Practices](#best-practices)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Introduction

The CrackGov.ai plugin system allows you to create modular, independent features that can be:
- Enabled/disabled dynamically
- Configured independently
- Developed and tested in isolation
- Shared across projects

## Plugin Structure

```
src/plugins/[plugin-name]/
├── manifest.json          # Plugin metadata (required)
├── index.ts              # Plugin entry point (required)
├── config.schema.ts      # Configuration schema (optional)
├── routes/               # API route handlers
│   ├── handler1.ts
│   └── handler2.ts
├── components/           # UI components (optional)
│   └── Component.tsx
├── lib/                  # Plugin utilities
├── jobs/                 # Background jobs
└── README.md            # Plugin documentation
```

## Creating a Plugin

### Step 1: Create Plugin Directory

```bash
mkdir -p src/plugins/my-plugin
cd src/plugins/my-plugin
```

### Step 2: Create Manifest

Create `manifest.json`:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "displayName": "My Awesome Plugin",
  "description": "Description of what this plugin does",
  "author": "Your Name",
  "license": "MIT",
  "icon": "Zap",
  "category": "core",
  "dependencies": {
    "core": ">=1.0.0"
  },
  "requiredPlugins": [],
  "permissions": [
    {
      "permission": "my-plugin:use",
      "description": "Use my plugin features"
    }
  ],
  "routes": [
    {
      "method": "POST",
      "path": "/api/my-plugin/action",
      "handler": "routes/action",
      "auth": true
    }
  ],
  "navigation": [
    {
      "label": "My Plugin",
      "href": "/app/my-plugin",
      "icon": "Zap"
    }
  ],
  "config": {
    "schema": "config.schema.ts",
    "defaults": {
      "enabled": true
    }
  }
}
```

### Step 3: Create Plugin Entry Point

Create `index.ts`:

```typescript
import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("Plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("Plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("Plugin disabled");
  },
};

const myPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Plugin initialized");
  },
};

export default myPlugin;
```

### Step 4: Create Route Handlers

Create `routes/action.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { PluginContext } from "../../../lib/plugins/types";

export default async function actionHandler(
  request: NextRequest,
  context: PluginContext
) {
  try {
    const body = await request.json();
    
    // Your logic here
    
    return NextResponse.json({
      success: true,
      data: {}
    });
  } catch (error) {
    context.services.logger.error("Error in action handler", error as Error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
```

## Plugin Lifecycle

### Lifecycle Hooks

```typescript
interface PluginHooks {
  onInstall?: (context: PluginContext) => Promise<void>;
  onEnable?: (context: PluginContext) => Promise<void>;
  onDisable?: (context: PluginContext) => Promise<void>;
  onUninstall?: (context: PluginContext) => Promise<void>;
  onConfigUpdate?: (context: PluginContext, newConfig: any) => Promise<void>;
  onStartup?: (context: PluginContext) => Promise<void>;
  onShutdown?: (context: PluginContext) => Promise<void>;
}
```

### Lifecycle Flow

```
Available → Install → Installed → Enable → Enabled
                ↓                    ↓
            Uninstall            Disable
                ↓                    ↓
            Removed              Disabled
```

## API Routes

### Defining Routes

Routes are defined in `manifest.json`:

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/api/my-plugin/items",
      "handler": "routes/list",
      "auth": true,
      "permissions": ["my-plugin:view"]
    }
  ]
}
```

### Route Handler

```typescript
export default async function handler(
  request: NextRequest,
  context: PluginContext,
  params?: Record<string, string>
) {
  // Access services
  const { db, cache, logger, ai } = context.services;
  
  // Access configuration
  const config = context.config;
  
  // Emit events
  context.events.emit("my-plugin:action", { data: "..." });
  
  return NextResponse.json({ success: true });
}
```

## Configuration

### Configuration Schema

Create `config.schema.ts`:

```typescript
import { z } from "zod";

export const myPluginConfigSchema = z.object({
  enabled: z.boolean().default(true),
  maxItems: z.number().int().min(1).max(100).default(10),
  apiKey: z.string().optional(),
});

export type MyPluginConfig = z.infer<typeof myPluginConfigSchema>;
```

### Accessing Configuration

```typescript
const config = context.config as MyPluginConfig;
const maxItems = config.maxItems;
```

## Events

### Emitting Events

```typescript
context.events.emit("my-plugin:item-created", {
  itemId: "123",
  userId: "456"
});
```

### Listening to Events

```typescript
context.events.on("user:created", async (data) => {
  // Handle user creation
});
```

### Built-in Events

- `plugin:installed`
- `plugin:enabled`
- `plugin:disabled`
- `plugin:uninstalled`
- `plugin:config:updated`
- `system:startup`
- `system:shutdown`
- `user:created`
- `user:updated`
- `user:deleted`

## Best Practices

### 1. Error Handling

Always wrap your code in try-catch blocks:

```typescript
try {
  // Your code
} catch (error) {
  context.services.logger.error("Error message", error as Error);
  return NextResponse.json({ error: "..." }, { status: 500 });
}
```

### 2. Logging

Use structured logging:

```typescript
context.services.logger.info("Action performed", {
  userId: "123",
  action: "create"
});
```

### 3. Database Access

Use transactions for multiple operations:

```typescript
await context.services.db.$transaction(async (tx) => {
  await tx.model1.create({ ... });
  await tx.model2.update({ ... });
});
```

### 4. Caching

Cache expensive operations:

```typescript
const cacheKey = `my-plugin:${userId}:data`;
const cached = await context.services.cache?.get(cacheKey);

if (cached) {
  return JSON.parse(cached as string);
}

// Generate data
const data = await generateData();

// Cache it
await context.services.cache?.setEx(cacheKey, 3600, JSON.stringify(data));
```

### 5. Background Jobs

Use queues for long-running tasks:

```typescript
await context.services.queue.ai?.add("process-data", {
  userId: "123",
  data: {...}
});
```

## Testing

### Unit Tests

Create `__tests__/plugin.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import myPlugin from "../index";

describe("My Plugin", () => {
  it("should have correct manifest", () => {
    expect(myPlugin.manifest.name).toBe("my-plugin");
  });
  
  it("should initialize correctly", async () => {
    const context = createMockContext();
    await myPlugin.initialize?.(context);
    // Assertions
  });
});
```

### Integration Tests

Test with actual plugin manager:

```typescript
import { pluginManager } from "@/lib/plugins";

describe("Plugin Integration", () => {
  it("should install and enable", async () => {
    await pluginManager.install("my-plugin");
    await pluginManager.enable("my-plugin");
    
    expect(pluginManager.isEnabled("my-plugin")).toBe(true);
  });
});
```

## Deployment

### 1. Build and Test

```bash
npm run build
npm test
```

### 2. Install Plugin

Via Admin UI or API:

```bash
POST /api/admin/plugins/my-plugin/install
```

### 3. Enable Plugin

```bash
POST /api/admin/plugins/my-plugin/enable
```

### 4. Configure Plugin

```bash
PUT /api/admin/plugins/my-plugin/config
{
  "config": {
    "enabled": true,
    "maxItems": 20
  }
}
```

## Example Plugins

See the following example plugins:
- `src/plugins/study-plan` - AI study plan generation
- `src/plugins/mock-test` - Mock test system
- `src/plugins/flashcard` - Flashcard system

## Support

For questions or issues:
- Check the documentation
- Review example plugins
- Contact the development team

---

**Happy Plugin Development! 🚀**
