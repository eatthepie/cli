import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "..", "..", "config.json");

export async function saveConfig(config) {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

export async function loadConfig() {
  try {
    const data = await fs.readFile(configPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Configuration not found. Please run 'setup' first.");
    process.exit(1);
  }
}
