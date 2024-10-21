import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createWalletClient } from "../utils/ethereum.js";
import { claimPrize } from "../services/gameService.js";

async function claimPrizeHandler() {
  try {
    const config = await loadConfig();
    const walletClient = createWalletClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number for which you want to claim the prize:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to claim the prize?",
        default: false,
      },
    ]);

    if (confirm) {
      const txHash = await claimPrize(
        walletClient,
        config.contractAddress,
        gameNumber
      );
      console.log(chalk.green("\nPrize claimed successfully!"));
      console.log(chalk.cyan("Transaction Hash:"), txHash);
    } else {
      console.log(chalk.yellow("\nPrize claim cancelled."));
    }
  } catch (error) {
    console.error(chalk.red("Error claiming prize:"), error);
  }
}

export default {
  command: "claim-prize",
  describe: "Claim your prize for a specific game",
  handler: claimPrizeHandler,
};
