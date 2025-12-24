/**
 * File Storage Plugin
 * 
 * File upload and storage with AWS S3 and Cloudflare R2 support
 */

import { Plugin, PluginContext, PluginHooks } from "../../lib/plugins/types";
import manifest from "./manifest.json";

const hooks: PluginHooks = {
  async onInstall(context: PluginContext) {
    context.services.logger.info("File Storage plugin installed");
  },

  async onEnable(context: PluginContext) {
    context.services.logger.info("File Storage plugin enabled");
  },

  async onDisable(context: PluginContext) {
    context.services.logger.info("File Storage plugin disabled");
  },
};

const fileStoragePlugin: Plugin = {
  manifest: manifest as any,
  hooks,
  
  async initialize(context: PluginContext) {
    context.services.logger.info("Initializing File Storage plugin");
  },
};

export default fileStoragePlugin;
