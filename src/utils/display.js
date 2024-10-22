import figlet from "figlet";
import chalk from "chalk";
import { convertWeiToEth } from "./helpers.js";

export function displayBanner() {
  console.log(
    chalk.yellow(
      figlet.textSync("EAT THE PIE", {
        font: "ANSI Shadow",
        horizontalLayout: "full",
      })
    )
  );
  console.log(chalk.cyan("♦♦♦ THE WORLD LOTTERY ON ETHEREUM ♦♦♦ \n"));
}

export function formatTimeUntilDraw(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export function formatDifficulty(difficulty) {
  const difficultyMap = ["Easy", "Medium", "Hard"];
  return difficultyMap[difficulty] || "Unknown";
}

export function displayPayouts(gameNumber, payouts) {
  const payoutsInEth = payouts.map(convertWeiToEth);

  console.log(chalk.yellow(`\nGame ${gameNumber} Payouts:`));
  console.log(
    chalk.cyan("Jackpot:"),
    chalk.white(
      payoutsInEth[0] ? `${payoutsInEth[0].toFixed(4)} ETH` : "no winners"
    )
  );
  console.log(
    chalk.cyan("3 in-a-row:"),
    chalk.white(
      payoutsInEth[1] ? `${payoutsInEth[1].toFixed(4)} ETH` : "no winners"
    )
  );
  console.log(
    chalk.cyan("2 in-a-row:"),
    chalk.white(
      payoutsInEth[2] ? `${payoutsInEth[2].toFixed(4)} ETH` : "no winners"
    )
  );
}
