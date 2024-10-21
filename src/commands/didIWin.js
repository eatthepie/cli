import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getUserGameWinnings } from "../services/gameService.js";
import { formatEther } from "viem";

async function didIWinHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number you want to check:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const winningInfo = await getUserGameWinnings(
      publicClient,
      config.contractAddress,
      gameNumber,
      config.address
    );

    if (winningInfo.goldWin || winningInfo.silverWin || winningInfo.bronzeWin) {
      console.log(chalk.green("\nCongratulations! You won in this game!"));
      console.log(chalk.yellow("\nDetailed Winning Information:"));
      console.log(chalk.cyan("Gold Win:"), winningInfo.goldWin ? "Yes" : "No");
      console.log(
        chalk.cyan("Silver Win:"),
        winningInfo.silverWin ? "Yes" : "No"
      );
      console.log(
        chalk.cyan("Bronze Win:"),
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
    console.error(chalk.red("Error checking win status:"), error);
  }
}

export default {
  command: "did-i-win",
  describe: "Check if you won in a specific game",
  handler: didIWinHandler,
};
