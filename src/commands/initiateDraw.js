import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import { initiateDraw } from "../services/gameService.js";

/**
 * Error messages that require special handling
 */
const ERROR_MESSAGES = {
  ALREADY_INITIATED: "Draw already initiated for current game",
  TIME_INTERVAL: "Time interval not passed",
  INSUFFICIENT_POOL: "Insufficient prize pool",
};

/**
 * Success messages
 */
const SUCCESS_MESSAGES = {
  DRAW_INITIATED: "Draw initiated successfully!",
};

/**
 * Error response messages
 */
const ERROR_RESPONSES = {
  ALREADY_INITIATED: "Draw already initiated.",
  TIME_INTERVAL: "Cannot initiate draw, time interval not yet reached.",
  INSUFFICIENT_POOL:
    "Cannot initiate draw, prize pool threshold not yet reached.",
};

/**
 * Handles the process of initiating a draw for the current game.
 * This includes validating conditions and processing the draw initiation.
 */
async function initiateDrawHandler() {
  try {
    // Initialize clients and configuration
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    // Process draw initiation
    await processDrawInitiation(
      walletClient,
      publicClient,
      config.contractAddress
    );
  } catch (error) {
    handleDrawError(error);
  }
}

/**
 * Processes the draw initiation transaction and displays results
 * @param {WalletClient} walletClient - The wallet client instance
 * @param {PublicClient} publicClient - The public client instance
 * @param {string} contractAddress - The lottery contract address
 */
async function processDrawInitiation(
  walletClient,
  publicClient,
  contractAddress
) {
  const txHash = await initiateDraw(
    walletClient,
    publicClient,
    contractAddress
  );

  displaySuccessMessages(txHash);
}

/**
 * Displays success messages after draw initiation
 * @param {string} txHash - The transaction hash
 */
function displaySuccessMessages(txHash) {
  console.log(chalk.cyan("Transaction Hash:"), txHash);
  console.log(chalk.green(`\n${SUCCESS_MESSAGES.DRAW_INITIATED}`));
}

/**
 * Handles errors that occur during the draw initiation process
 * @param {Error} error - The error to handle
 */
function handleDrawError(error) {
  // Map of error messages to their corresponding responses
  const errorHandlers = {
    [ERROR_MESSAGES.ALREADY_INITIATED]: () =>
      console.log(chalk.yellow(ERROR_RESPONSES.ALREADY_INITIATED)),
    [ERROR_MESSAGES.TIME_INTERVAL]: () =>
      console.log(chalk.yellow(ERROR_RESPONSES.TIME_INTERVAL)),
    [ERROR_MESSAGES.INSUFFICIENT_POOL]: () =>
      console.log(chalk.yellow(ERROR_RESPONSES.INSUFFICIENT_POOL)),
  };

  // Check if error matches any known error types
  for (const [errorMessage, handler] of Object.entries(errorHandlers)) {
    if (error.message.includes(errorMessage)) {
      handler();
      return;
    }
  }

  // Handle unknown errors
  console.error(chalk.red("\nError:"), error.shortMessage || error.message);
  console.error(
    chalk.red(
      "\nMake sure your settings are correct.\nRun 'config' to view them and 'setup' to reset them."
    )
  );
  process.exit(1);
}

export default {
  command: "initiate-draw",
  describe: "Initiate the draw",
  handler: initiateDrawHandler,
};
