/**
 * PDF Export Plugin
 * 
 * Export study plans, test results, and reports as PDF
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("PDF Export plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("PDF Export plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("PDF Export plugin disabled");
  },
};

const pdfExportPlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing PDF Export plugin");
  },
};

export default pdfExportPlugin;
