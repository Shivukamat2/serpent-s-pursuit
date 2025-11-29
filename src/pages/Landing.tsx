import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Coins, Zap, Trophy } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="max-w-4xl w-full text-center relative z-10 space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative bg-gradient-to-br from-primary to-secondary p-6 rounded-3xl shadow-2xl">
              <svg
                className="w-20 h-20 text-white"
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
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Serpent's Pursuit
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Blockchain-Based Snake Game
          </p>
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-lg text-foreground/80">
            Experience the classic snake game reimagined with cutting-edge blockchain technology. 
            Every coin you collect is yours to track and compete with.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smooth Controls</h3>
              <p className="text-sm text-muted-foreground">
                WASD controls with buttery smooth movement
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <Coins className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Mining Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Collect coins that accumulate in your wallet
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <Trophy className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Compete Globally</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress on the leaderboard
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Button
            size="lg"
            className="text-lg px-12 py-6 rounded-2xl shadow-2xl hover:shadow-primary/50 transition-all bg-gradient-to-r from-primary to-secondary hover:scale-105"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-sm text-muted-foreground pt-8">
          Connect your MetaMask wallet to start mining coins
        </p>
      </div>
    </div>
  );
};

export default Landing;
