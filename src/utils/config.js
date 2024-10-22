/**
 * Configuration utility module for managing application settings
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Set up file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "..", "..", "config.json");

/**
 * Save configuration to file
 * @param {Object} config - Configuration to save
 */
export async function saveConfig(config) {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Load configuration from file
 * @returns {Promise<Object>} Configuration object
 */
export async function loadConfig() {
  try {
    const data = await fs.readFile(configPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Configuration not found. Please run 'setup' first.");
    process.exit(1);
  }
}
