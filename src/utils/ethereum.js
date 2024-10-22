import {
  createPublicClient as viemCreatePublicClient,
  createWalletClient as viemCreateWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, sepolia, localhost } from "viem/chains";

export function createPublicClient(config) {
  const chain = getChain(config.network);
  return viemCreatePublicClient({
    chain,
    transport: http(config.rpcUrl),
  });
}

export function createWalletClient(config) {
  const chain = getChain(config.network);
  const account = privateKeyToAccount(config.privateKey);
  return viemCreateWalletClient({
    account,
    chain,
    transport: http(config.rpcUrl),
  });
}

function getChain(network) {
  switch (network) {
    case "mainnet":
      return mainnet;
    case "sepolia":
      return sepolia;
    case "anvil":
      return {
        id: 31337,
        name: "Anvil",
        network: "anvil",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      };
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}
