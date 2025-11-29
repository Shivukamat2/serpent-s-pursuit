import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SnakeGame } from "@/components/SnakeGame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Wallet, User, Coins } from "lucide-react";

const Game = () => {
  const navigate = useNavigate();
  const { username, walletAddress, totalCoins, addCoins } = useAuth();

  useEffect(() => {
    if (!username || !walletAddress) {
      navigate("/profile");
    }
  }, [username, walletAddress, navigate]);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!username || !walletAddress) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="flex gap-4">
            <Card className="px-4 py-2 flex items-center gap-2 bg-card/80 backdrop-blur-sm">
              <User className="w-4 h-4 text-primary" />
              <span className="font-semibold">{username}</span>
            </Card>

            <Card className="px-4 py-2 flex items-center gap-2 bg-card/80 backdrop-blur-sm">
              <Wallet className="w-4 h-4 text-secondary" />
              <span className="font-mono text-sm">{shortenAddress(walletAddress)}</span>
            </Card>

            <Card className="px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-accent/20 to-accent/10">
              <Coins className="w-4 h-4 text-accent" />
              <span className="font-bold">{totalCoins}</span>
              <span className="text-xs text-muted-foreground">total</span>
            </Card>
          </div>
        </div>

        {/* Game Container */}
        <div className="flex justify-center">
          <Card className="p-8 bg-card/80 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Serpent's Pursuit</h1>
                <p className="text-muted-foreground">
                  Use <kbd className="px-2 py-1 bg-muted rounded">W</kbd>
                  <kbd className="px-2 py-1 bg-muted rounded ml-1">A</kbd>
                  <kbd className="px-2 py-1 bg-muted rounded ml-1">S</kbd>
                  <kbd className="px-2 py-1 bg-muted rounded ml-1">D</kbd> to control
                </p>
              </div>

              <SnakeGame
                onCoinCollected={(coinsThisRun) => {
                  addCoins(1);
                }}
                onGameOver={(totalCoinsThisRun) => {
                  // Coins already added during collection
                }}
              />

              <div className="pt-4 border-t text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Every coin you collect is automatically added to your wallet balance
                </p>
                <div className="flex items-center justify-center gap-2 text-accent">
                  <Coins className="w-5 h-5" />
                  <span className="text-2xl font-bold">{totalCoins}</span>
                  <span className="text-muted-foreground">coins mined</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="p-6 max-w-2xl mx-auto bg-card/80 backdrop-blur-sm">
          <h3 className="font-semibold mb-3">How to Play:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Control the snake using WASD keys</li>
            <li>• Collect golden coins to grow longer and earn rewards</li>
            <li>• Avoid hitting walls and your own body</li>
            <li>• Speed increases as you collect more coins</li>
            <li>• All coins are tracked to your connected wallet</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Game;
