# Plugin System Setup Guide

Quick guide to set up and use the plugin system.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (optional, for caching)

## Installation

### 1. Install Dependencies

The plugin system requires the `semver` package:

```bash
npm install semver
npm install --save-dev @types/semver
```

### 2. Generate Prisma Client

After adding the plugin models to the schema:

```bash
npx prisma generate
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_plugin_system
```

### 3. Initialize Plugin System

Add to your `src/app/layout.tsx` or application entry point:

```typescript
import { pluginManager } from "@/lib/plugins";

// Initialize on app startup
if (typeof window === "undefined") {
  pluginManager.initialize().catch(console.error);
}
```

## Usage

### Installing a Plugin

#### Via Admin API

```bash
POST /api/admin/plugins/study-plan/install
```

#### Programmatically

```typescript
import { pluginManager } from "@/lib/plugins";

await pluginManager.install("study-plan");
```

### Enabling a Plugin

```bash
POST /api/admin/plugins/study-plan/enable
```

### Disabling a Plugin

```bash
POST /api/admin/plugins/study-plan/disable
```

### Configuring a Plugin

```bash
PUT /api/admin/plugins/study-plan/config
Content-Type: application/json

{
  "config": {
    "maxPlansPerUser": 20,
    "cacheResults": true
  }
}
```

### Listing All Plugins

```bash
GET /api/admin/plugins
```

## Creating Your First Plugin

See the [Plugin Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md) for detailed instructions.

Quick start:

```bash
# Create plugin directory
mkdir -p src/plugins/my-plugin

# Create manifest
cat > src/plugins/my-plugin/manifest.json << EOF
{
  "name": "my-plugin",
  "version": "1.0.0",
  "displayName": "My Plugin",
  "description": "My awesome plugin",
  "author": "Me",
  "license": "MIT"
}
EOF

# Create entry point
cat > src/plugins/my-plugin/index.ts << EOF
import { Plugin } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const myPlugin: Plugin = {
  manifest: manifest as any,
};

export default myPlugin;
EOF
```

## Admin UI

Access the plugin management UI at:

```
/admin/plugins
```

Features:
- View all available plugins
- Install/uninstall plugins
- Enable/disable plugins
- Configure plugin settings
- View plugin status and errors

## Troubleshooting

### Plugin Not Found

Ensure the plugin directory exists in `src/plugins/[plugin-name]` and has a `manifest.json`.

### Plugin Won't Enable

Check:
1. All required dependencies are installed
2. Required plugins are enabled
3. No configuration errors
4. Check logs for specific errors

### Database Errors

Ensure you've run:

```bash
npx prisma generate
npx prisma db push
```

### TypeScript Errors

If you see errors about missing types:

```bash
npm install --save-dev @types/semver
npx prisma generate
```

## Environment Variables

No additional environment variables required. The plugin system uses existing database and Redis connections.

## Next Steps

1. ✅ Install dependencies
2. ✅ Generate Prisma client
3. ✅ Initialize plugin system
4. 📝 Create your first plugin
5. 🚀 Install and enable plugins
6. 🎨 Customize plugin configurations

## Examples

See example plugins in:
- `src/plugins/study-plan` - Complete example with AI integration
- More plugins coming soon!

## Support

For issues or questions:
- Check the [Plugin Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md)
- Review example plugins
- Check application logs

---

**Ready to build amazing plugins! 🎉**
