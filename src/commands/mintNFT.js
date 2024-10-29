import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createWalletClient } from "../utils/ethereum.js";
import { mintWinningNFT } from "../services/gameService.js";

/**
 * Validation messages
 */
const VALIDATION = {
  GAME_NUMBER: "⚠️ Please enter a valid game number",
};

/**
 * Success messages
 */
const SUCCESS_MESSAGES = {
  NFT_MINTED: "✨ Winning NFT minted successfully! 🎨",
};

/**
 * Prompt messages
 */
const PROMPT_MESSAGES = {
  GAME_NUMBER:
    "Enter the game number for which you want to mint the winning NFT:",
};

/**
 * Handles the process of minting a winning NFT for a specific game.
 */
async function mintNFTHandler() {
  try {
    console.log(chalk.cyan("\n🎨 Starting NFT minting process..."));

    // Initialize client and configuration
    const config = await loadConfig();
    const walletClient = createWalletClient(config);

    // Get game number from user
    const gameNumber = await promptForGameNumber();

    // Process NFT minting
    await processNFTMinting(walletClient, config.contractAddress, gameNumber);
  } catch (error) {
    handleMintError(error);
  }
}

/**
 * Prompts the user for a game number
 * @returns {Promise<number>} The selected game number
 */
async function promptForGameNumber() {
  const { gameNumber } = await inquirer.prompt([
    {
      type: "number",
      name: "gameNumber",
      message: "🎮 " + PROMPT_MESSAGES.GAME_NUMBER,
      validate: (input) => input > 0 || VALIDATION.GAME_NUMBER,
    },
  ]);
  return gameNumber;
}

/**
 * Processes the NFT minting transaction and displays results
 * @param {WalletClient} walletClient - The wallet client instance
 * @param {string} contractAddress - The lottery contract address
 * @param {number} gameNumber - The game number to mint NFT for
 */
async function processNFTMinting(walletClient, contractAddress, gameNumber) {
  console.log(chalk.yellow("\n🎯 Processing your NFT mint..."));

  const txHash = await mintWinningNFT(
    walletClient,
    contractAddress,
    gameNumber
  );

  displaySuccessMessages(txHash);

  // Wait for transaction confirmation
  await waitForTransactionConfirmation(walletClient, txHash);
}

/**
 * Waits for a transaction to be confirmed and displays the confirmation
 * @param {WalletClient} walletClient - The wallet client instance
 * @param {string} txHash - The transaction hash to wait for
 */
async function waitForTransactionConfirmation(walletClient, txHash) {
  console.log(chalk.yellow("\n⏳ Waiting for transaction to be confirmed..."));

  const receipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  console.log(chalk.cyan("📦 Block Number:"), receipt.blockNumber);
  console.log(chalk.green("\n✅ Transaction confirmed successfully!"));
  console.log(chalk.cyan("🖼️ Your NFT has been minted to your wallet!"));
}

/**
 * Displays success messages after NFT minting
 * @param {string} txHash - The transaction hash
 */
function displaySuccessMessages(txHash) {
  console.log(chalk.yellow("\n📝 Transaction Hash:"), txHash);
  console.log(chalk.green(SUCCESS_MESSAGES.NFT_MINTED));
}

/**
 * Handles errors that occur during the NFT minting process
 * @param {Error} error - The error to handle
 */
function handleMintError(error) {
  if (error.message.includes("Not a gold ticket winner.")) {
    console.error(chalk.yellow("\n👑 Only jackpot winners can mint an NFT."));
  } else {
    console.error(
      chalk.red("\n❌ Error:"),
      error.shortMessage || error.message
    );
    console.error(
      chalk.red(
        "\n⚠️ Make sure your settings are correct.\n🔧 Run 'config' to view them and 'setup' to reset them."
      )
    );
    process.exit(1);
  }
}

export default {
  command: "mint-nft",
  describe: "🎨 Mint your jackpot NFT",
  handler: mintNFTHandler,
};
