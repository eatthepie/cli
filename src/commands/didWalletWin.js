import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getUserGameWinnings } from "../services/gameService.js";
import { formatEther } from "viem";

async function didWalletWinHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    const { walletAddress, gameNumber } = await inquirer.prompt([
      {
        type: "input",
        name: "walletAddress",
        message: "Enter the wallet address:",
        validate: (input) =>
          /^0x[a-fA-F0-9]{40}$/.test(input) ||
          "Please enter a valid Ethereum address",
      },
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const winningInfo = await getUserGameWinnings(
      publicClient,
      config.contractAddress,
      gameNumber,
      walletAddress
    );

    if (winningInfo.goldWin || winningInfo.silverWin || winningInfo.bronzeWin) {
      console.log(chalk.green(`\n${walletAddress} won!`));
      console.log(chalk.cyan("Jackpot:"), winningInfo.goldWin ? "Yes" : "No");
      console.log(
        chalk.cyan("3 in-a-row:"),
        winningInfo.silverWin ? "Yes" : "No"
      );
      console.log(
        chalk.cyan("2 in-a-row:"),
        winningInfo.bronzeWin ? "Yes" : "No"
      );
      console.log(
        chalk.cyan("Total Prize:"),
        formatEther(winningInfo.totalPrize),
        "ETH"
      );
      console.log(chalk.cyan("Claimed:"), winningInfo.claimed ? "Yes" : "No");

      if (!winningInfo.claimed) {
        console.log(chalk.green("\nDon't forget to claim your prize!"));
      }
    } else {
      console.log(chalk.yellow(`\${walletAddress} didn't win in this game.`));
    }
  } catch (error) {
    if (error.shortMessage?.includes("Game draw not completed yet")) {
      console.log(chalk.yellow("\nGame is not completed yet."));
    } else {
      console.error(chalk.red("\nError:"), error.shortMessage || error.message);
      process.exit(1);
    }
  }
}

export default {
  command: "did-wallet-win",
  describe: "Check if a wallet won",
  handler: didWalletWinHandler,
};
