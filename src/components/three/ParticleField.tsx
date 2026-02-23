"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 4000;

/* ---------- Seeded Random ---------- */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ---------- Brain Shape: Two Hemispheres ---------- */
/*
  The most recognizable brain shape: TWO WALNUT HALVES.
  Each hemisphere is an egg/oval shape with:
  - Deep central fissure (medial longitudinal fissure)
  - Wrinkled surface (gyri & sulci)
  - Wider at top-back, narrower at front-bottom
  - Flat inner face where they meet
  
  Coordinate system: X = left/right, Y = up/down, Z = front/back
  Particles placed on SURFACE ONLY for clear shape definition.
*/

function generateHemisphere(
  rng: () => number,
  side: 1 | -1, // +1 = right, -1 = left
): [number, number, number] {
  // Spherical coordinates for surface sampling
  const u = Math.acos(1 - 2 * rng()); // polar (0=top, PI=bottom) — uniform distribution on sphere
  const v = rng() * Math.PI * 2;       // azimuthal

  // Brain hemisphere profile (egg-shaped, not a perfect sphere)
  // Wider at the back-top, narrower at the front-bottom
  const sinU = Math.sin(u);
  const cosU = Math.cos(u);
  const sinV = Math.sin(v);
  const cosV = Math.cos(v);

  // Radii: brain is ~140mm L, ~120mm W (per hemisphere), ~100mm H
  const rX = 0.55;   // half-width of one hemisphere
  const rY = 0.75;   // height (top to bottom)
  const rZ = 0.9;    // length (front to back)

  // Shape modifiers for realistic proportions:
  // 1. Flatter on the bottom (brain base)
  const bottomFlatten = cosU < 0 ? 0.5 + 0.5 * (1 + cosU) : 1.0;
  // 2. Wider in back, narrower in front (frontal lobe is narrower)
  const frontNarrow = 1.0 + cosV * 0.08;
  // 3. The medial (inner) face is flatter — squish the inner side
  const medialFlatten = 0.85;

  // Base surface point
  let x = sinU * sinV * rX * frontNarrow;
  let y = cosU * rY * bottomFlatten;
  let z = sinU * cosV * rZ;

  // Flatten the inner face: reduce x when pointing inward
  if (side * x < 0) {
    x *= medialFlatten;
  }

  // Shift hemisphere outward to create the central fissure gap
  x += side * 0.18;

  // Wrinkles (gyri/sulci): multiple frequencies for realistic folds
  // These are the brain's most recognizable surface feature
  const wx = x * 12, wy = y * 10, wz = z * 8;
  const wrinkle =
    Math.sin(wx + wy * 0.7) * 0.025 +
    Math.sin(wy * 1.3 + wz * 0.9) * 0.022 +
    Math.sin(wz * 1.5 + wx * 0.6) * 0.018 +
    Math.sin(wx * 2.1 + wy * 1.7 + wz * 1.2) * 0.012;

  // Displace along surface normal (approximately radial)
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  x += (x / len) * wrinkle;
  y += (y / len) * wrinkle;
  z += (z / len) * wrinkle;

  // Keep particles strictly on surface (95-100% radius) for sharp shape
  const depth = 0.95 + rng() * 0.05;
  // But also add a small percentage inside for density
  const isInterior = rng() < 0.08;
  const finalDepth = isInterior ? 0.5 + rng() * 0.45 : depth;
  x = (x - side * 0.18) * finalDepth + side * 0.18;
  y *= finalDepth;
  z *= finalDepth;

  return [x, y, z];
}

/* ---------- Cerebellum (at back-bottom) ---------- */
function generateCerebellum(rng: () => number): [number, number, number] {
  const side = rng() > 0.5 ? 1 : -1;
  const u = Math.acos(1 - 2 * rng());
  const v = rng() * Math.PI * 2;

  let x = Math.sin(u) * Math.sin(v) * 0.35 * side;
  let y = Math.cos(u) * 0.22 - 0.65;     // sits below the cerebrum
  let z = Math.sin(u) * Math.cos(v) * 0.3 - 0.55; // sits behind

  // Cerebellum has tight horizontal ridges (folia)
  const ridge = Math.sin(y * 40) * 0.012;
  x += ridge;

  x += side * 0.05; // slight gap

  return [x, y, z];
}

