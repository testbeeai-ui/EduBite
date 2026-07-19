"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { shuffle, pickRandom } from "@/lib/brain-gym/utils/shuffle";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard } from "./_shared";
import { cn } from "@/lib/utils";
import { GAMES } from "@/data/brain-gym/registry";
import { usePausableScheduler } from "./_pausable-scheduler";

// 3D shape configurations for shadow matching
const SHAPES = [
  {
    id: "sphere",
    name: "Sphere",
    emoji: "🔵",
    color: "#4285f4",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#4285f4" metalness={0.3} roughness={0.7} />
      </mesh>
    )
  },
  {
    id: "cube",
    name: "Cube",
    emoji: "🟡",
    color: "#fbbc05",
    create3D: (position: [number, number, number]) => (
      <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.1} position={position}>
        <meshStandardMaterial color="#fbbc05" metalness={0.4} roughness={0.6} />
      </RoundedBox>
    )
  },
  {
    id: "cylinder",
    name: "Cylinder",
    emoji: "🟢",
    color: "#34a853",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 2, 32]} />
        <meshStandardMaterial color="#34a853" metalness={0.5} roughness={0.5} />
      </mesh>
    )
  },
  {
    id: "torus",
    name: "Torus",
    emoji: "🟣",
    color: "#9c27b0",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <torusGeometry args={[1, 0.4, 32, 32]} />
        <meshStandardMaterial color="#9c27b0" metalness={0.6} roughness={0.4} />
      </mesh>
    )
  },
  {
    id: "cone",
    name: "Cone",
    emoji: "🔴",
    color: "#ea4335",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[1, 2, 32]} />
        <meshStandardMaterial color="#ea4335" metalness={0.2} roughness={0.8} />
      </mesh>
    )
  },
  {
    id: "pyramid",
    name: "Pyramid",
    emoji: "⚫",
    color: "#000000",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <coneGeometry args={[1, 1.5, 4]} />
        <meshStandardMaterial color="#000000" metalness={0.7} roughness={0.3} />
      </mesh>
    )
  },
  {
    id: "diamond",
    name: "Diamond",
    emoji: "💎",
    color: "#00bcd4",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial color="#00bcd4" metalness={0.8} roughness={0.2} />
      </mesh>
    )
  },
  {
    id: "star",
    name: "Star",
    emoji: "⭐",
    color: "#ffeb3b",
    create3D: (position: [number, number, number]) => (
      <group position={position}>
        <mesh rotation={[0, 0, Math.PI / 10]}>
          <coneGeometry args={[0.5, 1.5, 8]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.3} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 10]} position={[0, 0, 0.1]}>
          <coneGeometry args={[0.5, 1.5, 8]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.3} />
        </mesh>
      </group>
    )
  },
  {
    id: "capsule",
    name: "Capsule",
    emoji: "💊",
    color: "#e91e63",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.6, 1.2, 16, 32]} />
        <meshStandardMaterial color="#e91e63" metalness={0.4} roughness={0.6} />
      </mesh>
    )
  },
  {
    id: "ring",
    name: "Ring",
    emoji: "💍",
    color: "#ff9800",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 1.2, 32]} />
        <meshStandardMaterial color="#ff9800" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
    )
  },
  {
    id: "dodecahedron",
    name: "Dodecahedron",
    emoji: "🔶",
    color: "#ff5722",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <dodecahedronGeometry args={[1]} />
        <meshStandardMaterial color="#ff5722" metalness={0.5} roughness={0.5} />
      </mesh>
    )
  },
  {
    id: "icosahedron",
    name: "Icosahedron",
    emoji: "🔷",
    color: "#3f51b5",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <icosahedronGeometry args={[1]} />
        <meshStandardMaterial color="#3f51b5" metalness={0.5} roughness={0.5} />
      </mesh>
    )
  },
  {
    id: "tetrahedron",
    name: "Tetrahedron",
    emoji: "🔺",
    color: "#f44336",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <tetrahedronGeometry args={[1.2]} />
        <meshStandardMaterial color="#f44336" metalness={0.4} roughness={0.6} />
      </mesh>
    )
  },
  {
    id: "torusknot",
    name: "Torus Knot",
    emoji: "🪢",
    color: "#673ab7",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <torusKnotGeometry args={[0.7, 0.25, 128, 16]} />
        <meshStandardMaterial color="#673ab7" metalness={0.6} roughness={0.4} />
      </mesh>
    )
  },
  {
    id: "hexprism",
    name: "Hex Prism",
    emoji: "⬡",
    color: "#009688",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 1.8, 6]} />
        <meshStandardMaterial color="#009688" metalness={0.5} roughness={0.5} />
      </mesh>
    )
  },
  {
    id: "pentprism",
    name: "Pentagon Prism",
    emoji: "⬠",
    color: "#8bc34a",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 1.8, 5]} />
        <meshStandardMaterial color="#8bc34a" metalness={0.4} roughness={0.6} />
      </mesh>
    )
  },
  {
    id: "ellipsoid",
    name: "Ellipsoid",
    emoji: "🥚",
    color: "#ffc107",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} scale={[1, 1.4, 0.8]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#ffc107" metalness={0.3} roughness={0.7} />
      </mesh>
    )
  },
  {
    id: "cross",
    name: "Cross",
    emoji: "✚",
    color: "#f44336",
    create3D: (position: [number, number, number]) => (
      <group position={position}>
        <mesh>
          <boxGeometry args={[0.5, 2, 0.5]} />
          <meshStandardMaterial color="#f44336" metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh>
          <boxGeometry args={[2, 0.5, 0.5]} />
          <meshStandardMaterial color="#f44336" metalness={0.3} roughness={0.7} />
        </mesh>
      </group>
    )
  },
  {
    id: "hemisphere",
    name: "Hemisphere",
    emoji: "🌓",
    color: "#607d8b",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#607d8b" metalness={0.5} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    )
  },
  {
    id: "wedge",
    name: "Wedge",
    emoji: "🧀",
    color: "#cddc39",
    create3D: (position: [number, number, number]) => (
      <mesh position={position} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[1, 2, 3]} />
        <meshStandardMaterial color="#cddc39" metalness={0.3} roughness={0.7} />
      </mesh>
    )
  },
  {
    id: "doublecone",
    name: "Double Cone",
    emoji: "⏳",
    color: "#795548",
    create3D: (position: [number, number, number]) => (
      <group position={position}>
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.8, 1.2, 32]} />
          <meshStandardMaterial color="#795548" metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.8, 1.2, 32]} />
          <meshStandardMaterial color="#795548" metalness={0.4} roughness={0.6} />
        </mesh>
      </group>
    )
  },
  {
    id: "trunccone",
    name: "Truncated Cone",
    emoji: "🪣",
    color: "#03a9f4",
    create3D: (position: [number, number, number]) => (
      <mesh position={position}>
        <cylinderGeometry args={[0.5, 1, 1.8, 32]} />
        <meshStandardMaterial color="#03a9f4" metalness={0.4} roughness={0.6} />
      </mesh>
    )
  }
];

