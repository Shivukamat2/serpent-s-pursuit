// SnakeCoin ERC-20 Token Configuration
// Replace the address below with your deployed contract address from Remix

export const SNAKECOIN_ADDRESS: string = "0x4fA9756013aa72aA44217CE6047cA0644a081C76"; // Deployed SnakeCoin contract on Sepolia

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
