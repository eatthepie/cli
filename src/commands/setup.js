import inquirer from "inquirer";
import { saveConfig } from "../utils/config.js";
import { displayBanner } from "../utils/display.js";

const NETWORK_CONFIG = {
  WORLD_CHAIN: {
    NAME: "worldchain",
    RPC: "https://worldchain-mainnet.g.alchemy.com/public",
    CONTRACT: "0x86510c295644d1214dc62112e15ec314076acf2c",
  },
};

const VALIDATION = {
  ETHEREUM_ADDRESS: {
    PATTERN: /^0x[a-fA-F0-9]{40}$/,
    MESSAGE: "⚠️ Please enter a valid World Chain address",
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
    choices: ["worldchain"],
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
    case NETWORK_CONFIG.WORLD_CHAIN.NAME:
      return NETWORK_CONFIG.WORLD_CHAIN.CONTRACT;
  }
}

function getRpcUrlDefault(answers) {
  switch (answers.network) {
    case NETWORK_CONFIG.WORLD_CHAIN.NAME:
      return NETWORK_CONFIG.WORLD_CHAIN.RPC;
  }
}

export default {
  command: "setup",
  describe: "⚙️ Setup your network, wallet, and contract settings",
  handler: setupHandler,
};
