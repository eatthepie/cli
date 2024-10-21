#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import setupCommand from "./commands/setup.js";
import currentGameCommand from "./commands/currentGame.js";
import pastGameCommand from "./commands/pastGame.js";
import difficultyInfoCommand from "./commands/difficultyInfo.js";
import userWinningInfoCommand from "./commands/userWinningInfo.js";
import didIWinCommand from "./commands/didIWin.js";
import ticketHistoryCommand from "./commands/ticketHistory.js";
import claimPrizeCommand from "./commands/claimPrize.js";
import mintNFTCommand from "./commands/mintNFT.js";
import initiateDrawCommand from "./commands/initiateDraw.js";
import setRandomCommand from "./commands/setRandom.js";
import submitVDFProofCommand from "./commands/submitVDFProof.js";
import verifyVDFCommand from "./commands/verifyVDF.js";
import calculatePayoutsCommand from "./commands/calculatePayouts.js";
import changeDifficultyCommand from "./commands/changeDifficulty.js";

yargs(hideBin(process.argv))
  .command(setupCommand)
  .command(currentGameCommand)
  .command(pastGameCommand)
  .command(difficultyInfoCommand)
  .command(userWinningInfoCommand)
  .command(didIWinCommand)
  .command(ticketHistoryCommand)
  .command(claimPrizeCommand)
  .command(mintNFTCommand)
  .command(initiateDrawCommand)
  .command(setRandomCommand)
  .command(submitVDFProofCommand)
  .command(verifyVDFCommand)
  .command(calculatePayoutsCommand)
  .command(changeDifficultyCommand)
  .demandCommand(1, "You need at least one command before moving on")
  .help().argv;