// Create silhouette/shadow version of a shape
function createShadowElement(shapeId: string, position: [number, number, number]) {
  const shape = SHAPES.find(s => s.id === shapeId);
  if (!shape) return null;

  // Shadow is a black silhouette
  if (shapeId === "sphere") {
    return (
      <mesh position={position}>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "cube") {
    return (
      <RoundedBox args={[1.3, 1.3, 1.3]} radius={0.1} position={position}>
        <meshBasicMaterial color="#111111" />
      </RoundedBox>
    );
  }
  if (shapeId === "cylinder") {
    return (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 2.1, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "torus") {
    return (
      <mesh position={position}>
        <torusGeometry args={[1.1, 0.5, 16, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "cone") {
    return (
      <mesh position={position} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[1.1, 2.2, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "pyramid") {
    return (
      <mesh position={position}>
        <coneGeometry args={[1.1, 1.6, 4]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "diamond") {
    return (
      <mesh position={position} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <octahedronGeometry args={[1.1]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "star") {
    return (
      <group position={position}>
        <mesh rotation={[0, 0, Math.PI / 10]}>
          <coneGeometry args={[0.6, 1.7, 8]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 10]} position={[0, 0, 0.1]}>
          <coneGeometry args={[0.6, 1.7, 8]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
      </group>
    );
  }
  if (shapeId === "capsule") {
    return (
      <mesh position={position} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.7, 1.3, 16, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "ring") {
    return (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.3, 16]} />
        <meshBasicMaterial color="#111111" side={THREE.DoubleSide} />
      </mesh>
    );
  }
  if (shapeId === "dodecahedron") {
    return (
      <mesh position={position}>
        <dodecahedronGeometry args={[1.1]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "icosahedron") {
    return (
      <mesh position={position}>
        <icosahedronGeometry args={[1.1]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "tetrahedron") {
    return (
      <mesh position={position}>
        <tetrahedronGeometry args={[1.3]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "torusknot") {
    return (
      <mesh position={position}>
        <torusKnotGeometry args={[0.8, 0.3, 64, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "hexprism") {
    return (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 1.9, 6]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "pentprism") {
    return (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 1.9, 5]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "ellipsoid") {
    return (
      <mesh position={position} scale={[1, 1.4, 0.8]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "cross") {
    return (
      <group position={position}>
        <mesh>
          <boxGeometry args={[0.6, 2.1, 0.6]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh>
          <boxGeometry args={[2.1, 0.6, 0.6]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
      </group>
    );
  }
  if (shapeId === "hemisphere") {
    return (
      <mesh position={position}>
        <sphereGeometry args={[1.1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#111111" side={THREE.DoubleSide} />
      </mesh>
    );
  }
  if (shapeId === "wedge") {
    return (
      <mesh position={position} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[1.1, 2.1, 3]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  if (shapeId === "doublecone") {
    return (
      <group position={position}>
        <mesh position={[0, 0.65, 0]}>
          <coneGeometry args={[0.9, 1.3, 16]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh position={[0, -0.65, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.9, 1.3, 16]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
      </group>
    );
  }
  if (shapeId === "trunccone") {
    return (
      <mesh position={position}>
        <cylinderGeometry args={[0.6, 1.1, 1.9, 16]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    );
  }
  return null;
}

// Main 3D scene for match shadow game
function MatchShadowScene({
  shapes,
  selectedShape,
  correctShape,
  onSelect,
  disabled,
  revealAnswer,
  hintActive
}: {
  shapes: typeof SHAPES;
  selectedShape: string | null;
  correctShape: string;
  onSelect: (shapeId: string) => void;
  disabled: boolean;
  revealAnswer: boolean;
  hintActive: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Subtle rotation animation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const shadowPosition: [number, number, number] = [0, 3, -5];
  const optionsPositions: [number, number, number][] = [
    [-4, 0, 0],
    [0, 0, 0],
    [4, 0, 0],
    [-4, 0, -4],
    [4, 0, -4],
    [-4, 0, 4],
    [4, 0, 4]
  ];

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />
      
      {/* Shadow display (at the top) */}
      <group position={shadowPosition}>
        {createShadowElement(correctShape, [0, 0, 0])}
        
        {/* Shadow label */}
        <mesh position={[0, -2, 0]}>
          <Text
            fontSize={0.4}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            SHADOW
          </Text>
        </mesh>
      </group>

      {/* Shape options (below) */}
      <group position={[0, -3, 0]}>
        {shapes.map((shape, index) => {
          const isSelected = selectedShape === shape.id;
          const isCorrect = shape.id === correctShape && revealAnswer;
          const isWrong = selectedShape === shape.id && selectedShape !== correctShape && revealAnswer;
          const isHinted = shape.id === correctShape && hintActive;
          
          return (
            <group
              key={shape.id}
              position={optionsPositions[index] || [0, 0, index * 3]}
              onClick={() => !disabled && onSelect(shape.id)}
            >
              {shape.create3D([0, 0, 0])}
              
              {/* Selection highlight */}
              {isSelected && (
                <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
                  <sphereGeometry args={[2, 16, 16]} />
                  <meshBasicMaterial color="#ffeb3b" transparent opacity={0.3} />
                </mesh>
              )}

              {/* Hint highlight */}
              {isHinted && (
                <mesh position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
                  <sphereGeometry args={[1.5, 12, 12]} />
                  <meshBasicMaterial color="#fbbf24" transparent opacity={0.45} wireframe />
                </mesh>
              )}
              
              {/* Correct indicator */}
              {isCorrect && (
                <mesh position={[0, 2, 0]}>
                  <Text
                    fontSize={0.5}
                    color="#4caf50"
                    anchorX="center"
                    anchorY="middle"
                  >
                    ✓
                  </Text>
                </mesh>
              )}
              
              {/* Wrong indicator */}
              {isWrong && (
                <mesh position={[0, 2, 0]}>
                  <Text
                    fontSize={0.5}
                    color="#f44336"
                    anchorX="center"
                    anchorY="middle"
                  >
                    ✗
                  </Text>
                </mesh>
              )}
              
              {/* Shape label */}
              <mesh position={[0, -1.6, 0]}>
                <Text
                  fontSize={0.25}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {`${shape.emoji} ${shape.name}`}
                </Text>
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Grid helper */}
      <gridHelper args={[40, 40, 40]} />
      
      {/* Orbit controls */}
      <OrbitControls 
        enabled={!disabled} 
        enableRotate={true} 
        enableZoom={true} 
        enablePan={false}
        minDistance={5}
        maxDistance={30}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
    </group>
  );
}

function MatchShadow3D({
  shapes,
  selectedShape,
  correctShape,
  onSelect,
  disabled,
  revealAnswer,
  hintActive
}: {
  shapes: typeof SHAPES;
  selectedShape: string | null;
  correctShape: string;
  onSelect: (shapeId: string) => void;
  disabled: boolean;
  revealAnswer: boolean;
  hintActive: boolean;
}) {
  return (
    <Canvas camera={{ position: [0, 4, 20], fov: 50 }} style={{ width: "100%", height: "100%" }}>
      <MatchShadowScene
        shapes={shapes}
        selectedShape={selectedShape}
        correctShape={correctShape}
        onSelect={onSelect}
        disabled={disabled}
        revealAnswer={revealAnswer}
        hintActive={hintActive}
      />
    </Canvas>
  );
}

export function MatchShadowGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
  restartKey,
}: GameComponentProps) {
  const numOptions = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;
  const lives = useMemo(() => {
    const gameMeta = GAMES.find(g => g.id === "match-shadow");
    return gameMeta?.maxLives ?? 3;
  }, []);

  const [currentRound, setCurrentRound] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [internalScore, setInternalScore] = useState(0);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [internalLives, setInternalLives] = useState(lives);
  const [startTime, setStartTime] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  // Hint states
  const [hintActive, setHintActive] = useState(false);
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
    setCurrentRound(0);
    setCorrectRounds(0);
    setInternalScore(0);
    setSelectedShape(null);
    setRevealAnswer(false);
    setInternalLives(lives);
    setStartTime(Date.now());
    setHintActive(false);
    setHintsUsed(0);
    completedRef.current = false;
  }, [restartKey, lives]);

  // Reset hint when round changes
  useEffect(() => {
    setHintActive(false);
  }, [currentRound]);

  // Generate options for current round
  const [options, correctShape] = useMemo(() => {
    void currentRound;
    // Filter shapes based on difficulty: easy gets simpler shapes
    const eligibleShapes = difficulty === "easy"
      ? SHAPES.filter(s => ["sphere", "cube", "cylinder", "cone", "torus"].includes(s.id))
      : SHAPES;

    const correct = pickRandom(eligibleShapes).id;
    const otherOptions = eligibleShapes.filter(s => s.id !== correct);
    const selectedOptions = shuffle(otherOptions).slice(0, numOptions - 1);
    const roundOptions = shuffle([...selectedOptions, { ...eligibleShapes.find(s => s.id === correct)! }]);
    return [roundOptions, correct];
  }, [currentRound, numOptions, difficulty]);

  const handleSelect = (shapeId: string) => {
    if (
      paused ||
      completedRef.current ||
      selectedShape !== null ||
      revealAnswer
    ) {
      return;
    }
    
    sfx.tap(soundEnabled);
    setSelectedShape(shapeId);
    
    schedule(() => {
      if (shapeId === correctShape) {
        // Correct answer
        sfx.correct(soundEnabled);
        const newScore = internalScore + 100 * difficultyMultiplier(difficulty);
        setInternalScore(newScore);
        
        // Next round after delay
        schedule(() => {
          setSelectedShape(null);
          setCorrectRounds((rounds) => rounds + 1);
          setCurrentRound(prev => prev + 1);
          setRevealAnswer(false);
        }, 1000);
      } else {
        // Wrong answer
        sfx.wrong(soundEnabled);
        const nextLives = internalLives - 1;
        setInternalLives(nextLives);
        setRevealAnswer(true);
        
        // Show correct answer, then next round
        schedule(() => {
          setSelectedShape(null);
          setRevealAnswer(false);
          if (nextLives > 0) {
            setCurrentRound(prev => prev + 1);
          }
        }, 2000);
      }
    }, 500);
  };

  const handleHint = () => {
    if (paused || revealAnswer || internalLives <= 0 || hintsUsed >= 2 || hintActive) return;
    setHintActive(true);
    setHintsUsed(prev => prev + 1);
    sfx.tap(soundEnabled);
  };

  useEffect(() => {
    // Check for win condition (complete several rounds)
    const roundsToWin = difficulty === "easy" ? 5 : difficulty === "medium" ? 7 : 10;
    if (correctRounds >= roundsToWin && !completedRef.current) {
      completedRef.current = true;
      const timeMs = Date.now() - startTime;
      onScoreChange?.(internalScore);
      onComplete({ score: internalScore, won: true, timeMs, difficulty });
    }
  }, [correctRounds, internalScore, difficulty, startTime, onComplete, onScoreChange]);

  useEffect(() => {
    // Check for game over
    if (internalLives <= 0 && !completedRef.current) {
      completedRef.current = true;
      const timeMs = Date.now() - startTime;
      onComplete({ score: internalScore, won: false, timeMs, difficulty });
    }
  }, [internalLives, internalScore, difficulty, startTime, onComplete]);

  return (
    <GameBoard>
      <div className="flex justify-between items-center mb-2 px-1">
        <p className="text-sm text-[var(--text-dim)] font-display font-bold leading-none">
          Score: {internalScore} · Lives: {internalLives} · Correct: {correctRounds}
        </p>
        <button
          onClick={handleHint}
          disabled={paused || revealAnswer || internalLives <= 0 || hintsUsed >= 2 || hintActive}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shrink-0 leading-none",
            "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20",
            (hintsUsed >= 2 || hintActive || paused || revealAnswer || internalLives <= 0) && "opacity-50 cursor-not-allowed"
          )}
        >
          💡 Hint ({2 - hintsUsed})
        </button>
      </div>
      
      <div className="relative w-full h-[300px] sm:h-[340px] mb-2 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/20">
        <MatchShadow3D
          shapes={options}
          selectedShape={selectedShape}
          correctShape={correctShape}
          onSelect={handleSelect}
          disabled={paused || revealAnswer || internalLives <= 0}
          revealAnswer={revealAnswer}
          hintActive={hintActive}
        />
        <span className="absolute bottom-2 left-3 text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg backdrop-blur border border-slate-800 pointer-events-none select-none">
          💡 Swipe/drag to rotate the grid
        </span>
      </div>

      {/* 2D Option Buttons */}
      <div className="w-full max-w-lg mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider sm:shrink-0 leading-none">
            Select Match:
          </span>
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {options.map((shape) => {
              const isSelected = selectedShape === shape.id;
              const isCorrect = shape.id === correctShape && revealAnswer;
              const isWrong = selectedShape === shape.id && selectedShape !== correctShape && revealAnswer;
              const isHinted = shape.id === correctShape && hintActive;

              return (
                <button
                  key={shape.id}
                  onClick={() => handleSelect(shape.id)}
                  disabled={paused || revealAnswer || internalLives <= 0}
                  className={cn(
                    "flex flex-col sm:flex-row items-center justify-center gap-1 px-2 py-2 rounded-xl border font-bold text-xs transition-all w-full leading-none",
                    "bg-slate-800/40 border-slate-700/50 text-slate-200 hover:bg-slate-700/50 hover:text-white",
                    isSelected && "border-yellow-400 bg-yellow-500/10 text-yellow-300",
                    isCorrect && "border-green-500 bg-green-500/20 text-green-300",
                    isWrong && "border-red-500 bg-red-500/20 text-red-300",
                    isHinted && "border-amber-400/90 bg-amber-500/15 text-amber-300 animate-pulse ring-2 ring-amber-500/40",
                    (paused || revealAnswer || internalLives <= 0) && "opacity-75 cursor-not-allowed"
                  )}
                >
                  <span className="text-sm">{shape.emoji}</span>
                  <span className="text-[10px] sm:text-xs truncate">{shape.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameBoard>
  );
}