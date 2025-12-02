// MetaMask Token Utilities

// TODO: Replace with actual deployed token contract address
const TOKEN_ADDRESS: string = "<PUT_TOKEN_CONTRACT_ADDRESS_HERE>";
const TOKEN_SYMBOL = "SNAKE";
const TOKEN_DECIMALS = 18;

/**
 * Add SnakeCoin token to MetaMask wallet
 * This will allow users to see their SNAKE tokens in MetaMask once the ERC-20 contract is deployed
 */
export async function addSnakeCoinToMetaMask() {
  if (!window.ethereum) {
    console.warn("MetaMask is not installed");
    return false;
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: TOKEN_ADDRESS,
          symbol: TOKEN_SYMBOL,
          decimals: TOKEN_DECIMALS,
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
 * Check if the placeholder token address has been replaced with a real contract
 */
export function isTokenContractConfigured(): boolean {
  return TOKEN_ADDRESS !== "<PUT_TOKEN_CONTRACT_ADDRESS_HERE>" && 
         TOKEN_ADDRESS.length > 0 && 
         TOKEN_ADDRESS.indexOf("0x") === 0;
}
