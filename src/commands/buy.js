import chalk from "chalk";
import inquirer from "inquirer";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import {
  buyTickets,
  getTicketPrice,
  getCurrentGameInfo,
} from "../services/gameService.js";
import {
  generateRandomTicket,
  getDifficultyLimits,
} from "../utils/ticketUtils.js";
import { formatDifficulty } from "../utils/display.js";
import { formatEther } from "viem";

async function buyHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    const ticketPrice = await getTicketPrice(
      publicClient,
      config.contractAddress
    );
    const gameInfo = await getCurrentGameInfo(
      publicClient,
      config.contractAddress
    );
    const limits = getDifficultyLimits(gameInfo.difficulty);

    console.log(
      chalk.cyan(`Current ticket price: ${formatEther(ticketPrice)} ETH`)
    );
    console.log(
      chalk.cyan(`Current difficulty: ${formatDifficulty(gameInfo.difficulty)}`)
    );
    console.log(
      chalk.cyan(
        `Valid number range: 1-${limits.max}, Etherball: 1-${limits.etherballMax}`
      )
    );

    const { ticketCount } = await inquirer.prompt([
      {
        type: "number",
        name: "ticketCount",
        message: "How many tickets do you want to buy? (1-100)",
        validate: (input) => input >= 1 && input <= 100,
      },
    ]);

    const { choiceMethod } = await inquirer.prompt([
      {
        type: "list",
        name: "choiceMethod",
        message: "Do you want to provide your own numbers or auto-generate?",
        choices: ["Provide own", "Auto-generate"],
      },
    ]);

    let tickets = [];

    if (choiceMethod === "Provide own") {
      for (let i = 0; i < ticketCount; i++) {
        const { numbers } = await inquirer.prompt([
          {
            type: "input",
            name: "numbers",
            message: `Enter 4 numbers for ticket ${
              i + 1
            } (comma-separated, last is Etherball):`,
            validate: (input) => {
              const nums = input.split(",").map(Number);
              return (
                nums.length === 4 &&
                nums.slice(0, 3).every((n) => n >= 1 && n <= limits.max) &&
                nums[3] >= 1 &&
                nums[3] <= limits.etherballMax
              );
            },
          },
        ]);
        tickets.push(numbers.split(",").map(Number));
      }
    } else {
      tickets = Array(ticketCount)
        .fill()
        .map(() => generateRandomTicket(limits));
    }

    const totalPrice = ticketPrice * BigInt(ticketCount);

    console.log(chalk.cyan("Tickets to purchase:"));
    tickets.forEach((ticket, index) => {
      console.log(chalk.yellow(`Ticket ${index + 1}:`), ticket.join(", "));
    });
    console.log(chalk.cyan(`Total cost: ${formatEther(totalPrice)} ETH`));

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
        config.contractAddress,
        tickets,
        totalPrice
      );
      console.log(chalk.green("Tickets purchased successfully!"));
      console.log(chalk.yellow("Transaction Hash:"), result);
    } else {
      console.log(chalk.yellow("Purchase cancelled."));
    }
  } catch (error) {
    console.error(chalk.red("Error buying tickets:"), error);
  }
}

export default {
  command: "buy",
  describe: "Buy lottery tickets",
  handler: buyHandler,
};
