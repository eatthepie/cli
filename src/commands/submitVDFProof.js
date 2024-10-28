import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import { pad } from "viem";
import { loadConfig } from "../utils/config.js";
import { createWalletClient, createPublicClient } from "../utils/ethereum.js";
import { submitVDFProof } from "../services/gameService.js";

/**
 * Error messages that require special handling
 */
const ERROR_MESSAGES = {
  RANDAO_NOT_SET: "Random value not set for this game",
  VDF_ALREADY_SUBMITTED: "VDF proof already submitted for this game",
  INVALID_VDF_PROOF: "Invalid VDF proof",
};

/**
 * Error response messages
 */
const ERROR_RESPONSES = {
  RANDAO_NOT_SET:
    "RANDAO value not set for this game. VDF proof cannot be submitted yet.",
  VDF_ALREADY_SUBMITTED:
    "VDF proof already submitted for this game. To verify a previous game, use command 'verify-vdf'.",
  INVALID_VDF_PROOF:
    "Invalid VDF proof. Please check the proof file and try again.",
};

/**
 * Validation messages
 */
const VALIDATION = {
  GAME_NUMBER: "Please enter a valid game number",
  FILE_PATH: "Please enter a valid file path",
};

/**
 * Prompt messages
 */
const PROMPT_MESSAGES = {
  GAME_NUMBER: "Enter the game number to submit the VDF proof for:",
  PROOF_FILE: "Enter the path to the proof file (proof.json):",
};

/**
 * Status messages
 */
const STATUS_MESSAGES = {
  SUBMITTING: "Submitting VDF proof...",
  SUCCESS: "VDF proof submitted successfully!",
};

/**
 * Prepares a big number for VDF proof submission
 * @param {string} valHex - Hex string value
 * @param {number} bitlen - Bit length
 * @returns {Object} Prepared big number object
 */
function prepareBigNumber(valHex, bitlen) {
  const prefixedHex = addHexPrefix(valHex);
  const paddedHex = padHexValue(prefixedHex, bitlen);

  return {
    val: paddedHex,
    bitlen: BigInt(bitlen),
  };
}

/**
 * Adds hex prefix if not present
 * @param {string} hex - Hex string
 * @returns {string} Hex string with prefix
 */
function addHexPrefix(hex) {
  return hex.startsWith("0x") ? hex : `0x${hex}`;
}

/**
 * Pads hex value to required length
 * @param {string} hex - Hex string with prefix
 * @param {number} bitlen - Bit length
 * @returns {string} Padded hex string
 */
function padHexValue(hex, bitlen) {
  return pad(hex, { size: Math.ceil(bitlen / 8) });
}

/**
 * Prepares proof data for submission
 * @param {Object} proofData - Raw proof data
 * @returns {Object} Prepared proof data
 */
function prepareProofData(proofData) {
  const y = prepareBigNumber(proofData.y.val, proofData.y.bitlen);
  const v = proofData.v.map((bn) => prepareBigNumber(bn.val, bn.bitlen));
  return { v, y };
}

/**
 * Handles the VDF proof submission process
 */
async function submitVDFProofHandler() {
  try {
    // Initialize clients
    const config = await loadConfig();
    const walletClient = createWalletClient(config);
    const publicClient = createPublicClient(config);

    // Get user input
    const { gameNumber, proofData } = await getUserInput();

    // Process and submit proof
    await processProofSubmission(
      walletClient,
      publicClient,
      config.contractAddress,
      gameNumber,
      proofData
    );
  } catch (error) {
    handleError(error);
  }
}

/**
 * Gets required input from user
 * @returns {Promise<Object>} Object containing game number and proof data
 */
async function getUserInput() {
  const { gameNumber, proofFilePath } = await promptForInput();
  const proofData = readProofFile(proofFilePath);
  return { gameNumber, proofData };
}

/**
 * Prompts user for game number and proof file path
 * @returns {Promise<Object>} User input values
 */
async function promptForInput() {
  return await inquirer.prompt([
    {
      type: "number",
      name: "gameNumber",
      message: PROMPT_MESSAGES.GAME_NUMBER,
      validate: (input) => input > 0 || VALIDATION.GAME_NUMBER,
    },
    {
      type: "input",
      name: "proofFilePath",
      message: PROMPT_MESSAGES.PROOF_FILE,
      validate: (input) => fs.existsSync(input) || VALIDATION.FILE_PATH,
    },
  ]);
}

/**
 * Reads and parses the proof file
 * @param {string} filePath - Path to proof file
 * @returns {Object} Parsed proof data
 */
function readProofFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContent);
}

/**
 * Processes and submits the VDF proof
 * @param {WalletClient} walletClient - The wallet client
 * @param {PublicClient} publicClient - The public client
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game number
 * @param {Object} proofData - The proof data
 */
async function processProofSubmission(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber,
  proofData
) {
  const { v, y } = prepareProofData(proofData);

  console.log(chalk.cyan(STATUS_MESSAGES.SUBMITTING));

  const txHash = await submitVDFProof(
    walletClient,
    publicClient,
    contractAddress,
    gameNumber,
    v,
    y
  );

  displaySuccessMessages(txHash);
}

/**
 * Displays success messages after proof submission
 * @param {string} txHash - Transaction hash
 */
function displaySuccessMessages(txHash) {
  console.log(chalk.yellow("\nTransaction Hash:"), txHash);
  console.log(chalk.green(`${STATUS_MESSAGES.SUCCESS}`));
}

/**
 * Handles errors during proof submission
 * @param {Error} error - The error object
 */
function handleError(error) {
  // Map of error messages to their corresponding responses
  const errorHandlers = {
    [ERROR_MESSAGES.RANDAO_NOT_SET]: () =>
      console.log(chalk.yellow(ERROR_RESPONSES.RANDAO_NOT_SET)),
    [ERROR_MESSAGES.VDF_ALREADY_SUBMITTED]: () =>
      console.log(chalk.yellow(ERROR_RESPONSES.VDF_ALREADY_SUBMITTED)),
    [ERROR_MESSAGES.INVALID_VDF_PROOF]: () =>
      console.log(chalk.yellow(ERROR_RESPONSES.INVALID_VDF_PROOF)),
  };

  // Check if error matches any known error types
  for (const [errorMessage, handler] of Object.entries(errorHandlers)) {
    if (error.message.includes(errorMessage)) {
      handler();
      return;
    }
  }

  console.error(chalk.red("\nError:"), error.shortMessage || error.message);
  console.error(
    chalk.red(
      "\nMake sure your settings are correct.\nRun 'config' to view them and 'setup' to reset them."
    )
  );
  process.exit(1);
}

export default {
  command: "submit-vdf-proof",
  describe: "Submit a VDF proof",
  handler: submitVDFProofHandler,
};
