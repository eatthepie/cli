import { formatEther, parseEther } from "viem";
// import contractABI from "../../abi.json";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractABIPath = path.join(__dirname, "..", "..", "abi.json");
const contractABI = JSON.parse(fs.readFileSync(contractABIPath, "utf8"));

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
  userAddress
) {
  // This function is not directly available in the smart contract.
  // You might need to implement this by querying events or storing ticket data off-chain.
  // For now, we'll return a placeholder.
  console.log(
    "getTicketHistory: This function needs to be implemented based on your data storage strategy."
  );
  return [];
}

export async function claimPrize(walletClient, contractAddress, gameNumber) {
  const { request } = await walletClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "claimPrize",
    args: [BigInt(gameNumber)],
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function mintWinningNFT(
  walletClient,
  contractAddress,
  gameNumber
) {
  const { request } = await walletClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "mintWinningNFT",
    args: [BigInt(gameNumber)],
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function initiateDraw(walletClient, contractAddress) {
  const { request } = await walletClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "initiateDraw",
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function setRandom(walletClient, contractAddress, gameNumber) {
  const { request } = await walletClient.simulateContract({
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
  const { request } = await walletClient.simulateContract({
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
  contractAddress,
  gameNumber
) {
  const { request } = await walletClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "calculatePayouts",
    args: [BigInt(gameNumber)],
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}

export async function changeDifficulty(walletClient, contractAddress) {
  const { request } = await walletClient.simulateContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "changeDifficulty",
  });

  const hash = await walletClient.writeContract(request);
  return hash;
}
