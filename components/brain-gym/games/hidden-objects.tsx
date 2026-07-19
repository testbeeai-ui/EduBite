"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { shuffle, pickRandom, range } from "@/lib/brain-gym/utils/shuffle";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HelpCircle, Timer, Star } from "lucide-react";
import { usePausableScheduler } from "./_pausable-scheduler";

// Object types and their emoji representations
const OBJECT_TYPES = [
  { id: "key", name: "Key", emoji: "🔑", color: "#ffd700" },
  { id: "heart", name: "Heart", emoji: "❤️", color: "#ff6b6b" },
  { id: "star", name: "Star", emoji: "⭐", color: "#ffeb3b" },
  { id: "diamond", name: "Diamond", emoji: "💎", color: "#00bcd4" },
  { id: "clock", name: "Clock", emoji: "⏰", color: "#9e9e9e" },
  { id: "book", name: "Book", emoji: "📚", color: "#8d6e63" },
  { id: "lightbulb", name: "Lightbulb", emoji: "💡", color: "#fff176" },
  { id: "gift", name: "Gift", emoji: "🎁", color: "#ff5252" },
  { id: "apple", name: "Apple", emoji: "🍎", color: "#ef4444" },
  { id: "moon", name: "Moon", emoji: "🌙", color: "#f8fafc" },
  { id: "umbrella", name: "Umbrella", emoji: "☂️", color: "#8b5cf6" },
  { id: "camera", name: "Camera", emoji: "📷", color: "#94a3b8" },
  { id: "bell", name: "Bell", emoji: "🔔", color: "#f59e0b" },
  { id: "music", name: "Music", emoji: "🎵", color: "#ec4899" },
  { id: "puzzle", name: "Puzzle", emoji: "🧩", color: "#22c55e" },
  { id: "magnifier", name: "Magnifier", emoji: "🔍", color: "#38bdf8" }
];

// Scene for hidden objects game
function HiddenObjectsScene({
  sceneObjects,
  selectedObjects,
  onSelect,
  disabled,
  hintActiveCell
}: {
  sceneObjects: Array<{
    type: string;
    name: string;
    emoji: string;
    color: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    isTarget: boolean;
    found: boolean;
  }>;
  selectedObjects: Set<number>;
  onSelect: (objectId: string, index: number) => void;
  disabled: boolean;
  hintActiveCell: number | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Subtle slow rotation of the whole world
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0006;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 8]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 8, -5]} intensity={0.6} />
      <pointLight position={[0, 12, 0]} intensity={0.4} />
      
      {/* Floating environment ring grid */}
      <gridHelper args={[40, 40, "#1e293b", "#0f172a"]} position={[0, -2, 0]} />
      
      {/* Scene objects represented as Billboard Emojis */}
      {sceneObjects.map((obj, index) => {
        const isFound = obj.found;
        const isSelected = selectedObjects.has(index);
        const isHinted = index === hintActiveCell;
        
        // Target indicators: Hinted is double scaled, Found is dimmed
        const scaleFactor = isHinted ? 2.5 : isFound ? 0.75 : 1.4;

        return (
          <group
            key={index}
            position={obj.position}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onSelect(obj.type, index);
            }}
          >
            {/* Billboard emoji (always faces the player camera) */}
            <Billboard scale={[scaleFactor, scaleFactor, scaleFactor]}>
              
              {/* Pulsing Hint yellow ring */}
              {isHinted && (
                <mesh position={[0, 0, -0.05]}>
                  <ringGeometry args={[0.6, 0.75, 32]} />
                  <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
                </mesh>
              )}

              {/* Selection pulse halo */}
              {isSelected && (
                <mesh position={[0, 0, -0.08]}>
                  <ringGeometry args={[0.55, 0.85, 32]} />
                  <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.6} />
                </mesh>
              )}

              {/* Actual Emoji Text */}
              <Text
                fontSize={0.65}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                // Fade out found items so they don't crowd the screen
                fillOpacity={isFound ? 0.25 : 1.0}
              >
                {obj.emoji}
              </Text>
            </Billboard>
            
            {/* Found Green Check Badge */}
            {isFound && (
              <Billboard position={[0, 0.55, 0.1]} scale={[0.45, 0.45, 0.45]}>
                <mesh>
                  <circleGeometry args={[0.35, 32]} />
                  <meshBasicMaterial color="#10b981" />
                </mesh>
                <Text
                  fontSize={0.4}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  position={[0, 0, 0.05]}
                >
                  ✓
                </Text>
              </Billboard>
            )}

            {/* Glowing Hint Marker Arrow */}
            {isHinted && (
              <Billboard position={[0, 0.9, 0]} scale={[0.5, 0.5, 0.5]}>
                <Text
                  fontSize={0.75}
                  color="#fbbf24"
                  anchorX="center"
                  anchorY="middle"
                >
                  👇
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}
      
      {/* Orbit Controls for rotating scene */}
      <OrbitControls 
        enabled={!disabled} 
        enableRotate={true} 
        enableZoom={true} 
        enablePan={false}
        minDistance={8}
        maxDistance={25}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </group>
  );
}

