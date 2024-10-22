import chalk from "chalk";

import { changeDifficulty } from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";

async function changeDifficultyHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    const txHash = await changeDifficulty(
      walletClient,
      publicClient,
      config.contractAddress
    );
    console.log(chalk.cyan("Transaction Hash:"), txHash);
    console.log(
      chalk.yellow(
        "Note: If the conditions for a difficulty change are met, the change will take effect in the next game."
      )
    );
    console.log(chalk.green("\nDifficulty change initiated successfully!"));
  } catch (error) {
    if (
      error.shortMessage?.includes("Not enough games played") ||
      error.shortMessage?.includes("Too soon to change difficulty")
    ) {
      console.log(
        chalk.yellow(
          "Cannot change difficulty yet. Not enough games played or too soon since last change."
        )
      );
    } else {
      console.error(chalk.red("\nError:"), error.shortMessage || error.message);
      process.exit(1);
    }
  }
}

export default {
  command: "change-difficulty",
  describe: "Change the difficulty of the game",
  handler: changeDifficultyHandler,
};
