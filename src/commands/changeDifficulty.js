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
    console.log(chalk.green("\nDifficulty change initiated successfully!"));
    console.log(chalk.cyan("Transaction Hash:"), txHash);
    console.log(
      chalk.yellow(
        "Note: The difficulty change will take effect in a future game."
      )
    );
  } catch (error) {
    console.error(chalk.red("Error changing difficulty:"), error);
  }
}

export default {
  command: "change-difficulty",
  describe: "Initiate a change in game difficulty",
  handler: changeDifficultyHandler,
};
