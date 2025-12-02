// SnakeCoin ERC-20 Token Configuration
// Replace the address below with your deployed contract address from Remix

export const SNAKECOIN_ADDRESS: string = "PASTE_YOUR_FULL_CONTRACT_ADDRESS_HERE"; // Must be full 42-char 0x... address

export const SNAKECOIN_SYMBOL = "SNAKE";
export const SNAKECOIN_DECIMALS = 18;

// Sepolia testnet chain ID
export const SNAKECOIN_CHAIN_ID = 11155111;

/**
 * Check if the token contract address is properly configured
 */
export function isTokenConfigured(): boolean {
  return (
    SNAKECOIN_ADDRESS !== "PASTE_YOUR_FULL_CONTRACT_ADDRESS_HERE" &&
    SNAKECOIN_ADDRESS.startsWith("0x") &&
    SNAKECOIN_ADDRESS.length === 42
  );
}
