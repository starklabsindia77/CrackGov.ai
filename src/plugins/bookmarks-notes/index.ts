/**
 * Bookmarks & Notes Plugin
 * 
 * Save bookmarks and create notes for questions, tests, and study materials
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("Bookmarks & Notes plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("Bookmarks & Notes plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("Bookmarks & Notes plugin disabled");
  },
};

const bookmarksNotesPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing Bookmarks & Notes plugin");
  },
};

export default bookmarksNotesPlugin;
