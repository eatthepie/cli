import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getDetailedGameInfo } from "../services/gameService.js";
import { formatDifficulty } from "../utils/display.js";
import { formatEther } from "viem";

/**
 * Game status mapping
 */
const GAME_STATUS = {
  0: "🎮 In Play",
  1: "🎲 Drawing",
  2: "✅ Completed",
};

/**
 * Prize tier labels
 */
const PRIZE_TIERS = ["🏆 Jackpot", "🥈 3 in-a-row", "🥉 2 in-a-row"];

/**
 * Validation messages
 */
const VALIDATION = {
  GAME_NUMBER: "⚠️ Please enter a valid game number",
};

/**
 * Display defaults
 */
const DISPLAY = {
  NOT_AVAILABLE: "❓",
};

/**
 * Error messages that require special handling
 */
const ERROR_MESSAGES = {
  GAME_NOT_STARTED: "Game ID exceeds current game",
};

/**
 * Error response messages
 */
const ERROR_RESPONSES = {
  GAME_NOT_STARTED:
    "⚠️ Game number you entered exceeds the current active game.",
};

/**
 * Handles displaying detailed information about a specific game
 */
async function gameInfoHandler() {
  try {
    console.log(chalk.cyan("\n🔍 Loading game information..."));

    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    // Get game number from user
    const gameNumber = await promptForGameNumber();
    // Get and display game information
    const gameInfo = await getDetailedGameInfo(
      publicClient,
      config.contractAddress,
      gameNumber
    );

    displayGameInformation(gameNumber, gameInfo, config.network);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Prompts the user for a game number
 * @returns {Promise<number>} The selected game number
 */
async function promptForGameNumber() {
  const { gameNumber } = await inquirer.prompt([
    {
      type: "number",
      name: "gameNumber",
      message: "🎮 Enter the past game number you want to view:",
      validate: (input) => input > 0 || VALIDATION.GAME_NUMBER,
    },
  ]);
  return gameNumber;
}

/**
 * Displays all game information
 * @param {number} gameNumber - The game number
 * @param {Object} gameInfo - The detailed game information
 * @param {string} network - The network name
 */
function displayGameInformation(gameNumber, gameInfo, network) {
  const status = GAME_STATUS[Number(gameInfo.status)];
  const isVdfSubmitted = gameInfo.winningNumbers[0] !== 0n;

  console.log(chalk.yellow(`\n🎲 Game ${gameNumber} Information:`));

  // Display basic game info
  displayBasicInfo(gameInfo, status, network);

  // Display block information
  displayBlockInfo(gameInfo, status);

  // Display winning information
  displayWinningInfo(gameInfo, status, isVdfSubmitted, network);
}

/**
 * Displays basic game information
 * @param {Object} gameInfo - The game information
 * @param {string} status - The game status
 * @param {string} network - The network name
 */
function displayBasicInfo(gameInfo, status, network) {
  console.log(chalk.cyan("📊 Status:"), status);
  console.log(
    chalk.cyan("💰 Prize Pool:"),
    formatEther(gameInfo.prizePool),
    network === "worldchain" ? "WLD" : "ETH"
  );
  console.log(
    chalk.cyan("🎯 Difficulty:"),
    formatDifficulty(gameInfo.difficulty)
  );
}

/**
 * Displays block-related information
 * @param {Object} gameInfo - The game information
 * @param {string} status - The game status
 */
function displayBlockInfo(gameInfo, status) {
  const isInPlay = status === "🎮 In Play";

  console.log(
    chalk.cyan("📡 Draw Initiated Block:"),
    isInPlay ? DISPLAY.NOT_AVAILABLE : gameInfo.drawInitiatedBlock.toString()
  );
  console.log(
    chalk.cyan("🔄 RANDAO Block:"),
    isInPlay ? DISPLAY.NOT_AVAILABLE : gameInfo.randaoBlock.toString()
  );
  console.log(
    chalk.cyan("🎲 RANDAO Value:"),
    isInPlay || !gameInfo.randaoValue
      ? DISPLAY.NOT_AVAILABLE
      : gameInfo.randaoValue.toString()
  );
}

/**
 * Displays winning-related information
 * @param {Object} gameInfo - The game information
 * @param {string} status - The game status
 * @param {boolean} isVdfSubmitted - Whether VDF has been submitted
 * @param {string} network - The network name
 */
function displayWinningInfo(gameInfo, status, isVdfSubmitted, network) {
  console.log(
    chalk.cyan("🎯 Winning Numbers:"),
    isVdfSubmitted ? gameInfo.winningNumbers.join(", ") : DISPLAY.NOT_AVAILABLE
  );
  console.log(
    chalk.cyan("👥 Number of Winners:"),
    isVdfSubmitted
      ? `${gameInfo.numberOfWinners.toString()} (🏆: ${
          gameInfo.goldWinners
        }, 🥈: ${gameInfo.silverWinners}, 🥉: ${gameInfo.bronzeWinners})`
      : DISPLAY.NOT_AVAILABLE
  );

  displayPayouts(gameInfo, status, network);
}

/**
 * Formats and displays payout information
 * @param {Object} gameInfo - The game information
 * @param {string} status - The game status
 * @param {string} network - The network name
 */
function displayPayouts(gameInfo, status, network) {
  console.log(
    chalk.cyan("💸 Payouts:"),
    status === "✅ Completed"
      ? formatPayouts(gameInfo.payouts, network)
      : DISPLAY.NOT_AVAILABLE
  );
}

/**
 * Formats payout information into a readable string
 * @param {bigint[]} payouts - Array of payout amounts
 * @param {string} network - The network name
 * @returns {string} Formatted payout string
 */
function formatPayouts(payouts, network) {
  return payouts
    .map((payout, index) => {
      return `${PRIZE_TIERS[index]}: ${formatEther(payout)} ${
        network === "worldchain" ? "WLD" : "ETH"
      }`;
    })
    .join(", ");
}

/**
 * Handles errors that occur during the game info display
 * @param {Error} error - The error to handle
 */
function handleError(error) {
  if (error.message.includes(ERROR_MESSAGES.GAME_NOT_STARTED)) {
    console.log(chalk.yellow(ERROR_RESPONSES.GAME_NOT_STARTED));
  } else {
    console.error(
      chalk.red("\n❌ Error:"),
      error.shortMessage || error.message
    );
    console.error(
      chalk.red(
        "\n⚠️ Make sure your settings are correct.\n🔧 Run 'config' to view them and 'setup' to reset them."
      )
    );
    process.exit(1);
  }
}

export default {
  command: "game-info",
  describe: "🎲 Get game information",
  handler: gameInfoHandler,
};
