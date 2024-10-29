import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";

/**
 * Configuration display settings
 */
const CONFIG_DISPLAY = {
  MASKED_KEY_LENGTH: {
    PREFIX: 6,
    SUFFIX: 4,
  },
  DEFAULT_VALUE: "⚠️ Not set",
};

/**
 * Error messages
 */
const ERROR_MESSAGES = {
  NO_CONFIG: "❌ No configuration found. Please run 'setup' first.",
  GENERIC: "❌ Error reading configuration:",
};

/**
 * Warning messages
 */
const WARNING_MESSAGES = {
  PRIVATE_KEY:
    "🚨 Warning: Never share your private key with anyone! Keep it secure! 🔒",
};

/**
 * Handles the display of configuration settings including network,
 * contract address, RPC URL, and optionally the private key.
 */
async function displayConfig() {
  try {
    console.log(chalk.cyan("\n🔍 Loading configuration..."));

    const config = await loadConfig();

    // Display basic configuration
    displayBasicConfig(config);

    // Handle private key display
    await handlePrivateKeyDisplay(config);
  } catch (error) {
    handleConfigError(error);
  }
}

/**
 * Displays the basic configuration settings
 * @param {Object} config - The configuration object
 */
function displayBasicConfig(config) {
  console.log(chalk.yellow("\n⚙️ Current Configuration:"));
  console.log(chalk.cyan("🌐 Network:"), config.network);
  console.log(chalk.cyan("📝 Contract Address:"), config.contractAddress);
  console.log(chalk.cyan("🔗 RPC URL:"), config.rpcUrl);

  const maskedKey = maskPrivateKey(config.privateKey);
  console.log(chalk.cyan("🔑 Private Key:"), maskedKey);
}

/**
 * Masks a private key for secure display
 * @param {string} privateKey - The private key to mask
 * @returns {string} The masked private key
 */
function maskPrivateKey(privateKey) {
  if (!privateKey) return CONFIG_DISPLAY.DEFAULT_VALUE;

  const { PREFIX, SUFFIX } = CONFIG_DISPLAY.MASKED_KEY_LENGTH;
  return `${privateKey.slice(0, PREFIX)}...${privateKey.slice(-SUFFIX)}`;
}

/**
 * Handles the display of the full private key after user confirmation
 * @param {Object} config - The configuration object
 */
async function handlePrivateKeyDisplay(config) {
  const showFullKey = await promptForFullKeyDisplay();

  if (showFullKey) {
    displayFullPrivateKey(config.privateKey);
  }
}

/**
 * Prompts the user about displaying the full private key
 * @returns {Promise<boolean>} Whether to show the full private key
 */
async function promptForFullKeyDisplay() {
  const { showFullKey } = await inquirer.prompt([
    {
      type: "confirm",
      name: "showFullKey",
      message: "🔐 Would you like to view the full private key?",
      default: false,
    },
  ]);

  return showFullKey;
}

/**
 * Displays the full private key with a security warning
 * @param {string} privateKey - The full private key
 */
function displayFullPrivateKey(privateKey) {
  console.log(chalk.cyan("\n🔓 Full Private Key:"), privateKey);
  console.log(chalk.yellow(`\n${WARNING_MESSAGES.PRIVATE_KEY}`));
}

/**
 * Handles errors that occur during configuration display
 * @param {Error} error - The error to handle
 */
function handleConfigError(error) {
  if (error.code === "ENOENT") {
    console.error(chalk.red(ERROR_MESSAGES.NO_CONFIG));
    console.error(chalk.red("🔧 Run 'setup' to configure your settings."));
  } else {
    console.error(chalk.red(ERROR_MESSAGES.GENERIC), error);
  }
}

export default {
  command: "config",
  describe: "⚙️ Display your network, wallet, and contract settings",
  handler: displayConfig,
};
