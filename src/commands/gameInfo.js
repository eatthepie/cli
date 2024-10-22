import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getDetailedGameInfo } from "../services/gameService.js";
import { formatDifficulty } from "../utils/display.js";
import { formatEther } from "viem";

// Enum mapping for GameStatus
const GameStatus = {
  0: "InPlay",
  1: "Drawing",
  2: "Completed",
};

async function gameInfoHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the past game number you want to view:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const gameInfo = await getDetailedGameInfo(
      publicClient,
      config.contractAddress,
      gameNumber
    );

    const status = GameStatus[Number(gameInfo.status)];
    const vdfSubmitted = gameInfo.winningNumbers[0] !== 0;

    console.log(chalk.yellow(`\nGame ${gameNumber} Information:`));
    console.log(chalk.cyan("Status:"), status);
    console.log(
      chalk.cyan("Prize Pool:"),
      formatEther(gameInfo.prizePool),
      "ETH"
    );
    console.log(
      chalk.cyan("Difficulty:"),
      formatDifficulty(gameInfo.difficulty)
    );
    console.log(
      chalk.cyan("Draw Initiated Block:"),
      status === "InPlay" ? "-" : gameInfo.drawInitiatedBlock.toString()
    );
    console.log(
      chalk.cyan("RANDAO Block:"),
      status === "InPlay" ? "-" : gameInfo.randaoBlock.toString()
    );
    console.log(
      chalk.cyan("RANDAO Value:"),
      status === "InPlay" || !gameInfo.randaoValue
        ? "-"
        : gameInfo.randaoValue.toString()
    );
    console.log(
      chalk.cyan("Number of Winners:"),
      vdfSubmitted ? gameInfo.numberOfWinners.toString() : "-"
    );
    console.log(
      chalk.cyan("Winning Numbers:"),
      vdfSubmitted ? gameInfo.winningNumbers.join(", ") : "-"
    );
    console.log(
      chalk.cyan("Payouts:"),
      status === "Completed"
        ? gameInfo.payouts
            .map((payout) => `${formatEther(payout)} ETH`)
            .join(", ")
        : "-"
    );
  } catch (error) {
    console.error(chalk.red("\nError:"), error.shortMessage || error.message);
    process.exit(1);
  }
}

export default {
  command: "game-info",
  describe: "Get game information",
  handler: gameInfoHandler,
};
