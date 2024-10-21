import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getCurrentGameInfo } from "../services/gameService.js";
import { formatDifficulty } from "../utils/display.js";

async function difficultyInfoHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    const gameInfo = await getCurrentGameInfo(
      publicClient,
      config.contractAddress
    );

    console.log(chalk.yellow("\nCurrent Difficulty Information:"));
    console.log(
      chalk.cyan("Current Difficulty:"),
      formatDifficulty(gameInfo.difficulty)
    );

    let maxNumber, maxEtherball;
    switch (gameInfo.difficulty) {
      case 0: // Easy
        maxNumber = 50;
        maxEtherball = 5;
        break;
      case 1: // Medium
        maxNumber = 100;
        maxEtherball = 10;
        break;
      case 2: // Hard
        maxNumber = 150;
        maxEtherball = 15;
        break;
    }

    console.log(chalk.cyan("Number Range:"), `1 to ${maxNumber}`);
    console.log(chalk.cyan("Etherball Range:"), `1 to ${maxEtherball}`);
    console.log(
      chalk.green("\nWhen buying tickets, choose numbers within these ranges.")
    );
  } catch (error) {
    console.error(chalk.red("Error fetching difficulty info:"), error);
  }
}

export default {
  command: "difficulty-info",
  describe: "Get information about the current difficulty",
  handler: difficultyInfoHandler,
};
