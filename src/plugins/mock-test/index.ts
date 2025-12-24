/**
 * Mock Test Generator Plugin
 * 
 * AI-powered mock test generation with 20 questions, automatic scoring, and topic-wise analysis
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("Mock Test Generator plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("Mock Test Generator plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("Mock Test Generator plugin disabled");
  },
};

const mockTestPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing Mock Test Generator plugin");
  },
};

export default mockTestPlugin;
