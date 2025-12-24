/**
 * Study Streaks Plugin
 * 
 * Track daily study activity and maintain learning streaks
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("Study Streaks plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("Study Streaks plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("Study Streaks plugin disabled");
  },
};

const studyStreaksPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing Study Streaks plugin");
  },
};

export default studyStreaksPlugin;
