/**
 * AI Doubt Resolution Plugin
 * 
 * AI-powered doubt resolution with step-by-step explanations and subject-specific tutoring
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("AI Doubt Resolution plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("AI Doubt Resolution plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("AI Doubt Resolution plugin disabled");
  },
};

const doubtChatPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing AI Doubt Resolution plugin");
  },
};

export default doubtChatPlugin;
