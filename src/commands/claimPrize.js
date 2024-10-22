import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import { claimPrize } from "../services/gameService.js";

async function claimPrizeHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number for which you want to claim the prize:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const txHash = await claimPrize(
      walletClient,
      publicClient,
      config.contractAddress,
      gameNumber
    );
    console.log(chalk.green("\nPrize claimed successfully!"));
    console.log(chalk.cyan("Transaction Hash:"), txHash);
  } catch (error) {
    if (error.shortMessage?.includes("No prize to claim")) {
      console.log(chalk.yellow("\nNo prize to claim for this game."));
    } else {
      console.error(
        chalk.red("\nError claiming prize:"),
        error.shortMessage || error.message
      );
      process.exit(1);
    }
  }
}

export default {
  command: "claim-prize",
  describe: "Claim your prize for a specific game",
  handler: claimPrizeHandler,
};
