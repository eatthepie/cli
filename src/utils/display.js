/**
 * Display utility module for formatting and presenting game information
 */

import figlet from "figlet";
import chalk from "chalk";
import { convertWeiToEth } from "./helpers.js";

/**
 * Display the application banner
 */
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

/**
 * Format seconds into days, hours, and minutes
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTimeUntilDraw(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

/**
 * Convert difficulty number to text representation
 * @param {number} difficulty - Difficulty level (0-2)
 * @returns {string} Difficulty description
 */
export function formatDifficulty(difficulty) {
  const difficultyMap = ["Easy", "Medium", "Hard"];
  return difficultyMap[difficulty] || "Unknown";
}

/**
 * Display payout information for a game
 * @param {number} gameNumber - Game identifier
 * @param {Array<number>} payouts - Array of payout amounts in Wei
 */
export function displayPayouts(gameNumber, payouts) {
  const payoutsInEth = payouts.map(convertWeiToEth);
  const formatPayout = (payout) =>
    payout ? `${payout.toFixed(4)} ETH` : "no winners";

  console.log(chalk.yellow(`\nGame ${gameNumber} Payouts:`));
  console.log(
    chalk.cyan("Jackpot:    "),
    chalk.white(formatPayout(payoutsInEth[0]))
  );
  console.log(
    chalk.cyan("3 in-a-row: "),
    chalk.white(formatPayout(payoutsInEth[1]))
  );
  console.log(
    chalk.cyan("2 in-a-row: "),
    chalk.white(formatPayout(payoutsInEth[2]))
  );
}
