/**
 * Ethereum client configuration utilities
 * Handles creation of public and wallet clients for different networks
 */

import {
  createPublicClient as viemCreatePublicClient,
  createWalletClient as viemCreateWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, sepolia } from "viem/chains";

/**
 * Create a public client for reading from the blockchain
 * @param {Object} config - Client configuration
 * @param {string} config.network - Network name (mainnet, sepolia, or anvil)
 * @param {string} config.rpcUrl - RPC endpoint URL
 * @returns {PublicClient} Configured public client
 */
export function createPublicClient(config) {
  const chain = getChain(config.network);
  return viemCreatePublicClient({
    chain,
    transport: http(config.rpcUrl),
  });
}

/**
 * Create a wallet client for signing transactions
 * @param {Object} config - Client configuration
 * @param {string} config.network - Network name (mainnet, sepolia, or anvil)
 * @param {string} config.rpcUrl - RPC endpoint URL
 * @param {string} config.privateKey - Private key for signing
 * @returns {WalletClient} Configured wallet client
 */
export function createWalletClient(config) {
  const chain = getChain(config.network);
  const account = privateKeyToAccount(config.privateKey);
  return viemCreateWalletClient({
    account,
    chain,
    transport: http(config.rpcUrl),
  });
}

/**
 * Get chain configuration for specified network
 * @param {string} network - Network name
 * @returns {Chain} Chain configuration
 * @throws {Error} If network is unsupported
 */
function getChain(network) {
  const chains = {
    mainnet,
    sepolia,
    anvil: {
      id: 31337,
      name: "Anvil",
      network: "anvil",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
    },
  };

  const chain = chains[network];
  if (!chain) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return chain;
}
