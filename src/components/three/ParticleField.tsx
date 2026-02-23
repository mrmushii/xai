"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Grid } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 7500;

/* ---------- Seeded Random ---------- */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ---------- Tree Branch Structure ---------- */
interface Branch {
  start: [number, number, number];
  end: [number, number, number];
  thickness: number;
  depth: number;
}

const KNOWLEDGE_DOMAINS = [
  { id: "nn", title: "Neural Networks", desc: "The foundational architecture inspired by biological brains, enabling deep learning.", angle: -0.8, elevation: 0.7, length: 2.5 },
  { id: "ml", title: "Machine Learning", desc: "Algorithms that improve automatically through experience and data.", angle: -0.3, elevation: 0.9, length: 2.7 },
  { id: "cv", title: "Computer Vision", desc: "Enabling computers to derive high-level understanding from digital images or videos.", angle: 0.3, elevation: 0.85, length: 2.6 },
  { id: "rl", title: "Reinforcement Learning", desc: "Training agents by rewarding desired behaviors and punishing negative ones.", angle: 0.8, elevation: 0.65, length: 2.3 },
  { id: "gen", title: "Generative AI", desc: "Systems capable of generating novel text, images, or other media formats.", angle: -0.15, elevation: 1.1, length: 2.9 },
  { id: "rob", title: "Robotics", desc: "Intersection of AI and physical machines, focused on autonomous action.", angle: 0.6, elevation: 0.5, length: 2.1 },
  { id: "eth", title: "AI Ethics", desc: "Ensuring artificial intelligence is developed and deployed responsibly and fairly.", angle: -0.6, elevation: 0.45, length: 2.0 },
  { id: "xai", title: "Explainable AI", desc: "Methods to understand and interpret the decisions of AI models.", angle: 1.2, elevation: 0.55, length: 2.2 },
];

function buildKnowledgeTree(rng: () => number) {
  const branches: Branch[] = [];
  const fruitPositions: [number, number, number][] = [];

  // ---- Trunk (root → center) ----
  const trunkBase: [number, number, number] = [0, -3.2, 0];
  const trunkTop: [number, number, number] = [0, -0.5, 0];
  branches.push({ start: trunkBase, end: trunkTop, thickness: 1.0, depth: 0 });

  // Main Banyan Roots (Prop roots spreading out)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + rng() * 0.3;
    const rx = Math.cos(angle) * (0.8 + rng() * 0.6);
    const rz = Math.sin(angle) * (0.8 + rng() * 0.6);
    branches.push({
      start: [trunkBase[0], trunkBase[1] + 1.0 + rng(), trunkBase[2]],
      end: [trunkBase[0] + rx, trunkBase[1] - 0.5 - rng() * 0.5, trunkBase[2] + rz],
      thickness: 0.4,
      depth: 1,
    });
  }

  // Small root spread
  for (let i = 0; i < 8; i++) {
    const angle = rng() * Math.PI * 2;
    const r = 0.3 + rng() * 0.8;
    branches.push({
      start: trunkBase,
      end: [trunkBase[0] + Math.cos(angle) * r, trunkBase[1] - 0.2 - rng() * 0.3, trunkBase[2] + Math.sin(angle) * r],
      thickness: 0.2,
      depth: 2,
    });
  }

  // ---- Level 1: Major AI domain branches ----
  KNOWLEDGE_DOMAINS.forEach((domain) => {
    const dx = Math.sin(domain.angle) * domain.length;
    const dy = domain.elevation * domain.length * 0.8;
    const dz = Math.cos(domain.angle) * domain.length * 0.5 * (rng() > 0.5 ? 1 : -1);
    const end: [number, number, number] = [
      trunkTop[0] + dx,
      trunkTop[1] + dy,
      trunkTop[2] + dz,
    ];
    branches.push({
      start: [...trunkTop],
      end,
      thickness: 0.7,
      depth: 1,
    });

    // Banyan drop roots from main branches
    if (rng() > 0.3) {
      const dropRootStart: [number, number, number] = [
        end[0] * 0.6,
        end[1] * 0.6,
        end[2] * 0.6,
      ];
      branches.push({
        start: dropRootStart,
        end: [dropRootStart[0] + (rng()-0.5)*0.2, trunkBase[1] - 0.2, dropRootStart[2] + (rng()-0.5)*0.2],
        thickness: 0.25,
        depth: 1,
      });
    }

    // ---- Level 2: Sub-topic branches ----
    const subCount = 3 + Math.floor(rng() * 3);
    let outermostTip = end;
    let maxDist = 0;

    for (let s = 0; s < subCount; s++) {
      const subAngle = domain.angle + (rng() - 0.5) * 1.5;
      const subLen = 0.8 + rng() * 1.0;
      const subEnd: [number, number, number] = [
        end[0] + Math.sin(subAngle) * subLen,
        end[1] + (0.2 + rng() * 0.6) * subLen,
        end[2] + Math.cos(subAngle) * subLen * 0.8,
      ];
      branches.push({
        start: [...end],
        end: subEnd,
        thickness: 0.4,
        depth: 2,
      });

      const dist = subEnd[0]**2 + subEnd[1]**2 + subEnd[2]**2;
      if (dist > maxDist) {
        maxDist = dist;
        outermostTip = subEnd;
      }

      // ---- Level 3: Leaf twigs ----
      const leafCount = 2 + Math.floor(rng() * 4);
      for (let l = 0; l < leafCount; l++) {
        const leafAngle = subAngle + (rng() - 0.5) * 2.0;
        const leafLen = 0.4 + rng() * 0.6;
        const leafEnd: [number, number, number] = [
          subEnd[0] + Math.sin(leafAngle) * leafLen,
          subEnd[1] + (0.1 + rng() * 0.4) * leafLen,
          subEnd[2] + Math.cos(leafAngle) * leafLen * 0.8,
        ];
        branches.push({
          start: [...subEnd],
          end: leafEnd,
          thickness: 0.15,
          depth: 3,
        });

        // Small drop roots from leaf clusters
        if (rng() > 0.85) {
            branches.push({
                start: leafEnd,
                end: [leafEnd[0], leafEnd[1] - 1.0 - rng(), leafEnd[2]],
                thickness: 0.05,
                depth: 4,
            });
        }
      }
    }
    
    // Assign fruit position to the outermost tip of this domain
    fruitPositions.push(outermostTip);
  });

  return { branches, fruitPositions };
}

