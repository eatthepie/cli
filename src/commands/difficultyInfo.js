import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import {
  getCurrentGameInfo,
  getConsecutiveGamesInfo,
} from "../services/gameService.js";
import { formatDifficulty } from "../utils/display.js";

/**
 * Difficulty level configurations
 */
const DIFFICULTY_CONFIGS = {
  EASY: {
    LEVEL: 0,
    MAX_NUMBER: 25,
    MAX_ETHERBALL: 10,
  },
  MEDIUM: {
    LEVEL: 1,
    MAX_NUMBER: 50,
    MAX_ETHERBALL: 10,
  },
  HARD: {
    LEVEL: 2,
    MAX_NUMBER: 75,
    MAX_ETHERBALL: 10,
  },
};

/**
 * Display messages
 */
const MESSAGES = {
  INSTRUCTION: "📝 When buying tickets, choose numbers within these ranges.",
  CONSECUTIVE_THRESHOLD: 3,
};

/**
 * Handles displaying information about the current game difficulty
 * and the corresponding number ranges.
 */
async function difficultyInfoHandler() {
  try {
    console.log(chalk.cyan("\n🔍 Loading difficulty information..."));

    // Initialize client and get game info
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const gameInfo = await getCurrentGameInfo(
      publicClient,
      config.contractAddress
    );
    const consecutiveInfo = await getConsecutiveGamesInfo(
      publicClient,
      config.contractAddress
    );

    // Display difficulty information
    await displayDifficultyInfo(Number(gameInfo.difficulty), consecutiveInfo);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Displays the current difficulty and corresponding number ranges
 * @param {number} difficulty - The current difficulty level
 * @param {Object} consecutiveInfo - Info about consecutive wins/losses
 */
function displayDifficultyInfo(difficulty, consecutiveInfo) {
  console.log(
    chalk.cyan("🎯 Current Difficulty:"),
    formatDifficulty(difficulty)
  );

  const ranges = getDifficultyRanges(difficulty);
  displayRanges(ranges);

  displayConsecutiveInfo(difficulty, consecutiveInfo);

  console.log(chalk.green(`\n${MESSAGES.INSTRUCTION}`));
}

/**
 * Displays information about consecutive wins/losses and potential difficulty changes
 * @param {number} currentDifficulty - The current difficulty level
 * @param {Object} consecutiveInfo - Info about consecutive wins/losses
 */
function displayConsecutiveInfo(currentDifficulty, consecutiveInfo) {
  // Convert BigInt values to numbers
  const jackpotGames = Number(consecutiveInfo.consecutiveJackpotGames);
  const nonJackpotGames = Number(consecutiveInfo.consecutiveNonJackpotGames);

  console.log("\n" + chalk.cyan("📊 Consecutive Statistics:"));
  console.log(`🏆 Consecutive Games With Jackpot: ${jackpotGames}`);
  console.log(`💫 Consecutive Games Without Jackpot: ${nonJackpotGames}`);

  // Calculate remaining games needed for difficulty change
  const remainingForIncrease = MESSAGES.CONSECUTIVE_THRESHOLD - jackpotGames;
  const remainingForDecrease = MESSAGES.CONSECUTIVE_THRESHOLD - nonJackpotGames;

  // Display difficulty change potential
  console.log("\n" + chalk.yellow("⚖️ Difficulty Change Potential:"));

  if (jackpotGames > 0 && currentDifficulty < DIFFICULTY_CONFIGS.HARD.LEVEL) {
    console.log(
      `📈 ${remainingForIncrease} more consecutive jackpot${
        remainingForIncrease === 1 ? "" : "s"
      } needed to increase difficulty`
    );
  }

  if (
    nonJackpotGames > 0 &&
    currentDifficulty > DIFFICULTY_CONFIGS.EASY.LEVEL
  ) {
    console.log(
      `📉 ${remainingForDecrease} more game${
        remainingForDecrease === 1 ? "" : "s"
      } without jackpot needed to decrease difficulty`
    );
  }

  if (jackpotGames >= MESSAGES.CONSECUTIVE_THRESHOLD) {
    if (currentDifficulty < DIFFICULTY_CONFIGS.HARD.LEVEL) {
      console.log(chalk.green("🌟 Difficulty increase is now possible!"));
    } else {
      console.log(chalk.yellow("🔝 Maximum difficulty level reached"));
    }
  }

  if (nonJackpotGames >= MESSAGES.CONSECUTIVE_THRESHOLD) {
    if (currentDifficulty > DIFFICULTY_CONFIGS.EASY.LEVEL) {
      console.log(chalk.green("⭐ Difficulty decrease is now possible!"));
    } else {
      console.log(chalk.yellow("↩️ Minimum difficulty level reached"));
    }
  }
}

/**
 * Gets the number ranges for a given difficulty level
 * @param {number} difficulty - The difficulty level
 * @returns {Object} Object containing max number and max etherball values
 */
function getDifficultyRanges(difficulty) {
  let config;

  switch (difficulty) {
    case DIFFICULTY_CONFIGS.EASY.LEVEL:
      config = DIFFICULTY_CONFIGS.EASY;
      break;
    case DIFFICULTY_CONFIGS.MEDIUM.LEVEL:
      config = DIFFICULTY_CONFIGS.MEDIUM;
      break;
    case DIFFICULTY_CONFIGS.HARD.LEVEL:
      config = DIFFICULTY_CONFIGS.HARD;
      break;
    default:
      throw new Error(`Unknown difficulty level: ${difficulty}`);
  }

  return {
    maxNumber: config.MAX_NUMBER,
    maxEtherball: config.MAX_ETHERBALL,
  };
}

/**
 * Displays the number ranges for the current difficulty
 * @param {Object} ranges - Object containing max number and max etherball values
 */
function displayRanges(ranges) {
  console.log(chalk.cyan("🔢 Number Range:"), `1 to ${ranges.maxNumber}`);
  console.log(chalk.cyan("🌟 Etherball Range:"), `1 to ${ranges.maxEtherball}`);
}

/**
 * Handles errors that occur during the difficulty info display
 * @param {Error} error - The error to handle
 */
function handleError(error) {
  console.error(chalk.red("\n❌ Error:"), error.shortMessage || error.message);
  console.error(
    chalk.red(
      "\n⚠️ Make sure your settings are correct.\n🔧 Run 'config' to view them and 'setup' to reset them."
    )
  );
  process.exit(1);
}

export default {
  command: "difficulty-info",
  describe: "🎯 Get difficulty information",
  handler: difficultyInfoHandler,
};
