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

    const txHash = await claimPrize(
      walletClient,
      config.contractAddress,
      gameNumber
    );
    console.log(chalk.green("\nPrize claimed successfully!"));
    console.log(chalk.cyan("Transaction Hash:"), txHash);
  } catch (error) {
    if (error.message?.includes("Game draw not completed yet")) {
      console.log(chalk.yellow("\nGame draw not completed yet."));
    } else if (error.message?.includes("Prize already claimed")) {
      console.log(chalk.yellow("\nPrize already claimed for this game."));
    } else if (error.shortMessage?.includes("No prize to claim")) {
      console.log(chalk.yellow("\nNo prize to claim for this game."));
    } else {
      console.error(chalk.red("\nError:"), error.shortMessage || error.message);
      process.exit(1);
    }
  }
}

export default {
  command: "claim-prize",
  describe: "Claim your prize",
  handler: claimPrizeHandler,
};
