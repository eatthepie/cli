import inquirer from "inquirer";
import chalk from "chalk";
import { privateKeyToAccount } from "viem/accounts";

import { getTicketHistory } from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";

/**
 * Validation patterns and messages
 */
const VALIDATION = {
  GAME_NUMBER: {
    MESSAGE: "Please enter a valid game number",
  },
  ETHEREUM_ADDRESS: {
    PATTERN: /^0x[a-fA-F0-9]{40}$/,
    MESSAGE: "Please enter a valid Ethereum address",
  },
};

/**
 * Display messages
 */
const MESSAGES = {
  NO_TICKETS: "No tickets found.",
  TICKETS_HEADER: "Tickets:",
  TOTAL_TICKETS: "Total Tickets:",
};

/**
 * Prompt messages
 */
const PROMPT_MESSAGES = {
  GAME_NUMBER: "Enter the game number:",
  WALLET_ADDRESS: "Enter wallet address:",
};

/**
 * Handles displaying ticket history for a specific game and wallet
 */
async function ticketHistoryHandler() {
  try {
    // Initialize client and configuration
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    // Get user input
    const { gameNumber, walletAddress } = await promptForInput(config);

    // Fetch and display ticket history
    await fetchAndDisplayHistory(
      publicClient,
      config.contractAddress,
      gameNumber,
      walletAddress
    );
  } catch (error) {
    handleError(error);
  }
}

/**
 * Prompts user for game number and wallet address
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Object containing game number and wallet address
 */
async function promptForInput(config) {
  return await inquirer.prompt([
    {
      type: "number",
      name: "gameNumber",
      message: PROMPT_MESSAGES.GAME_NUMBER,
      validate: (input) => input > 0 || VALIDATION.GAME_NUMBER.MESSAGE,
    },
    {
      type: "input",
      name: "walletAddress",
      message: PROMPT_MESSAGES.WALLET_ADDRESS,
      default: async () => getDefaultWalletAddress(config),
      validate: (input) =>
        VALIDATION.ETHEREUM_ADDRESS.PATTERN.test(input) ||
        VALIDATION.ETHEREUM_ADDRESS.MESSAGE,
    },
  ]);
}

/**
 * Gets the default wallet address from configuration
 * @param {Object} config - Configuration object
 * @returns {string} Default wallet address or empty string
 */
function getDefaultWalletAddress(config) {
  return config.privateKey
    ? privateKeyToAccount(config.privateKey).address
    : "";
}

/**
 * Fetches and displays ticket history
 * @param {PublicClient} publicClient - The public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game number
 * @param {string} walletAddress - Wallet address
 */
async function fetchAndDisplayHistory(
  publicClient,
  contractAddress,
  gameNumber,
  walletAddress
) {
  const events = await getTicketHistory(
    publicClient,
    contractAddress,
    gameNumber,
    walletAddress
  );

  if (events.length === 0) {
    displayNoTicketsMessage();
  } else {
    displayTickets(events);
  }
}

/**
 * Displays message when no tickets are found
 */
function displayNoTicketsMessage() {
  console.log(chalk.yellow(`\n${MESSAGES.NO_TICKETS}`));
}

/**
 * Displays ticket information
 * @param {Array} events - Array of ticket events
 */
function displayTickets(events) {
  console.log(chalk.yellow(`\n${MESSAGES.TICKETS_HEADER}`));

  events.forEach((event, index) => {
    displayTicket(event, index);
  });

  displayTicketCount(events.length);
}

/**
 * Displays individual ticket information
 * @param {Object} event - Ticket event object
 * @param {number} index - Ticket index
 */
function displayTicket(event, index) {
  const numbers = event.args.numbers.map((n) => Number(n));
  const etherball = Number(event.args.etherball);

  console.log(
    chalk.cyan(`Ticket ${index + 1}:`),
    `${numbers[0]}, ${numbers[1]}, ${numbers[2]}, ${etherball}`
  );
}

/**
 * Displays total ticket count
 * @param {number} count - Total number of tickets
 */
function displayTicketCount(count) {
  console.log(chalk.yellow(`\n${MESSAGES.TOTAL_TICKETS}`), count);
}

/**
 * Handles errors during ticket history display
 * @param {Error} error - Error object
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
  command: "ticket-history",
  describe: "Get ticket history",
  handler: ticketHistoryHandler,
};
