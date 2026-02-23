"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 2500;

/* ---------- Seeded Random for deterministic particles ---------- */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ---------- Connection Lines (grid mode only) ---------- */
function ConnectionLines({
  positions,
  scrollProgress,
}: {
  positions: Float32Array;
  scrollProgress: number;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const maxConnections = 3000;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);
    geo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!linesRef.current) return;

    // Only show connections in the converged grid phase (0.3 – 0.65)
    const gridPhase = scrollProgress > 0.3 && scrollProgress < 0.65;
    if (!gridPhase) {
      linesRef.current.visible = false;
      return;
    }

    linesRef.current.visible = true;
    const posAttr = linesRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const colAttr = linesRef.current.geometry.attributes
      .color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    // Fade in 0.3→0.4, full 0.4→0.55, fade out 0.55→0.65
    let lineOpacity = 1;
    if (scrollProgress < 0.4) lineOpacity = (scrollProgress - 0.3) / 0.1;
    else if (scrollProgress > 0.55) lineOpacity = 1 - (scrollProgress - 0.55) / 0.1;

    const connectionThreshold = 0.8;
    let lineCount = 0;
    const maxConnections = 3000;

    for (let i = 0; i < PARTICLE_COUNT && lineCount < maxConnections; i++) {
      for (
        let j = i + 1;
        j < PARTICLE_COUNT && lineCount < maxConnections;
        j++
      ) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionThreshold) {
          const idx = lineCount * 6;
          posArr[idx] = positions[i * 3];
          posArr[idx + 1] = positions[i * 3 + 1];
          posArr[idx + 2] = positions[i * 3 + 2];
          posArr[idx + 3] = positions[j * 3];
          posArr[idx + 4] = positions[j * 3 + 1];
          posArr[idx + 5] = positions[j * 3 + 2];

          const alpha =
            (1 - dist / connectionThreshold) * lineOpacity * 0.4;
          colArr[idx] = 0.3;
          colArr[idx + 1] = 0.1;
          colArr[idx + 2] = 0.9 * alpha;
          colArr[idx + 3] = 0.3;
          colArr[idx + 4] = 0.1;
          colArr[idx + 5] = 0.9 * alpha;
          lineCount++;
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, lineCount * 2);
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* ---------- Main Particle System ---------- */
/*
  3-phase scroll behavior:
  Phase 1 (0.0 – 0.35): scattered chaos → converge to grid
  Phase 2 (0.35 – 0.65): hold as structured grid (+ color wave + connections)
  Phase 3 (0.65 – 1.0): explode outward (scatter far away) + fade out
*/
function ParticleSystem({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();

  const { chaosPositions, gridPositions, explodePositions, positions, colors } =
    useMemo(() => {
      const rng = seededRandom(42);
      const chaos = new Float32Array(PARTICLE_COUNT * 3);
      const grid = new Float32Array(PARTICLE_COUNT * 3);
      const explode = new Float32Array(PARTICLE_COUNT * 3);
      const pos = new Float32Array(PARTICLE_COUNT * 3);
      const col = new Float32Array(PARTICLE_COUNT * 3);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Chaos: random sphere
        const theta = rng() * Math.PI * 2;
        const phi = Math.acos(2 * rng() - 1);
        const r = 3 + rng() * 4;
        chaos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        chaos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        chaos[i * 3 + 2] = r * Math.cos(phi);

        // Explode: far outward from grid position (much larger radius)
        const eTheta = rng() * Math.PI * 2;
        const ePhi = Math.acos(2 * rng() - 1);
        const eR = 12 + rng() * 10;
        explode[i * 3] = eR * Math.sin(ePhi) * Math.cos(eTheta);
        explode[i * 3 + 1] = eR * Math.sin(ePhi) * Math.sin(eTheta);
        explode[i * 3 + 2] = eR * Math.cos(ePhi);

        // Start at chaos
        pos[i * 3] = chaos[i * 3];
        pos[i * 3 + 1] = chaos[i * 3 + 1];
        pos[i * 3 + 2] = chaos[i * 3 + 2];

        // Base colors
        col[i * 3] = 0.3 + rng() * 0.2;
        col[i * 3 + 1] = 0.1 + rng() * 0.1;
        col[i * 3 + 2] = 0.9 + rng() * 0.1;
      }

      // Grid positions
      const gridSize = Math.ceil(Math.cbrt(PARTICLE_COUNT));
      const spacing = 0.45;
      const offset = (gridSize * spacing) / 2;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        grid[i * 3] = (i % gridSize) * spacing - offset;
        grid[i * 3 + 1] =
          (Math.floor(i / gridSize) % gridSize) * spacing - offset;
        grid[i * 3 + 2] =
          Math.floor(i / (gridSize * gridSize)) * spacing - offset;
      }

      return {
        chaosPositions: chaos,
        gridPositions: grid,
        explodePositions: explode,
        positions: pos,
        colors: col,
      };
    }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const colAttr = pointsRef.current.geometry.attributes
      .color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;
    const t = state.clock.elapsedTime;
    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let tx: number, ty: number, tz: number;

      if (scrollProgress < 0.35) {
        // Phase 1: chaos → grid
        const p = scrollProgress / 0.35; // 0→1
        tx = chaosPositions[i3] + (gridPositions[i3] - chaosPositions[i3]) * p;
        ty =
          chaosPositions[i3 + 1] +
          (gridPositions[i3 + 1] - chaosPositions[i3 + 1]) * p;
        tz =
          chaosPositions[i3 + 2] +
          (gridPositions[i3 + 2] - chaosPositions[i3 + 2]) * p;
      } else if (scrollProgress < 0.65) {
        // Phase 2: hold grid
        tx = gridPositions[i3];
        ty = gridPositions[i3 + 1];
        tz = gridPositions[i3 + 2];
      } else {
        // Phase 3: grid → explode outward
        const p = (scrollProgress - 0.65) / 0.35; // 0→1
        tx =
          gridPositions[i3] +
          (explodePositions[i3] - gridPositions[i3]) * p;
        ty =
          gridPositions[i3 + 1] +
          (explodePositions[i3 + 1] - gridPositions[i3 + 1]) * p;
        tz =
          gridPositions[i3 + 2] +
          (explodePositions[i3 + 2] - gridPositions[i3 + 2]) * p;
      }

      // Smooth interpolation
      posArr[i3] += (tx - posArr[i3]) * 0.08;
      posArr[i3 + 1] += (ty - posArr[i3 + 1]) * 0.08;
      posArr[i3 + 2] += (tz - posArr[i3 + 2]) * 0.08;

      // Floating motion (stronger when scattered, weaker in grid)
      const isGrid = scrollProgress > 0.3 && scrollProgress < 0.7;
      const floatIntensity = isGrid ? 0.15 : 1;
      posArr[i3] += Math.sin(t * 0.3 + i * 0.01) * 0.005 * floatIntensity;
      posArr[i3 + 1] +=
        Math.cos(t * 0.2 + i * 0.015) * 0.005 * floatIntensity;

      // Color wave in grid phase
      if (scrollProgress > 0.3 && scrollProgress < 0.7) {
        const wave = Math.sin(t * 2 + i * 0.03) * 0.5 + 0.5;
        colArr[i3] = THREE.MathUtils.lerp(colArr[i3], 0.3 + wave * 0.4, 0.02);
        colArr[i3 + 1] = THREE.MathUtils.lerp(
          colArr[i3 + 1],
          0.08 + wave * 0.5,
          0.02
        );
        colArr[i3 + 2] = THREE.MathUtils.lerp(colArr[i3 + 2], 0.9, 0.02);
      }

      // Cursor proximity
      const dx = posArr[i3] - mouseX;
      const dy = posArr[i3 + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2.5) {
        const force = (1 - dist / 2.5) * 0.15;
        colArr[i3] = 0.3 + force * 2;
        colArr[i3 + 1] = 0.1 + force * 1.5;
        colArr[i3 + 2] = 0.9 + force * 0.5;
      }
    }

    // Fade opacity during explode phase
    if (scrollProgress > 0.75) {
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        Math.max(0, 1 - (scrollProgress - 0.75) / 0.25),
        0.1
      );
    } else {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.85, 0.1);
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.03;
    pointsRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
  });

  return (
    <>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          vertexColors
          size={0.04}
          sizeAttenuation
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <ConnectionLines positions={positions} scrollProgress={scrollProgress} />
    </>
  );
}

/* ---------- Exported Component ---------- */
export default function ParticleField({
  scrollProgress: externalProgress,
}: {
  scrollProgress?: number;
}) {
  const [internalProgress, setInternalProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progress =
    externalProgress !== undefined ? externalProgress : internalProgress;

  useEffect(() => {
    if (externalProgress !== undefined) return;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const total = containerRef.current.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      setInternalProgress(Math.max(0, Math.min(1, -rect.top / total)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [externalProgress]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <ParticleSystem scrollProgress={progress} />
      </Canvas>
    </div>
  );
}
