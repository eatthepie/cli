import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createWalletClient } from "../utils/ethereum.js";
import { claimPrize } from "../services/gameService.js";

/**
 * Error messages that require special handling
 */
const ERROR_MESSAGES = {
  DRAW_NOT_COMPLETE: "Game draw not completed yet",
  ALREADY_CLAIMED: "Prize already claimed",
  NO_PRIZE: "No prize to claim",
};

/**
 * Success messages
 */
const SUCCESS_MESSAGES = {
  CLAIMED: "Prize claimed successfully!",
};

/**
 * Handles the process of claiming a prize for a specific game number.
 * This includes validating the game number and processing the claim transaction.
 */
async function claimPrizeHandler() {
  try {
    // Initialize wallet client and configuration
    const config = await loadConfig();
    const walletClient = createWalletClient(config);

    // Get game number from user
    const gameNumber = await promptForGameNumber();

    // Process the prize claim
    await processPrizeClaim(walletClient, config.contractAddress, gameNumber);
  } catch (error) {
    handleClaimError(error);
  }
}

/**
 * Prompts the user to input a game number
 * @returns {Promise<number>} The selected game number
 */
async function promptForGameNumber() {
  const { gameNumber } = await inquirer.prompt([
    {
      type: "number",
      name: "gameNumber",
      message: "Enter the game number for which you want to claim the prize:",
      validate: (input) => input > 0 || "Please enter a valid game number",
    },
  ]);
  return gameNumber;
}

/**
 * Processes the prize claim transaction and displays results
 * @param {WalletClient} walletClient - The wallet client instance
 * @param {string} contractAddress - The lottery contract address
 * @param {number} gameNumber - The game number to claim prize for
 */
async function processPrizeClaim(walletClient, contractAddress, gameNumber) {
  const txHash = await claimPrize(walletClient, contractAddress, gameNumber);
  displaySuccessMessages(txHash);
}

/**
 * Displays success messages after prize claim transaction
 * @param {string} txHash - The transaction hash
 */
function displaySuccessMessages(txHash) {
  console.log(chalk.green(`\n${SUCCESS_MESSAGES.CLAIMED}`));
  console.log(chalk.cyan("Transaction Hash:"), txHash);
}

/**
 * Handles errors that occur during the prize claiming process
 * @param {Error} error - The error to handle
 */
function handleClaimError(error) {
  const errorMessages = {
    [ERROR_MESSAGES.DRAW_NOT_COMPLETE]: "Game draw not completed yet.",
    [ERROR_MESSAGES.ALREADY_CLAIMED]: "Prize already claimed for this game.",
    [ERROR_MESSAGES.NO_PRIZE]: "No prize to claim for this game.",
  };

  // Check if error message matches any of our known error types
  for (const [errorType, message] of Object.entries(errorMessages)) {
    if (error.message.includes(errorType)) {
      console.log(chalk.yellow(`\n${message}`));
      return;
    }
  }

  // Handle unknown errors
  console.error(chalk.red("\nError:"), error.shortMessage || error.message);
  process.exit(1);
}

export default {
  command: "claim-prize",
  describe: "Claim your prize",
  handler: claimPrizeHandler,
};