/* ---------- Brain Stem ---------- */
function generateBrainStem(rng: () => number): [number, number, number] {
  const angle = rng() * Math.PI * 2;
  const r = 0.06 + rng() * 0.04;
  const x = Math.cos(angle) * r;
  const y = -0.7 - rng() * 0.4;
  const z = -0.4 + Math.sin(angle) * r * 0.5;
  return [x, y, z];
}

/* ---------- Synaptic Connection Lines ---------- */
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
    const max = 5000;
    const lp = new Float32Array(max * 6);
    const lc = new Float32Array(max * 6);
    geo.setAttribute("position", new THREE.BufferAttribute(lp, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(lc, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!linesRef.current) return;
    const inBrain = scrollProgress > 0.3 && scrollProgress < 0.65;
    if (!inBrain) {
      linesRef.current.visible = false;
      return;
    }
    linesRef.current.visible = true;

    const posAttr = linesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = linesRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const pa = posAttr.array as Float32Array;
    const ca = colAttr.array as Float32Array;
    const t = clock.elapsedTime;

    let alpha = 1;
    if (scrollProgress < 0.38) alpha = (scrollProgress - 0.3) / 0.08;
    else if (scrollProgress > 0.57) alpha = 1 - (scrollProgress - 0.57) / 0.08;

    const thresh = 0.18; // tight threshold — only very nearby particles connect
    let cnt = 0;
    const max = 5000;

    for (let i = 0; i < PARTICLE_COUNT && cnt < max; i += 2) {
      for (let j = i + 1; j < Math.min(i + 25, PARTICLE_COUNT) && cnt < max; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < thresh) {
          const idx = cnt * 6;
          pa[idx] = positions[i * 3]; pa[idx + 1] = positions[i * 3 + 1]; pa[idx + 2] = positions[i * 3 + 2];
          pa[idx + 3] = positions[j * 3]; pa[idx + 4] = positions[j * 3 + 1]; pa[idx + 5] = positions[j * 3 + 2];
          const pulse = Math.sin(t * 2 + i * 0.03) * 0.5 + 0.5;
          const a = (1 - d / thresh) * alpha * 0.5;
          ca[idx] = (0.3 + pulse * 0.3) * a; ca[idx + 1] = (0.1 + pulse * 0.5) * a; ca[idx + 2] = 0.85 * a;
          ca[idx + 3] = ca[idx]; ca[idx + 4] = ca[idx + 1]; ca[idx + 5] = ca[idx + 2];
          cnt++;
        }
      }
    }
    linesRef.current.geometry.setDrawRange(0, cnt * 2);
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

/* ---------- Main Particle System ---------- */
function ParticleSystem({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  const clickPulseRef = useRef({ time: -10, x: 0, y: 0 });

  const data = useMemo(() => {
    const rng = seededRandom(42);
    const chaos = new Float32Array(PARTICLE_COUNT * 3);
    const brain = new Float32Array(PARTICLE_COUNT * 3);
    const explode = new Float32Array(PARTICLE_COUNT * 3);
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    // Allocation: 88% cerebrum, 9% cerebellum, 3% brain stem
    const cerebellumStart = Math.floor(PARTICLE_COUNT * 0.88);
    const stemStart = Math.floor(PARTICLE_COUNT * 0.97);

    const SCALE = 2.2; // overall brain scale

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Chaos: scattered sphere
      const ct = rng() * Math.PI * 2;
      const cp = Math.acos(2 * rng() - 1);
      const cr = 3 + rng() * 5;
      chaos[i * 3] = cr * Math.sin(cp) * Math.cos(ct);
      chaos[i * 3 + 1] = cr * Math.sin(cp) * Math.sin(ct);
      chaos[i * 3 + 2] = cr * Math.cos(cp);

      // Brain shape
      let bx: number, by: number, bz: number;
      if (i >= stemStart) {
        [bx, by, bz] = generateBrainStem(rng);
      } else if (i >= cerebellumStart) {
        [bx, by, bz] = generateCerebellum(rng);
      } else {
        const side: 1 | -1 = i < cerebellumStart / 2 ? 1 : -1;
        [bx, by, bz] = generateHemisphere(rng, side);
      }
      brain[i * 3] = bx * SCALE;
      brain[i * 3 + 1] = by * SCALE;
      brain[i * 3 + 2] = bz * SCALE;

      // Explode
      const et = rng() * Math.PI * 2;
      const ep = Math.acos(2 * rng() - 1);
      const er = 14 + rng() * 12;
      explode[i * 3] = er * Math.sin(ep) * Math.cos(et);
      explode[i * 3 + 1] = er * Math.sin(ep) * Math.sin(et);
      explode[i * 3 + 2] = er * Math.cos(ep);

      // Start at chaos
      pos[i * 3] = chaos[i * 3];
      pos[i * 3 + 1] = chaos[i * 3 + 1];
      pos[i * 3 + 2] = chaos[i * 3 + 2];

      // Colors
      const c = rng();
      if (i >= stemStart) {
        col[i * 3] = 0.2; col[i * 3 + 1] = 0.12; col[i * 3 + 2] = 0.45;
      } else if (i >= cerebellumStart) {
        col[i * 3] = 0.25; col[i * 3 + 1] = 0.18; col[i * 3 + 2] = 0.65;
      } else if (c < 0.5) {
        col[i * 3] = 0.35 + rng() * 0.1; col[i * 3 + 1] = 0.08 + rng() * 0.06; col[i * 3 + 2] = 0.85 + rng() * 0.1;
      } else if (c < 0.8) {
        col[i * 3] = 0.2 + rng() * 0.1; col[i * 3 + 1] = 0.25 + rng() * 0.12; col[i * 3 + 2] = 0.8 + rng() * 0.1;
      } else {
        col[i * 3] = 0.55 + rng() * 0.25; col[i * 3 + 1] = 0.45 + rng() * 0.2; col[i * 3 + 2] = 0.9;
      }
    }

    return { chaos, brain, explode, pos, col };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(data.pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(data.col, 3));
    return geo;
  }, [data]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const c = document.querySelector("canvas");
      if (!c) return;
      const r = c.getBoundingClientRect();
      clickPulseRef.current = {
        time: performance.now() / 1000,
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -((e.clientY - r.top) / r.height) * 2 + 1,
      };
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const p = posAttr.array as Float32Array;
    const c = colAttr.array as Float32Array;
    const t = state.clock.elapsedTime;
    const mx = (mouse.x * viewport.width) / 2;
    const my = (mouse.y * viewport.height) / 2;
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    const inBrain = scrollProgress > 0.3 && scrollProgress < 0.7;

    const cAge = t - clickPulseRef.current.time;
    const cActive = cAge < 2 && cAge > 0;
    const cx = (clickPulseRef.current.x * viewport.width) / 2;
    const cy = (clickPulseRef.current.y * viewport.height) / 2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let tx: number, ty: number, tz: number;

      if (scrollProgress < 0.35) {
        const s = scrollProgress / 0.35;
        const e = s * s * (3 - 2 * s);
        tx = data.chaos[i3] + (data.brain[i3] - data.chaos[i3]) * e;
        ty = data.chaos[i3 + 1] + (data.brain[i3 + 1] - data.chaos[i3 + 1]) * e;
        tz = data.chaos[i3 + 2] + (data.brain[i3 + 2] - data.chaos[i3 + 2]) * e;
      } else if (scrollProgress < 0.65) {
        tx = data.brain[i3]; ty = data.brain[i3 + 1]; tz = data.brain[i3 + 2];
      } else {
        const s = (scrollProgress - 0.65) / 0.35;
        const e = s * s;
        tx = data.brain[i3] + (data.explode[i3] - data.brain[i3]) * e;
        ty = data.brain[i3 + 1] + (data.explode[i3 + 1] - data.brain[i3 + 1]) * e;
        tz = data.brain[i3 + 2] + (data.explode[i3 + 2] - data.brain[i3 + 2]) * e;
      }

      p[i3] += (tx - p[i3]) * 0.06;
      p[i3 + 1] += (ty - p[i3 + 1]) * 0.06;
      p[i3 + 2] += (tz - p[i3 + 2]) * 0.06;

      // Gentle breathing
      if (inBrain) {
        const br = Math.sin(t * 0.6) * 0.004;
        const gd = Math.sqrt(data.brain[i3] ** 2 + data.brain[i3 + 1] ** 2 + data.brain[i3 + 2] ** 2) || 1;
        p[i3] += (data.brain[i3] / gd) * br;
        p[i3 + 1] += (data.brain[i3 + 1] / gd) * br;
      } else {
        p[i3] += Math.sin(t * 0.3 + i * 0.01) * 0.005;
        p[i3 + 1] += Math.cos(t * 0.2 + i * 0.015) * 0.005;
      }

      // Neural wave
      if (inBrain) {
        const wp = (t * 1.0) % 5 - 2.5;
        const dw = Math.abs(p[i3] - wp);
        if (dw < 0.5) {
          const wi = 1 - dw / 0.5;
          c[i3] = Math.min(1, c[i3] + wi * 0.4);
          c[i3 + 1] = Math.min(1, c[i3 + 1] + wi * 0.6);
          c[i3 + 2] = Math.min(1, c[i3 + 2] + wi * 0.2);
        } else {
          c[i3] *= 0.995; c[i3 + 1] *= 0.995;
          c[i3 + 2] = THREE.MathUtils.lerp(c[i3 + 2], 0.82, 0.008);
        }
      }

      // Click ripple
      if (cActive && inBrain) {
        const cdx = p[i3] - cx, cdy = p[i3 + 1] - cy;
        const cd = Math.sqrt(cdx * cdx + cdy * cdy);
        const ring = cAge * 3;
        const dr = Math.abs(cd - ring);
        if (dr < 0.5) {
          const rs = (1 - dr / 0.5) * Math.max(0, 1 - cAge / 2);
          c[i3] = Math.min(1, c[i3] + rs * 0.7);
          c[i3 + 1] = Math.min(1, c[i3 + 1] + rs * 0.5);
          if (cd > 0.01) { p[i3] += (cdx / cd) * rs * 0.08; p[i3 + 1] += (cdy / cd) * rs * 0.08; }
        }
      }

      // Mouse interaction
      const dx = p[i3] - mx, dy = p[i3 + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ir = inBrain ? 1.8 : 1.0;
      if (dist < ir) {
        const nf = 1 - dist / ir;
        const gl = inBrain ? nf * 1.5 : nf * 0.3;
        c[i3] = Math.min(1, c[i3] + gl * 0.6);
        c[i3 + 1] = Math.min(1, c[i3 + 1] + gl * 0.8);
        c[i3 + 2] = Math.min(1, c[i3 + 2] + gl * 0.3);
        if (inBrain && dist > 0.01) {
          p[i3] += (dx / dist) * nf * nf * 0.2;
          p[i3 + 1] += (dy / dist) * nf * nf * 0.2;
        }
      }
    }

    // Opacity fade
    if (scrollProgress > 0.75) {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, Math.max(0, 1 - (scrollProgress - 0.75) / 0.25), 0.1);
    } else {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.9, 0.1);
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Very slow oscillating rotation to show 3D shape
    pointsRef.current.rotation.y = Math.sin(t * 0.06) * 0.3;
    // Tilt slightly forward so you see the top (the two hemispheres)
    pointsRef.current.rotation.x = -0.35;
  });

  return (
    <>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial vertexColors size={0.035} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <SynapticConnections positions={data.pos} scrollProgress={scrollProgress} />
    </>
  );
}

/* ---------- Export ---------- */
export default function ParticleField({ scrollProgress: ext }: { scrollProgress?: number }) {
  const [ip, setIp] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const progress = ext !== undefined ? ext : ip;

  useEffect(() => {
    if (ext !== undefined) return;
    const h = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const t = ref.current.offsetHeight - window.innerHeight;
      if (t <= 0) return;
      setIp(Math.max(0, Math.min(1, -r.top / t)));
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [ext]);

  return (
    <div ref={ref} className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[3, 3, 4]} intensity={0.2} color="#7c4dff" />
        <pointLight position={[-2, -1, 3]} intensity={0.15} color="#4fc3f7" />
        <ParticleSystem scrollProgress={progress} />
      </Canvas>
    </div>
  );
}
