"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { GAMES, CATEGORY_META } from "@/data/brain-gym/registry";
import { useBrainGym } from "@/lib/brain-gym/hooks/use-brain-gym";
import type { GameCategory, GameId } from "@/lib/brain-gym/types";

const SCENE_FONT =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff";

const CATEGORY_COLORS: Record<GameCategory, string> = {
  memory: "#a78bfa",
  logic: "#60a5fa",
  visual: "#f472b6",
  speed: "#fbbf24",
};

const CATEGORIES = Object.keys(CATEGORY_META) as GameCategory[];

function EmojiLabel({
  emoji,
  size = 26,
}: {
  emoji: string;
  size?: number;
}) {
  return (
    <Html
      center
      zIndexRange={[1, 5]}
      distanceFactor={12}
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <span
        style={{
          fontSize: size,
          lineHeight: 1,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
        }}
      >
        {emoji}
      </span>
    </Html>
  );
}

function CategoryLabel({
  emoji,
  label,
}: {
  emoji: string;
  label: string;
}) {
  return (
    <Html
      center
      zIndexRange={[1, 5]}
      distanceFactor={14}
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(15,23,42,0.75)",
          border: "1px solid rgba(255,255,255,0.12)",
          fontSize: 12,
          fontWeight: 700,
          color: "#f8fafc",
          whiteSpace: "nowrap",
          backdropFilter: "blur(6px)",
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>{emoji}</span>
        <span>{label}</span>
      </div>
    </Html>
  );
}

function HubScene3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { progress } = useBrainGym();

  const gamesByCategory = useMemo(() => {
    const grouped: Record<GameCategory, typeof GAMES> = {
      memory: [],
      logic: [],
      visual: [],
      speed: [],
    };
    for (const game of GAMES) grouped[game.category].push(game);
    return grouped;
  }, []);

  const categoryClusters = useMemo(
    () =>
      CATEGORIES.map((category, index) => {
        const angle = (index / CATEGORIES.length) * Math.PI * 2 - Math.PI / 4;
        const radius = 7.5;
        return {
          category,
          center: [
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius,
          ] as [number, number, number],
          games: gamesByCategory[category].map((game, gameIndex, list) => {
            const gameAngle = (gameIndex / list.length) * Math.PI * 2;
            const gameRadius = Math.min(2.8, 1.4 + list.length * 0.12);
            return {
              id: game.id as GameId,
              emoji: game.emoji,
              color: game.color,
              offset: [
                Math.cos(gameAngle) * gameRadius,
                0.15 + Math.sin(gameIndex * 0.8) * 0.2,
                Math.sin(gameAngle) * gameRadius,
              ] as [number, number, number],
            };
          }),
        };
      }),
    [gamesByCategory],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 11 + (i % 3) * 1.5;
        return {
          position: [
            Math.cos(angle) * radius,
            ((i % 5) - 2) * 0.8,
            Math.sin(angle) * radius,
          ] as [number, number, number],
          color: `hsl(${(i * 360) / 16}, 75%, 58%)`,
          scale: 0.08 + (i % 4) * 0.04,
        };
      }),
    [],
  );

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} />
      <directionalLight position={[-6, 4, -4]} intensity={0.45} />
      <pointLight position={[0, 8, 0]} intensity={0.25} />

      <group ref={groupRef}>
        <group position={[0, 0, 0]}>
          <RoundedBox args={[2.2, 2.2, 2.2]} radius={0.25}>
            <meshStandardMaterial
              color="#6366f1"
              metalness={0.7}
              roughness={0.25}
              emissive="#4338ca"
              emissiveIntensity={0.35}
            />
          </RoundedBox>
          <Text
            position={[0, 0, 1.15]}
            font={SCENE_FONT}
            fontSize={0.42}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
            textAlign="center"
          >
            BRAIN{"\n"}GYM
          </Text>
        </group>

        {categoryClusters.map((cluster) => {
          const meta = CATEGORY_META[cluster.category];
          const color = CATEGORY_COLORS[cluster.category];

          return (
            <group key={cluster.category} position={cluster.center}>
              <RoundedBox args={[2.4, 0.35, 2.4]} radius={0.12} position={[0, -0.6, 0]}>
                <meshStandardMaterial
                  color={color}
                  transparent
                  opacity={0.85}
                  metalness={0.35}
                  roughness={0.45}
                />
              </RoundedBox>

              <CategoryLabel emoji={meta.emoji} label={meta.label} />

              {cluster.games.map((game) => {
                const gameStats =
                  progress.games[game.id as keyof typeof progress.games];
                const isUnlocked = (gameStats?.plays ?? 0) > 0;

                return (
                  <group key={game.id} position={game.offset}>
                    <RoundedBox args={[0.55, 0.55, 0.55]} radius={0.1}>
                      <meshStandardMaterial
                        color={game.color}
                        transparent
                        opacity={isUnlocked ? 1 : 0.55}
                        metalness={isUnlocked ? 0.55 : 0.2}
                        roughness={isUnlocked ? 0.35 : 0.75}
                        emissive={game.color}
                        emissiveIntensity={isUnlocked ? 0.15 : 0.05}
                      />
                    </RoundedBox>
                    <group position={[0, 0.42, 0]}>
                      <EmojiLabel emoji={game.emoji} size={22} />
                    </group>
                  </group>
                );
              })}
            </group>
          );
        })}

        {particles.map((particle, i) => (
          <mesh key={i} position={particle.position} scale={particle.scale}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial
              color={particle.color}
              emissive={particle.color}
              emissiveIntensity={0.45}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}

        <gridHelper args={[28, 28, "#334155", "#1e293b"]} position={[0, -1.2, 0]} />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={9}
        maxDistance={15}
        minPolarAngle={1.08}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 0.15, 0]}
      />
    </>
  );
}

export function BrainGymScene3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 4.2, 11.2], fov: 42 }}
      style={{ height: "400px", width: "100%" }}
    >
      <color attach="background" args={["#0b1220"]} />
      <HubScene3D />
    </Canvas>
  );
}