/* ---------- Distribute particles along tree branches ---------- */
function distributeOnTree(
  branches: Branch[],
  count: number,
  rng: () => number
): Float32Array {
  const positions = new Float32Array(count * 3);

  // Weight branches by their thickness and length for particle allocation
  const branchWeights = branches.map((b) => {
    const dx = b.end[0] - b.start[0];
    const dy = b.end[1] - b.start[1];
    const dz = b.end[2] - b.start[2];
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return len * (b.thickness + 0.1);
  });
  const totalWeight = branchWeights.reduce((a, b) => a + b, 0);

  // Add leaf clusters at branch tips (depth 2+)
  const leafTips = branches.filter((b) => b.depth >= 2).map((b) => b.end);

  let placed = 0;

  // 70% of particles along branches
  const branchParticles = Math.floor(count * 0.70);
  for (let i = 0; i < branchParticles && placed < count; i++) {
    // Choose branch weighted by size
    let r = rng() * totalWeight;
    let bi = 0;
    for (bi = 0; bi < branches.length - 1; bi++) {
      r -= branchWeights[bi];
      if (r <= 0) break;
    }
    const b = branches[bi];

    // Random position along the branch
    const t = rng();
    const jitter = b.thickness * 0.12 * (1 + b.depth * 0.4); // More jitter at higher depths

    positions[placed * 3] =
      b.start[0] + (b.end[0] - b.start[0]) * t + (rng() - 0.5) * jitter;
    positions[placed * 3 + 1] =
      b.start[1] + (b.end[1] - b.start[1]) * t + (rng() - 0.5) * jitter;
    positions[placed * 3 + 2] =
      b.start[2] + (b.end[2] - b.start[2]) * t + (rng() - 0.5) * jitter;
    placed++;
  }

  // 30% of particles as leaf node clusters at branch tips to make dense canopy
  for (; placed < count; placed++) {
    const tip = leafTips[Math.floor(rng() * leafTips.length)];
    const clusterR = 0.1 + rng() * 0.25;
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    positions[placed * 3] = tip[0] + clusterR * Math.sin(phi) * Math.cos(theta);
    positions[placed * 3 + 1] = tip[1] + clusterR * Math.sin(phi) * Math.sin(theta);
    positions[placed * 3 + 2] = tip[2] + clusterR * Math.cos(phi);
  }

  return positions;
}

