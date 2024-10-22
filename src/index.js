#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import configCommand from "./commands/config.js";
import setupCommand from "./commands/setup.js";
import buyCommand from "./commands/buy.js";
import statusCommand from "./commands/status.js";
import gameInfoCommand from "./commands/gameInfo.js";
import difficultyInfoCommand from "./commands/difficultyInfo.js";
import didIWinCommand from "./commands/didIWin.js";
import ticketHistoryCommand from "./commands/ticketHistory.js";
import claimPrizeCommand from "./commands/claimPrize.js";
import mintNFTCommand from "./commands/mintNFT.js";
import initiateDrawCommand from "./commands/initiateDraw.js";
import setRandaoCommand from "./commands/setRandao.js";
import submitVDFProofCommand from "./commands/submitVDFProof.js";
import verifyVDFCommand from "./commands/verifyVDF.js";
import calculatePayoutsCommand from "./commands/calculatePayouts.js";
import changeDifficultyCommand from "./commands/changeDifficulty.js";

yargs(hideBin(process.argv))
  .command(configCommand)
  .command(setupCommand)
  .command(buyCommand)
  .command(statusCommand)
  .command(gameInfoCommand)
  .command(didIWinCommand)
  .command(ticketHistoryCommand)
  .command(claimPrizeCommand)
  .command(mintNFTCommand)
  .command(initiateDrawCommand)
  .command(setRandaoCommand)
  .command(submitVDFProofCommand)
  .command(verifyVDFCommand)
  .command(calculatePayoutsCommand)
  .command(difficultyInfoCommand)
  .command(changeDifficultyCommand)
  .demandCommand(1, "You need at least one command before moving on")
  .help().argv;
