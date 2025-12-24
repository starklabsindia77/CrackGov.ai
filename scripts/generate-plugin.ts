/**
 * Plugin Generator Script
 * 
 * Generates plugin boilerplate code from manifest.
 * Usage: npm run generate-plugin <plugin-name>
 */

import * as fs from "fs/promises";
import * as path from "path";

interface PluginManifest {
    name: string;
    version: string;
    displayName: string;
    description: string;
    author: string;
    category?: string;
    routes?: any[];
    permissions?: any[];
    navigation?: any[];
    config?: any;
}

async function generatePlugin(pluginName: string) {
    const pluginDir = path.join(process.cwd(), "src", "plugins", pluginName);
    const manifestPath = path.join(pluginDir, "manifest.json");

    // Check if manifest exists
    try {
        await fs.access(manifestPath);
    } catch {
        console.error(`Manifest not found: ${manifestPath}`);
        console.log("Please create manifest.json first");
        process.exit(1);
    }

    // Read manifest
    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest: PluginManifest = JSON.parse(manifestContent);

    console.log(`Generating plugin: ${manifest.displayName}`);

    // Create directories
    await fs.mkdir(path.join(pluginDir, "routes"), { recursive: true });
    await fs.mkdir(path.join(pluginDir, "lib"), { recursive: true });
    await fs.mkdir(path.join(pluginDir, "components"), { recursive: true });

    // Generate index.ts
    const indexContent = `/**
 * ${manifest.displayName} Plugin
 * 
 * ${manifest.description}
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("${manifest.displayName} plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("${manifest.displayName} plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("${manifest.displayName} plugin disabled");
  },
};

const ${toCamelCase(manifest.name)}Plugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing ${manifest.displayName} plugin");
  },
};

export default ${toCamelCase(manifest.name)}Plugin;
`;

    await fs.writeFile(path.join(pluginDir, "index.ts"), indexContent);

    // Generate route handlers
    if (manifest.routes) {
        for (const route of manifest.routes) {
            const handlerName = route.handler.split("/").pop();
            const handlerPath = path.join(pluginDir, "routes", `${handlerName}.ts`);

            const handlerContent = `/**
 * ${manifest.displayName} - ${handlerName} handler
 * 
 * ${route.method} ${route.path}
 */

import { NextRequest, NextResponse } from "next/server";
import { PluginContext } from "../../../lib/plugins/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route";

export default async function ${handlerName}Handler(
  request: NextRequest,
  context: PluginContext,
  params?: Record<string, string>
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await context.services.db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // TODO: Implement ${handlerName} logic
    
    return NextResponse.json({
      success: true,
      message: "${handlerName} handler - implement me!"
    });
  } catch (error) {
    context.services.logger.error("Error in ${handlerName} handler", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
`;

            await fs.writeFile(handlerPath, handlerContent);
        }
    }

    // Generate config schema if config is defined
    if (manifest.config) {
        const configContent = `/**
 * ${manifest.displayName} Configuration Schema
 */

import { z } from "zod";

export const ${toCamelCase(manifest.name)}ConfigSchema = z.object({
  // TODO: Define configuration schema
  enabled: z.boolean().default(true),
});

export type ${toPascalCase(manifest.name)}Config = z.infer<typeof ${toCamelCase(manifest.name)}ConfigSchema>;
`;

        await fs.writeFile(path.join(pluginDir, "config.schema.ts"), configContent);
    }

    // Generate README
    const readmeContent = `# ${manifest.displayName}

${manifest.description}

## Version

${manifest.version}

## Category

${manifest.category || "Uncategorized"}

## Permissions

${manifest.permissions?.map(p => `- \`${p.permission}\` - ${p.description}`).join("\n") || "None"}

## API Routes

${manifest.routes?.map(r => `- \`${r.method} ${r.path}\``).join("\n") || "None"}

## Navigation

${manifest.navigation?.map(n => `- ${n.label} (\`${n.href}\`)`).join("\n") || "None"}

## Configuration

See \`config.schema.ts\` for configuration options.

## Installation

\`\`\`bash
POST /api/admin/plugins/${manifest.name}/install
POST /api/admin/plugins/${manifest.name}/enable
\`\`\`
`;

    await fs.writeFile(path.join(pluginDir, "README.md"), readmeContent);

    console.log(`✅ Plugin generated successfully: ${pluginDir}`);
    console.log("\nGenerated files:");
    console.log("  - index.ts");
    console.log("  - config.schema.ts");
    console.log("  - README.md");
    console.log(`  - ${manifest.routes?.length || 0} route handlers`);
}

function toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function toPascalCase(str: string): string {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// Run generator
const pluginName = process.argv[2];
if (!pluginName) {
    console.error("Usage: tsx scripts/generate-plugin.ts <plugin-name>");
    process.exit(1);
}

generatePlugin(pluginName).catch(console.error);