/* ---------- Connection Lines (tree synapses) ---------- */
function TreeConnections({
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
    const max = 8000;
    const lp = new Float32Array(max * 6);
    const lc = new Float32Array(max * 6);
    geo.setAttribute("position", new THREE.BufferAttribute(lp, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(lc, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!linesRef.current) return;
    const inTree = scrollProgress > 0.3 && scrollProgress < 0.65;
    if (!inTree) {
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

    const thresh = 0.25;
    let cnt = 0;
    const max = 8000;

    for (let i = 0; i < PARTICLE_COUNT && cnt < max; i += 3) {
      for (let j = i + 1; j < Math.min(i + 30, PARTICLE_COUNT) && cnt < max; j+= 2) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < thresh) {
          const idx = cnt * 6;
          pa[idx] = positions[i * 3]; pa[idx + 1] = positions[i * 3 + 1]; pa[idx + 2] = positions[i * 3 + 2];
          pa[idx + 3] = positions[j * 3]; pa[idx + 4] = positions[j * 3 + 1]; pa[idx + 5] = positions[j * 3 + 2];
          const pulse = Math.sin(t * 3 + i * 0.05) * 0.5 + 0.5;
          const a = (1 - d / thresh) * alpha * 0.4;
          // Soft cyan-green (REVERTED intensity)
          ca[idx] = 0.1 * a; ca[idx + 1] = (0.6 + pulse * 0.4) * a; ca[idx + 2] = (0.5 + pulse * 0.2) * a;
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
      <lineBasicMaterial vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

/* ---------- Knowledge Fruits ---------- */
function KnowledgeFruits({ 
  positions, 
  scrollProgress,
  activeNode,
  setActiveNode
}: { 
  positions: [number, number, number][]; 
  scrollProgress: number;
  activeNode: number | null;
  setActiveNode: (idx: number | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const inTree = scrollProgress > 0.3 && scrollProgress < 0.7;
    groupRef.current.visible = inTree;
    if (!inTree) return;

    let alpha = 1;
    if (scrollProgress < 0.4) alpha = (scrollProgress - 0.3) / 0.1;
    else if (scrollProgress > 0.6) alpha = 1 - (scrollProgress - 0.6) / 0.1;
    
    // Scale fruits based on scroll & active state
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const isActive = activeNode === i;
      const t = clock.elapsedTime;
      const pulse = Math.sin(t * 3 + i) * 0.1;
      
      const baseScale = isActive ? 1.5 : 1.0;
      const targetScale = (baseScale + pulse) * alpha;
      mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, 0.1));
      
      // Sway gently relative to local coords
      mesh.position.y = positions[i][1] + Math.sin(t * 0.5 + i) * 0.05;
      mesh.position.x = positions[i][0] + Math.sin(t * 0.3 + i * 2) * 0.03;
      mesh.position.z = positions[i][2] + Math.cos(t * 0.4 + i) * 0.03;

      mat.opacity = Math.min(0.9, alpha * (isActive ? 1.0 : 0.7));
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => {
        const domain = KNOWLEDGE_DOMAINS[i];
        const color = new THREE.Color().setHSL(0.3 + (pos[1] * 0.05), 0.8, 0.6); 
        
        return (
          <mesh 
            key={i} 
            position={pos} 
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            onClick={(e) => {
              e.stopPropagation(); 
              setActiveNode(i);
            }}
          >
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
            
            {activeNode === i && (
              <Html distanceFactor={8} position={[0, 0, 0]} center zIndexRange={[100, 0]}>
                <div className="w-72 p-5 rounded-md border border-[#00ff41]/50 bg-black/80 backdrop-blur-xl shadow-[0_0_20px_rgba(0,255,65,0.4)] text-[#00ff41] relative flex flex-col pointer-events-auto font-mono">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveNode(null); }}
                    className="absolute top-2 right-3 text-[#00ff41]/60 hover:text-white transition-colors cursor-pointer text-lg"
                  >
                    [X]
                  </button>
                  <div className="uppercase text-[10px] tracking-widest text-cyan-400 mb-1 opacity-80">
                    {`// KNOWLEDGE_NODE_${domain.id.toUpperCase()}`}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                    {domain.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-[#00ff41]/40 pl-3">
                    {domain.desc}
                  </p>
                  <div className="mt-4 text-xs font-bold tracking-wider text-[#00ff41] hover:text-white transition-colors cursor-pointer flex items-center gap-2 group">
                    <span className="w-full h-[1px] bg-gradient-to-r from-[#00ff41]/50 to-transparent"></span>
                    <span className="whitespace-nowrap group-hover:-translate-x-1 transition-transform">&gt; INITIALIZE</span>
                  </div>
                </div>
              </Html>
            )}
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------- Main Particle System ---------- */
function ParticleSystem({ scrollProgress, activeNode, setActiveNode }: { scrollProgress: number, activeNode: number | null, setActiveNode: (idx: number | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const points0Ref = useRef<THREE.Points>(null);
  const points1Ref = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  const clickPulseRef = useRef({ time: -10, x: 0, y: 0 });

  const texture0 = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.font = "bold 52px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("0", 32, 34);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const texture1 = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.font = "bold 52px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("1", 32, 34);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const data = useMemo(() => {
    const rng = seededRandom(42);
    const chaos = new Float32Array(PARTICLE_COUNT * 3);
    const { branches, fruitPositions } = buildKnowledgeTree(rng);
    const tree = distributeOnTree(branches, PARTICLE_COUNT, rng);
    const explode = new Float32Array(PARTICLE_COUNT * 3);
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const indices0: number[] = [];
    const indices1: number[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (rng() > 0.5) indices0.push(i);
      else indices1.push(i);
      // Chaos: scattered sphere
      const ct = rng() * Math.PI * 2;
      const cp = Math.acos(2 * rng() - 1);
      const cr = 4 + rng() * 8;
      chaos[i * 3] = cr * Math.sin(cp) * Math.cos(ct);
      chaos[i * 3 + 1] = cr * Math.sin(cp) * Math.sin(ct);
      chaos[i * 3 + 2] = cr * Math.cos(cp);

      // Explode
      const et = rng() * Math.PI * 2;
      const ep = Math.acos(2 * rng() - 1);
      const er = 18 + rng() * 15;
      explode[i * 3] = er * Math.sin(ep) * Math.cos(et);
      explode[i * 3 + 1] = er * Math.sin(ep) * Math.sin(et);
      explode[i * 3 + 2] = er * Math.cos(ep);

      // Start at chaos
      pos[i * 3] = chaos[i * 3];
      pos[i * 3 + 1] = chaos[i * 3 + 1];
      pos[i * 3 + 2] = chaos[i * 3 + 2];

      // Colors based on vertical position (tree height) - REVERTED intensities
      const height = tree[i * 3 + 1]; 
      if (height < -2.0) {
        // Deep roots: earthy brown-purple
        col[i * 3] = 0.25 + rng() * 0.15;
        col[i * 3 + 1] = 0.1 + rng() * 0.1;
        col[i * 3 + 2] = 0.4 + rng() * 0.2;
      } else if (height < -0.5) {
        // Trunk: deep royal blue
        col[i * 3] = 0.15 + rng() * 0.1;
        col[i * 3 + 1] = 0.1 + rng() * 0.1;
        col[i * 3 + 2] = 0.8 + rng() * 0.2;
      } else if (height < 1.0) {
        // Lower branches: cyan
        col[i * 3] = 0.1 + rng() * 0.1;
        col[i * 3 + 1] = 0.5 + rng() * 0.2;
        col[i * 3 + 2] = 0.8 + rng() * 0.2;
      } else if (height < 2.5) {
        // Mid canopy: green-cyan
        col[i * 3] = 0.05 + rng() * 0.1;
        col[i * 3 + 1] = 0.7 + rng() * 0.3;
        col[i * 3 + 2] = 0.6 + rng() * 0.2;
      } else {
        // High canopy / tips: vibrant green/yellow
        col[i * 3] = 0.3 + rng() * 0.2;
        col[i * 3 + 1] = 0.8 + rng() * 0.2;
        col[i * 3 + 2] = 0.2 + rng() * 0.2;
      }
    }

    return { chaos, tree, explode, pos, col, fruitPositions, indices0, indices1 };
  }, []);

  const { geo0, geo1 } = useMemo(() => {
    const posA = new THREE.BufferAttribute(data.pos, 3);
    const colA = new THREE.BufferAttribute(data.col, 3);

    const g0 = new THREE.BufferGeometry();
    g0.setAttribute("position", posA);
    g0.setAttribute("color", colA);
    g0.setIndex(data.indices0);

    const g1 = new THREE.BufferGeometry();
    g1.setAttribute("position", posA);
    g1.setAttribute("color", colA);
    g1.setIndex(data.indices1);

    return { geo0: g0, geo1: g1 };
  }, [data]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.pointer-events-auto')) return;
      
      const c = document.querySelector("canvas");
      if (!c) return;
      const r = c.getBoundingClientRect();
      clickPulseRef.current = {
        time: performance.now() / 1000,
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -((e.clientY - r.top) / r.height) * 2 + 1,
      };
      setActiveNode(null); 
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [setActiveNode]);

  useFrame((state) => {
    if (!points0Ref.current || !points1Ref.current || !groupRef.current) return;
    const posA = points0Ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const colA = points0Ref.current.geometry.attributes.color as THREE.BufferAttribute;
    const p = posA.array as Float32Array;
    const c = colA.array as Float32Array;
    const t = state.clock.elapsedTime;
    const mx = (mouse.x * viewport.width) / 2;
    const my = (mouse.y * viewport.height) / 2;
    const inTree = scrollProgress > 0.3 && scrollProgress < 0.7;

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
        tx = data.chaos[i3] + (data.tree[i3] - data.chaos[i3]) * e;
        ty = data.chaos[i3 + 1] + (data.tree[i3 + 1] - data.chaos[i3 + 1]) * e;
        tz = data.chaos[i3 + 2] + (data.tree[i3 + 2] - data.chaos[i3 + 2]) * e;
      } else if (scrollProgress < 0.65) {
        tx = data.tree[i3]; ty = data.tree[i3 + 1]; tz = data.tree[i3 + 2];
      } else {
        const s = (scrollProgress - 0.65) / 0.35;
        const e = s * s;
        tx = data.tree[i3] + (data.explode[i3] - data.tree[i3]) * e;
        ty = data.tree[i3 + 1] + (data.explode[i3 + 1] - data.tree[i3 + 1]) * e;
        tz = data.tree[i3 + 2] + (data.explode[i3 + 2] - data.tree[i3 + 2]) * e;
      }

      p[i3] += (tx - p[i3]) * 0.08;
      p[i3 + 1] += (ty - p[i3 + 1]) * 0.08;
      p[i3 + 2] += (tz - p[i3 + 2]) * 0.08;

      // Gentle sway for branches (leaves sway more)
      if (inTree) {
        const height = data.tree[i3 + 1];
        const swayAmount = Math.max(0, (height + 2) * 0.004); 
        p[i3] += Math.sin(t * 0.4 + i * 0.02) * swayAmount;
        p[i3 + 2] += Math.cos(t * 0.3 + i * 0.015) * swayAmount * 0.6;
      } else {
        p[i3] += Math.sin(t * 0.3 + i * 0.01) * 0.005;
        p[i3 + 1] += Math.cos(t * 0.2 + i * 0.015) * 0.005;
      }

      // Energy flow (REVERTED intensity)
      if (inTree) {
        const treeY = data.tree[i3 + 1];
        const flowPos = ((t * 1.2) % 8) - 4.0;
        const distFromFlow = Math.abs(treeY - flowPos);
        if (distFromFlow < 0.5) {
          const fi = 1 - distFromFlow / 0.5;
          c[i3] = Math.min(1, c[i3] + fi * 0.2);
          c[i3 + 1] = Math.min(1, c[i3 + 1] + fi * 0.4);
          c[i3 + 2] = Math.min(1, c[i3 + 2] + fi * 0.2);
        } else {
          c[i3] *= 0.995; c[i3 + 1] *= 0.995; c[i3 + 2] *= 0.995;
        }
      }

      // Click ripple
      if (cActive && inTree) {
        const cdx = p[i3] - cx, cdy = p[i3 + 1] - cy;
        const cd = Math.sqrt(cdx * cdx + cdy * cdy);
        const ring = cAge * 4;
        const dr = Math.abs(cd - ring);
        if (dr < 0.6) {
          const rs = (1 - dr / 0.6) * Math.max(0, 1 - cAge / 2);
          c[i3] = Math.min(1, c[i3] + rs * 0.4);
          c[i3 + 1] = Math.min(1, c[i3 + 1] + rs * 0.9);
          c[i3 + 2] = Math.min(1, c[i3 + 2] + rs * 0.5);
          if (cd > 0.01) {
            p[i3] += (cdx / cd) * rs * 0.1;
            p[i3 + 1] += (cdy / cd) * rs * 0.1;
          }
        }
      }

      // Mouse interaction (REVERTED repel force)
      const dx = p[i3] - mx, dy = p[i3 + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ir = inTree ? 1.8 : 1.0; 
      if (dist < ir) {
        const nf = 1 - dist / ir;
        const gl = inTree ? nf * 1.8 : nf * 0.4;
        c[i3] = Math.min(1, c[i3] + gl * 0.3);
        c[i3 + 1] = Math.min(1, c[i3 + 1] + gl * 0.7);
        c[i3 + 2] = Math.min(1, c[i3 + 2] + gl * 0.4);
        if (inTree && dist > 0.01) {
          p[i3] += (dx / dist) * nf * nf * 0.2;
          p[i3 + 1] += (dy / dist) * nf * nf * 0.2;
        }
      }
    }

    // Opacity
    const mat0 = points0Ref.current.material as THREE.PointsMaterial;
    const mat1 = points1Ref.current.material as THREE.PointsMaterial;
    if (scrollProgress > 0.75) {
      const target = Math.max(0, 1 - (scrollProgress - 0.75) / 0.25);
      mat0.opacity = THREE.MathUtils.lerp(mat0.opacity, target, 0.1);
      mat1.opacity = THREE.MathUtils.lerp(mat1.opacity, target, 0.1);
    } else {
      mat0.opacity = THREE.MathUtils.lerp(mat0.opacity, 0.9, 0.1);
      mat1.opacity = THREE.MathUtils.lerp(mat1.opacity, 0.9, 0.1);
    }

    posA.needsUpdate = true;
    colA.needsUpdate = true;

    // Apply rotation to the entire group so fruits orbit perfectly with the tree
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.3;
  });

  return (
    <group ref={groupRef}>
      <points ref={points0Ref} geometry={geo0}>
        <pointsMaterial map={texture0} vertexColors size={0.12} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <points ref={points1Ref} geometry={geo1}>
        <pointsMaterial map={texture1} vertexColors size={0.12} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <TreeConnections positions={data.pos} scrollProgress={scrollProgress} />
      <KnowledgeFruits 
        positions={data.fruitPositions} 
        scrollProgress={scrollProgress} 
        activeNode={activeNode} 
        setActiveNode={setActiveNode} 
      />
    </group>
  );
}

/* ---------- Export ---------- */
export default function ParticleField({ scrollProgress: ext }: { scrollProgress?: number }) {
  const [ip, setIp] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
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
    <div ref={ref} className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", pointerEvents: "auto" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 3, 4]} intensity={0.3} color="#7c4dff" />
        <pointLight position={[-2, -2, 3]} intensity={0.2} color="#00e676" />
        
        {/* Matrix Floor Grid */}
        <Grid 
          position={[0, -3.5, 0]} 
          args={[60, 60]} 
          cellColor="#00ff41" 
          sectionColor="#00ff41" 
          sectionSize={1.5}
          cellSize={0.5}
          fadeDistance={25} 
          fadeStrength={5} 
          cellThickness={0.3} 
          sectionThickness={0.8} 
        />
        
        <ParticleSystem scrollProgress={progress} activeNode={activeNode} setActiveNode={setActiveNode} />
      </Canvas>
    </div>
  );
}
