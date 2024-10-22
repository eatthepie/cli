import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import { pad } from "viem";
import { loadConfig } from "../utils/config.js";
import { createPublicClient } from "../utils/ethereum.js";
import { verifyPastGameVDF } from "../services/gameService.js";

function prepareBigNumber(valHex, bitlen) {
  const prefixedHex = valHex.startsWith("0x") ? valHex : `0x${valHex}`;
  const paddedHex = pad(prefixedHex, { size: Math.ceil(bitlen / 8) });

  return {
    val: paddedHex,
    bitlen: BigInt(bitlen),
  };
}

const prepareProofData = (proofData) => {
  const y = prepareBigNumber(proofData.y.val, proofData.y.bitlen);
  const v = proofData.v.map((bn) => prepareBigNumber(bn.val, bn.bitlen));
  return { v, y };
};

async function verifyVDFHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);

    const { gameNumber, proofFilePath } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message: "Enter the game number to verify the VDF proof for:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
      {
        type: "input",
        name: "proofFilePath",
        message: "Enter the path to the proof.json file:",
        default: "proof.json",
        validate: (input) =>
          fs.existsSync(input) || "Please enter a valid file path",
      },
    ]);

    const proofData = JSON.parse(fs.readFileSync(proofFilePath, "utf8"));
    const { v, y } = prepareProofData(proofData);

    console.log(chalk.cyan("Verifying VDF proof..."));

    const { calculatedNumbers, isValid } = await verifyPastGameVDF(
      publicClient,
      config.contractAddress,
      gameNumber,
      v,
      y
    );

    if (isValid) {
      console.log(
        chalk.green(`\nGame ${gameNumber} VDF verified successfully!`)
      );
      console.log(chalk.cyan("Winning Numbers:"), calculatedNumbers.join(", "));
    } else {
      console.log(chalk.red("\nVDF proof verification failed."));
    }
  } catch (error) {
    console.error(chalk.red("Error verifying VDF proof:"), error);
  }
}

export default {
  command: "verify-vdf",
  describe: "Verify VDF proof for a past game",
  handler: verifyVDFHandler,
};
