import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Position {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface SnakeGameProps {
  onCoinCollected?: (coinsThisRun: number) => void;
  onGameOver?: (totalCoinsThisRun: number) => void;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

export const SnakeGame = ({ onCoinCollected, onGameOver }: SnakeGameProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem("snakeBestScore") || "0");
  });
  const [totalCoins, setTotalCoins] = useState(() => {
    return parseInt(localStorage.getItem("snakeTotalCoins") || "0");
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const prevSnakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Position>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Position>({ x: 1, y: 0 });
  const coinRef = useRef<Position>({ x: 15, y: 10 });
  const speedRef = useRef(INITIAL_SPEED);
  const lastUpdateRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const tongueRef = useRef(0);
  const scoreRef = useRef(0);
  const interpolationRef = useRef(0);

  const spawnCoin = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cols = Math.floor(canvas.width / GRID_SIZE);
    const rows = Math.floor(canvas.height / GRID_SIZE);

    let newCoin: Position;
    let attempts = 0;
    do {
      newCoin = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
      attempts++;
    } while (
      attempts < 100 &&
      snakeRef.current.some((segment) => segment.x === newCoin.x && segment.y === newCoin.y)
    );

    coinRef.current = newCoin;
  };

  const createParticles = (x: number, y: number) => {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 2 + Math.random() * 2;
      particlesRef.current.push({
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE + GRID_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 20,
      });
    }
  };

  const drawSnake = (ctx: CanvasRenderingContext2D) => {
    const snake = snakeRef.current;
    const prevSnake = prevSnakeRef.current;
    const interpolation = interpolationRef.current;
    const direction = directionRef.current;
    
    snake.forEach((segment, index) => {
      const prevSegment = prevSnake[index] ?? segment;
      const x =
        (prevSegment.x + (segment.x - prevSegment.x) * interpolation) * GRID_SIZE;
      const y =
        (prevSegment.y + (segment.y - prevSegment.y) * interpolation) * GRID_SIZE;
      const size = GRID_SIZE;
      const isHead = index === 0;
      const isTail = index === snake.length - 1;

      // Realistic snake body with scales
      const bodyWidth = isTail ? size * 0.6 : isHead ? size * 0.85 : size * 0.8;
      const bodyHeight = bodyWidth;

      // Main body gradient - realistic green python colors
      const bodyGradient = ctx.createRadialGradient(
        x + size / 2 - 3,
        y + size / 2 - 3,
        0,
        x + size / 2,
        y + size / 2,
        bodyWidth / 2
      );
      
      if (isHead) {
        bodyGradient.addColorStop(0, "#3d5a3d");
        bodyGradient.addColorStop(0.4, "#2d4a2d");
        bodyGradient.addColorStop(1, "#1d3a1d");
      } else {
        const progress = index / snake.length;
        bodyGradient.addColorStop(0, `hsl(120, 30%, ${35 - progress * 8}%)`);
        bodyGradient.addColorStop(0.5, `hsl(120, 35%, ${28 - progress * 8}%)`);
        bodyGradient.addColorStop(1, `hsl(120, 30%, ${20 - progress * 8}%)`);
      }

      // Draw main body
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.ellipse(x + size / 2, y + size / 2, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Add shadow for depth
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw realistic scales pattern
      if (!isHead) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
        ctx.lineWidth = 1;
        
        // Horizontal scale lines
        for (let i = 0; i < 3; i++) {
          const scaleY = y + size / 4 + (i * size / 4);
          ctx.beginPath();
          ctx.moveTo(x + size * 0.2, scaleY);
          ctx.lineTo(x + size * 0.8, scaleY);
          ctx.stroke();
        }

        // Add scale texture with small dots
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            const dotX = x + size * 0.25 + (i * size * 0.17);
            const dotY = y + size * 0.25 + (j * size * 0.17);
            ctx.beginPath();
            ctx.arc(dotX, dotY, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Belly pattern - lighter scales
      const bellyGradient = ctx.createLinearGradient(
        x + size * 0.3,
        y + size / 2,
        x + size * 0.7,
        y + size / 2
      );
      bellyGradient.addColorStop(0, "rgba(180, 200, 160, 0)");
      bellyGradient.addColorStop(0.5, "rgba(180, 200, 160, 0.3)");
      bellyGradient.addColorStop(1, "rgba(180, 200, 160, 0)");
      
      ctx.fillStyle = bellyGradient;
      ctx.beginPath();
      ctx.ellipse(x + size / 2, y + size / 2, bodyWidth / 3, bodyHeight / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight for realistic shine
      const highlightGradient = ctx.createRadialGradient(
        x + size / 2 - 4,
        y + size / 2 - 4,
        0,
        x + size / 2 - 4,
        y + size / 2 - 4,
        bodyWidth / 3
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.ellipse(x + size / 2 - 3, y + size / 2 - 3, bodyWidth / 4, bodyHeight / 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw detailed head
      if (isHead) {
        // Head shape - more triangular and realistic
        ctx.fillStyle = "#3d5a3d";
        ctx.beginPath();
        
        if (direction.x > 0) {
          ctx.moveTo(x + size * 0.2, y + size * 0.3);
          ctx.lineTo(x + size * 0.9, y + size * 0.5);
          ctx.lineTo(x + size * 0.2, y + size * 0.7);
          ctx.closePath();
        } else if (direction.x < 0) {
          ctx.moveTo(x + size * 0.8, y + size * 0.3);
          ctx.lineTo(x + size * 0.1, y + size * 0.5);
          ctx.lineTo(x + size * 0.8, y + size * 0.7);
          ctx.closePath();
        } else if (direction.y > 0) {
          ctx.moveTo(x + size * 0.3, y + size * 0.2);
          ctx.lineTo(x + size * 0.5, y + size * 0.9);
          ctx.lineTo(x + size * 0.7, y + size * 0.2);
          ctx.closePath();
        } else {
          ctx.moveTo(x + size * 0.3, y + size * 0.8);
          ctx.lineTo(x + size * 0.5, y + size * 0.1);
          ctx.lineTo(x + size * 0.7, y + size * 0.8);
          ctx.closePath();
        }
        ctx.fill();

        // Realistic eyes - reptilian with slit pupils
        const eyePositions = direction.x !== 0
          ? [
              { x: x + size / 2, y: y + size * 0.35 },
              { x: x + size / 2, y: y + size * 0.65 }
            ]
          : [
              { x: x + size * 0.35, y: y + size / 2 },
              { x: x + size * 0.65, y: y + size / 2 }
            ];

        eyePositions.forEach((eyePos) => {
          // Eye socket shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.beginPath();
          ctx.arc(eyePos.x, eyePos.y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Eye white/iris - yellow-green
          const eyeGradient = ctx.createRadialGradient(
            eyePos.x,
            eyePos.y,
            0,
            eyePos.x,
            eyePos.y,
            3.5
          );
          eyeGradient.addColorStop(0, "#c4d600");
          eyeGradient.addColorStop(0.6, "#9ab000");
          eyeGradient.addColorStop(1, "#708000");
          ctx.fillStyle = eyeGradient;
          ctx.beginPath();
          ctx.arc(eyePos.x, eyePos.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Vertical slit pupil (reptilian)
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          if (direction.x !== 0) {
            ctx.ellipse(eyePos.x, eyePos.y, 0.8, 3, 0, 0, Math.PI * 2);
          } else {
            ctx.ellipse(eyePos.x, eyePos.y, 3, 0.8, 0, 0, Math.PI * 2);
          }
          ctx.fill();

          // Eye shine
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.beginPath();
          ctx.arc(eyePos.x - 1, eyePos.y - 1, 1, 0, Math.PI * 2);
          ctx.fill();
        });

        // Realistic forked tongue
        tongueRef.current = (tongueRef.current + 0.08) % (Math.PI * 2);
        const tongueLength = 10 + Math.sin(tongueRef.current) * 3;
        
        const tongueStartX = x + size / 2 + direction.x * size / 2;
        const tongueStartY = y + size / 2 + direction.y * size / 2;
        const tongueEndX = tongueStartX + direction.x * tongueLength;
        const tongueEndY = tongueStartY + direction.y * tongueLength;
        
        // Tongue shadow
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tongueStartX + 1, tongueStartY + 1);
        ctx.lineTo(tongueEndX + 1, tongueEndY + 1);
        ctx.stroke();

        // Main tongue - red with gradient
        const tongueGradient = ctx.createLinearGradient(
          tongueStartX,
          tongueStartY,
          tongueEndX,
          tongueEndY
        );
        tongueGradient.addColorStop(0, "#dc2626");
        tongueGradient.addColorStop(1, "#b91c1c");
        ctx.strokeStyle = tongueGradient;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tongueStartX, tongueStartY);
        ctx.lineTo(tongueEndX, tongueEndY);
        ctx.stroke();

        // Forked tip
        const forkLength = 4;
        const forkAngle = Math.PI / 5;
        
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tongueEndX, tongueEndY);
        if (direction.x !== 0) {
          ctx.lineTo(tongueEndX + direction.x * 2, tongueEndY - forkLength);
          ctx.moveTo(tongueEndX, tongueEndY);
          ctx.lineTo(tongueEndX + direction.x * 2, tongueEndY + forkLength);
        } else {
          ctx.lineTo(tongueEndX - forkLength, tongueEndY + direction.y * 2);
          ctx.moveTo(tongueEndX, tongueEndY);
          ctx.lineTo(tongueEndX + forkLength, tongueEndY + direction.y * 2);
        }
        ctx.stroke();
      }
    });
  };

  const drawCoin = (ctx: CanvasRenderingContext2D) => {
    const x = coinRef.current.x * GRID_SIZE;
    const y = coinRef.current.y * GRID_SIZE;
    const size = GRID_SIZE;
    const time = Date.now() / 1000;

    // Animated glow
    const glowSize = size / 2 + Math.sin(time * 3) * 3;
    const glowGradient = ctx.createRadialGradient(
      x + size / 2,
      y + size / 2,
      0,
      x + size / 2,
      y + size / 2,
      glowSize
    );
    glowGradient.addColorStop(0, "hsla(45, 93%, 70%, 0.4)");
    glowGradient.addColorStop(1, "hsla(45, 93%, 70%, 0)");
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Coin body
    const gradient = ctx.createRadialGradient(
      x + size / 2 - 2,
      y + size / 2 - 2,
      0,
      x + size / 2,
      y + size / 2,
      size / 2
    );
    gradient.addColorStop(0, "hsl(45, 93%, 60%)");
    gradient.addColorStop(0.6, "hsl(45, 93%, 47%)");
    gradient.addColorStop(1, "hsl(45, 93%, 40%)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Coin shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(x + size / 2 - 2, y + size / 2 - 2, size / 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;
      particle.vy += 0.1; // Gravity

      const alpha = 1 - particle.life / particle.maxLife;
      if (alpha <= 0) return false;

      ctx.fillStyle = `hsla(45, 93%, 60%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fill();

      return true;
    });
  };

  const gameLoop = (timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || gameOver || !gameStarted) return;

    const deltaTime = timestamp - lastUpdateRef.current;
    
    // Update interpolation for smooth movement
    interpolationRef.current = Math.min(1, deltaTime / speedRef.current);

    if (deltaTime >= speedRef.current) {
      lastUpdateRef.current = timestamp;
      interpolationRef.current = 0;

      // Store previous snake positions for interpolation
      prevSnakeRef.current = snakeRef.current.map((segment) => ({ ...segment }));

      // Update direction
      directionRef.current = nextDirectionRef.current;

      const head = snakeRef.current[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      const cols = Math.floor(canvas.width / GRID_SIZE);
      const rows = Math.floor(canvas.height / GRID_SIZE);

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
        setGameOver(true);
        if (onGameOver) {
          onGameOver(scoreRef.current);
        }
        return;
      }

      // Check self collision
      if (snakeRef.current.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        if (onGameOver) {
          onGameOver(scoreRef.current);
        }
        return;
      }

      snakeRef.current.unshift(newHead);

      // Check coin collision
      if (newHead.x === coinRef.current.x && newHead.y === coinRef.current.y) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        
        const newTotal = totalCoins + 1;
        setTotalCoins(newTotal);
        localStorage.setItem("snakeTotalCoins", newTotal.toString());

        if (scoreRef.current > bestScore) {
          setBestScore(scoreRef.current);
          localStorage.setItem("snakeBestScore", scoreRef.current.toString());
        }

        createParticles(coinRef.current.x, coinRef.current.y);
        spawnCoin();
        
        // Increase speed
        speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREMENT);

        // Notify parent component
        if (onCoinCollected) {
          onCoinCollected(scoreRef.current);
        }
      } else {
        snakeRef.current.pop();
      }
    }

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCoin(ctx);
    drawSnake(ctx);
    drawParticles(ctx);

    requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    prevSnakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    speedRef.current = INITIAL_SPEED;
    particlesRef.current = [];
    interpolationRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    spawnCoin();
    lastUpdateRef.current = performance.now();
    requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      const key = e.key.toLowerCase();
      const current = directionRef.current;

      switch (key) {
        case "w":
          if (current.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case "s":
          if (current.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case "a":
          if (current.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case "d":
          if (current.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      requestAnimationFrame(gameLoop);
    }
  }, [gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-6">
      <div className="flex gap-4 flex-wrap justify-center">
        <div className="backdrop-blur-sm bg-card/80 rounded-2xl px-6 py-3 shadow-lg border border-border/50">
          <div className="text-sm text-muted-foreground">Score</div>
          <div className="text-3xl font-bold text-foreground">{score}</div>
        </div>
        <div className="backdrop-blur-sm bg-card/80 rounded-2xl px-6 py-3 shadow-lg border border-border/50">
          <div className="text-sm text-muted-foreground">Best</div>
          <div className="text-3xl font-bold text-primary">{bestScore}</div>
        </div>
        <div className="backdrop-blur-sm bg-card/80 rounded-2xl px-6 py-3 shadow-lg border border-border/50">
          <div className="text-sm text-muted-foreground">Total Coins</div>
          <div className="text-3xl font-bold text-accent">{totalCoins}</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="border-2 border-border rounded-2xl shadow-2xl bg-white"
        />

        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl">
            <div className="text-center space-y-6">
              <h1 className="text-5xl font-bold text-foreground">Snake Game</h1>
              <p className="text-muted-foreground text-lg">Use WASD to move</p>
              <Button onClick={startGame} size="lg" className="text-lg px-8 py-6">
                Start Game
              </Button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/95 backdrop-blur-sm rounded-2xl">
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-bold text-destructive-foreground">Game Over!</h2>
              <p className="text-destructive-foreground text-2xl">Score: {score}</p>
              {score === bestScore && score > 0 && (
                <p className="text-destructive-foreground text-lg font-semibold">🎉 New Best Score! 🎉</p>
              )}
              <Button onClick={startGame} size="lg" className="text-lg px-8 py-6">
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-muted-foreground text-sm">
        <p>Press <kbd className="px-2 py-1 bg-muted rounded">W</kbd> <kbd className="px-2 py-1 bg-muted rounded">A</kbd> <kbd className="px-2 py-1 bg-muted rounded">S</kbd> <kbd className="px-2 py-1 bg-muted rounded">D</kbd> to control the snake</p>
      </div>
    </div>
  );
};