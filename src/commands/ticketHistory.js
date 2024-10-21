import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { getTicketHistory } from "../services/gameService.js";

async function ticketHistoryHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number to view ticket history:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const tickets = await getTicketHistory(
      publicClient,
      config.contractAddress,
      gameNumber,
      config.address
    );

    if (tickets.length === 0) {
      console.log(
        chalk.yellow("\nYou did not purchase any tickets for this game.")
      );
    } else {
      console.log(chalk.yellow(`\nTicket History for Game ${gameNumber}:`));
      tickets.forEach((ticket, index) => {
        console.log(chalk.cyan(`Ticket ${index + 1}:`), ticket.join(", "));
      });
    }
  } catch (error) {
    console.error(chalk.red("Error fetching ticket history:"), error);
  }
}

export default {
  command: "ticket-history",
  describe: "Get your ticket history for a specific game",
  handler: ticketHistoryHandler,
};
