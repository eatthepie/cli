import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createWalletClient } from "../utils/ethereum.js";
import { calculatePayouts } from "../services/gameService.js";

async function calculatePayoutsHandler() {
  try {
    const config = await loadConfig();
    const walletClient = createWalletClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number to calculate payouts for:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to calculate payouts for game ${gameNumber}?`,
        default: false,
      },
    ]);

    if (confirm) {
      const txHash = await calculatePayouts(
        walletClient,
        config.contractAddress,
        gameNumber
      );
      console.log(chalk.green("\nPayouts calculated successfully!"));
      console.log(chalk.cyan("Transaction Hash:"), txHash);
    } else {
      console.log(chalk.yellow("\nPayout calculation cancelled."));
    }
  } catch (error) {
    console.error(chalk.red("Error calculating payouts:"), error);
  }
}

export default {
  command: "calculate-payouts",
  describe: "Calculate payouts for a specific game",
  handler: calculatePayoutsHandler,
};
