import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getDetailedGameInfo } from "../services/gameService.js";
import { formatDifficulty } from "../utils/display.js";
import { formatEther } from "viem";

async function pastGameHandler() {
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

    console.log(chalk.yellow(`\nGame ${gameNumber} Information:`));
    console.log(chalk.cyan("Status:"), gameInfo.status);
    console.log(
      chalk.cyan("Prize Pool:"),
      formatEther(gameInfo.prizePool),
      "ETH"
    );
    console.log(
      chalk.cyan("Number of Winners:"),
      gameInfo.numberOfWinners.toString()
    );
    console.log(
      chalk.cyan("Winning Numbers:"),
      gameInfo.winningNumbers.join(", ")
    );
    console.log(
      chalk.cyan("Difficulty:"),
      formatDifficulty(gameInfo.difficulty)
    );
    console.log(
      chalk.cyan("Draw Initiated Block:"),
      gameInfo.drawInitiatedBlock.toString()
    );
    console.log(chalk.cyan("RANDAO Block:"), gameInfo.randaoBlock.toString());
    console.log(chalk.cyan("RANDAO Value:"), gameInfo.randaoValue.toString());
    console.log(
      chalk.cyan("Payouts:"),
      gameInfo.payouts.map((payout) => `${formatEther(payout)} ETH`).join(", ")
    );
  } catch (error) {
    console.error(chalk.red("Error fetching past game info:"), error);
  }
}

export default {
  command: "past-game",
  describe: "Get information about a past game",
  handler: pastGameHandler,
};
