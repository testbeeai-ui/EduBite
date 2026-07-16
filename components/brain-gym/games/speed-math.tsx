"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { shuffle, range } from "@/lib/brain-gym/utils/shuffle";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard } from "./_shared";
import { cn } from "@/lib/utils";
import { GAMES } from "@/data/brain-gym/registry";
import { motion } from "framer-motion";
import { HelpCircle, Timer, Star } from "lucide-react";

// Question Card component
function QuestionCard3D({
  equation,
  showResult,
  correctAnswer,
  isCorrect,
  position,
}: {
  equation: string;
  showResult: boolean;
  correctAnswer: number;
  isCorrect: boolean;
  position: [number, number, number];
}) {
  const innerRef = useRef<THREE.Group>(null);

  // Gentle individual float and rotation wobble
  useFrame((state) => {
    if (innerRef.current) {
      const time = state.clock.getElapsedTime();
      innerRef.current.position.y = Math.sin(time * 1.3) * 0.05;
      innerRef.current.rotation.z = Math.cos(time * 0.9) * 0.012;
    }
  });

  return (
    <Billboard position={position}>
      <group ref={innerRef}>
        {/* Sleek rounded background panel */}
        <RoundedBox args={[3.2, 1.4, 0.02]} radius={0.15}>
          <meshStandardMaterial 
            color={showResult ? (isCorrect ? "#10b981" : "#ef4444") : "#1e1b4b"}
            metalness={0.1}
            roughness={0.9}
          />
        </RoundedBox>

        {/* Equation text */}
        <Text
          position={[0, 0.25, 0.03]}
          fontSize={0.45}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {equation}
        </Text>

        {/* Answer status / ? */}
        <Text
          position={[0, -0.28, 0.03]}
          fontSize={0.38}
          color={showResult ? "#ffffff" : "#fbbf24"}
          anchorX="center"
          anchorY="middle"
          fontWeight="extrabold"
        >
          {showResult ? `=  ${correctAnswer}` : "=  ?"}
        </Text>
      </group>
    </Billboard>
  );
}

// Option Card component
function OptionCard3D({
  option,
  position,
  index,
  selectedAnswer,
  correctAnswer,
  showResult,
  isHighlighted,
  onSelect,
}: {
  option: number;
  position: [number, number, number];
  index: number;
  selectedAnswer: number | null;
  correctAnswer: number;
  showResult: boolean;
  isHighlighted: boolean;
  onSelect: (val: number) => void;
}) {
  const innerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Individual float wave (undulation phase offset per card index) and smooth scaling on hover
  useFrame((state) => {
    if (innerRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Offset undulating wave floating
      const wave = Math.sin(time * 2.2 + index * 0.8) * 0.06;
      innerRef.current.position.y = wave;
      
      // Indivudal rocking/wobbling
      innerRef.current.rotation.z = Math.sin(time * 1.1 + index * 0.8) * 0.015;
      
      // Lerp scale
      const targetScale = hovered ? 1.08 : 1.0;
      innerRef.current.scale.x = THREE.MathUtils.lerp(innerRef.current.scale.x, targetScale, 0.15);
      innerRef.current.scale.y = THREE.MathUtils.lerp(innerRef.current.scale.y, targetScale, 0.15);
      innerRef.current.scale.z = THREE.MathUtils.lerp(innerRef.current.scale.z, targetScale, 0.15);
    }
  });

  // Switch cursor style on pointer hover
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [hovered]);

  const isSelected = selectedAnswer === option;
  const isCorrect = showResult && option === correctAnswer;
  const isWrong = showResult && selectedAnswer === option && option !== correctAnswer;
  const hasResult = showResult;

  // Determine colors based on state
  let cardColor = "#1e293b"; // Default slate glass
  let textColor = "#ffffff";

  if (hasResult) {
    if (isCorrect) cardColor = "#10b981"; // Correct
    else if (isWrong) cardColor = "#ef4444"; // Wrong
    else {
      cardColor = "#0f172a"; // Dimmed
      textColor = "#475569";
    }
  } else if (isHighlighted) {
    cardColor = "#fbbf24"; // Highlighted Hint
    textColor = "#04141c";
  } else if (isSelected) {
    cardColor = "#38bdf8"; // Selected
    textColor = "#ffffff";
  }

  return (
    <Billboard 
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!showResult) setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!showResult) {
          onSelect(option);
          setHovered(false);
        }
      }}
    >
      <group ref={innerRef}>
        {/* Outer border highlight on Hint */}
        {isHighlighted && !hasResult && (
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.02, 1.02]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        )}

        {/* Option card box */}
        <RoundedBox args={[1.9, 0.9, 0.02]} radius={0.1}>
          <meshStandardMaterial 
            color={cardColor}
            metalness={0.2}
            roughness={0.8}
            transparent={hasResult && !isCorrect && !isWrong}
            opacity={hasResult && !isCorrect && !isWrong ? 0.35 : 1.0}
          />
        </RoundedBox>

        {/* Option value text */}
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.4}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {option}
        </Text>

        {/* Correct check badge */}
        {isCorrect && (
          <group position={[0, 0.55, 0.02]}>
            <RoundedBox args={[0.3, 0.3, 0.01]} radius={0.05}>
              <meshStandardMaterial color="#10b981" />
            </RoundedBox>
            <Text position={[0, 0, 0.01]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">✓</Text>
          </group>
        )}

        {/* Wrong cross badge */}
        {isWrong && (
          <group position={[0, 0.55, 0.02]}>
            <RoundedBox args={[0.3, 0.3, 0.01]} radius={0.05}>
              <meshStandardMaterial color="#ef4444" />
            </RoundedBox>
            <Text position={[0, 0, 0.01]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">✗</Text>
          </group>
        )}
      </group>
    </Billboard>
  );
}

