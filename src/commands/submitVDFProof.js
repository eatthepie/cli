import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import { loadConfig } from "../utils/config.js";
import { createWalletClient, createPublicClient } from "../utils/ethereum.js";
import { submitVDFProof } from "../services/gameService.js";
import { decodeErrorResult } from "viem";

function prepareBigNumber(valHex, bitlen) {
  const prefixedHex = valHex.startsWith("0x") ? valHex : `0x${valHex}`;
  const paddedHex = prefixedHex.padEnd(Math.ceil(bitlen / 8) * 2 + 2, "0");
  return {
    val: paddedHex,
    bitlen: BigInt(bitlen),
  };
}

function prepareProofData(proofData) {
  const y = prepareBigNumber(proofData.y.val, proofData.y.bitlen);
  const v = proofData.v.map((bn) => prepareBigNumber(bn.val, bn.bitlen));
  return { v, y };
}

async function submitVDFProofHandler() {
  try {
    const config = await loadConfig();
    const walletClient = createWalletClient(config);
    const publicClient = createPublicClient(config);

    const { gameNumber, proofFilePath } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number to submit the VDF proof for:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
      {
        type: "input",
        name: "proofFilePath",
        message: "Enter the path to the proof.json file:",
        validate: (input) =>
          fs.existsSync(input) || "Please enter a valid file path",
      },
    ]);

    const proofData = JSON.parse(fs.readFileSync(proofFilePath, "utf8"));
    const { v, y } = prepareProofData(proofData);

    console.log(chalk.cyan("Submitting VDF proof..."));
    console.log(chalk.cyan("v:"), v);
    console.log(chalk.cyan("y:"), y);

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Do you want to proceed with submitting the VDF proof?",
        default: false,
      },
    ]);

    if (confirm) {
      try {
        const simulationResult = await publicClient.simulateContract({
          address: config.contractAddress,
          abi: config.contractABI,
          functionName: "submitVDFProof",
          args: [BigInt(gameNumber), v, y],
          account: walletClient.account,
        });
        console.log(chalk.green("Simulation successful:"), simulationResult);
      } catch (simulationError) {
        console.error(chalk.red("Simulation failed:"), simulationError);
        if (simulationError.cause?.data) {
          const decodedError = decodeErrorResult({
            abi: config.contractABI,
            data: simulationError.cause.data,
          });
          console.error(chalk.red("Decoded error:"), decodedError);
        }
        throw simulationError;
      }

      const txHash = await submitVDFProof(
        walletClient,
        publicClient,
        config.contractAddress,
        gameNumber,
        v,
        y
      );
      console.log(chalk.green("\nVDF proof submitted successfully!"));
      console.log(chalk.cyan("Transaction Hash:"), txHash);
    } else {
      console.log(chalk.yellow("\nVDF proof submission cancelled."));
    }
  } catch (error) {
    console.error(chalk.red("Error submitting VDF proof:"), error);
    if (error.cause?.data) {
      try {
        const decodedError = decodeErrorResult({
          abi: config.contractABI,
          data: error.cause.data,
        });
        console.error(chalk.red("Decoded error:"), decodedError);
      } catch (decodeError) {
        console.error(chalk.red("Failed to decode error:"), decodeError);
      }
    }
    if (error.message) {
      console.error(chalk.red("Error message:"), error.message);
    }
  }
}

export default {
  command: "submit-vdf-proof",
  describe: "Submit VDF proof for a specific game",
  handler: submitVDFProofHandler,
};
