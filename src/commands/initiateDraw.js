import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createWalletClient } from "../utils/ethereum.js";
import { initiateDraw } from "../services/gameService.js";

async function initiateDrawHandler() {
  try {
    const config = await loadConfig();
    const walletClient = createWalletClient(config);

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message:
          "Are you sure you want to initiate the draw for the current game?",
        default: false,
      },
    ]);

    if (confirm) {
      const txHash = await initiateDraw(walletClient, config.contractAddress);
      console.log(chalk.green("\nDraw initiated successfully!"));
      console.log(chalk.cyan("Transaction Hash:"), txHash);
    } else {
      console.log(chalk.yellow("\nDraw initiation cancelled."));
    }
  } catch (error) {
    console.error(chalk.red("Error initiating draw:"), error);
  }
}

export default {
  command: "initiate-draw",
  describe: "Initiate the draw for the current game",
  handler: initiateDrawHandler,
};