// Main 3D scene for speed math
function SpeedMathScene({
  equation,
  correctAnswer,
  answerOptions,
  selectedAnswer,
  showResult,
  onSelect,
  disabled,
  hintActive = false,
}: {
  equation: string;
  correctAnswer: number;
  answerOptions: number[];
  selectedAnswer: number | null;
  showResult: boolean;
  onSelect: (answer: number) => void;
  disabled: boolean;
  hintActive?: boolean;
}) {
  // Spacing slightly brought in to ensure they fit in all viewports without clipping
  const optionPositions: [number, number, number][] = [
    [-2.7, 0.4, 3.0],
    [-0.9, 0.4, 3.0],
    [0.9, 0.4, 3.0],
    [2.7, 0.4, 3.0]
  ];

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 6]} intensity={1.4} castShadow />
      <directionalLight position={[-10, 6, -5]} intensity={0.5} />
      
      {/* Background floor grid */}
      <gridHelper args={[30, 30, "#1e293b", "#0f172a"]} position={[0, -1.2, 0]} />

      {/* Central Question Card */}
      {equation && (
        <QuestionCard3D
          equation={equation}
          showResult={showResult}
          correctAnswer={correctAnswer}
          isCorrect={selectedAnswer === correctAnswer}
          position={[0, 1.8, 0]}
        />
      )}

      {/* Four Option Cards in 3D */}
      {answerOptions.map((option, index) => (
        <OptionCard3D
          key={option}
          option={option}
          position={optionPositions[index] || [0, 0, 0]}
          index={index}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showResult={showResult}
          isHighlighted={hintActive && option === correctAnswer}
          onSelect={onSelect}
        />
      ))}
      
      {/* Orbit controls */}
      <OrbitControls 
        enabled={!disabled} 
        enableRotate={true} 
        enableZoom={true} 
        enablePan={false}
        minDistance={5}
        maxDistance={25}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </group>
  );
}

function SpeedMath3D({
  equation,
  correctAnswer,
  answerOptions,
  selectedAnswer,
  showResult,
  onSelect,
  disabled,
  hintActive = false,
}: {
  equation: string;
  correctAnswer: number;
  answerOptions: number[];
  selectedAnswer: number | null;
  showResult: boolean;
  onSelect: (answer: number) => void;
  disabled: boolean;
  hintActive?: boolean;
}) {
  return (
    <Canvas camera={{ position: [0, 4.2, 10.5], fov: 45 }} className="w-full h-full rounded-2xl bg-slate-950/80">
      <SpeedMathScene
        equation={equation}
        correctAnswer={correctAnswer}
        answerOptions={answerOptions}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        onSelect={onSelect}
        disabled={disabled}
        hintActive={hintActive}
      />
    </Canvas>
  );
}

// Generate math equations
function generateEquation(difficulty: string) {
  const max = difficulty === "easy" ? 12 : difficulty === "medium" ? 20 : 50;
  const a = 1 + Math.floor(Math.random() * max);
  const b = 1 + Math.floor(Math.random() * max);
  
  const ops = difficulty === "hard" ? ["+", "-", "*"] : ["+", "-"];
  const op = ops[Math.floor(Math.random() * ops.length)]!;
  
  const ans = op === "+" ? a + b : op === "-" ? a - b : a * b;
  if (op === "-" && ans < 0) return generateEquation(difficulty);
  
  return {
    equation: `${a} ${op === "*" ? "×" : op} ${b}`,
    answer: ans
  };
}

