import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createWalletClient } from "../utils/ethereum.js";
import { changeDifficulty } from "../services/gameService.js";

async function changeDifficultyHandler() {
  try {
    const config = await loadConfig();
    const walletClient = createWalletClient(config);

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to change the game difficulty?",
        default: false,
      },
    ]);

    if (confirm) {
      const txHash = await changeDifficulty(
        walletClient,
        config.contractAddress
      );
      console.log(chalk.green("\nDifficulty change initiated successfully!"));
      console.log(chalk.cyan("Transaction Hash:"), txHash);
      console.log(
        chalk.yellow(
          "Note: The difficulty change will take effect in a future game."
        )
      );
    } else {
      console.log(chalk.yellow("\nDifficulty change cancelled."));
    }
  } catch (error) {
    console.error(chalk.red("Error changing difficulty:"), error);
  }
}

export default {
  command: "change-difficulty",
  describe: "Initiate a change in game difficulty",
  handler: changeDifficultyHandler,
};
