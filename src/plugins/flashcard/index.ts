/**
 * Flashcard System Plugin
 * 
 * Spaced repetition flashcard system with AI-generated cards and progress tracking
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("Flashcard System plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("Flashcard System plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("Flashcard System plugin disabled");
  },
};

const flashcardPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing Flashcard System plugin");
  },
};

export default flashcardPlugin;
