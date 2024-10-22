import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";

async function displayConfig() {
  try {
    const config = await loadConfig();

    console.log(chalk.yellow("\nCurrent Configuration:"));
    console.log(chalk.cyan("Network:"), config.network);
    console.log(chalk.cyan("Contract Address:"), config.contractAddress);
    console.log(chalk.cyan("RPC URL:"), config.rpcUrl);

    // Show private key in a masked format for security
    const maskedKey = config.privateKey
      ? `${config.privateKey.slice(0, 6)}...${config.privateKey.slice(-4)}`
      : "Not set";
    console.log(chalk.cyan("Private Key:"), maskedKey);

    // Ask if user wants to view full private key
    const { showFullKey } = await inquirer.prompt([
      {
        type: "confirm",
        name: "showFullKey",
        message: "Would you like to view the full private key?",
        default: false,
      },
    ]);

    if (showFullKey) {
      console.log(chalk.cyan("\nFull Private Key:"), config.privateKey);
      console.log(
        chalk.yellow("\nWarning: Never share your private key with anyone!")
      );
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        chalk.red("No configuration found. Please run 'setup' first.")
      );
    } else {
      console.error(chalk.red("Error reading configuration:"), error);
    }
  }
}

export default {
  command: "config",
  describe: "Display current configuration",
  handler: displayConfig,
};
