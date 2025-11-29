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
      const key = `snakeCoins:${walletAddress}`;
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
    localStorage.removeItem("snakeWallet");
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
      localStorage.setItem("snakeWallet", address);

      // Store username -> wallet mapping
      if (username) {
        const mapping = JSON.parse(
          localStorage.getItem("snakeWalletMapping") || "{}"
        );
        mapping[address] = username;
        localStorage.setItem("snakeWalletMapping", JSON.stringify(mapping));
      }

      // Load coins for this wallet
      const key = `snakeCoins:${address}`;
      const stored = localStorage.getItem(key);
      setTotalCoins(stored ? parseInt(stored) : 0);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem("snakeWallet");
  };

  const addCoins = (amount: number) => {
    if (!walletAddress) return;

    const newTotal = totalCoins + amount;
    setTotalCoins(newTotal);

    const key = `snakeCoins:${walletAddress}`;
    localStorage.setItem(key, newTotal.toString());

    // Update leaderboard
    const leaderboard = JSON.parse(
      localStorage.getItem("snakeLeaderboard") || "[]"
    );
    
    const existingIndex = leaderboard.findIndex(
      (entry: any) => entry.wallet === walletAddress
    );

    if (existingIndex >= 0) {
      leaderboard[existingIndex].totalCoins = newTotal;
    } else {
      leaderboard.push({
        username: username || "Anonymous",
        wallet: walletAddress,
        totalCoins: newTotal,
      });
    }

    leaderboard.sort((a: any, b: any) => b.totalCoins - a.totalCoins);
    localStorage.setItem("snakeLeaderboard", JSON.stringify(leaderboard));
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
