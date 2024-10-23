/**
 * Game service module for managing lottery game operations
 * Provides functions for interacting with the smart contract
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const contractABI = JSON.parse(
  fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "abi.json"
    ),
    "utf8"
  )
);

/**
 * Ticket purchase event definition
 */
const TICKET_PURCHASED_EVENT = {
  type: "event",
  name: "TicketPurchased",
  inputs: [
    { name: "player", type: "address", indexed: true, internalType: "address" },
    {
      name: "gameNumber",
      type: "uint256",
      indexed: false,
      internalType: "uint256",
    },
    {
      name: "numbers",
      type: "uint256[3]",
      indexed: false,
      internalType: "uint256[3]",
    },
    {
      name: "etherball",
      type: "uint256",
      indexed: false,
      internalType: "uint256",
    },
  ],
  anonymous: false,
};

/**
 * Get current ticket price from the contract
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @returns {Promise<bigint>} Current ticket price in wei
 */
export async function getTicketPrice(publicClient, contractAddress) {
  const price = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "ticketPrice",
  });

  return price;
}
/**
 * Get payouts for all tiers of a specific game
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @returns {Promise<bigint[]>} Array of payout amounts for each tier
 */
export async function getGamePayouts(
  publicClient,
  contractAddress,
  gameNumber
) {
  const payoutPromises = [0, 1, 2].map((tier) =>
    publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "gamePayouts",
      args: [BigInt(gameNumber), BigInt(tier)],
    })
  );

  const payouts = await Promise.all(payoutPromises);
  return payouts;
}

/**
 * Purchase lottery tickets
 * @param {Object} walletClient - Viem wallet client instance
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number[][]} tickets - Array of ticket number arrays
 * @param {bigint} totalCost - Total cost in wei
 * @returns {Promise<string>} Transaction hash
 * @throws {Error} If ticket format is invalid or transaction fails
 */
export async function buyTickets(
  walletClient,
  publicClient,
  contractAddress,
  tickets,
  totalCost
) {
  // Format tickets into correct structure
  const formattedTickets = tickets.map((ticket) => {
    if (!Array.isArray(ticket) || ticket.length !== 4) {
      throw new Error("Each ticket must be an array of 4 numbers");
    }
    return ticket.map((num) => BigInt(num));
  });

  try {
    // Simulate transaction
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "buyTickets",
      args: [formattedTickets],
      account: walletClient.account,
      value: totalCost,
    });

    // Execute transaction
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt.transactionHash;
  } catch (error) {
    throw new Error(`Failed to buy tickets: ${error.message}`);
  }
}

/**
 * Get current game information from the contract
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Current game information
 */
export async function getCurrentGameInfo(publicClient, contractAddress) {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getCurrentGameInfo",
  });

  return {
    gameNumber: result[0],
    difficulty: result[1],
    prizePool: result[2],
    drawTime: result[3],
    timeUntilDraw: result[4],
  };
}

/**
 * Get detailed information for a specific game
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @returns {Promise<Object>} Detailed game information
 */
export async function getDetailedGameInfo(
  publicClient,
  contractAddress,
  gameNumber
) {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getDetailedGameInfo",
    args: [BigInt(gameNumber)],
  });

  return {
    gameId: result.gameId,
    status: result.status,
    prizePool: result.prizePool,
    numberOfWinners: result.numberOfWinners,
    goldWinners: result.goldWinners,
    silverWinners: result.silverWinners,
    bronzeWinners: result.bronzeWinners,
    winningNumbers: result.winningNumbers,
    difficulty: result.difficulty,
    drawInitiatedBlock: result.drawInitiatedBlock,
    randaoBlock: result.randaoBlock,
    randaoValue: result.randaoValue,
    payouts: result.payouts,
  };
}

/**
 * Get user's winnings for a specific game
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @param {string} userAddress - User's ethereum address
 * @returns {Promise<Object>} User's winning information
 */
export async function getUserGameWinnings(
  publicClient,
  contractAddress,
  gameNumber,
  userAddress
) {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getUserGameWinnings",
    args: [BigInt(gameNumber), userAddress],
  });

  return {
    goldWin: result[0],
    silverWin: result[1],
    bronzeWin: result[2],
    totalPrize: result[3],
    claimed: result[4],
  };
}

/**
 * Get ticket purchase history for a specific game and wallet
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Array>} Array of ticket purchase events
 */
