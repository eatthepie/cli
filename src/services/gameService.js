import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractABIPath = path.join(__dirname, "..", "..", "abi.json");
const contractABI = JSON.parse(fs.readFileSync(contractABIPath, "utf8"));

export async function getTicketPrice(publicClient, contractAddress) {
  const price = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "ticketPrice",
  });

  return price;
}

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

export async function buyTickets(
  walletClient,
  publicClient,
  contractAddress,
  tickets,
  totalCost
) {
  // Prepare the tickets array in the correct format
  // Each ticket should be an array of 4 numbers
  const formattedTickets = tickets.map((ticket) => {
    if (!Array.isArray(ticket) || ticket.length !== 4) {
      throw new Error("Each ticket must be an array of 4 numbers");
    }
    return ticket.map((num) => BigInt(num));
  });

  try {
    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "buyTickets",
      args: [formattedTickets],
      account: walletClient.account,
      value: totalCost,
    });

    // If simulation succeeds, proceed with the actual transaction
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt.transactionHash;
  } catch (error) {
    // If simulation fails, throw the error with more context
    throw new Error(`Failed to buy tickets: ${error.message}`);
  }
}

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
    winningNumbers: result.winningNumbers,
    difficulty: result.difficulty,
    drawInitiatedBlock: result.drawInitiatedBlock,
    randaoBlock: result.randaoBlock,
    randaoValue: result.randaoValue,
    payouts: result.payouts,
  };
}

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

export async function getTicketHistory(
  publicClient,
  contractAddress,
  gameNumber,
  walletAddress
) {
  const gameStartBlock = await publicClient.readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "gameStartBlock",
    args: [BigInt(gameNumber)],
  });

  let endBlock;
  try {
    const nextGameStartBlock = await publicClient.readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "gameStartBlock",
      args: [BigInt(gameNumber + 1)],
    });
    endBlock = nextGameStartBlock;
  } catch {
    endBlock = await publicClient.getBlockNumber();
  }

  const events = await publicClient.getLogs({
    address: contractAddress,
    event: {
      type: "event",
      name: "TicketPurchased",
      inputs: [
        {
          name: "player",
          type: "address",
          indexed: true,
          internalType: "address",
        },
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
    },
    args: {
      player: walletAddress,
      gameNumber: BigInt(gameNumber),
    },
    fromBlock: gameStartBlock,
    toBlock: endBlock,
  });

  return events;
}

export async function claimPrize(walletClient, contractAddress, gameNumber) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "claimPrize",
    args: [gameNumber],
  });

  return hash;
}

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

export async function initiateDraw(
  walletClient,
  publicClient,
  contractAddress
) {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "initiateDraw",
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function setRandao(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber
) {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "setRandom",
    args: [BigInt(gameNumber)],
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function submitVDFProof(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber,
  v,
  y
) {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "submitVDFProof",
    args: [BigInt(gameNumber), v, y],
  });

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.transactionHash;
}

export async function verifyPastGameVDF(
  publicClient,
  contractAddress,
  gameNumber,
  v,
  y
) {
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
}

export async function calculatePayouts(
  walletClient,
  publicClient,
  contractAddress,
  gameNumber
) {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "calculatePayouts",
    args: [BigInt(gameNumber)],
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function changeDifficulty(
  walletClient,
  publicClient,
  contractAddress
) {
  const { request } = await publicClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "changeDifficulty",
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}
