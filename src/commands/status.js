import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getCurrentGameInfo } from "../services/gameService.js";
import { formatTimeUntilDraw, formatDifficulty } from "../utils/display.js";
import { formatEther } from "viem";

async function infoHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const gameInfo = await getCurrentGameInfo(
      publicClient,
      config.contractAddress
    );

    console.log(chalk.cyan("Status:"));
    console.log(
      chalk.yellow("Current Game Round:"),
      gameInfo.gameNumber.toString()
    );
    console.log(
      chalk.yellow("Difficulty:"),
      formatDifficulty(gameInfo.difficulty)
    );
    console.log(
      chalk.yellow("Prize Pool:"),
      formatEther(gameInfo.prizePool),
      "ETH"
    );
    console.log(
      chalk.yellow("Next Possible Draw Time:"),
      new Date(Number(gameInfo.drawTime) * 1000).toLocaleString()
    );
    console.log(
      chalk.yellow("Time Until Draw:"),
      formatTimeUntilDraw(Number(gameInfo.timeUntilDraw))
    );
  } catch (error) {
    console.error(chalk.red("\nError:"), error.shortMessage || error.message);
    process.exit(1);
  }
}

export default {
  command: "status",
  describe: "Get the current game status",
  handler: infoHandler,
};
