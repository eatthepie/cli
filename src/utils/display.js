import figlet from "figlet";
import chalk from "chalk";

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
