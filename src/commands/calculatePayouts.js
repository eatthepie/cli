import inquirer from "inquirer";
import chalk from "chalk";

import { getGamePayouts, calculatePayouts } from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { displayPayouts } from "../utils/display.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";

async function calculatePayoutsHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number to calculate payouts for:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    try {
      console.log(chalk.yellow("\nCalculating payouts..."));
      const txHash = await calculatePayouts(
        walletClient,
        publicClient,
        config.contractAddress,
        gameNumber
      );

      console.log(chalk.green("\nPayouts calculation submitted!"));
      console.log(chalk.cyan("Transaction Hash:"), txHash);

      console.log(chalk.yellow("\nWaiting for transaction to be mined..."));
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      console.log(chalk.green("\nTransaction mined successfully!"));
      console.log(chalk.cyan("Block Number:"), receipt.blockNumber);
    } catch (error) {
      // If error is not "already calculated", rethrow it
      if (
        !error.shortMessage?.includes(
          "Payouts already calculated for this game"
        )
      ) {
        throw error;
      }
    }

    // Get and display payouts regardless of whether we just calculated them or they existed
    console.log(chalk.yellow("\nFetching payout information..."));
    const payouts = await getGamePayouts(
      publicClient,
      config.contractAddress,
      gameNumber
    );
    await displayPayouts(gameNumber, payouts);
  } catch (error) {
    if (
      error.shortMessage?.includes("VDF proof not yet validated for this game")
    ) {
      console.log(
        chalk.yellow(
          "Game still in progress. You can only calculate payouts once the VDF proof has been submitted."
        )
      );
    } else {
      console.error(chalk.red("\nError:"), error.shortMessage || error.message);
      process.exit(1);
    }
  }
}

export default {
  command: "calculate-payouts",
  describe: "Calculate payouts for a specific game",
  handler: calculatePayoutsHandler,
};
