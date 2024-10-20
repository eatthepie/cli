#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");
const chalk = require("chalk");

const configPath = path.join(__dirname, "config.json");

function displayBanner() {
  console.log(
    chalk.yellow(figlet.textSync("EAT THE PIE", { horizontalLayout: "full" }))
  );
  console.log(chalk.cyan("THE WORLD LOTTERY ON ETHEREUM\n"));
}

async function interactiveSetup() {
  displayBanner();
  console.log("Welcome to EatThePie! Let's set up your configuration.");

  const questions = [
    {
      type: "list",
      name: "network",
      message: "Which network would you like to use?",
      choices: ["mainnet", "sepolia"],
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

function displayHelp() {
  console.log(chalk.cyan("\nAvailable commands:"));
  console.log(chalk.yellow("  setup") + "     Run the interactive setup");
  console.log(chalk.yellow("  enter") + "     Enter the EatThePie lottery");
  console.log(
    chalk.cyan("\nUse --help with any command for more information.")
  );
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .command("setup", "Run the interactive setup", {}, interactiveSetup)
    .command(
      "enter <amount>",
      "Enter the EatThePie lottery",
      (yargs) => {
        return yargs.option("amount", {
          describe: "Amount to enter",
          type: "number",
          demandOption: true,
        });
      },
      (argv) => {
        console.log(chalk.blue(`Entering EatThePie with ${argv.amount} ETH`));
        // Implement lottery entry logic here
      }
    )
    .demandCommand(1, "You need at least one command before moving on")
    .help().argv;

  // The command execution is now handled by yargs
}

main().catch((error) => {
  console.error("An error occurred:", error);
});
