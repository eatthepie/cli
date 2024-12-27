/**
 * Game service module for managing lottery game operations
 * Provides functions for interacting with the smart contract
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WC_ER20_TOKEN } from "../utils/config.js";
import { maxUint256, parseEther } from "viem";
import { SignatureTransfer } from "@uniswap/permit2-sdk";
import { PERMIT2_ADDRESS } from "../utils/config.js";

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
 * @param {Object} network - Network to buy tickets on
 * @param {Object} walletClient - Viem wallet client instance
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number[][]} tickets - Array of ticket number arrays
 * @param {bigint} totalCost - Total cost in wei
 * @returns {Promise<string>} Transaction hash
 * @throws {Error} If ticket format is invalid or transaction fails
 */
export async function buyTickets(
  network,
  walletClient,
  publicClient,
  contractAddress,
  tickets,
  totalCost
) {
  if (!walletClient?.account) {
    throw new Error("Wallet not connected");
  }

  const formattedTickets = tickets.map((ticket) => {
    if (!Array.isArray(ticket) || ticket.length !== 4) {
      throw new Error("Each ticket must be an array of 4 numbers");
    }
    return ticket.map((num) => BigInt(num));
  });

  if (network === "worldchain") {
    try {
      // Check token allowance for Permit2
      const allowance = await publicClient.readContract({
        address: WC_ER20_TOKEN,
        abi: [
          {
            inputs: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
            ],
            name: "allowance",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "allowance",
        args: [walletClient.account.address, PERMIT2_ADDRESS],
      });

      // Approve Permit2 if needed
      if (allowance < totalCost) {
        const hash = await walletClient.writeContract({
          address: WC_ER20_TOKEN,
          abi: [
            {
              inputs: [
                { name: "spender", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              name: "approve",
              outputs: [{ name: "", type: "bool" }],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "approve",
          args: [PERMIT2_ADDRESS, maxUint256],
        });

        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Generate Permit2 signature
      const chainId = await publicClient.getChainId();
      const nonce = BigInt(Math.floor(Math.random() * 1000000));

      const permit = {
        permitted: {
          token: WC_ER20_TOKEN,
          amount: totalCost,
        },
        spender: contractAddress,
        nonce,
        deadline: maxUint256,
      };

      const { domain, types, values } = SignatureTransfer.getPermitData(
        permit,
        PERMIT2_ADDRESS,
        chainId
      );

      const signature = await walletClient.account.signTypedData({
        domain: {
          name: domain.name,
          version: domain.version,
          chainId: chainId,
          verifyingContract: domain.verifyingContract,
        },
        types,
        primaryType: "PermitTransferFrom",
        message: values,
      });

      // Buy tickets with permit
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: [
          {
            type: "function",
            name: "buyTickets",
            inputs: [
              {
                name: "tickets",
                type: "uint256[4][]",
                internalType: "uint256[4][]",
              },
              {
                name: "permit",
                type: "tuple",
                internalType: "struct IPermit2.PermitTransferFrom",
                components: [
                  {
                    name: "permitted",
                    type: "tuple",
                    internalType: "struct IPermit2.TokenPermissions",
                    components: [
                      {
                        name: "token",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "amount",
                        type: "uint256",
                        internalType: "uint256",
                      },
                    ],
                  },
                  {
                    name: "nonce",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "deadline",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
            ],
            outputs: [],
            stateMutability: "payable",
          },
        ],
        functionName: "buyTickets",
        args: [formattedTickets, permit, signature],
      });

      return hash;
    } catch (error) {
      throw new Error(`Failed to buy tickets: ${error.message}`);
    }
  } else {
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "buyTickets",
        args: [formattedTickets],
        value: totalCost,
      });

      return hash;
    } catch (error) {
      throw new Error(`Failed to buy tickets: ${error.message}`);
    }
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
    randomValue: result.randomSeed,
    payouts: result.payouts,
  };
}

/**
 * Get user's winnings for a specific game
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @param {string} userAddress - User's world chain address
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
 * @param {string} contractAddress - Contract address
 * @param {string} witnetFee - The Witnet randomness fee
 * @returns {Promise<string>} Transaction hash
 */
export async function initiateDraw(walletClient, contractAddress, witnetFee) {
  try {
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "initiateDraw",
      value: parseEther(witnetFee),
    });
    return hash;
  } catch (error) {
    throw new Error(`Failed to initiate draw: ${error.message}`);
  }
}

/**
 * Complete draw for a game
 * @param {Object} walletClient - Viem wallet client instance
 * @param {Object} publicClient - Viem public client instance
 * @param {string} contractAddress - Contract address
 * @param {number} gameNumber - Game identifier
 * @returns {Promise<string>} Transaction hash
 */
export async function completeDraw(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber
) {
  try {
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "setRandomAndWinningNumbers",
      args: [BigInt(gameNumber)],
    });

    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (error) {
    throw new Error(`Failed to complete draw: ${error.message}`);
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
