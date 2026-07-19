"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text } from "@react-three/drei";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { pickRandom, range } from "@/lib/brain-gym/utils/shuffle";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { cn } from "@/lib/utils";
import { GAMES } from "@/data/brain-gym/registry";
import { usePausableScheduler } from "./_pausable-scheduler";

// Symbol types for visual search
const SYMBOLS = [
  { id: "circle", emoji: "⚪", color: "#4285f4" },
  { id: "square", emoji: "⬛", color: "#fbbc05" },
  { id: "triangle", emoji: "⬤", color: "#34a853" },
  { id: "diamond", emoji: "◆", color: "#ea4335" },
  { id: "star", emoji: "⭐", color: "#ffeb3b" },
  { id: "heart", emoji: "❤️", color: "#ff6b6b" },
  { id: "hexagon", emoji: "⬢", color: "#9c27b0" },
  { id: "cross", emoji: "✚", color: "#00bcd4" }
];

// 3D symbol components
function CircleSymbol({ position, color, selected, found }: {
  position: [number, number, number];
  color: string;
  selected: boolean;
  found: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </mesh>
      {selected && (
        <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      {found && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function SquareSymbol({ position, color, selected, found }: {
  position: [number, number, number];
  color: string;
  selected: boolean;
  found: boolean;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.1}>
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
      </RoundedBox>
      {selected && (
        <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      {found && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function TriangleSymbol({ position, color, selected, found }: {
  position: [number, number, number];
  color: string;
  selected: boolean;
  found: boolean;
}) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 4]}>
      <mesh>
        <coneGeometry args={[0.5, 0.8, 3]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
      </mesh>
      {selected && (
        <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <coneGeometry args={[0.7, 1.2, 3]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      {found && (
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.6, 1, 3]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function DiamondSymbol({ position, color, selected, found }: {
  position: [number, number, number];
  color: string;
  selected: boolean;
  found: boolean;
}) {
  return (
    <group position={position} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
      <mesh>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {selected && (
        <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <octahedronGeometry args={[0.6]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      {found && (
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.5]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function StarSymbol({ position, color, selected, found }: {
  position: [number, number, number];
  color: string;
  selected: boolean;
  found: boolean;
}) {
  return (
    <group position={position}>
      <group>
        <mesh rotation={[0, 0, Math.PI / 10]}>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 10]} position={[0, 0, 0.1]}>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      </group>
      {selected && (
        <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      {found && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function HeartSymbol({ position, color, selected, found }: {
  position: [number, number, number];
  color: string;
  selected: boolean;
  found: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <coneGeometry args={[0.3, 0.6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.25, -0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.3, 0.6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {selected && (
        <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      {found && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function HexagonSymbol({ position, color, selected, found }: {
  position: [number, number, number];
  color: string;
  selected: boolean;
  found: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 6]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      {selected && (
        <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <cylinderGeometry args={[0.6, 0.6, 0.15, 6]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      {found && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.12, 6]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function CrossSymbol({ position, color, selected, found }: {
  position: [number, number, number];
  color: string;
  selected: boolean;
  found: boolean;
}) {
  return (
    <group position={position}>
      <group>
        <RoundedBox args={[0.3, 0.8, 0.1]} radius={0.05}>
          <meshStandardMaterial color={color} />
        </RoundedBox>
        <RoundedBox args={[0.8, 0.3, 0.1]} radius={0.05}>
          <meshStandardMaterial color={color} />
        </RoundedBox>
      </group>
      {selected && (
        <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
      {found && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#4caf50" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

const SymbolComponents: Record<string, React.ComponentType<{ position: [number, number, number]; color: string; selected: boolean; found: boolean; }>> = {
  circle: CircleSymbol,
  square: SquareSymbol,
  triangle: TriangleSymbol,
  diamond: DiamondSymbol,
  star: StarSymbol,
  heart: HeartSymbol,
  hexagon: HexagonSymbol,
  cross: CrossSymbol
};

// Main 3D scene for visual search
function VisualSearchScene({
  grid,
  selectedPosition,
  foundPositions,
  onSelect,
  disabled,
  hintActiveCell
}: {
  grid: Array<{ symbol: string; color: string }>;
  selectedPosition: [number, number] | null;
  foundPositions: Set<string>;
  onSelect: (row: number, col: number) => void;
  disabled: boolean;
  hintActiveCell: number | null;
}) {
  const gridSize = Math.sqrt(grid.length);
  // Fit board snugly inside the popup canvas
  const spacing = gridSize <= 4 ? 1.7 : gridSize === 5 ? 1.45 : 1.25;
  const pieceScale = gridSize <= 4 ? 1.25 : gridSize === 5 ? 1.1 : 1.0;
  
  return (
    <group>
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 14, 6]} intensity={1.5} castShadow />
      <directionalLight position={[-6, 5, -4]} intensity={0.55} />
      <pointLight position={[0, 5, 0]} intensity={0.35} color="#7dd3fc" />
      
      {grid.map((cell, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const position: [number, number, number] = [
          (col - (gridSize - 1) / 2) * spacing,
          0,
          ((gridSize - 1) / 2 - row) * spacing
        ];
        const posKey = `${row},${col}`;
        const isSelected =
          selectedPosition !== null &&
          selectedPosition[0] === row &&
          selectedPosition[1] === col;
        const isFound = foundPositions.has(posKey);
        const isHintActive = hintActiveCell === index;
        
        const SymbolComponent = SymbolComponents[cell.symbol] || CircleSymbol;
        
        return (
          <group
            key={index}
            position={position}
            scale={[pieceScale, pieceScale, pieceScale]}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onSelect(row, col);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = disabled || isFound ? "default" : "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "default";
            }}
          >
            <SymbolComponent
              position={[0, 0, 0]}
              color={cell.color}
              selected={isSelected}
              found={isFound}
            />

            {isHintActive && (
              <mesh position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
                <sphereGeometry args={[0.78, 20, 20]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} wireframe />
              </mesh>
            )}
            
            {isFound && (
              <mesh position={[0, 0.95, 0]}>
                <Text
                  fontSize={0.36}
                  color="#86efac"
                  anchorX="center"
                  anchorY="middle"
                >
                  ✓
                </Text>
              </mesh>
            )}
          </group>
        );
      })}
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
        <circleGeometry args={[gridSize * spacing * 0.78, 64]} />
        <meshStandardMaterial color="#111827" transparent opacity={0.7} />
      </mesh>
      
      <OrbitControls
        enabled={!disabled}
        enableRotate={true}
        enableZoom={true}
        enablePan={false}
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </group>
  );
}

function VisualSearch3D({
  grid,
  selectedPosition,
  foundPositions,
  onSelect,
  disabled,
  hintActiveCell,
}: {
  grid: Array<{ symbol: string; color: string }>;
  selectedPosition: [number, number] | null;
  foundPositions: Set<string>;
  onSelect: (row: number, col: number) => void;
  disabled: boolean;
  hintActiveCell: number | null;
}) {
  return (
    <Canvas
      camera={{ position: [0, 5.5, 9.5], fov: 42, near: 0.1, far: 80 }}
      style={{ width: "100%", height: "100%" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#070b14"]} />
      <VisualSearchScene
        grid={grid}
        selectedPosition={selectedPosition}
        foundPositions={foundPositions}
        onSelect={onSelect}
        disabled={disabled}
        hintActiveCell={hintActiveCell}
      />
    </Canvas>
  );
}

export function VisualSearchGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
  restartKey,
}: GameComponentProps) {
  const gridSize = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const numTargets = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;
  const timeLimit = difficulty === "easy" ? 45000 : difficulty === "medium" ? 40000 : 35000;

  // Guarantees exactly numTargets targets are placed in the grid
  const [grid, targetSymbol] = useMemo(() => {
    // Pick target symbol
    const target = pickRandom(SYMBOLS);
    const targetId = target.id;
    
    const totalCells = gridSize * gridSize;
    // 1. Fill all cells with distractors (non-targets)
    const cells = range(totalCells).map(() => {
      const distractor = pickRandom(SYMBOLS.filter(s => s.id !== targetId)).id;
      const symbolObj = SYMBOLS.find(s => s.id === distractor) || SYMBOLS[0];
      return {
        symbol: distractor,
        color: symbolObj.color
      };
    });
    
    // 2. Select exactly numTargets distinct cells and set them to targetId
    const targetIndices: number[] = [];
    while (targetIndices.length < numTargets) {
      const randIdx = Math.floor(Math.random() * totalCells);
      if (!targetIndices.includes(randIdx)) {
        targetIndices.push(randIdx);
      }
    }
    
    for (const idx of targetIndices) {
      const targetObj = SYMBOLS.find(s => s.id === targetId) || SYMBOLS[0];
      cells[idx] = {
        symbol: targetId,
        color: targetObj.color
      };
    }
    
    return [cells, targetId];
  }, [gridSize, numTargets]);

  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [foundPositions, setFoundPositions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [internalScore, setInternalScore] = useState(0);
  const lives = useMemo(() => {
    const gameMeta = GAMES.find(g => g.id === "visual-search");
    return gameMeta?.maxLives ?? 3;
  }, []);
  const [internalLives, setInternalLives] = useState(lives);
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  // Hint states
  const [hintActiveCell, setHintActiveCell] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Sync score with parent
  useEffect(() => {
    onScoreChange?.(internalScore);
  }, [internalScore, onScoreChange]);

  // Sync lives with parent
  useEffect(() => {
    onLivesChange?.(internalLives);
  }, [internalLives, onLivesChange]);

  // Reset game when restartKey changes
  useEffect(() => {
    setSelectedPosition(null);
    setFoundPositions(new Set());
    setTimeLeft(timeLimit);
    setInternalScore(0);
    setInternalLives(lives);
    setHintActiveCell(null);
    setHintsUsed(0);
    completedRef.current = false;
  }, [restartKey, timeLimit, lives]);

  // Reset active hint on select or timer changes
  useEffect(() => {
    setHintActiveCell(null);
  }, [foundPositions]);

  useEffect(() => {
    // Timer countdown
    const timer = setInterval(() => {
      if (paused) return;
      setTimeLeft(prev => {
        if (prev <= 100 && !completedRef.current) {
          clearInterval(timer);
          completedRef.current = true;
          onComplete({
            score: foundPositions.size * 50,
            won: foundPositions.size >= numTargets,
            timeMs: timeLimit,
            difficulty
          });
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [timeLimit, foundPositions, numTargets, difficulty, onComplete, paused]);

  useEffect(() => {
    // Check win condition
    if (foundPositions.size >= numTargets && !completedRef.current) {
      completedRef.current = true;
      const timeMs = Math.max(0, timeLimit - timeLeft);
      const score = Math.max(
        100,
        Math.round(
          (numTargets * 100 + timeLeft / 10) * difficultyMultiplier(difficulty)
        )
      );
      setInternalScore(score);
      onComplete({ score, won: true, timeMs, difficulty });
    }
    
    // Check lose condition
    else if (internalLives <= 0 && !completedRef.current) {
      completedRef.current = true;
      const timeMs = Math.max(0, timeLimit - timeLeft);
      const score = foundPositions.size * 50;
      setInternalScore(score);
      onComplete({ score, won: false, timeMs, difficulty });
    }
  }, [foundPositions, numTargets, internalLives, timeLimit, timeLeft, difficulty, onComplete]);

  const handleSelect = (row: number, col: number) => {
    if (
      paused ||
      completedRef.current ||
      selectedPosition !== null ||
      timeLeft <= 0 ||
      internalLives <= 0
    ) {
      return;
    }
    
    const posKey = `${row},${col}`;
    if (foundPositions.has(posKey)) return;

    const cell = grid[row * gridSize + col];
    
    sfx.tap(soundEnabled);
    setSelectedPosition([row, col]);
    
    schedule(() => {
      if (cell.symbol === targetSymbol) {
        // Found a target
        sfx.correct(soundEnabled);
        setFoundPositions(prev => new Set(prev).add(posKey));
      } else {
        // Wrong selection
        sfx.wrong(soundEnabled);
        setInternalLives(prev => prev - 1);
      }
      setSelectedPosition(null);
    }, 500);
  };

  const handleHint = () => {
    if (
      paused ||
      completedRef.current ||
      timeLeft <= 0 ||
      internalLives <= 0 ||
      hintsUsed >= 2 ||
      hintActiveCell !== null
    ) {
      return;
    }
    
    const unfoundIndices: number[] = [];
    for (let i = 0; i < grid.length; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const posKey = `${row},${col}`;
      if (grid[i].symbol === targetSymbol && !foundPositions.has(posKey)) {
        unfoundIndices.push(i);
      }
    }
    
    if (unfoundIndices.length > 0) {
      const hintIdx = pickRandom(unfoundIndices);
      setHintActiveCell(hintIdx);
      setHintsUsed(prev => prev + 1);
      sfx.tap(soundEnabled);
      
      // Auto clear hint highlight after 3 seconds
      schedule(() => {
        setHintActiveCell(null);
      }, 3000);
    }
  };

  const targetMeta = SYMBOLS.find((s) => s.id === targetSymbol) ?? SYMBOLS[0]!;
  const foundCount = foundPositions.size;
  const hintsLeft = Math.max(0, 2 - hintsUsed);
  const canHint =
    !paused &&
    timeLeft > 0 &&
    internalLives > 0 &&
    hintsLeft > 0 &&
    hintActiveCell === null &&
    foundCount < numTargets;

  return (
    <GameBoard>
      <StatusLine>
        Find: {targetMeta.emoji} {targetMeta.id} · {foundCount}/{numTargets} · Time:{" "}
        {(timeLeft / 1000).toFixed(1)}s
      </StatusLine>

      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5"
          style={{
            borderColor: `${targetMeta.color}55`,
            background: `linear-gradient(135deg, ${targetMeta.color}22, transparent)`,
          }}
        >
          <span className="text-lg leading-none" aria-hidden>
            {targetMeta.emoji}
          </span>
          <span className="text-xs font-display font-bold capitalize text-white">
            Find {targetMeta.id}
          </span>
        </div>

        <button
          type="button"
          onClick={handleHint}
          disabled={!canHint}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-display font-bold transition-all",
            canHint
              ? "border-amber-400/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 active:scale-95"
              : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-dim)] opacity-50 cursor-not-allowed",
          )}
          aria-label={`Use hint, ${hintsLeft} remaining`}
        >
          <span aria-hidden>💡</span>
          <span className="font-mono">{hintsLeft}</span>
        </button>
      </div>

      <div className="relative w-full h-[300px] sm:h-[360px] mb-2 rounded-2xl overflow-hidden border border-[var(--line)] bg-[#070b14]">
        <VisualSearch3D
          grid={grid}
          selectedPosition={selectedPosition}
          foundPositions={foundPositions}
          onSelect={handleSelect}
          disabled={paused || timeLeft <= 0 || internalLives <= 0}
          hintActiveCell={hintActiveCell}
        />
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-mono tracking-wide text-white/55">
          Swipe to orbit · Tap to collect
        </div>
      </div>

      <div className="flex gap-1 px-1">
        {range(numTargets).map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < foundCount ? "bg-teal" : "bg-white/10",
            )}
          />
        ))}
      </div>
    </GameBoard>
  );
}