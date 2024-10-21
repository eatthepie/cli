import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getUserGameWinnings } from "../services/gameService.js";
import { formatEther } from "viem";

async function userWinningInfoHandler() {
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

    console.log(chalk.yellow(`\nWinning Information for Game ${gameNumber}:`));
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
  } catch (error) {
    console.error(chalk.red("Error fetching user winning info:"), error);
  }
}

export default {
  command: "user-winning-info",
  describe: "Get winning information for a user in a specific game",
  handler: userWinningInfoHandler,
};
