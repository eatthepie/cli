import inquirer from "inquirer";
import chalk from "chalk";
import { loadConfig } from "../utils/config.js";
import { createWalletClient } from "../utils/ethereum.js";
import { mintWinningNFT } from "../services/gameService.js";

async function mintNFTHandler() {
  try {
    const config = await loadConfig();
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

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to mint the winning NFT?",
        default: false,
      },
    ]);

    if (confirm) {
      const txHash = await mintWinningNFT(
        walletClient,
        config.contractAddress,
        gameNumber
      );
      console.log(chalk.green("\nWinning NFT minted successfully!"));
      console.log(chalk.cyan("Transaction Hash:"), txHash);
    } else {
      console.log(chalk.yellow("\nNFT minting cancelled."));
    }
  } catch (error) {
    console.error(chalk.red("Error minting winning NFT:"), error);
  }
}

export default {
  command: "mint-nft",
  describe: "Mint a winning NFT for a specific game",
  handler: mintNFTHandler,
};
