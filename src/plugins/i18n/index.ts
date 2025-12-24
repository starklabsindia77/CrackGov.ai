/**
 * Internationalization Plugin
 * 
 * Multi-language support with dynamic translation loading
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("Internationalization plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("Internationalization plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("Internationalization plugin disabled");
  },
};

const i18nPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing Internationalization plugin");
  },
};

export default i18nPlugin;
