import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createPublicClient, createWalletClient } from "../utils/ethereum.js";
import { mintWinningNFT } from "../services/gameService.js";

async function mintNFTHandler() {
  try {
    const config = await loadConfig();
    const publicClient = createPublicClient(config);
    const walletClient = createWalletClient(config);

    const { gameNumber } = await inquirer.prompt([
      {
        type: "number",
        name: "gameNumber",
        message:
          "Enter the game number for which you want to mint the winning NFT:",
        validate: (input) => input > 0 || "Please enter a valid game number",
      },
    ]);

    const txHash = await mintWinningNFT(
      walletClient,
      publicClient,
      config.contractAddress,
      gameNumber
    );
    console.log(chalk.green("\nWinning NFT minted successfully!"));
    console.log(chalk.cyan("Transaction Hash:"), txHash);
  } catch (error) {
    console.error(chalk.red("Error minting winning NFT:"), error);
  }
}

export default {
  command: "mint-nft",
  describe: "Mint a winning NFT for a specific game",
  handler: mintNFTHandler,
};
