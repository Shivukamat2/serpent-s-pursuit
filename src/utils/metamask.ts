// MetaMask Token Utilities
import {
  SNAKECOIN_ADDRESS,
  SNAKECOIN_SYMBOL,
  SNAKECOIN_DECIMALS,
  SNAKECOIN_CHAIN_ID,
  isTokenConfigured,
} from "@/lib/tokenConfig";

/**
 * Add SnakeCoin token to MetaMask wallet
 * This will allow users to see their SNAKE tokens in MetaMask once the ERC-20 contract is deployed
 */
export async function addSnakeCoinToMetaMask() {
  if (!window.ethereum) {
    console.warn("MetaMask is not installed");
    return false;
  }

  if (!isTokenConfigured()) {
    console.error("SnakeCoin contract address not configured");
    return false;
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: SNAKECOIN_ADDRESS,
          symbol: SNAKECOIN_SYMBOL,
          decimals: SNAKECOIN_DECIMALS,
        },
      } as any,
    });

    if (wasAdded) {
      console.log("SnakeCoin token added to MetaMask");
      return true;
    } else {
      console.log("User declined to add token");
      return false;
    }
  } catch (error) {
    console.error("Failed to add token to MetaMask:", error);
    return false;
  }
}

/**
 * Check if the token contract is properly configured
 */
export function isTokenContractConfigured(): boolean {
  return isTokenConfigured();
}

/**
 * Get the expected chain ID for SnakeCoin (Sepolia testnet)
 */
export function getSnakeCoinChainId(): number {
  return SNAKECOIN_CHAIN_ID;
}

/**
 * Check if the user is on the correct network for SnakeCoin
 */
export async function isOnCorrectNetwork(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const currentChainId = parseInt(chainId as string, 16);
    return currentChainId === SNAKECOIN_CHAIN_ID;
  } catch (error) {
    console.error("Failed to check network:", error);
    return false;
  }
}
