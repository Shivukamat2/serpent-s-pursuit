import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, Trophy, Play, LogOut, Coins, Plus, AlertCircle } from "lucide-react";
import { addSnakeCoinToMetaMask, isTokenContractConfigured, isOnCorrectNetwork } from "@/utils/metamask";
import { useToast } from "@/hooks/use-toast";
import { isTokenConfigured } from "@/lib/tokenConfig";

interface LeaderboardEntry {
  username: string;
  wallet: string;
  totalCoins: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    username,
    walletAddress,
    totalCoins,
    connectWallet,
    disconnectWallet,
    logout,
    isMetaMaskInstalled,
  } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [correctNetwork, setCorrectNetwork] = useState(true);

  useEffect(() => {
    if (!username) {
      navigate("/login");
      return;
    }

    // Load players leaderboard
    const stored = localStorage.getItem("players");
    if (stored) {
      const data = JSON.parse(stored);
      setLeaderboard(data.slice(0, 10)); // Top 10
    }

    // Check if on correct network
    const checkNetwork = async () => {
      const onCorrect = await isOnCorrectNetwork();
      setCorrectNetwork(onCorrect);
    };
    checkNetwork();
  }, [username, navigate, totalCoins]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleAddTokenToMetaMask = async () => {
    if (!isTokenConfigured()) {
      toast({
        title: "Token Not Deployed Yet",
        description: "The SnakeCoin ERC-20 contract hasn't been deployed. Please update the contract address in tokenConfig.ts",
        variant: "default",
      });
      return;
    }

    if (!correctNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch MetaMask to Sepolia testnet to add SnakeCoin.",
        variant: "destructive",
      });
      return;
    }

    const success = await addSnakeCoinToMetaMask();
    if (success) {
      toast({
        title: "Token Added!",
        description: "SnakeCoin has been added to your MetaMask wallet.",
      });
    } else {
      toast({
        title: "Failed to Add Token",
        description: "Could not add SnakeCoin to MetaMask. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {username}!</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Wallet Section */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Wallet Connection</h2>
              </div>
              {walletAddress ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Connected</p>
                  <p className="font-mono text-lg">{shortenAddress(walletAddress)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Coins className="w-5 h-5 text-accent" />
                    <span className="text-2xl font-bold">{totalCoins}</span>
                    <span className="text-muted-foreground">coins mined</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isMetaMaskInstalled
                    ? "Connect your wallet to start mining"
                    : "MetaMask not detected"}
                </p>
              )}
            </div>
            {isMetaMaskInstalled && (
              <div className="flex flex-col gap-2">
                {!walletAddress ? (
                  <Button
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={disconnectWallet}>
                      Disconnect
                    </Button>
                    {!isTokenConfigured() ? (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          disabled
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add SnakeCoin to MetaMask
                        </Button>
                        <p className="text-xs text-amber-600 dark:text-amber-400 text-center flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Token not configured yet
                        </p>
                      </>
                    ) : !correctNetwork ? (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={handleAddTokenToMetaMask}
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add SnakeCoin to MetaMask
                        </Button>
                        <p className="text-xs text-amber-600 dark:text-amber-400 text-center flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Switch to Sepolia testnet
                        </p>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={handleAddTokenToMetaMask}
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add SnakeCoin to MetaMask
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Add token to your wallet
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Game Card */}
        <Card className="p-8 hover:shadow-xl transition-all bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="inline-block p-3 bg-primary/10 rounded-xl">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold">Serpent's Pursuit</h2>
              <p className="text-muted-foreground max-w-md">
                Navigate your serpent through the digital realm, collecting mining-style coins.
                Use WASD controls, avoid walls, and watch your speed increase!
              </p>
              {!walletAddress && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Connect your wallet to start earning coins
                </p>
              )}
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/game")}
              className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all"
              disabled={!walletAddress}
            >
              <Play className="w-5 h-5 mr-2" />
              Play Now
            </Button>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.wallet}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    entry.wallet === walletAddress
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-amber-500 text-white"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                          ? "bg-amber-700 text-white"
                          : "bg-muted"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{entry.username}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {shortenAddress(entry.wallet)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-accent" />
                    <span className="text-xl font-bold">{entry.totalCoins}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No records yet. Be the first to play!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