export function SpeedMathGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
  restartKey,
}: GameComponentProps) {
  const timeLimit = difficulty === "easy" ? 60000 : difficulty === "medium" ? 45000 : 30000;
  const numQuestions = difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;

  const [equations] = useState(() => {
    return range(numQuestions).map(() => generateEquation(difficulty));
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [internalScore, setInternalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [completed, setCompleted] = useState(false);
  
  const lives = useMemo(() => {
    const gameMeta = GAMES.find(g => g.id === "speed-math");
    return gameMeta?.maxLives ?? 3;
  }, []);
  const [internalLives, setInternalLives] = useState(lives);
  const [hintActive, setHintActive] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);

  // Sync score with parent
  useEffect(() => {
    onScoreChange?.(internalScore);
  }, [internalScore, onScoreChange]);

  // Sync lives with parent
  useEffect(() => {
    onLivesChange?.(internalLives);
  }, [internalLives, onLivesChange]);

  // Reset game on restart key
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setInternalScore(0);
    setCorrectCount(0);
    setTimeLeft(timeLimit);
    setStartTime(Date.now());
    setCompleted(false);
    setInternalLives(lives);
    setHintActive(false);
    setHintsLeft(3);
  }, [restartKey, timeLimit, lives]);

  const currentEquation = equations[currentIndex];
  const correctAnswer = currentEquation ? currentEquation.answer : 0;

  // Generate answer options (including wrong answers)
  const answerOptions = useMemo(() => {
    if (!currentEquation) return [];
    const options = new Set<number>();
    options.add(correctAnswer);
    
    // Add wrong answers
    while (options.size < 4) {
      const wrong = Math.floor(Math.random() * 100) + 1;
      options.add(wrong);
    }
    
    return shuffle(Array.from(options));
  }, [currentIndex, correctAnswer, currentEquation]);

  const handleSelect = useCallback((answer: number) => {
    if (paused || completed || showResult) return;
    
    sfx.tap(soundEnabled);
    setSelectedAnswer(answer);
    setHintActive(false);
    
    setTimeout(() => {
      setShowResult(true);
      
      if (answer === correctAnswer) {
        sfx.correct(soundEnabled);
        setCorrectCount(prev => prev + 1);
        setInternalScore(prev => prev + 100 * difficultyMultiplier(difficulty));
      } else {
        sfx.wrong(soundEnabled);
        setInternalLives(prev => prev - 1);
      }
      
      // Move to next question or end game
      setTimeout(() => {
        if (currentIndex < equations.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          // Game completed
          const timeMs = Date.now() - startTime;
          onComplete({
            score: internalScore + (answer === correctAnswer ? 100 * difficultyMultiplier(difficulty) : 0),
            won: true,
            timeMs,
            difficulty,
            accuracy: (correctCount + (answer === correctAnswer ? 1 : 0)) / equations.length
          });
          setCompleted(true);
        }
      }, 1000);
    }, 300);
  }, [paused, completed, showResult, soundEnabled, correctAnswer, difficulty, currentIndex, equations.length, startTime, internalScore, correctCount, onComplete]);

  // Check for game over (lives)
  useEffect(() => {
    if (internalLives <= 0) {
      const timeMs = Date.now() - startTime;
      onComplete({
        score: internalScore,
        won: false,
        timeMs,
        difficulty,
        accuracy: correctCount / equations.length
      });
      setCompleted(true);
    }
  }, [internalLives, internalScore, correctCount, startTime, difficulty, onComplete, equations.length]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(timer);
          const actualTime = timeLimit - (Date.now() - startTime);
          onComplete({
            score: internalScore,
            won: false,
            timeMs: actualTime,
            difficulty,
            accuracy: correctCount / equations.length
          });
          setCompleted(true);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [timeLimit, startTime, internalScore, correctCount, equations.length, difficulty, onComplete]);

  // Keyboard controls listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed || paused || showResult) return;
      
      const keyToAnswer: Record<string, number> = {
        "1": answerOptions[0]!,
        "2": answerOptions[1]!,
        "3": answerOptions[2]!,
        "4": answerOptions[3]!
      };
      
      const answer = keyToAnswer[e.key];
      if (answer !== undefined) {
        handleSelect(answer);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paused, completed, showResult, answerOptions, handleSelect]);

  const secondsLeft = (timeLeft / 1000).toFixed(1);

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none">
      
      {/* Background ambient backlight decoration */}
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="rounded-[32px] border border-white/[0.08] bg-slate-950/60 p-4 min-[480px]:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

        {/* Widescreen 2-column layout */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-12 gap-5 min-[480px]:gap-6 items-center">
          
          {/* LEFT SIDE: 3D INTERACTIVE PLAY AREA */}
          <div className="min-[480px]:col-span-7 flex flex-col justify-center">
            
            {/* Mobile HUD panel (only visible on mobile layout) */}
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

            {/* 3D Render Canvas wrapper */}
            <div className="relative w-full h-[320px] min-[480px]:h-[400px] rounded-3xl bg-slate-950/70 border border-slate-700/60 p-1 z-10 overflow-hidden shadow-inner">
              {currentEquation && (
                <SpeedMath3D
                  equation={currentEquation.equation}
                  correctAnswer={correctAnswer}
                  answerOptions={answerOptions}
                  selectedAnswer={selectedAnswer}
                  showResult={showResult}
                  onSelect={handleSelect}
                  disabled={paused || completed}
                  hintActive={hintActive}
                />
              )}
              
              {/* Camera navigation guide */}
              <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-white/[0.05] rounded-full px-3 py-1 text-[9px] font-mono text-slate-400 pointer-events-none flex items-center gap-1">
                <span>🔄</span> Drag grid to rotate, scroll to zoom
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: HUB STATS & KEYBOARD SHORTCUTS */}
          <div className="min-[480px]:col-span-5 flex flex-col justify-between h-full gap-4">
            
            {/* Desktop HUD (only visible on desktop layout) */}
            <div className="hidden min-[480px]:flex flex-col gap-3.5 select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-xs font-mono tracking-wide text-teal-300 uppercase">
                  <Star className="w-3.5 h-3.5 text-teal-400 fill-teal-400/20" />
                  <span>{difficulty}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-xs font-mono text-slate-300">
                  <Timer className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-amber-400">{secondsLeft}s</span>
                </div>
              </div>
            </div>

            {/* Current Score Panel & Instructions */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/[0.03] flex flex-col gap-2 select-none">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                Progress & Stats
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-950/40 border border-white/[0.02] p-3 rounded-xl flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">Question</span>
                  <span className="text-lg font-black text-teal-300 mt-0.5">{currentIndex + 1}/{equations.length}</span>
                </div>
                <div className="bg-slate-950/40 border border-white/[0.02] p-3 rounded-xl flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">Score</span>
                  <span className="text-lg font-black text-amber-400 mt-0.5">{internalScore}</span>
                </div>
              </div>
            </div>

            {/* Helper buttons */}
            <div className="flex flex-col gap-3 select-none">
              
              {/* Hint button */}
              <button
                type="button"
                disabled={hintsLeft <= 0 || showResult || completed || paused || hintActive}
                onClick={() => {
                  if (hintsLeft > 0) {
                    setHintActive(true);
                    setHintsLeft(prev => prev - 1);
                  }
                }}
                className={cn(
                  "w-full py-3 rounded-2xl font-display font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 border transition-all cursor-pointer",
                  hintsLeft > 0 && !hintActive && !showResult && !completed && !paused
                    ? "bg-slate-900 border-slate-800 text-slate-100 hover:border-yellow-500/40 hover:bg-slate-800"
                    : "bg-slate-950/20 border-white/[0.02] text-slate-700 cursor-not-allowed"
                )}
              >
                <HelpCircle className="w-4 h-4 text-yellow-500" />
                <span>Get Hint ({hintsLeft})</span>
              </button>

            </div>

            {/* Keyboard Guide Panel */}
            <div className="hidden min-[480px]:block mt-auto p-3.5 rounded-2xl bg-slate-900/45 border border-white/[0.02] text-[10px] text-slate-500 font-mono shadow-inner select-none">
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 tracking-wider uppercase flex items-center gap-1">
                <span>⌨️</span> Keyboard Shortcuts
              </div>
              <div className="flex justify-between mb-0.5"><span>1, 2, 3, 4</span> <span className="text-slate-600">Select answers (Left to Right)</span></div>
              <div className="flex justify-between"><span>Mouse Drag</span> <span className="text-slate-600">Rotate / Pan 3D Grid</span></div>
            </div>

          </div>

        </div>

      </motion.div>

    </div>
  );
}