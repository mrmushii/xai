"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 3500;

/* ---------- Seeded Random ---------- */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ---------- Simple noise for brain folds (gyri/sulci) ---------- */
function noise3D(x: number, y: number, z: number): number {
  const n =
    Math.sin(x * 1.7 + y * 3.1) * 0.5 +
    Math.sin(y * 2.3 + z * 1.9) * 0.3 +
    Math.sin(z * 3.7 + x * 2.1) * 0.2 +
    Math.sin(x * 5.3 + y * 4.7 + z * 3.1) * 0.15;
  return n;
}

/* ---------- Brain Surface Generator ---------- */
/*
  Generates points on a human brain surface:
  - Two hemispheres with a longitudinal fissure
  - Wider frontal lobe, narrower occipital
  - Temporal lobes extending downward
  - Surface perturbation for gyri/sulci (folds)
  - Cerebellum bump at the back-bottom
  - Brain stem hint at the base
*/
function generateBrainPosition(
  t: number,     // 0→1, parameterizes the surface
  rng: () => number,
  scale: number
): [number, number, number] {
  // Choose hemisphere: left or right
  const hemisphere = rng() > 0.5 ? 1 : -1;

  // Spherical sampling on a hemisphere
  const u = rng() * Math.PI; // polar angle (top to bottom)
  const v = rng() * Math.PI; // azimuthal (front to back, half-sphere per side)

  // Base ellipsoid dimensions (brain proportions)
  // X = left-right (width), Y = top-bottom (height), Z = front-back (length)
  const baseWidth = 1.8;  // half-width of each hemisphere
  const baseHeight = 2.2; // top-to-bottom
  const baseLength = 2.8; // front-to-back (brains are longer than wide)

  // Asymmetric profile: frontal lobe wider, occipital narrower
  const frontBackT = Math.cos(v); // -1 (back) to 1 (front)
  const widthMod = 1.0 + frontBackT * 0.15; // wider at front
  const heightMod = 1.0 - Math.abs(frontBackT) * 0.1;

  // Temporal lobe: widen and push down at the sides
  const topBottomT = Math.cos(u); // 1 (top) to -1 (bottom)
  const temporalBulge = topBottomT < -0.2 ? (1 + Math.abs(topBottomT + 0.2) * 0.6) : 1.0;

  // Surface position on ellipsoid
  let x = hemisphere * Math.sin(u) * Math.sin(v) * baseWidth * widthMod * temporalBulge;
  let y = Math.cos(u) * baseHeight * heightMod;
  let z = Math.cos(v) * baseLength;

  // Longitudinal fissure: push hemispheres apart slightly
  x += hemisphere * 0.15;

  // Flatten the bottom slightly (brain sits on the skull base)
  if (y < -baseHeight * 0.6) {
    y = -baseHeight * 0.6 + (y + baseHeight * 0.6) * 0.3;
  }

  // Cerebellum: extra particles at back-bottom
  if (rng() < 0.12) {
    const cAngle = rng() * Math.PI * 2;
    const cR = 0.5 + rng() * 0.6;
    x = Math.cos(cAngle) * cR * 1.2;
    y = -baseHeight * 0.55 - rng() * 0.5;
    z = -baseLength * 0.6 - rng() * 0.4;
  }

  // Brain stem: thin column at bottom-back
  if (rng() < 0.04) {
    x = (rng() - 0.5) * 0.3;
    y = -baseHeight * 0.7 - rng() * 0.8;
    z = -baseLength * 0.3 + (rng() - 0.5) * 0.2;
  }

  // Gyri/sulci: surface perturbation (folds)
  const foldIntensity = 0.18;
  const fold = noise3D(x * 3, y * 3, z * 3) * foldIntensity;
  // Push along the surface normal (radial direction)
  const dist = Math.sqrt(x * x + y * y + z * z) || 1;
  x += (x / dist) * fold;
  y += (y / dist) * fold;
  z += (z / dist) * fold;

  // Fill some interior volume for density (not all on surface)
  const depthFactor = 0.6 + rng() * 0.4; // 60-100% radius
  x *= depthFactor;
  y *= depthFactor;
  z *= depthFactor;

  return [x * scale, y * scale, z * scale];
}

