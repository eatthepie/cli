import inquirer from "inquirer";
import { saveConfig } from "../utils/config.js";
import { displayBanner } from "../utils/display.js";

/**
 * Network configuration defaults
 */
const NETWORK_CONFIG = {
  MAINNET: {
    NAME: "mainnet",
    RPC: "https://cloudflare-eth.com",
    CONTRACT: "0x043c9ae2764B5a7c2d685bc0262F8cF2f6D86008",
  },
  SEPOLIA: {
    NAME: "sepolia",
    RPC: "https://rpc2.sepolia.org",
    CONTRACT: "0x44B340051a31D216f83428B447DBa2C102DFF373",
  },
};

/**
 * Validation patterns
 */
const VALIDATION = {
  ETHEREUM_ADDRESS: {
    PATTERN: /^0x[a-fA-F0-9]{40}$/,
    MESSAGE: "⚠️ Please enter a valid Ethereum address",
  },
  PRIVATE_KEY: {
    PATTERN: /^0x[a-fA-F0-9]{64}$/,
    MESSAGE:
      "⚠️ Please enter a valid private key (66 characters long, starting with 0x)",
  },
  RPC_URL: {
    VALIDATE: (input) => input.startsWith("http"),
    MESSAGE: "⚠️ Please enter a valid URL",
  },
};

/**
 * Welcome messages
 */
const MESSAGES = {
  WELCOME: "🥧 Welcome to Eat The Pie! Let's set up your configuration 🚀",
  SUCCESS: "✨ Configuration saved successfully! You're ready to go! 🎉",
};

/**
 * Setup questions configuration
 */
const setupQuestions = [
  {
    type: "list",
    name: "network",
    message: "🌐 Which network would you like to use?",
    choices: ["mainnet", "sepolia", "anvil"],
    default: NETWORK_CONFIG.MAINNET.NAME,
  },
  {
    type: "input",
    name: "contractAddress",
    message: "📝 Enter the EatThePie contract address:",
    default: (answers) => getContractDefault(answers),
    validate: (input) =>
      VALIDATION.ETHEREUM_ADDRESS.PATTERN.test(input) ||
      VALIDATION.ETHEREUM_ADDRESS.MESSAGE,
  },
  {
    type: "input",
    name: "rpcUrl",
    message:
      "🔗 Enter the RPC URL (see chainlist.org for a list of public nodes):",
    default: (answers) => getRpcUrlDefault(answers),
    validate: (input) =>
      VALIDATION.RPC_URL.VALIDATE(input) || VALIDATION.RPC_URL.MESSAGE,
  },
  {
    type: "password",
    name: "privateKey",
    message: "🔐 Enter your wallet private key:",
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
 * Gets the default contract based on the selected network
 * @param {Object} answers - The current answers object
 * @returns {string} The default contract
 */
function getContractDefault(answers) {
  return answers.network === NETWORK_CONFIG.MAINNET.NAME
    ? NETWORK_CONFIG.MAINNET.CONTRACT
    : NETWORK_CONFIG.SEPOLIA.CONTRACT;
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
  describe: "⚙️ Setup your network, wallet, and contract settings",
  handler: setupHandler,
};
