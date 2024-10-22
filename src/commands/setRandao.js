import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import { setRandao } from "../services/gameService.js";

async function setRandaoHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number to set the RANDAO value for:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const txHash = await setRandao(
      walletClient,
      publicClient,
      config.contractAddress,
      gameNumber
    );
    console.log(chalk.cyan("Transaction Hash:"), txHash);
    console.log(chalk.green("\nRANDAO value set successfully!"));
  } catch (error) {
    console.error(chalk.red("\nError:"), error.shortMessage || error.message);
    process.exit(1);
  }
}

export default {
  command: "set-randao",
  describe: "Set the RANDAO value for a specific game",
  handler: setRandaoHandler,
};
