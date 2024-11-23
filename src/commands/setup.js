import inquirer from "inquirer";
import { saveConfig } from "../utils/config.js";
import { displayBanner } from "../utils/display.js";

const NETWORK_CONFIG = {
  MAINNET: {
    NAME: "mainnet",
    RPC: "https://cloudflare-eth.com",
    CONTRACT: "0x043c9ae2764B5a7c2d685bc0262F8cF2f6D86008",
  },
  WORLD_CHAIN: {
    NAME: "worldchain",
    RPC: "https://worldchain-mainnet.g.alchemy.com/public",
    CONTRACT: "0xB3406E515b7fA46c0Ba0E8A65e15D459A44E2de4",
  },
  SEPOLIA: {
    NAME: "sepolia",
    RPC: "https://rpc2.sepolia.org",
    CONTRACT: "0x44B340051a31D216f83428B447DBa2C102DFF373",
  },
};

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

const MESSAGES = {
  WELCOME: "🥧 Welcome to Eat The Pie! Let's set up your configuration 🚀",
  SUCCESS: "✨ Configuration saved successfully! You're ready to go! 🎉",
};

const setupQuestions = [
  {
    type: "list",
    name: "network",
    message: "🌐 Which network would you like to use?",
    choices: ["mainnet", "worldchain", "sepolia"],
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

async function setupHandler() {
  displayWelcomeMessage();
  await processSetup();
}

function displayWelcomeMessage() {
  displayBanner();
  console.log(MESSAGES.WELCOME);
}

async function processSetup() {
  const config = await promptForConfiguration();
  await saveConfiguration(config);
}

async function promptForConfiguration() {
  return await inquirer.prompt(setupQuestions);
}

async function saveConfiguration(config) {
  await saveConfig(config);
  console.log(MESSAGES.SUCCESS);
}

function getContractDefault(answers) {
  switch (answers.network) {
    case NETWORK_CONFIG.MAINNET.NAME:
      return NETWORK_CONFIG.MAINNET.CONTRACT;
    case NETWORK_CONFIG.WORLD_CHAIN.NAME:
      return NETWORK_CONFIG.WORLD_CHAIN.CONTRACT;
    case NETWORK_CONFIG.SEPOLIA.NAME:
      return NETWORK_CONFIG.SEPOLIA.CONTRACT;
  }
}

function getRpcUrlDefault(answers) {
  switch (answers.network) {
    case NETWORK_CONFIG.MAINNET.NAME:
      return NETWORK_CONFIG.MAINNET.RPC;
    case NETWORK_CONFIG.WORLD_CHAIN.NAME:
      return NETWORK_CONFIG.WORLD_CHAIN.RPC;
    case NETWORK_CONFIG.SEPOLIA.NAME:
      return NETWORK_CONFIG.SEPOLIA.RPC;
  }
}

export default {
  command: "setup",
  describe: "⚙️ Setup your network, wallet, and contract settings",
  handler: setupHandler,
};
