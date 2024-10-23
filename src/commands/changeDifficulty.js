import chalk from "chalk";

import { changeDifficulty } from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";

/**
 * Error messages that require special handling
 */
const ERROR_MESSAGES = {
  NOT_ENOUGH_GAMES: "Not enough games played",
  TOO_SOON: "Too soon to change difficulty",
};

/**
 * Success messages
 */
const SUCCESS_MESSAGES = {
  NOTE: "Note: If the conditions for a difficulty change are met, the change will take effect in the next game.",
  COMPLETE: "Difficulty change initiated successfully!",
};

/**
 * Handles the process of changing the game's difficulty level.
 * This includes validating conditions and submitting the transaction.
 */
async function changeDifficultyHandler() {
  try {
    // Initialize clients and configuration
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    // Attempt to change difficulty and process result
    await processDifficultyChange(
      walletClient,
      publicClient,
      config.contractAddress
    );
  } catch (error) {
    handleDifficultyError(error);
  }
}

/**
 * Processes the difficulty change transaction and displays results
 * @param {WalletClient} walletClient - The wallet client instance
 * @param {PublicClient} publicClient - The public client instance
 * @param {string} contractAddress - The lottery contract address
 */
async function processDifficultyChange(
  walletClient,
  publicClient,
  contractAddress
) {
  const txHash = await changeDifficulty(
    walletClient,
    publicClient,
    contractAddress
  );

  displaySuccessMessages(txHash);
}

/**
 * Displays success messages after difficulty change transaction
 * @param {string} txHash - The transaction hash
 */
function displaySuccessMessages(txHash) {
  console.log(chalk.yellow("\nTransaction Hash:"), txHash);
  console.log(chalk.cyan(SUCCESS_MESSAGES.NOTE));
  console.log(chalk.green(`${SUCCESS_MESSAGES.COMPLETE}`));
}

/**
 * Handles errors that occur during the difficulty change process
 * @param {Error} error - The error to handle
 */
function handleDifficultyError(error) {
  const isConditionError =
    error.message.includes(ERROR_MESSAGES.NOT_ENOUGH_GAMES) ||
    error.message.includes(ERROR_MESSAGES.TOO_SOON);

  if (isConditionError) {
    console.log(
      chalk.yellow(
        "Cannot change difficulty yet. Not enough games played or too soon since last change."
      )
    );
  } else {
    console.error(chalk.red("\nError:"), error.shortMessage || error.message);
    console.error(
      chalk.red(
        "\nMake sure your settings are correct.\nRun 'config' to view them and 'setup' to reset them."
      )
    );
    process.exit(1);
  }
}

export default {
  command: "change-difficulty",
  describe: "Change the difficulty of the game",
  handler: changeDifficultyHandler,
};
