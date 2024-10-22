import inquirer from "inquirer";
import chalk from "chalk";
import { privateKeyToAccount } from "viem/accounts";

import { getTicketHistory } from "../services/gameService.js";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";

async function ticketHistoryHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    // Get input parameters
    const { gameNumber, walletAddress } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
      {
        type: "input",
        name: "walletAddress",
        message: "Enter wallet address:",
        default: async () => {
          const account = config.privateKey
            ? privateKeyToAccount(config.privateKey).address
            : "";
          return account;
        },
        validate: (input) =>
          /^0x[a-fA-F0-9]{40}$/.test(input) ||
          "Please enter a valid Ethereum address",
      },
    ]);

    const events = await getTicketHistory(
      publicClient,
      config.contractAddress,
      gameNumber,
      walletAddress
    );

    if (events.length === 0) {
      console.log(chalk.yellow("\nNo tickets found."));
    } else {
      console.log(chalk.yellow("\nTickets:"));

      events.forEach((event, index) => {
        const numbers = event.args.numbers.map((n) => Number(n));
        const etherball = Number(event.args.etherball);

        console.log(
          chalk.cyan(`Ticket ${index + 1}:`),
          `${numbers[0]}, ${numbers[1]}, ${numbers[2]}, ${etherball}`
        );
      });

      console.log(chalk.yellow("\nTotal Tickets:"), events.length);
    }
  } catch (error) {
    console.error(chalk.red("\nError:"), error.shortMessage || error.message);
    process.exit(1);
  }
}

export default {
  command: "ticket-history",
  describe: "Get ticket history",
  handler: ticketHistoryHandler,
};