/* ---------- Neural Connection Lines (synapses) ---------- */
function SynapticConnections({
  positions,
  scrollProgress,
}: {
  positions: Float32Array;
  scrollProgress: number;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const { clock } = useThree();

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const maxConnections = 4000;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);
    geo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!linesRef.current) return;

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
    const t = clock.elapsedTime;

    // Fade in/out
    let lineOpacity = 1;
    if (scrollProgress < 0.4) lineOpacity = (scrollProgress - 0.3) / 0.1;
    else if (scrollProgress > 0.55) lineOpacity = 1 - (scrollProgress - 0.55) / 0.1;

    const connectionThreshold = 0.55;
    let lineCount = 0;
    const maxConnections = 4000;

    // Sample subset for performance (not all N² pairs)
    const step = 3;
    for (let i = 0; i < PARTICLE_COUNT && lineCount < maxConnections; i += step) {
      for (
        let j = i + 1;
        j < Math.min(i + 60, PARTICLE_COUNT) && lineCount < maxConnections;
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

          // Neural firing pulse: color travels along connections
          const pulse = Math.sin(t * 3 + i * 0.05) * 0.5 + 0.5;
          const alpha =
            (1 - dist / connectionThreshold) * lineOpacity * 0.5;
          colArr[idx] = (0.3 + pulse * 0.5) * alpha;
          colArr[idx + 1] = (0.1 + pulse * 0.8) * alpha;
          colArr[idx + 2] = 0.9 * alpha;
          colArr[idx + 3] = (0.3 + pulse * 0.5) * alpha;
          colArr[idx + 4] = (0.1 + pulse * 0.8) * alpha;
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
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* ---------- Main Particle System ---------- */
function ParticleSystem({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  const clickPulseRef = useRef({ time: -10, x: 0, y: 0 }); // for click interaction

  const { chaosPositions, gridPositions, explodePositions, positions, colors, sizes } =
    useMemo(() => {
      const rng = seededRandom(42);
      const chaos = new Float32Array(PARTICLE_COUNT * 3);
      const grid = new Float32Array(PARTICLE_COUNT * 3);
      const explode = new Float32Array(PARTICLE_COUNT * 3);
      const pos = new Float32Array(PARTICLE_COUNT * 3);
      const col = new Float32Array(PARTICLE_COUNT * 3);
      const sz = new Float32Array(PARTICLE_COUNT);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Chaos: random sphere
        const theta = rng() * Math.PI * 2;
        const phi = Math.acos(2 * rng() - 1);
        const r = 3 + rng() * 5;
        chaos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        chaos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        chaos[i * 3 + 2] = r * Math.cos(phi);

        // Brain shape positions
        const [bx, by, bz] = generateBrainPosition(i / PARTICLE_COUNT, rng, 1.0);
        grid[i * 3] = bx;
        grid[i * 3 + 1] = by;
        grid[i * 3 + 2] = bz;

        // Explode: outward from brain
        const eTheta = rng() * Math.PI * 2;
        const ePhi = Math.acos(2 * rng() - 1);
        const eR = 14 + rng() * 12;
        explode[i * 3] = eR * Math.sin(ePhi) * Math.cos(eTheta);
        explode[i * 3 + 1] = eR * Math.sin(ePhi) * Math.sin(eTheta);
        explode[i * 3 + 2] = eR * Math.cos(ePhi);

        // Start at chaos
        pos[i * 3] = chaos[i * 3];
        pos[i * 3 + 1] = chaos[i * 3 + 1];
        pos[i * 3 + 2] = chaos[i * 3 + 2];

        // Colors: mix of purples, blues, and some cyans for neural look
        const colorType = rng();
        if (colorType < 0.4) {
          // Purple neurons
          col[i * 3] = 0.35 + rng() * 0.2;
          col[i * 3 + 1] = 0.08 + rng() * 0.12;
          col[i * 3 + 2] = 0.85 + rng() * 0.15;
        } else if (colorType < 0.7) {
          // Blue synapses
          col[i * 3] = 0.15 + rng() * 0.1;
          col[i * 3 + 1] = 0.3 + rng() * 0.2;
          col[i * 3 + 2] = 0.9 + rng() * 0.1;
        } else if (colorType < 0.9) {
          // Cyan highlights
          col[i * 3] = 0.1 + rng() * 0.1;
          col[i * 3 + 1] = 0.6 + rng() * 0.2;
          col[i * 3 + 2] = 0.8 + rng() * 0.15;
        } else {
          // Bright white neuron hubs
          col[i * 3] = 0.7 + rng() * 0.3;
          col[i * 3 + 1] = 0.6 + rng() * 0.3;
          col[i * 3 + 2] = 0.9 + rng() * 0.1;
        }

        // Variable sizes: hub neurons bigger
        sz[i] = rng() < 0.05 ? 0.08 + rng() * 0.04 : 0.03 + rng() * 0.025;
      }

      return {
        chaosPositions: chaos,
        gridPositions: grid,
        explodePositions: explode,
        positions: pos,
        colors: col,
        sizes: sz,
      };
    }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  // Click handler for neural firing pulse
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      clickPulseRef.current = { time: performance.now() / 1000, x, y };
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

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
    const isGrid = scrollProgress > 0.3 && scrollProgress < 0.7;

    // Click pulse timing
    const clickAge = t - clickPulseRef.current.time;
    const clickActive = clickAge < 2.0 && clickAge > 0;
    const clickX = (clickPulseRef.current.x * viewport.width) / 2;
    const clickY = (clickPulseRef.current.y * viewport.height) / 2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let tx: number, ty: number, tz: number;

      if (scrollProgress < 0.35) {
        const p = scrollProgress / 0.35;
        // Ease in with cubic for smoother convergence
        const ep = p * p * (3 - 2 * p);
        tx = chaosPositions[i3] + (gridPositions[i3] - chaosPositions[i3]) * ep;
        ty = chaosPositions[i3 + 1] + (gridPositions[i3 + 1] - chaosPositions[i3 + 1]) * ep;
        tz = chaosPositions[i3 + 2] + (gridPositions[i3 + 2] - chaosPositions[i3 + 2]) * ep;
      } else if (scrollProgress < 0.65) {
        tx = gridPositions[i3];
        ty = gridPositions[i3 + 1];
        tz = gridPositions[i3 + 2];
      } else {
        const p = (scrollProgress - 0.65) / 0.35;
        const ep = p * p;
        tx = gridPositions[i3] + (explodePositions[i3] - gridPositions[i3]) * ep;
        ty = gridPositions[i3 + 1] + (explodePositions[i3 + 1] - gridPositions[i3 + 1]) * ep;
        tz = gridPositions[i3 + 2] + (explodePositions[i3 + 2] - gridPositions[i3 + 2]) * ep;
      }

      // Smooth interpolation
      posArr[i3] += (tx - posArr[i3]) * 0.06;
      posArr[i3 + 1] += (ty - posArr[i3 + 1]) * 0.06;
      posArr[i3 + 2] += (tz - posArr[i3 + 2]) * 0.06;

      // Subtle breathing motion in brain mode 
      if (isGrid) {
        const breathe = Math.sin(t * 0.8) * 0.008;
        const distFromCenter = Math.sqrt(
          gridPositions[i3] ** 2 + gridPositions[i3 + 1] ** 2 + gridPositions[i3 + 2] ** 2
        ) || 1;
        posArr[i3] += (gridPositions[i3] / distFromCenter) * breathe;
        posArr[i3 + 1] += (gridPositions[i3 + 1] / distFromCenter) * breathe;
        posArr[i3 + 2] += (gridPositions[i3 + 2] / distFromCenter) * breathe;
      } else {
        // Floating motion when scattered
        posArr[i3] += Math.sin(t * 0.3 + i * 0.01) * 0.008;
        posArr[i3 + 1] += Math.cos(t * 0.2 + i * 0.015) * 0.008;
      }

      // Neural activity wave: electrical impulse traveling across brain
      if (isGrid) {
        const waveSpeed = 1.5;
        const wavePos = (t * waveSpeed) % 8 - 4; // travels left to right
        const distFromWave = Math.abs(posArr[i3] - wavePos);
        if (distFromWave < 0.8) {
          const waveIntensity = 1 - distFromWave / 0.8;
          colArr[i3] = Math.min(1, colArr[i3] + waveIntensity * 0.6);
          colArr[i3 + 1] = Math.min(1, colArr[i3 + 1] + waveIntensity * 0.8);
          colArr[i3 + 2] = Math.min(1, colArr[i3 + 2] + waveIntensity * 0.3);
        } else {
          // Return to base color gradually
          const baseR = i % 3 === 0 ? 0.35 : i % 3 === 1 ? 0.15 : 0.1;
          const baseG = i % 3 === 0 ? 0.1 : i % 3 === 1 ? 0.4 : 0.65;
          const baseB = 0.88;
          colArr[i3] = THREE.MathUtils.lerp(colArr[i3], baseR, 0.02);
          colArr[i3 + 1] = THREE.MathUtils.lerp(colArr[i3 + 1], baseG, 0.02);
          colArr[i3 + 2] = THREE.MathUtils.lerp(colArr[i3 + 2], baseB, 0.02);
        }
      }

      // Click pulse: ripple expanding outward from click point
      if (clickActive && isGrid) {
        const cdx = posArr[i3] - clickX;
        const cdy = posArr[i3 + 1] - clickY;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        const rippleRadius = clickAge * 4; // expanding ring
        const rippleWidth = 0.8;
        const distFromRing = Math.abs(cdist - rippleRadius);
        if (distFromRing < rippleWidth) {
          const rippleStrength = (1 - distFromRing / rippleWidth) * Math.max(0, 1 - clickAge / 2);
          // Bright flash on the ring
          colArr[i3] = Math.min(1, colArr[i3] + rippleStrength);
          colArr[i3 + 1] = Math.min(1, colArr[i3 + 1] + rippleStrength * 0.8);
          colArr[i3 + 2] = Math.min(1, colArr[i3 + 2] + rippleStrength * 0.5);
          // Push particles outward from ring
          if (cdist > 0.01) {
            const pushForce = rippleStrength * 0.15;
            posArr[i3] += (cdx / cdist) * pushForce;
            posArr[i3 + 1] += (cdy / cdist) * pushForce;
          }
        }
      }

      // Mouse proximity — strong repulsion + glow halo
      const dx = posArr[i3] - mouseX;
      const dy = posArr[i3 + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const interactRadius = isGrid ? 2.5 : 1.5;
      if (dist < interactRadius) {
        const normForce = 1 - dist / interactRadius;

        // Bright glow — neurons "fire" near cursor
        const glow = isGrid ? normForce * 2 : normForce * 0.5;
        colArr[i3] = Math.min(1, colArr[i3] + glow * 0.8);
        colArr[i3 + 1] = Math.min(1, colArr[i3 + 1] + glow * 1.2);
        colArr[i3 + 2] = Math.min(1, colArr[i3 + 2] + glow * 0.4);

        // Position displacement — push particles along the brain surface
        if (isGrid && dist > 0.01) {
          const repelForce = normForce * normForce * 0.3;
          posArr[i3] += (dx / dist) * repelForce;
          posArr[i3 + 1] += (dy / dist) * repelForce;
          // Also push in Z slightly for depth effect
          posArr[i3 + 2] += normForce * 0.05;
        }
      }
    }

    // Fade during explode
    if (scrollProgress > 0.75) {
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        Math.max(0, 1 - (scrollProgress - 0.75) / 0.25),
        0.1
      );
    } else {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.9, 0.1);
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Slow rotation — brain slowly turns so you see its 3D shape
    pointsRef.current.rotation.y = t * 0.04;
    pointsRef.current.rotation.x = Math.sin(t * 0.02) * 0.08;
    // Slight tilt to show the brain from a ¾ angle
    pointsRef.current.rotation.z = 0.1;
  });

  return (
    <>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          vertexColors
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <SynapticConnections positions={positions} scrollProgress={scrollProgress} />
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
        camera={{ position: [0, 0.5, 6], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={0.3} color="#7c4dff" />
        <pointLight position={[-3, -1, 2]} intensity={0.2} color="#00bcd4" />
        <ParticleSystem scrollProgress={progress} />
      </Canvas>
    </div>
  );
}
