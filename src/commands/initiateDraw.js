import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import { initiateDraw } from "../services/gameService.js";

async function initiateDrawHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    const txHash = await initiateDraw(
      walletClient,
      publicClient,
      config.contractAddress
    );

    console.log(chalk.cyan("Transaction Hash:"), txHash);
    console.log(chalk.green("\nDraw initiated successfully!"));
  } catch (error) {
    if (
      error.shortMessage?.includes("Draw already initiated for current game")
    ) {
      console.log(chalk.yellow("Draw already initiated."));
    } else if (error.shortMessage?.includes("Time interval not passed")) {
      console.log(
        chalk.yellow("Cannot initiate draw, time interval not yet reached.")
      );
    } else if (error.shortMessage?.includes("Insufficient prize pool")) {
      console.log(
        chalk.yellow(
          "Cannot initiate draw, prize pool threshold not yet reached."
        )
      );
    } else {
      console.error(chalk.red("\nError:"), error.shortMessage || error.message);
      process.exit(1);
    }
  }
}

export default {
  command: "initiate-draw",
  describe: "Initiate the draw",
  handler: initiateDrawHandler,
};
