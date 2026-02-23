"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CrystalProps {
  activeSegment: number;
  intensity: number;
}

function Satellite({ index, total }: { index: number; total: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 2.5 + Math.random() * 0.5;
  const height = (Math.random() - 0.5) * 2;
  const speed = 0.3 + Math.random() * 0.3;
  const size = 0.03 + Math.random() * 0.04;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.position.x = Math.cos(t + angle) * radius;
    meshRef.current.position.y = height + Math.sin(t * 1.5) * 0.3;
    meshRef.current.position.z = Math.sin(t + angle) * radius;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color="#7c4dff"
        emissive="#4d19e6"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

function OrbitalRing({ radius, rotation }: { radius: number; rotation: [number, number, number] }) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, 0.003, 16, 100]} />
      <meshBasicMaterial color="#4d19e6" transparent opacity={0.15} />
    </mesh>
  );
}

function Crystal({ activeSegment, intensity }: CrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const segmentColors = useMemo(
    () => [
      new THREE.Color("#4d19e6"),
      new THREE.Color("#00e676"),
      new THREE.Color("#7c4dff"),
      new THREE.Color("#ffd740"),
      new THREE.Color("#ff4081"),
      new THREE.Color("#00bcd4"),
      new THREE.Color("#e040fb"),
    ],
    []
  );

  useFrame((state) => {
    if (!meshRef.current || !innerRef.current || !wireRef.current) return;
    const t = state.clock.elapsedTime;
    const rotSpeed = 0.3 + intensity * 0.5;

    meshRef.current.rotation.y = t * rotSpeed;
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;

    innerRef.current.rotation.y = -t * rotSpeed * 1.5;
    innerRef.current.rotation.z = t * 0.2;

    wireRef.current.rotation.y = t * rotSpeed * 0.5;
    wireRef.current.rotation.x = Math.cos(t * 0.2) * 0.1;

    const targetColor = segmentColors[activeSegment % segmentColors.length];
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    mat.emissive.lerp(targetColor, 0.05);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.15 + intensity * 0.5, 0.05);

    const innerMat = innerRef.current.material as THREE.MeshStandardMaterial;
    innerMat.emissive.lerp(targetColor, 0.05);
    innerMat.emissiveIntensity = THREE.MathUtils.lerp(innerMat.emissiveIntensity, 0.3 + intensity * 0.8, 0.05);

    if (lightRef.current) {
      lightRef.current.color.lerp(targetColor, 0.05);
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0.5 + intensity * 2, 0.05);
    }

    // Breathing scale
    const breathe = 1 + Math.sin(t * 0.8) * 0.02;
    meshRef.current.scale.setScalar(breathe);
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group>
        {/* Main Crystal */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshPhysicalMaterial
            color="#0a0a1a"
            metalness={0.2}
            roughness={0.05}
            transmission={0.85}
            thickness={2}
            ior={2.4}
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0}
            emissive="#4d19e6"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Inner Crystal */}
        <mesh ref={innerRef} scale={0.5}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#4d19e6"
            emissive="#4d19e6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Wireframe */}
        <mesh ref={wireRef} scale={1.6}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            wireframe
            color="#4d19e6"
            transparent
            opacity={0.08}
          />
        </mesh>

        {/* Inner Glow */}
        <pointLight ref={lightRef} intensity={0.5} color="#4d19e6" distance={5} />

        {/* Orbital Rings */}
        <OrbitalRing radius={2.2} rotation={[Math.PI / 4, 0, 0]} />
        <OrbitalRing radius={2.0} rotation={[Math.PI / 3, Math.PI / 6, 0]} />
        <OrbitalRing radius={2.4} rotation={[-Math.PI / 5, Math.PI / 4, Math.PI / 8]} />

        {/* Floating Satellites */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Satellite key={i} index={i} total={12} />
        ))}
      </group>
    </Float>
  );
}

export default function InsightCrystal({
  activeSegment = 0,
  intensity = 0,
}: {
  activeSegment?: number;
  intensity?: number;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />
      <directionalLight position={[-3, -2, 4]} intensity={0.1} color="#7c4dff" />
      <Crystal activeSegment={activeSegment} intensity={intensity} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />
    </Canvas>
  );
}
