#!/usr/bin/env node

/**
 * Main entry point for the CLI application.
 * This file sets up the command-line interface using yargs and registers all available commands.
 *
 * @module index
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Game Management Commands
import setupCommand from "./commands/setup.js";
import configCommand from "./commands/config.js";
import statusCommand from "./commands/status.js";
import gameInfoCommand from "./commands/gameInfo.js";
import difficultyInfoCommand from "./commands/difficultyInfo.js";
import changeDifficultyCommand from "./commands/changeDifficulty.js";

// Player Interaction Commands
import buyCommand from "./commands/buy.js";
import ticketHistoryCommand from "./commands/ticketHistory.js";
import didIWinCommand from "./commands/didIWin.js";
import claimPrizeCommand from "./commands/claimPrize.js";
import mintNFTCommand from "./commands/mintNFT.js";

// Draw and Verification Commands
import initiateDrawCommand from "./commands/initiateDraw.js";
import setRandaoCommand from "./commands/setRandao.js";
import submitVDFProofCommand from "./commands/submitVDFProof.js";
import verifyVDFCommand from "./commands/verifyVDF.js";
import calculatePayoutsCommand from "./commands/calculatePayouts.js";

yargs(hideBin(process.argv))
  // Game Management Commands
  .command(setupCommand)
  .command(configCommand)

  // Game Interaction Commands
  .command(buyCommand)
  .command(statusCommand)
  .command(gameInfoCommand)
  .command(didIWinCommand)
  .command(ticketHistoryCommand)

  // Prize Claiming Commands
  .command(claimPrizeCommand)
  .command(mintNFTCommand)

  // Draw and Verification Commands
  .command(initiateDrawCommand)
  .command(setRandaoCommand)
  .command(submitVDFProofCommand)
  .command(verifyVDFCommand)
  .command(calculatePayoutsCommand)

  // Difficulty Commands
  .command(difficultyInfoCommand)
  .command(changeDifficultyCommand)

  // Ensure at least one command is provided
  .demandCommand(1, "You need at least one command before moving on")
  .help().argv;
