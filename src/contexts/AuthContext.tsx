import { createContext, useContext, useState, useEffect, ReactNode } from "react";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

interface AuthContextType {
  username: string | null;
  walletAddress: string | null;
  totalCoins: number;
  login: (username: string) => void;
  logout: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  addCoins: (amount: number) => void;
  isMetaMaskInstalled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(() => 
    localStorage.getItem("snakeUsername")
  );
  const [walletAddress, setWalletAddress] = useState<string | null>(() =>
    localStorage.getItem("snakeWallet")
  );
  const [totalCoins, setTotalCoins] = useState(0);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    // Check MetaMask
    setIsMetaMaskInstalled(typeof window.ethereum !== "undefined");

    // Load total coins for current user
    if (username && walletAddress) {
      const key = `coins:${walletAddress}`;
      const stored = localStorage.getItem(key);
      setTotalCoins(stored ? parseInt(stored) : 0);
    }
  }, [username, walletAddress]);

  const login = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem("snakeUsername", newUsername);
  };

  const logout = () => {
    setUsername(null);
    setWalletAddress(null);
    localStorage.removeItem("snakeUsername");
    localStorage.removeItem("walletAddress");
    setTotalCoins(0);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      const address = accounts[0];
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);

      // Load coins for this wallet
      const key = `coins:${address}`;
      const stored = localStorage.getItem(key);
      setTotalCoins(stored ? parseInt(stored) : 0);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem("walletAddress");
  };

  const addCoins = (amount: number) => {
    if (!walletAddress) return;

    // Use coins:<wallet> key format as per requirements
    const key = `coins:${walletAddress}`;
    // Always read from localStorage to ensure accuracy
    const current = Number(localStorage.getItem(key) || "0");
    const newTotal = current + amount;
    
    setTotalCoins(newTotal);
    localStorage.setItem(key, newTotal.toString());

    // Update global players leaderboard
    const players = JSON.parse(
      localStorage.getItem("players") || "[]"
    );
    
    const existingIndex = players.findIndex(
      (entry: any) => entry.wallet === walletAddress
    );

    if (existingIndex >= 0) {
      // Update existing player record
      players[existingIndex].totalCoins = newTotal;
      players[existingIndex].username = username || "Anonymous";
    } else {
      // Add new player record
      players.push({
        username: username || "Anonymous",
        wallet: walletAddress,
        totalCoins: newTotal,
      });
    }

    // Sort by totalCoins descending
    players.sort((a: any, b: any) => b.totalCoins - a.totalCoins);
    localStorage.setItem("players", JSON.stringify(players));
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        walletAddress,
        totalCoins,
        login,
        logout,
        connectWallet,
        disconnectWallet,
        addCoins,
        isMetaMaskInstalled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
