import inquirer from "inquirer";
import chalk from "chalk";
import { formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getUserGameWinnings } from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";

/**
 * Error messages that require special handling
 */
const ERROR_MESSAGES = {
  GAME_NOT_COMPLETE: "Game draw not completed yet",
};

/**
 * Validation patterns and messages
 */
const VALIDATION = {
  ETHEREUM_ADDRESS: {
    PATTERN: /^0x[a-fA-F0-9]{40}$/,
    MESSAGE: "Please enter a valid Ethereum address",
  },
  GAME_NUMBER: {
    MESSAGE: "Please enter a valid game number",
  },
};

/**
 * Messages for different win scenarios
 */
const WIN_MESSAGES = {
  CONGRATULATIONS: "Congratulations, you won!",
  NO_WIN: "Sorry, you didn't win in this game. Better luck next time!",
  CLAIM_REMINDER: "Don't forget to claim your prize!",
};

/**
 * Handles the process of checking if a user won in a specific game.
 */
async function didIWinHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    // Get game number and wallet address
    const { gameNumber, walletAddress } = await promptForGameInfo(config);

    // Check winnings and display results
    await checkAndDisplayWinnings(
      publicClient,
      config.contractAddress,
      gameNumber,
      walletAddress
    );
  } catch (error) {
    handleWinCheckError(error);
  }
}

/**
 * Prompts the user for game number and wallet address
 * @param {Object} config - The configuration object
 * @returns {Promise<Object>} Object containing game number and wallet address
 */
async function promptForGameInfo(config) {
  return await inquirer.prompt([
    {
      type: "number",
      name: "gameNumber",
      message: "Enter the game number you want to check:",
      validate: (input) => input > 0 || VALIDATION.GAME_NUMBER.MESSAGE,
    },
    {
      type: "input",
      name: "walletAddress",
      message: "Enter wallet address:",
      default: async () => getDefaultWalletAddress(config),
      validate: (input) =>
        VALIDATION.ETHEREUM_ADDRESS.PATTERN.test(input) ||
        VALIDATION.ETHEREUM_ADDRESS.MESSAGE,
    },
  ]);
}

/**
 * Gets the default wallet address from the configuration
 * @param {Object} config - The configuration object
 * @returns {string} The default wallet address or empty string
 */
function getDefaultWalletAddress(config) {
  return config.privateKey
    ? privateKeyToAccount(config.privateKey).address
    : "";
}

/**
 * Checks and displays winning information for a specific game and wallet
 * @param {PublicClient} publicClient - The public client instance
 * @param {string} contractAddress - The lottery contract address
 * @param {number} gameNumber - The game number to check
 * @param {string} walletAddress - The wallet address to check
 */
async function checkAndDisplayWinnings(
  publicClient,
  contractAddress,
  gameNumber,
  walletAddress
) {
  const winningInfo = await getUserGameWinnings(
    publicClient,
    contractAddress,
    gameNumber,
    walletAddress
  );

  if (hasWon(winningInfo)) {
    displayWinningInfo(winningInfo);
  } else {
    console.log(chalk.yellow(`\n${WIN_MESSAGES.NO_WIN}`));
  }
}

/**
 * Checks if the user has won any prize
 * @param {Object} winningInfo - The winning information object
 * @returns {boolean} Whether the user has won any prize
 */
function hasWon(winningInfo) {
  return winningInfo.goldWin || winningInfo.silverWin || winningInfo.bronzeWin;
}

/**
 * Displays winning information including prize details
 * @param {Object} winningInfo - The winning information object
 */
function displayWinningInfo(winningInfo) {
  console.log(chalk.green(`\n${WIN_MESSAGES.CONGRATULATIONS}`));
  console.log(chalk.cyan("Jackpot:"), winningInfo.goldWin ? "Yes" : "No");
  console.log(chalk.cyan("3 in-a-row:"), winningInfo.silverWin ? "Yes" : "No");
  console.log(chalk.cyan("2 in-a-row:"), winningInfo.bronzeWin ? "Yes" : "No");
  console.log(
    chalk.cyan("Total Prize:"),
    formatEther(winningInfo.totalPrize),
    "ETH"
  );
  console.log(chalk.cyan("Claimed:"), winningInfo.claimed ? "Yes" : "No");

  if (!winningInfo.claimed) {
    console.log(chalk.green(`\n${WIN_MESSAGES.CLAIM_REMINDER}`));
  }
}

/**
 * Handles errors that occur during the win checking process
 * @param {Error} error - The error to handle
 */
function handleWinCheckError(error) {
  if (error.message.includes(ERROR_MESSAGES.GAME_NOT_COMPLETE)) {
    console.log(chalk.yellow("\nGame is not completed yet."));
  } else {
    console.error(chalk.red("\nError:"), error.shortMessage || error.message);
    console.error(
      chalk.red(
        "\nMake sure your settings are correct.\nRun 'config' to view them and 'setup' to reset them."
      )
    );
    process.exit(1);
  }
}

export default {
  command: "did-i-win",
  describe: "Check if you won",
  handler: didIWinHandler,
};
