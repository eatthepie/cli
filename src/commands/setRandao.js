import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import { setRandao } from "../services/gameService.js";

/**
 * Error messages that require special handling
 */
const ERROR_MESSAGES = {
  BUFFER_PERIOD: "Buffer period not yet passed",
};

/**
 * Error response messages
 */
const ERROR_RESPONSES = {
  BUFFER_PERIOD: "Buffer period (128 blocks) not yet passed.",
};

/**
 * Success messages
 */
const SUCCESS_MESSAGES = {
  RANDAO_SET: "RANDAO value set successfully!",
};

/**
 * Validation messages
 */
const VALIDATION = {
  GAME_NUMBER: "Please enter a valid game number",
};

/**
 * Prompt messages
 */
const PROMPT_MESSAGES = {
  GAME_NUMBER: "Enter the game number to set the RANDAO value for:",
};

/**
 * Handles the process of setting the RANDAO value for a specific game.
 */
async function setRandaoHandler() {
  try {
    // Initialize clients and configuration
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    // Get game number from user
    const gameNumber = await promptForGameNumber();

    // Process RANDAO value setting
    await processSetRandao(
      walletClient,
      publicClient,
      config.contractAddress,
      gameNumber
    );
  } catch (error) {
    handleSetRandaoError(error);
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
      message: PROMPT_MESSAGES.GAME_NUMBER,
      validate: (input) => input > 0 || VALIDATION.GAME_NUMBER,
    },
  ]);
  return gameNumber;
}

/**
 * Processes the RANDAO value setting transaction and displays results
 * @param {WalletClient} walletClient - The wallet client instance
 * @param {PublicClient} publicClient - The public client instance
 * @param {string} contractAddress - The lottery contract address
 * @param {number} gameNumber - The game number to set RANDAO for
 */
async function processSetRandao(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber
) {
  const txHash = await setRandao(
    walletClient,
    publicClient,
    contractAddress,
    gameNumber
  );

  displaySuccessMessages(txHash);
}

/**
 * Displays success messages after setting RANDAO value
 * @param {string} txHash - The transaction hash
 */
function displaySuccessMessages(txHash) {
  console.log(chalk.yellow("\nTransaction Hash:"), txHash);
  console.log(chalk.green(`${SUCCESS_MESSAGES.RANDAO_SET}`));
}

/**
 * Handles errors that occur during the RANDAO value setting process
 * @param {Error} error - The error to handle
 */
function handleSetRandaoError(error) {
  if (error.message.includes(ERROR_MESSAGES.BUFFER_PERIOD)) {
    console.log(chalk.yellow(ERROR_RESPONSES.BUFFER_PERIOD));
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
  command: "set-randao",
  describe: "Set the RANDAO value",
  handler: setRandaoHandler,
};
