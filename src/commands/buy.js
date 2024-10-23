import chalk from "chalk";
import inquirer from "inquirer";
import { formatEther } from "viem";

import {
  buyTickets,
  getTicketPrice,
  getCurrentGameInfo,
} from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import { generateRandomTicket, getDifficultyLimits } from "../utils/helpers.js";
import { formatDifficulty } from "../utils/display.js";

/**
 * Handles the ticket buying process for the lottery game.
 * This includes fetching game info, getting user input for tickets,
 * and executing the purchase transaction.
 */
async function buyHandler() {
  try {
    // Initialize clients and load configuration
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    // Fetch current game state
    const ticketPrice = await getTicketPrice(
      publicClient,
      config.contractAddress
    );
    const gameInfo = await getCurrentGameInfo(
      publicClient,
      config.contractAddress
    );
    const limits = getDifficultyLimits(gameInfo.difficulty);

    // Display current game information
    displayGameInfo(ticketPrice, gameInfo.difficulty, limits);

    // Get ticket count from user
    const ticketCount = await getTicketCount();

    // Get ticket numbers (manual or auto-generated)
    const tickets = await getTicketNumbers(ticketCount, limits);

    // Calculate and display purchase summary
    const totalPrice = ticketPrice * BigInt(ticketCount);
    displayPurchaseSummary(tickets, totalPrice);

    // Confirm and process purchase
    await confirmAndProcessPurchase(
      tickets,
      totalPrice,
      walletClient,
      publicClient,
      config.contractAddress
    );
  } catch (error) {
    console.error(chalk.red("\nError:"), error.shortMessage || error.message);
    process.exit(1);
  }
}

/**
 * Displays current game information including ticket price and difficulty
 */
function displayGameInfo(ticketPrice, difficulty, limits) {
  console.log(
    chalk.cyan(`Current ticket price: ${formatEther(ticketPrice)} ETH`)
  );
  console.log(
    chalk.cyan(`Current difficulty: ${formatDifficulty(difficulty)}`)
  );
  console.log(
    chalk.cyan(
      `Valid number range: 1-${limits.max}, Etherball: 1-${limits.etherballMax}`
    )
  );
}

/**
 * Prompts user for the number of tickets they want to buy
 * @returns {Promise<number>} Number of tickets to purchase
 */
async function getTicketCount() {
  const { ticketCount } = await inquirer.prompt([
    {
      type: "number",
      name: "ticketCount",
      message: "How many tickets do you want to buy? (1-100)",
      validate: (input) => input >= 1 && input <= 100,
    },
  ]);
  return ticketCount;
}

/**
 * Gets ticket numbers either through manual input or auto-generation
 * @param {number} ticketCount - Number of tickets to generate/input
 * @param {Object} limits - Number range limits based on difficulty
 * @returns {Promise<number[][]>} Array of ticket numbers
 */
async function getTicketNumbers(ticketCount, limits) {
  const { choiceMethod } = await inquirer.prompt([
    {
      type: "list",
      name: "choiceMethod",
      message: "Do you want to provide your own numbers or auto-generate?",
      choices: ["Provide own", "Auto-generate"],
    },
  ]);

  if (choiceMethod === "Provide own") {
    return await getManualTickets(ticketCount, limits);
  }
  return Array(ticketCount)
    .fill()
    .map(() => generateRandomTicket(limits));
}

/**
 * Prompts user for manual input of ticket numbers
 * @param {number} ticketCount - Number of tickets to input
 * @param {Object} limits - Number range limits
 * @returns {Promise<number[][]>} Array of ticket numbers
 */
async function getManualTickets(ticketCount, limits) {
  const tickets = [];
  for (let i = 0; i < ticketCount; i++) {
    const { numbers } = await inquirer.prompt([
      {
        type: "input",
        name: "numbers",
        message: `Enter 4 numbers for ticket ${
          i + 1
        } (comma-separated, last is Etherball):`,
        validate: (input) => validateTicketNumbers(input, limits),
      },
    ]);
    tickets.push(numbers.split(",").map(Number));
  }
  return tickets;
}

/**
 * Validates user-input ticket numbers
 * @param {string} input - Comma-separated numbers
 * @param {Object} limits - Number range limits
 * @returns {boolean} Whether the input is valid
 */
function validateTicketNumbers(input, limits) {
  const nums = input.split(",").map(Number);
  return (
    nums.length === 4 &&
    nums.slice(0, 3).every((n) => n >= 1 && n <= limits.max) &&
    nums[3] >= 1 &&
    nums[3] <= limits.etherballMax
  );
}

/**
 * Displays purchase summary including all tickets and total cost
 */
function displayPurchaseSummary(tickets, totalPrice) {
  console.log(chalk.cyan("Tickets to purchase:"));
  tickets.forEach((ticket, index) => {
    console.log(chalk.yellow(`Ticket ${index + 1}:`), ticket.join(", "));
  });
  console.log(chalk.cyan(`Total cost: ${formatEther(totalPrice)} ETH`));
}

/**
 * Confirms purchase with user and processes the transaction
 */
async function confirmAndProcessPurchase(
  tickets,
  totalPrice,
  walletClient,
  publicClient,
  contractAddress
) {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Do you want to proceed with the purchase?",
    },
  ]);

  if (confirm) {
    const result = await buyTickets(
      walletClient,
      publicClient,
      contractAddress,
      tickets,
      totalPrice
    );
    console.log(chalk.yellow("Transaction Hash:"), result);
    console.log(chalk.green("Tickets purchased successfully!"));
  } else {
    console.log(chalk.yellow("Purchase cancelled."));
  }
}

export default {
  command: "buy",
  describe: "Buy tickets",
  handler: buyHandler,
};
