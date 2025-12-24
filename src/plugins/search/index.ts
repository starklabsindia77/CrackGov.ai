/**
 * Full-Text Search Plugin
 * 
 * Advanced search across all content with filters and suggestions
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("Full-Text Search plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("Full-Text Search plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("Full-Text Search plugin disabled");
  },
};

const searchPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing Full-Text Search plugin");
  },
};

export default searchPlugin;