function HiddenObjects3D({
  sceneObjects,
  selectedObjects,
  onSelect,
  disabled,
  hintActiveCell
}: {
  sceneObjects: Array<{
    type: string;
    name: string;
    emoji: string;
    color: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    isTarget: boolean;
    found: boolean;
  }>;
  selectedObjects: Set<number>;
  onSelect: (objectId: string, index: number) => void;
  disabled: boolean;
  hintActiveCell: number | null;
}) {
  return (
    <Canvas camera={{ position: [0, 4, 16], fov: 45 }} className="w-full h-full rounded-2xl bg-slate-950/80">
      <HiddenObjectsScene
        sceneObjects={sceneObjects}
        selectedObjects={selectedObjects}
        onSelect={onSelect}
        disabled={disabled}
        hintActiveCell={hintActiveCell}
      />
    </Canvas>
  );
}

export function HiddenObjectsGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
  restartKey,
}: GameComponentProps) {
  const numObjects = difficulty === "easy" ? 14 : difficulty === "medium" ? 22 : 28;
  const numTargets = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;
  const timeLimit = difficulty === "easy" ? 75000 : difficulty === "medium" ? 55000 : 40000;

  // Stable 3D object list generation
  const [sceneObjects, targetObjects] = useMemo(() => {
    // Select targets randomly
    const targets = shuffle([...OBJECT_TYPES]).slice(0, numTargets).map(t => t.id);
    const distractorTypes = OBJECT_TYPES.filter(
      (objectType) => !targets.includes(objectType.id),
    );
    
    // Generate objects distributed on a circular 3D plane
    const objects = range(numObjects).map((i) => {
      // Alternate picking targets and distractors to ensure targets exist
      const useTarget = i < numTargets;
      const typeId = useTarget
        ? targets[i]!
        : pickRandom(distractorTypes).id;
      const objType = OBJECT_TYPES.find(o => o.id === typeId)!;
      
      const angle = (i / numObjects) * Math.PI * 2 + Math.random() * 0.4;
      const radius = 4 + Math.random() * 7;
      
      return {
        type: objType.id,
        name: objType.id, // Fixed: use lowercase ID to match handleSelect matching
        emoji: objType.emoji,
        color: objType.color,
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 3,
          Math.sin(angle) * radius
        ] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        isTarget: useTarget,
        found: false
      };
    });
    
    return [objects, targets];
  }, [numObjects, numTargets]);

  const [selectedObjects, setSelectedObjects] = useState<Set<number>>(new Set());
  const [foundObjects, setFoundObjects] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [internalScore, setInternalScore] = useState(0);
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  // Hints state
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintActiveCell, setHintActiveCell] = useState<number | null>(null);

  // Sync score with parent
  useEffect(() => {
    onScoreChange?.(internalScore);
  }, [internalScore, onScoreChange]);

  // Reset game on restart key
  useEffect(() => {
    setSelectedObjects(new Set());
    setFoundObjects(new Set());
    setTimeLeft(timeLimit);
    setInternalScore(0);
    completedRef.current = false;
    setHintsUsed(0);
    setHintActiveCell(null);
    sceneObjects.forEach(o => o.found = false);
  }, [restartKey, timeLimit, sceneObjects]);

  // Game timer countdown
  useEffect(() => {
    if (paused || timeLeft <= 0 || foundObjects.size === targetObjects.length) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100 && !completedRef.current) {
          clearInterval(timer);
          completedRef.current = true;
          const score = foundObjects.size * 100;
          setInternalScore(score);
          onComplete({
            score,
            won: false,
            timeMs: timeLimit,
            difficulty
          });
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [paused, timeLeft, foundObjects, targetObjects, timeLimit, difficulty, onComplete]);

  // Trigger win check
  useEffect(() => {
    if (
      foundObjects.size > 0 &&
      foundObjects.size === targetObjects.length &&
      !completedRef.current
    ) {
      completedRef.current = true;
      const elapsed = Math.max(0, timeLimit - timeLeft);
      const baseScore = targetObjects.length * 200;
      const timeBonus = Math.max(0, Math.round((timeLimit - elapsed) / 10));
      const finalScore = Math.round((baseScore + timeBonus) * difficultyMultiplier(difficulty));
      
      setInternalScore(finalScore);
      onComplete({ score: finalScore, won: true, timeMs: elapsed, difficulty });
    }
  }, [foundObjects, targetObjects, timeLimit, timeLeft, difficulty, onComplete]);

  // Handle object selection click
  const handleSelect = (_objectType: string, index: number) => {
    if (
      paused ||
      completedRef.current ||
      timeLeft <= 0 ||
      foundObjects.has(index)
    ) {
      return;
    }
    
    sfx.tap(soundEnabled);
    const isTarget = sceneObjects[index]?.isTarget === true;
    
    if (isTarget) {
      // Correct Match
      sfx.correct(soundEnabled);
      setFoundObjects(prev => new Set(prev).add(index));
      setSelectedObjects(prev => new Set(prev).add(index));
      
      // Update scene object found state
      if (sceneObjects[index]) {
        sceneObjects[index].found = true;
      }
      
      // If hint was active on this object, clear it
      if (hintActiveCell === index) {
        setHintActiveCell(null);
      }
    } else {
      // Wrong Match
      sfx.wrong(soundEnabled);
    }
    
    // Clear selection visual indicator after delay
    schedule(() => {
      setSelectedObjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 400);
  };

  // Trigger hint highlighting one unfound target
  const triggerHint = () => {
    if (
      paused ||
      completedRef.current ||
      timeLeft <= 0 ||
      hintsUsed >= 2 ||
      hintActiveCell !== null
    ) {
      return;
    }
    
    // Find index of an unfound target object in the scene
    const targetIndex = sceneObjects.findIndex(
      (obj, index) => obj.isTarget && !foundObjects.has(index)
    );
    
    if (targetIndex !== -1) {
      setHintActiveCell(targetIndex);
      setHintsUsed(prev => prev + 1);
      sfx.tap(soundEnabled);
      
      // Clear highlight after 4 seconds
      schedule(() => {
        setHintActiveCell(null);
      }, 4000);
    }
  };

  // Timer format (seconds remaining)
  const secondsLeft = (timeLeft / 1000).toFixed(1);

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none">
      
      {/* Background Backlight atmosphere glow */}
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="rounded-[32px] border border-white/[0.08] bg-slate-950/60 p-4 min-[480px]:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-12 gap-5 min-[480px]:gap-6 items-center">
          
          {/* LEFT COLUMN: 3D INTERACTIVE CANVAS */}
          <div className="min-[480px]:col-span-7 flex flex-col justify-center">
            
            {/* Mobile HUD Bar (only visible on mobile layout) */}
            <div className="flex min-[480px]:hidden items-center justify-between gap-3 mb-4 select-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-[11px] font-mono text-slate-300">
                <Star className="w-3.5 h-3.5 text-teal-400 fill-teal-400/20" />
                <span className="font-bold tracking-wide uppercase text-teal-300">{difficulty}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-xs font-mono text-slate-300">
                <Timer className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-amber-400">{secondsLeft}s</span>
              </div>
            </div>

            {/* 3D RENDER WRAPPER */}
            <div className="relative w-full h-[320px] min-[480px]:h-[400px] rounded-3xl bg-slate-950/70 border border-slate-700/60 p-1 z-10 overflow-hidden shadow-inner">
              <HiddenObjects3D
                sceneObjects={sceneObjects}
                selectedObjects={selectedObjects}
                onSelect={handleSelect}
                disabled={paused || timeLeft <= 0}
                hintActiveCell={hintActiveCell}
              />
              
              {/* Drag instruction helper watermark overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-white/[0.05] rounded-full px-3 py-1 text-[9px] font-mono text-slate-400 pointer-events-none flex items-center gap-1">
                <span>🔄</span> Drag grid to rotate, scroll to zoom
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: TARGETS DISPLAY & CONTROLS */}
          <div className="min-[480px]:col-span-5 flex flex-col justify-between h-full gap-4">
            
            {/* Desktop HUD Panel */}
            <div className="hidden min-[480px]:flex flex-col gap-3.5 select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-xs font-mono text-[var(--text-dim)] shadow-inner uppercase tracking-wide text-teal-300">
                  <Star className="w-3.5 h-3.5 text-teal-400 fill-teal-400/20" />
                  <span>{difficulty}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-xs font-mono text-slate-300">
                  <Timer className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-amber-400">{secondsLeft}s</span>
                </div>
              </div>
            </div>

            {/* TARGETS CARD BOX */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/[0.03] flex flex-col gap-2 select-none">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                Find Emojis ({foundObjects.size}/{targetObjects.length})
              </span>
              
              <div className="flex flex-wrap gap-2.5 items-center justify-center py-2.5">
                {targetObjects.map((target, targetOrder) => {
                  const obj = OBJECT_TYPES.find(o => o.id === target);
                  const found = foundObjects.has(targetOrder);
                  return (
                    <motion.div
                      key={target}
                      animate={found ? { scale: [1, 1.2, 1] } : {}}
                      className={cn(
                        "w-12 h-12 rounded-xl border flex items-center justify-center text-2xl transition-all relative",
                        found 
                          ? "border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
                          : "border-slate-800 bg-slate-950/40"
                      )}
                    >
                      <span>{obj?.emoji}</span>
                      
                      {/* Found check overlay mark */}
                      {found && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] text-slate-950 font-black shadow-md border border-slate-950">
                          ✓
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* HELPERS & HINT CONTROLS */}
            <div className="flex flex-col gap-3 select-none">
              
              {/* Hint button */}
              <motion.button
                type="button"
                whileHover={hintsUsed < 2 && hintActiveCell === null ? { scale: 1.02 } : {}}
                whileTap={hintsUsed < 2 && hintActiveCell === null ? { scale: 0.97 } : {}}
                onClick={triggerHint}
                disabled={hintsUsed >= 2 || hintActiveCell !== null || timeLeft <= 0}
                className={cn(
                  "w-full py-3.5 rounded-2xl font-display font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 border transition-all cursor-pointer",
                  hintsUsed < 2 && hintActiveCell === null
                    ? "bg-slate-900 border-slate-800 text-slate-100 hover:border-amber-400/50 hover:bg-slate-800"
                    : "bg-slate-950/20 border-white/[0.02] text-slate-700 cursor-not-allowed"
                )}
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Get Hint ({2 - hintsUsed})</span>
              </motion.button>

            </div>

          </div>

        </div>

      </motion.div>

    </div>
  );
}