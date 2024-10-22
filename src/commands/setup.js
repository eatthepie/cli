import inquirer from "inquirer";
import { saveConfig } from "../utils/config.js";
import { displayBanner } from "../utils/display.js";

const setupQuestions = [
  {
    type: "list",
    name: "network",
    message: "Which network would you like to use?",
    choices: ["mainnet", "sepolia", "anvil"],
    default: "mainnet",
  },
  {
    type: "input",
    name: "contractAddress",
    message: "Enter the EatThePie contract address:",
    default: "0x1234567890123456789012345678901234567890",
    validate: (input) =>
      /^0x[a-fA-F0-9]{40}$/.test(input) ||
      "Please enter a valid Ethereum address",
  },
  {
    type: "input",
    name: "rpcUrl",
    message: "Enter the RPC URL:",
    default: (answers) =>
      answers.network === "mainnet"
        ? "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
        : "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
    validate: (input) => input.startsWith("http") || "Please enter a valid URL",
  },
  {
    type: "password",
    name: "privateKey",
    message: "Enter your wallet private key:",
    mask: "*",
    validate: (input) =>
      /^0x[a-fA-F0-9]{64}$/.test(input) ||
      "Please enter a valid private key (66 characters long, starting with 0x)",
  },
];

async function setupHandler() {
  displayBanner();
  console.log("Welcome to EatThePie! Let's set up your configuration.");

  const answers = await inquirer.prompt(setupQuestions);
  await saveConfig(answers);
  console.log("Configuration saved successfully!");
}

export default {
  command: "setup",
  describe: "Setup your network, wallet, and contract settings",
  handler: setupHandler,
};
