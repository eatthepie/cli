#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");
const chalk = require("chalk");
const {
  createPublicClient,
  http,
  createWalletClient,
  parseEther,
  formatEther,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { mainnet, sepolia, localhost } = require("viem/chains");

const contractABI = require("./abi.json");
const configPath = path.join(__dirname, "config.json");

function displayBanner() {
  console.log(
    chalk.yellow(
      figlet.textSync("EAT THE PIE", {
        font: "ANSI Shadow",
        horizontalLayout: "full",
      })
    )
  );
  console.log(chalk.cyan("♦♦♦ THE WORLD LOTTERY ON ETHEREUM ♦♦♦ \n"));
}

/*
function displayHelp() {
  console.log(chalk.cyan("\nAvailable commands:"));
  console.log(chalk.yellow("  setup") + "     Run the interactive setup");
  console.log(chalk.yellow("  enter") + "     Enter the EatThePie lottery");
  console.log(
    chalk.cyan("\nUse --help with any command for more information.")
  );
}
*/

function loadConfig() {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  console.log(chalk.red("Configuration not found. Please run 'setup' first."));
  process.exit(1);
}

function createClients(config) {
  const chain =
    config.network === "mainnet"
      ? mainnet
      : config.network === "sepolia"
      ? sepolia
      : {
          id: 31337,
          name: "Anvil",
          network: "anvil",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        };

  const publicClient = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  });

  const account = privateKeyToAccount(config.privateKey);
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(config.rpcUrl),
  });

  return { publicClient, walletClient };
}

function formatTimeUntilDraw(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatDifficulty(difficulty) {
  const difficultyMap = ["Easy", "Medium", "Hard"];
  return difficultyMap[difficulty] || "Unknown";
}

async function interactiveSetup() {
  displayBanner();
  console.log("Welcome to EatThePie! Let's set up your configuration.");

  const questions = [
    {
      type: "list",
      name: "network",
      message: "Which network would you like to use?",
      choices: ["mainnet", "sepolia", "anvil"],
      default: "mainnet",
    },
    {
      type: "input",
      name: "contractAddress",
      message: "Enter the EatThePie contract address:",
      default: "0x1234567890123456789012345678901234567890",
      validate: (input) =>
        /^0x[a-fA-F0-9]{40}$/.test(input) ||
        "Please enter a valid Ethereum address",
    },
    {
      type: "input",
      name: "rpcUrl",
      message: "Enter the RPC URL:",
      default: (answers) =>
        answers.network === "mainnet"
          ? "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
          : "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
      validate: (input) =>
        input.startsWith("http") || "Please enter a valid URL",
    },
    {
      type: "password",
      name: "privateKey",
      message: "Enter your wallet private key:",
      mask: "*",
      validate: (input) =>
        /^0x[a-fA-F0-9]{64}$/.test(input) ||
        "Please enter a valid private key (66 characters long, starting with 0x)",
    },
  ];

  const answers = await inquirer.prompt(questions);

  fs.writeFileSync(configPath, JSON.stringify(answers, null, 2));
  console.log(chalk.green("Configuration saved successfully!"));
}

async function getCurrentGameInfo(publicClient, contractAddress) {
  try {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "getCurrentGameInfo",
    });

    console.log(chalk.cyan("Current Game Information:"));
    console.log(chalk.yellow("Game Number:"), result[0].toString());
    console.log(chalk.yellow("Difficulty:"), formatDifficulty(result[1]));
    console.log(chalk.yellow("Prize Pool:"), formatEther(result[2]), "ETH");
    console.log(
      chalk.yellow("Draw Time:"),
      new Date(Number(result[3]) * 1000).toLocaleString()
    );
    console.log(
      chalk.yellow("Time Until Draw:"),
      formatTimeUntilDraw(Number(result[4]))
    );
  } catch (error) {
    console.error(chalk.red("Error fetching game info:"), error);
  }
}

async function getTicketPrice(publicClient, contractAddress) {
  try {
    return await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "ticketPrice",
    });
  } catch (error) {
    console.error(chalk.red("Error fetching ticket price:"), error);
    process.exit(1);
  }
}

async function getCurrentDifficulty(publicClient, contractAddress, gameNumber) {
  try {
    return await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "gameDifficulty",
      args: [gameNumber],
    });
  } catch (error) {
    console.error(chalk.red("Error fetching game difficulty:"), error);
    process.exit(1);
  }
}

function getDifficultyLimits(difficulty) {
  const limits = [
    { max: 50, etherballMax: 5 },
    { max: 100, etherballMax: 10 },
    { max: 150, etherballMax: 15 },
  ];
  return limits[difficulty] || limits[0];
}

function generateRandomTicket(limits) {
  return [
    Math.floor(Math.random() * limits.max) + 1,
    Math.floor(Math.random() * limits.max) + 1,
    Math.floor(Math.random() * limits.max) + 1,
    Math.floor(Math.random() * limits.etherballMax) + 1,
  ];
}

async function buyTicketsInteractive(
  walletClient,
  publicClient,
  contractAddress
) {
  const ticketPrice = await getTicketPrice(publicClient, contractAddress);
  const gameInfo = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getCurrentGameInfo",
  });
  const difficulty = gameInfo[1];
  const limits = getDifficultyLimits(difficulty);

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
    try {
      const result = await walletClient.writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "buyTickets",
        args: [tickets],
        value: totalPrice,
      });

      console.log(chalk.green("Tickets purchased successfully!"));
      console.log(chalk.yellow("Transaction Hash:"), result);
    } catch (error) {
      console.error(chalk.red("Error buying tickets:"), error);
    }
  } else {
    console.log(chalk.yellow("Purchase cancelled."));
  }
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .command("setup", "Run the interactive setup", {}, interactiveSetup)
    .command("info", "Get current game information", {}, async () => {
      const config = loadConfig();
      const { publicClient } = createClients(config);
      await getCurrentGameInfo(publicClient, config.contractAddress);
    })
    .command("buy", "Buy lottery tickets", {}, async () => {
      const config = loadConfig();
      const { publicClient, walletClient } = createClients(config);
      await buyTicketsInteractive(
        walletClient,
        publicClient,
        config.contractAddress
      );
    })
    .demandCommand(1, "You need at least one command before moving on")
    .help().argv;

  // The command execution is now handled by yargs
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
