import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getCurrentGameInfo } from "../services/gameService.js";
import { formatTimeUntilDraw, formatDifficulty } from "../utils/display.js";
import { formatEther } from "viem";

/**
 * Status field labels
 */
const STATUS_LABELS = {
  GAME_ROUND: "Current Game Round",
  DIFFICULTY: "Difficulty",
  PRIZE_POOL: "Prize Pool",
  NEXT_DRAW: "Next Possible Draw Time",
  TIME_UNTIL_DRAW: "Time Until Draw",
};

/**
 * Currency units
 */
const CURRENCY = {
  ETH: "ETH",
};

/**
 * Time conversion constants
 */
const TIME = {
  MILLISECONDS_PER_SECOND: 1000,
};

/**
 * Handles displaying the current game status information
 */
async function infoHandler() {
  try {
    // Initialize client and get game info
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const gameInfo = await getCurrentGameInfo(
      publicClient,
      config.contractAddress
    );

    // Display status information
    displayGameStatus(gameInfo);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Displays the complete game status information
 * @param {Object} gameInfo - The current game information
 */
function displayGameStatus(gameInfo) {
  console.log(chalk.cyan("Status:"));
  displayStatusFields(gameInfo);
}

/**
 * Displays individual status fields with formatting
 * @param {Object} gameInfo - The game information object
 */
function displayStatusFields(gameInfo) {
  const fields = [
    {
      label: STATUS_LABELS.GAME_ROUND,
      value: gameInfo.gameNumber.toString(),
    },
    {
      label: STATUS_LABELS.DIFFICULTY,
      value: formatDifficulty(gameInfo.difficulty),
    },
    {
      label: STATUS_LABELS.PRIZE_POOL,
      value: `${formatEther(gameInfo.prizePool)} ${CURRENCY.ETH}`,
    },
    {
      label: STATUS_LABELS.NEXT_DRAW,
      value: formatDrawTime(gameInfo.drawTime),
    },
    {
      label: STATUS_LABELS.TIME_UNTIL_DRAW,
      value: formatTimeUntilDraw(Number(gameInfo.timeUntilDraw)),
    },
  ];

  fields.forEach(({ label, value }) => {
    displayStatusField(label, value);
  });
}

/**
 * Displays a single status field with consistent formatting
 * @param {string} label - The field label
 * @param {string} value - The field value
 */
function displayStatusField(label, value) {
  console.log(chalk.yellow(label + ":"), value);
}

/**
 * Formats the draw time into a localized string
 * @param {bigint} drawTime - The draw time in seconds
 * @returns {string} Formatted date and time string
 */
function formatDrawTime(drawTime) {
  return new Date(
    Number(drawTime) * TIME.MILLISECONDS_PER_SECOND
  ).toLocaleString();
}

/**
 * Handles errors that occur during status display
 * @param {Error} error - The error to handle
 */
function handleError(error) {
  console.error(chalk.red("\nError:"), error.shortMessage || error.message);
  console.error(
    chalk.red(
      "\nMake sure your settings are correct.\nRun 'config' to view them and 'setup' to reset them."
    )
  );
  process.exit(1);
}

export default {
  command: "status",
  describe: "Get the status of the current game",
  handler: infoHandler,
};
