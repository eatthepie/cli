import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import { setRandom } from "../services/gameService.js";

async function setRandomHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number to set the random value for:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const txHash = await setRandom(
      walletClient,
      publicClient,
      config.contractAddress,
      gameNumber
    );
    console.log(chalk.green("\nRandom value set successfully!"));
    console.log(chalk.cyan("Transaction Hash:"), txHash);
  } catch (error) {
    console.error(chalk.red("Error setting random value:"), error);
  }
}

export default {
  command: "set-random",
  describe: "Set the random value for a specific game",
  handler: setRandomHandler,
};
