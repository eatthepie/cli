import inquirer from "inquirer";
import chalk from "chalk";

import { getGamePayouts, calculatePayouts } from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { displayPayouts } from "../utils/display.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";

/**
 * Error messages that require special handling
 */
const ERROR_MESSAGES = {
  ALREADY_CALCULATED: "Payouts already calculated for this game",
  WINNING_NUMBERS_NOT_SET: "Winning numbers not set",
};

/**
 * Handles the payout calculation process for a specified game number.
 * This includes submitting the calculation transaction and displaying the results.
 */
async function calculatePayoutsHandler() {
  try {
    // Initialize clients and configuration
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    // Get game number from user
    const gameNumber = await promptForGameNumber();

    // Calculate payouts and wait for transaction confirmation
    await processPayoutCalculation(
      walletClient,
      publicClient,
      config.contractAddress,
      gameNumber
    );

    // Display payout information
    await displayPayoutInformation(
      publicClient,
      config.contractAddress,
      gameNumber,
      config.network
    );
  } catch (error) {
    handlePayoutError(error);
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
      message: "🎮 Enter the game number to calculate payouts for:",
      validate: (input) => input > 0 || "⚠️ Please enter a valid game number",
    },
  ]);
  return gameNumber;
}

/**
 * Processes the payout calculation transaction and waits for confirmation
 * @param {WalletClient} walletClient - The wallet client instance
 * @param {PublicClient} publicClient - The public client instance
 * @param {string} contractAddress - The lottery contract address
 * @param {number} gameNumber - The game number to calculate payouts for
 */
async function processPayoutCalculation(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber
) {
  try {
    console.log(chalk.yellow("\n🧮 Calculating payouts..."));

    // Submit payout calculation transaction
    const txHash = await calculatePayouts(
      walletClient,
      publicClient,
      contractAddress,
      gameNumber
    );

    console.log(chalk.yellow("\n📝 Transaction Hash:"), txHash);
    console.log(chalk.green("✨ Payouts calculation submitted!"));

    // Wait for transaction confirmation
    await waitForTransactionConfirmation(publicClient, txHash);
  } catch (error) {
    // Only suppress "already calculated" errors
    if (!error.message.includes(ERROR_MESSAGES.ALREADY_CALCULATED)) {
      throw error;
    }
  }
}

/**
 * Waits for a transaction to be confirmed and displays the confirmation
 * @param {PublicClient} publicClient - The public client instance
 * @param {string} txHash - The transaction hash to wait for
 */
async function waitForTransactionConfirmation(publicClient, txHash) {
  console.log(chalk.yellow("\n⏳ Waiting for transaction to be confirmed..."));

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  console.log(chalk.cyan("📦 Block Number:"), receipt.blockNumber);
  console.log(chalk.green("\n✅ Transaction confirmed successfully!"));
}

/**
 * Fetches and displays payout information for a specific game
 * @param {PublicClient} publicClient - The public client instance
 * @param {string} contractAddress - The lottery contract address
 * @param {number} gameNumber - The game number to display payouts for
 * @param {string} network - The World Chain network name
 */
async function displayPayoutInformation(
  publicClient,
  contractAddress,
  gameNumber,
  network
) {
  console.log(chalk.yellow("\n💫 Fetching payout information..."));

  const payouts = await getGamePayouts(
    publicClient,
    contractAddress,
    gameNumber
  );

  await displayPayouts(gameNumber, payouts, network);
}

/**
 * Handles errors that occur during the payout calculation process
 * @param {Error} error - The error to handle
 */
function handlePayoutError(error) {
  if (error.message.includes(ERROR_MESSAGES.WINNING_NUMBERS_NOT_SET)) {
    console.log(
      chalk.yellow(
        "⏰ You can only calculate payouts once the winning numbers have been set."
      )
    );
  } else {
    console.error(
      chalk.red("\n❌ Error:"),
      error.shortMessage || error.message
    );
    console.error(
      chalk.red(
        "\n⚠️ Make sure your settings are correct.\n🔧 Run 'config' to view them and 'setup' to reset them."
      )
    );
    process.exit(1);
  }
}

export default {
  command: "calculate-payouts",
  describe: "💰 Calculate payouts",
  handler: calculatePayoutsHandler,
};
