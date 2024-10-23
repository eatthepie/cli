import inquirer from "inquirer";
import { saveConfig } from "../utils/config.js";
import { displayBanner } from "../utils/display.js";

/**
 * Network configuration defaults
 */
const NETWORK_CONFIG = {
  MAINNET: {
    NAME: "mainnet",
    RPC: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID",
  },
  SEPOLIA: {
    NAME: "sepolia",
    RPC: "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
  },
};

/**
 * Validation patterns
 */
const VALIDATION = {
  ETHEREUM_ADDRESS: {
    PATTERN: /^0x[a-fA-F0-9]{40}$/,
    MESSAGE: "Please enter a valid Ethereum address",
  },
  PRIVATE_KEY: {
    PATTERN: /^0x[a-fA-F0-9]{64}$/,
    MESSAGE:
      "Please enter a valid private key (66 characters long, starting with 0x)",
  },
  RPC_URL: {
    VALIDATE: (input) => input.startsWith("http"),
    MESSAGE: "Please enter a valid URL",
  },
};

/**
 * Welcome messages
 */
const MESSAGES = {
  WELCOME: "Welcome to Eat The Pie! Let's set up your configuration.",
  SUCCESS: "Configuration saved successfully!",
};

/**
 * Default contract address for testing
 */
const DEFAULT_CONTRACT = "0x1234567890123456789012345678901234567890";

/**
 * Setup questions configuration
 */
const setupQuestions = [
  {
    type: "list",
    name: "network",
    message: "Which network would you like to use?",
    choices: ["mainnet", "sepolia", "anvil"],
    default: NETWORK_CONFIG.MAINNET.NAME,
  },
  {
    type: "input",
    name: "contractAddress",
    message: "Enter the EatThePie contract address:",
    default: DEFAULT_CONTRACT,
    validate: (input) =>
      VALIDATION.ETHEREUM_ADDRESS.PATTERN.test(input) ||
      VALIDATION.ETHEREUM_ADDRESS.MESSAGE,
  },
  {
    type: "input",
    name: "rpcUrl",
    message: "Enter the RPC URL:",
    default: (answers) => getRpcUrlDefault(answers),
    validate: (input) =>
      VALIDATION.RPC_URL.VALIDATE(input) || VALIDATION.RPC_URL.MESSAGE,
  },
  {
    type: "password",
    name: "privateKey",
    message: "Enter your wallet private key:",
    mask: "*",
    validate: (input) =>
      VALIDATION.PRIVATE_KEY.PATTERN.test(input) ||
      VALIDATION.PRIVATE_KEY.MESSAGE,
  },
];

/**
 * Handles the initial setup process for the application
 */
async function setupHandler() {
  displayWelcomeMessage();
  await processSetup();
}

/**
 * Displays the welcome banner and message
 */
function displayWelcomeMessage() {
  displayBanner();
  console.log(MESSAGES.WELCOME);
}

/**
 * Processes the setup questions and saves configuration
 */
async function processSetup() {
  const config = await promptForConfiguration();
  await saveConfiguration(config);
}

/**
 * Prompts the user for configuration details
 * @returns {Promise<Object>} The user's configuration answers
 */
async function promptForConfiguration() {
  return await inquirer.prompt(setupQuestions);
}

/**
 * Saves the configuration and displays success message
 * @param {Object} config - The configuration to save
 */
async function saveConfiguration(config) {
  await saveConfig(config);
  console.log(MESSAGES.SUCCESS);
}

/**
 * Gets the default RPC URL based on the selected network
 * @param {Object} answers - The current answers object
 * @returns {string} The default RPC URL
 */
function getRpcUrlDefault(answers) {
  return answers.network === NETWORK_CONFIG.MAINNET.NAME
    ? NETWORK_CONFIG.MAINNET.RPC
    : NETWORK_CONFIG.SEPOLIA.RPC;
}

export default {
  command: "setup",
  describe: "Setup your network, wallet, and contract settings",
  handler: setupHandler,
};