export async function getTicketHistory(
  publicClient,
  contractAddress,
  gameNumber,
  walletAddress
) {
  // Get starting block for the game
  const gameStartBlock = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "gameStartBlock",
    args: [BigInt(gameNumber)],
  });

  // Determine end block (next game start or current block)
  let endBlock;
  try {
    endBlock = await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "gameStartBlock",
      args: [BigInt(gameNumber + 1)],
    });
  } catch {
    endBlock = await publicClient.getBlockNumber();
  }

  // Fetch ticket purchase events
  const events = await publicClient.getLogs({
    address: contractAddress,
    event: TICKET_PURCHASED_EVENT,
    args: {
      player: walletAddress,
      gameNumber: BigInt(gameNumber),
    },
    fromBlock: gameStartBlock,
    toBlock: endBlock,
  });

  return events;
}

/**
 * Claim prize for winning tickets
 * @param {Object} walletClient - Viem wallet client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @returns {Promise<string>} Transaction hash
 */
export async function claimPrize(walletClient, contractAddress, gameNumber) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "claimPrize",
    args: [gameNumber],
  });

  return hash;
}

/**
 * Mint NFT for winning tickets
 * @param {Object} walletClient - Viem wallet client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @returns {Promise<string>} Transaction hash
 */
export async function mintWinningNFT(
  walletClient,
  contractAddress,
  gameNumber
) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "mintWinningNFT",
    args: [BigInt(gameNumber)],
  });

  return hash;
}

/**
 * Initiate a new game draw
 * @param {Object} walletClient - Viem wallet client instance
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @returns {Promise<string>} Transaction hash
 */
export async function initiateDraw(
  walletClient,
  publicClient,
  contractAddress
) {
  try {
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "initiateDraw",
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    throw new Error(`Failed to initiate draw: ${error.message}`);
  }
}

/**
 * Set RANDAO value for a game
 * @param {Object} walletClient - Viem wallet client instance
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @returns {Promise<string>} Transaction hash
 */
export async function setRandao(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber
) {
  try {
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "setRandom",
      args: [BigInt(gameNumber)],
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    throw new Error(`Failed to set RANDAO value: ${error.message}`);
  }
}

/**
 * Submit VDF proof for a game
 * @param {Object} walletClient - Viem wallet client instance
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @param {string} v - VDF value
 * @param {string} y - VDF proof
 * @returns {Promise<string>} Transaction hash
 */
export async function submitVDFProof(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber,
  v,
  y
) {
  try {
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "submitVDFProof",
      args: [BigInt(gameNumber), v, y],
    });

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt.transactionHash;
  } catch (error) {
    throw new Error(`Failed to submit VDF proof: ${error.message}`);
  }
}

/**
 * Verify VDF proof for a past game
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @param {string} v - VDF value
 * @param {string} y - VDF proof
 * @returns {Promise<Object>} Verification result with calculated numbers and validity
 */
export async function verifyPastGameVDF(
  publicClient,
  contractAddress,
  gameNumber,
  v,
  y
) {
  try {
    const result = await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "verifyPastGameVDF",
      args: [BigInt(gameNumber), v, y],
    });

    return {
      calculatedNumbers: result[0],
      isValid: result[1],
    };
  } catch (error) {
    throw new Error(`Failed to verify VDF proof: ${error.message}`);
  }
}

/**
 * Calculate payouts for a specific game
 * @param {Object} walletClient - Viem wallet client instance
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @returns {Promise<string>} Transaction hash
 */
export async function calculatePayouts(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber
) {
  try {
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "calculatePayouts",
      args: [BigInt(gameNumber)],
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    throw new Error(`Failed to calculate payouts: ${error.message}`);
  }
}

/**
 * Change game difficulty level
 * @param {Object} walletClient - Viem wallet client instance
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @returns {Promise<string>} Transaction hash
 */
export async function changeDifficulty(
  walletClient,
  publicClient,
  contractAddress
) {
  try {
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "changeDifficulty",
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    throw new Error(`Failed to change difficulty: ${error.message}`);
  }
}

/**
 * Get consecutive games information from the contract
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Consecutive games information
 */
export async function getConsecutiveGamesInfo(publicClient, contractAddress) {
  const [consecutiveJackpotGames, consecutiveNonJackpotGames] =
    await Promise.all([
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "consecutiveJackpotGames",
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "consecutiveNonJackpotGames",
      }),
    ]);

  return {
    consecutiveJackpotGames,
    consecutiveNonJackpotGames,
  };
}
