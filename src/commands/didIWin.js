import inquirer from "inquirer";
import chalk from "chalk";
import { formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getUserGameWinnings } from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";

async function didIWinHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    const { gameNumber, walletAddress } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number you want to check:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
      {
        type: "input",
        name: "walletAddress",
        message: "Enter wallet address:",
        default: async () => {
          const account = config.privateKey
            ? privateKeyToAccount(config.privateKey).address
            : "";
          return account;
        },
        validate: (input) =>
          /^0x[a-fA-F0-9]{40}$/.test(input) ||
          "Please enter a valid Ethereum address",
      },
    ]);

    const winningInfo = await getUserGameWinnings(
      publicClient,
      config.contractAddress,
      gameNumber,
      walletAddress
    );

    if (winningInfo.goldWin || winningInfo.silverWin || winningInfo.bronzeWin) {
      console.log(chalk.green("\nCongratulations, you won!"));
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
      console.log(
        chalk.yellow(
          "\nSorry, you didn't win in this game. Better luck next time!"
        )
      );
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
  command: "did-i-win",
  describe: "Check if you won",
  handler: didIWinHandler,
};
