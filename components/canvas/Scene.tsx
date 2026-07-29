"use client";

import React, { useRef, useMemo, useState, useCallback, useEffect, createContext, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { MomentData } from '@/types/moment';
import { moments as momentList } from '@/data/moments';
import { useSoundEffects } from '@/hooks/useSoundEffects';

/* ── Theme Colors ── */
const darkTheme = {
  line: '#ffffff',
  lineFaint: 'rgba(255,255,255,0.08)',
  lineMed: 'rgba(255,255,255,0.2)',
  text: '#ffffff',
  glow: '#ffffff',
  nebula: '#3b82f6',
  star: '#ffffff',
  scale: 1 as number,
};
const lightTheme = {
  line: '#111827',
  lineFaint: 'rgba(17,24,39,0.25)',
  lineMed: 'rgba(17,24,39,0.5)',
  text: '#111827',
  glow: '#1e293b',
  nebula: '#2563eb',
  star: '#374151',
  scale: 2.0 as number,
};

type ThemeColors = typeof darkTheme;
const ThemeContext = createContext<ThemeColors>(darkTheme);
const useTheme = () => useContext(ThemeContext);

/* ── Opacity helpers ── */
const opacityScale = (v: number, theme: ThemeColors) => Math.min(1, v * theme.scale);
const opacityFloor = (v: number, theme: ThemeColors) => theme.scale === 1 ? v : Math.max(0.12, v * theme.scale);

/* ── 3D font boost for light mode ── */
const LIGHT_FONT_BOOST = 1.25;

/* ── Glow Texture (radial gradient for fake bloom) ── */
const createGlowTexture = (dark = true): THREE.Texture => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  if (dark) {
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.08, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.2, 'rgba(220, 235, 255, 0.35)');
    gradient.addColorStop(0.45, 'rgba(180, 210, 255, 0.12)');
    gradient.addColorStop(0.7, 'rgba(140, 180, 255, 0.04)');
    gradient.addColorStop(1, 'rgba(100, 140, 255, 0)');
  } else {
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    gradient.addColorStop(0.08, 'rgba(15, 23, 42, 0.6)');
    gradient.addColorStop(0.2, 'rgba(30, 41, 59, 0.3)');
    gradient.addColorStop(0.45, 'rgba(51, 65, 85, 0.1)');
    gradient.addColorStop(0.7, 'rgba(71, 85, 105, 0.03)');
    gradient.addColorStop(1, 'rgba(100, 116, 139, 0)');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

/* ── Soft Glow Texture (extra diffuse for large halos) ── */
const createSoftGlowTexture = (dark = true): THREE.Texture => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  if (dark) {
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(0.15, 'rgba(220, 235, 255, 0.2)');
    gradient.addColorStop(0.4, 'rgba(180, 210, 255, 0.06)');
    gradient.addColorStop(0.7, 'rgba(140, 180, 255, 0.02)');
    gradient.addColorStop(1, 'rgba(100, 140, 255, 0)');
  } else {
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    gradient.addColorStop(0.15, 'rgba(30, 41, 59, 0.18)');
    gradient.addColorStop(0.4, 'rgba(51, 65, 85, 0.06)');
    gradient.addColorStop(0.7, 'rgba(71, 85, 105, 0.02)');
    gradient.addColorStop(1, 'rgba(100, 116, 139, 0)');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

const glowTexture = (() => {
  if (typeof document !== 'undefined') return createGlowTexture(true);
  return null;
})();

const glowTextureLight = (() => {
  if (typeof document !== 'undefined') return createGlowTexture(false);
  return null;
})();

const softGlowTexture = (() => {
  if (typeof document !== 'undefined') return createSoftGlowTexture(true);
  return null;
})();

const softGlowTextureLight = (() => {
  if (typeof document !== 'undefined') return createSoftGlowTexture(false);
  return null;
})();

/* ── Glow Sprite (fake bloom per point) ── */
const GlowSprite = ({ position, size = 0.3, opacity = 0.3, soft = false }: {
  position: [number, number, number]; size?: number; opacity?: number; soft?: boolean;
}) => {
  const theme = useTheme();
  const isDark = theme.scale === 1;
  const tex = useMemo(() => {
    if (soft) {
      return isDark
        ? (softGlowTexture ?? createSoftGlowTexture(true))
        : (softGlowTextureLight ?? createSoftGlowTexture(false));
    }
    return isDark
      ? (glowTexture ?? createGlowTexture(true))
      : (glowTextureLight ?? createGlowTexture(false));
  }, [soft, isDark]);
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial map={tex} transparent opacity={Math.min(1, opacity * theme.scale)} depthWrite={false} />
    </sprite>
  );
};

/* ── Star Field ── */
const StarField = () => {
  const theme = useTheme();
  const layers = useMemo(() => [
    { count: 2000, spread: 60, size: 0.025, opacity: 0.35 },
    { count: 1200, spread: 100, size: 0.012, opacity: 0.18 },
    { count: 600, spread: 140, size: 0.008, opacity: 0.1 },
  ], []);
  return (
    <group>
      {layers.map((layer, li) => {
        const positions = useMemo(() => {
          const pos = new Float32Array(layer.count * 3);
          for (let i = 0; i < layer.count * 3; i++) pos[i] = (Math.random() - 0.5) * layer.spread;
          return pos;
        }, [li]);
        return (
          <points key={li}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={layer.size} color={theme.star} transparent opacity={Math.min(1, layer.opacity * theme.scale)} />
          </points>
        );
      })}
    </group>
  );
};

/* ── Nebula (soft circular glow patches, fixed in background) ── */
const NebulaStreaks = () => {
  const theme = useTheme();
  const tex = useMemo(() => glowTexture ?? createGlowTexture(), []);
  const patches = useMemo(() => [
    // Left cluster
    { x: -7, y: 0, z: -18, size: 10, opacity: 0.1, color: "#1060c0" },
    { x: -8.5, y: 1.5, z: -20, size: 7, opacity: 0.08, color: "#1870d0" },
    { x: -6, y: -1, z: -17, size: 5, opacity: 0.09, color: "#1468c0" },
    { x: -9, y: -0.5, z: -22, size: 6, opacity: 0.07, color: "#0c50a0" },
    { x: -7.5, y: 2, z: -19, size: 4, opacity: 0.1, color: "#2080e0" },
    // Right cluster
    { x: 7, y: -0.5, z: -19, size: 9, opacity: 0.09, color: "#0e55a8" },
    { x: 8.5, y: 1, z: -21, size: 6, opacity: 0.08, color: "#1468c0" },
    { x: 6, y: 1.5, z: -18, size: 5, opacity: 0.08, color: "#1878d8" },
    { x: 9, y: -1, z: -23, size: 7, opacity: 0.07, color: "#1060b8" },
    { x: 7.5, y: 0, z: -20, size: 4, opacity: 0.09, color: "#2080e0" },
  ], []);
  return (
    <group>
      {patches.map((p, i) => (
        <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.size, p.size, 1]}>
          <spriteMaterial map={tex} transparent opacity={Math.min(1, p.opacity * theme.scale)} color={p.color} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
};

/* ── Crisp Ring (sharp line, optional glow halo) ── */
const CrispRing = ({ radius, color, opacity = 0.5, segments = 180, glowRadius = 0 }: {
  radius: number; color?: string; opacity?: number; segments?: number; glowRadius?: number;
}) => {
  const theme = useTheme();
  const ringColor = color ?? theme.line;
  const ringOpacity = Math.min(1, opacity * theme.scale);
  const line = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: ringColor, transparent: true, opacity: ringOpacity });
    return new THREE.Line(geom, mat);
  }, [radius, ringColor, ringOpacity, segments]);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={line} />
      {glowRadius > 0 && (
        <mesh>
          <torusGeometry args={[radius, glowRadius, 16, segments]} />
          <meshBasicMaterial color={ringColor} transparent opacity={ringOpacity * 0.08} />
        </mesh>
      )}
    </group>
  );
};

/* ── Tick Ring (compass-like marks) ── */
const TickRing = ({ radius, majorTicks, minorPerMajor, color, opacity = 0.35, tickLength }: {
  radius: number; majorTicks: number; minorPerMajor: number; color?: string; opacity?: number; tickLength?: number;
}) => {
  const theme = useTheme();
  const tickColor = color ?? theme.line;
  const tickOpacity = Math.min(1, opacity * theme.scale);
  const ticks = useMemo(() => {
    const result: { x: number; y: number; len: number; thick: number; rot: number }[] = [];
    const total = majorTicks * minorPerMajor;
    const baseLen = tickLength || 0.06;
    for (let i = 0; i < total; i++) {
      const a = (i / total) * Math.PI * 2;
      const isMajor = i % minorPerMajor === 0;
      result.push({
        x: Math.cos(a) * radius, y: Math.sin(a) * radius,
        len: isMajor ? baseLen * 1.3 : baseLen * 0.5,
        thick: isMajor ? 0.003 : 0.0015,
        rot: a - Math.PI / 2,
      });
    }
    return result;
  }, [radius, majorTicks, minorPerMajor, tickLength]);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {ticks.map((t, i) => (
        <mesh key={i} position={[t.x, t.y, 0]} rotation={[0, 0, t.rot]}>
          <boxGeometry args={[t.thick, t.len, 0.001]} />
          <meshBasicMaterial color={tickColor} transparent opacity={tickOpacity} />
        </mesh>
      ))}
    </group>
  );
};

/* ── Dot Pulse ── */
const DotPulse = ({ x, y, size, opacity, speed }: { x: number; y: number; size: number; opacity: number; speed: number }) => {
  const theme = useTheme();
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const p = 0.75 + Math.sin(t * speed) * 0.25;
      ref.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          (child.material as THREE.MeshBasicMaterial).opacity = opacity * p;
        }
      });
    }
  });
  return (
    <group ref={ref}>
      <mesh position={[x, y, 0]}><sphereGeometry args={[size * 2.5, 8, 8]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, opacity * 0.1 * theme.scale)} /></mesh>
      <mesh position={[x, y, 0]}><sphereGeometry args={[size, 8, 8]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, opacity * theme.scale)} /></mesh>
    </group>
  );
};

/* ── Intersection Dots ── */
/* ── Connecting Chords ── */
const ConnectingChords = () => {
  const theme = useTheme();
  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    const axes = 12;
    const ringRadii = [1.2, 1.8, 2.4, 3.0];
    for (const r of ringRadii) {
      for (let i = 0; i < axes; i++) {
        const a1 = (i / axes) * Math.PI * 2;
        const a2 = ((i + 3) / axes) * Math.PI * 2;
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a1) * r, Math.sin(a1) * r, 0),
          new THREE.Vector3(Math.cos(a2) * r, Math.sin(a2) * r, 0),
        ]);
      const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.18 * theme.scale) });
        result.push(new THREE.Line(geom, mat));
      }
    }
    return result;
  }, [theme.line]);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {lines.map((l, i) => <primitive key={i} object={l} />)}
    </group>
  );
};

/* ── Triangle Grid (sacred geometry) ── */
const TriangleGrid = () => {
  const theme = useTheme();
  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    const axes = 12;
    const ringRadii = [0.8, 1.2, 1.8, 2.4, 3.0];
    for (let i = 0; i < axes; i++) {
      const a1 = (i / axes) * Math.PI * 2;
      const a2 = ((i + 1) / axes) * Math.PI * 2;
      for (let j = 0; j < ringRadii.length - 1; j++) {
        const r1 = ringRadii[j];
        const r2 = ringRadii[j + 1];
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a1) * r1, Math.sin(a1) * r1, 0),
          new THREE.Vector3(Math.cos(a1) * r2, Math.sin(a1) * r2, 0),
          new THREE.Vector3(Math.cos(a2) * r2, Math.sin(a2) * r2, 0),
          new THREE.Vector3(Math.cos(a1) * r1, Math.sin(a1) * r1, 0),
        ]);
        const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.1 * theme.scale) });
        result.push(new THREE.Line(geom, mat));
        const geom2 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a1) * r1, Math.sin(a1) * r1, 0),
          new THREE.Vector3(Math.cos(a2) * r2, Math.sin(a2) * r2, 0),
          new THREE.Vector3(Math.cos(a2) * r1, Math.sin(a2) * r1, 0),
          new THREE.Vector3(Math.cos(a1) * r1, Math.sin(a1) * r1, 0),
        ]);
        const mat2 = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.1 * theme.scale) });
        result.push(new THREE.Line(geom2, mat2));
      }
    }
    return result;
  }, [theme.line]);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {lines.map((l, i) => <primitive key={i} object={l} />)}
    </group>
  );
};

/* ── Diamond Frame ── */
const DiamondFrame = ({ size, opacity = 0.25 }: { size: number; opacity?: number }) => {
  const theme = useTheme();
  const line = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, size, 0), new THREE.Vector3(size, 0, 0),
      new THREE.Vector3(0, -size, 0), new THREE.Vector3(-size, 0, 0),
      new THREE.Vector3(0, size, 0),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, opacity * theme.scale) });
    return new THREE.Line(geom, mat);
  }, [size, opacity, theme.line]);
  return <group rotation={[Math.PI / 2, 0, 0]}><primitive object={line} /></group>;
};

/* ── Square Frame ── */
const SquareFrame = ({ size, opacity = 0.15 }: { size: number; opacity?: number }) => {
  const theme = useTheme();
  const line = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-size, -size, 0), new THREE.Vector3(size, -size, 0),
      new THREE.Vector3(size, size, 0), new THREE.Vector3(-size, size, 0),
      new THREE.Vector3(-size, -size, 0),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, opacity * theme.scale) });
    return new THREE.Line(geom, mat);
  }, [size, opacity, theme.line]);
  return <group rotation={[Math.PI / 2, 0, 0]}><primitive object={line} /></group>;
};

/* ── Triangle Frame ── */
const TriangleFrame = ({ radius, rotation: rot, opacity = 0.18 }: { radius: number; rotation: number; opacity?: number }) => {
  const theme = useTheme();
  const line = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 4 }, (_, i) => {
      const a = rot + (i * Math.PI * 2) / 3;
      return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    }));
    const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, opacity * theme.scale) });
    return new THREE.Line(geom, mat);
  }, [radius, rot, opacity, theme.line]);
  return <group rotation={[Math.PI / 2, 0, 0]}><primitive object={line} /></group>;
};

/* ── Main Axis (prominent, with endpoint dot+circle) ── */
const MainAxis = ({ angle, length }: { angle: number; length: number }) => {
  const theme = useTheme();
  const line = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -length),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.8 * theme.scale) });
    return new THREE.Line(geom, mat);
  }, [length, theme.line]);
  const circle = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const r = 0.25;
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -length));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.85 * theme.scale) });
    return new THREE.Line(geom, mat);
  }, [length, theme.line]);
  const innerCircle = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const r = 0.14;
    for (let i = 0; i <= 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -length));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.6 * theme.scale) });
    return new THREE.Line(geom, mat);
  }, [length, theme.line]);
  return (
    <group rotation={[0, 0, angle]}>
      <primitive object={line} />
      <primitive object={circle} />
      <primitive object={innerCircle} />
      {/* Glow sprite at endpoint */}
      <GlowSprite position={[0, 0, -length]} size={0.8} opacity={0.15} />
      {/* Outer glow sphere */}
      <mesh position={[0, 0, -length]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.1 * theme.scale)} />
      </mesh>
      {/* Core dot */}
      <mesh position={[0, 0, -length]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 1 * theme.scale)} />
      </mesh>
      {/* Mid-axis ring marker */}
      <mesh position={[0, 0, -length * 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.003, 16, 32]} />
        <meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.5 * theme.scale)} />
      </mesh>
    </group>
  );
};

/* ── Mouse Trail ── */
const MouseTrail = () => {
  const theme = useTheme();
  const trailCount = 8;
  const refs = useRef<THREE.Mesh[]>([]);
  const positions = useRef<THREE.Vector3[]>(Array.from({ length: trailCount }, () => new THREE.Vector3(0, 0, 5)));
  const _mouse3D = useMemo(() => new THREE.Vector3(), []);
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const _pos = useMemo(() => new THREE.Vector3(), []);
  const { camera, pointer } = useThree();
  useFrame(() => {
    _mouse3D.set(pointer.x * 5, pointer.y * 4, 5);
    _mouse3D.unproject(camera);
    _dir.copy(_mouse3D).sub(camera.position).normalize();
    const distance = -camera.position.z / _dir.z;
    _pos.copy(camera.position).add(_dir.multiplyScalar(distance * 0.5));
    _pos.z = 5;
    positions.current[0].copy(_pos);
    for (let i = trailCount - 1; i > 0; i--) {
      positions.current[i].lerp(positions.current[i - 1], 0.35);
    }
    refs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.position.copy(positions.current[i]);
        const opacity = Math.min(1, (1 - i / trailCount) * 0.35 * theme.scale);
        const scale = (1 - i / trailCount) * 0.5;
        mesh.scale.setScalar(scale);
        if (mesh.material) (mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
    });
  });
  return (
    <group>
      {Array.from({ length: trailCount }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }} position={[0, 0, 5]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.3 * theme.scale)} />
        </mesh>
      ))}
    </group>
  );
};

/* ── Fade In Overlay ── */
const FadeInOverlay = () => {
  const theme = useTheme();
  const ref = useRef<THREE.Mesh>(null!);
  const done = useRef(false);
  useFrame(() => {
    if (done.current || !ref.current) return;
    const t = performance.now() * 0.001;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    if (t < 2) mat.opacity = Math.max(0, 1 - t / 2);
    else { mat.opacity = 0; done.current = true; }
  });
  return <mesh ref={ref} position={[0, 0, 8]}><planeGeometry args={[50, 50]} /><meshBasicMaterial color={theme.glow} transparent opacity={1} /></mesh>;
};

/* ── K Letter (geometric technical style matching reference) ── */
const KermitLetter = () => {
  const theme = useTheme();
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.04;
    }
  });

  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    const gap = 0.028;

    const addLine = (pts: THREE.Vector3[], opacity: number) => {
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity });
      const line = new THREE.Line(geom, mat);
      line.frustumCulled = false;
      result.push(line);
    };

    // Serif K: vertical left stem + two diagonals meeting at middle
    const stemX = -0.4;
    const top = 0.5;
    const bot = -0.5;
    const mid = 0;

    // Vertical stem (double stroke)
    addLine([new THREE.Vector3(stemX - gap, top, 0), new THREE.Vector3(stemX - gap, bot, 0)], 0.95);
    addLine([new THREE.Vector3(stemX + gap, top, 0), new THREE.Vector3(stemX + gap, bot, 0)], 0.95);
    // Top/bottom caps
    addLine([new THREE.Vector3(stemX - gap, top, 0), new THREE.Vector3(stemX + gap, top, 0)], 0.95);
    addLine([new THREE.Vector3(stemX - gap, bot, 0), new THREE.Vector3(stemX + gap, bot, 0)], 0.95);

    // Upper diagonal: from mid to upper-right (double stroke)
    const ur = 0.5;
    addLine([new THREE.Vector3(stemX + gap, mid + gap * 2, 0), new THREE.Vector3(ur, top - gap * 3, 0)], 0.95);
    addLine([new THREE.Vector3(stemX + gap, mid - gap, 0), new THREE.Vector3(ur, top + gap, 0)], 0.95);
    // Tip cap
    addLine([new THREE.Vector3(ur, top - gap * 3, 0), new THREE.Vector3(ur, top + gap, 0)], 0.9);

    // Lower diagonal: from mid to lower-right (double stroke)
    addLine([new THREE.Vector3(stemX + gap, mid - gap * 2, 0), new THREE.Vector3(ur, bot + gap * 3, 0)], 0.95);
    addLine([new THREE.Vector3(stemX + gap, mid + gap, 0), new THREE.Vector3(ur, bot - gap, 0)], 0.95);
    // Tip cap
    addLine([new THREE.Vector3(ur, bot + gap * 3, 0), new THREE.Vector3(ur, bot - gap, 0)], 0.9);

    // Shadow/outline lines (dimmer)
    const s = 0.04;
    addLine([new THREE.Vector3(stemX - s - gap, top + s, 0), new THREE.Vector3(stemX - s - gap, bot - s, 0)], 0.15);
    addLine([new THREE.Vector3(stemX - s, mid + s, 0), new THREE.Vector3(ur + s, top + s, 0)], 0.12);
    addLine([new THREE.Vector3(stemX - s, mid - s, 0), new THREE.Vector3(ur + s, bot - s, 0)], 0.12);

    return result;
  }, [theme.line]);

  // Concentric diamond frames (4 layers)
  const diamonds = useMemo(() => {
    const result: THREE.Line[] = [];
    const sizes = [0.85, 1.05, 1.25, 1.5];
    const opacities = [0.65, 0.5, 0.35, 0.2];
    for (let d = 0; d < sizes.length; d++) {
      const s = sizes[d];
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, s, 0), new THREE.Vector3(s, 0, 0),
        new THREE.Vector3(0, -s, 0), new THREE.Vector3(-s, 0, 0),
        new THREE.Vector3(0, s, 0),
      ]);
      const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: opacities[d] });
      result.push(new THREE.Line(geom, mat));
    }
    return result;
  }, [theme.line]);

  return (
    <group ref={groupRef} position={[0, 0, 0.5]}>
      {/* K glow layers (sun-like, mega spread) */}
      <GlowSprite position={[0, 0, 0]} size={5.5} opacity={0.1} soft />
      <GlowSprite position={[0, 0, 0]} size={3.5} opacity={0.14} soft />
      <GlowSprite position={[0, 0, 0]} size={2.0} opacity={0.2} />
      <GlowSprite position={[0, 0, 0]} size={1.0} opacity={0.35} />
      <GlowSprite position={[0, 0, 0]} size={0.5} opacity={0.5} />
      <mesh position={[0, 0, -0.02]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.15 * theme.scale)} />
      </mesh>
      {/* Concentric diamond frames */}
      {diamonds.map((d, i) => <primitive key={`dia-${i}`} object={d} />)}
      {/* K lines (double-stroke) */}
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
};

/* ── Main Core ── */
const KermitIdentityCore = () => {
  const theme = useTheme();
  const coreRef = useRef<THREE.Group>(null!);
  const outerRef = useRef<THREE.Group>(null!);
  const midRef = useRef<THREE.Group>(null!);
  const axesRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerRef.current) outerRef.current.rotation.z = t * 0.015;
    if (midRef.current) midRef.current.rotation.z = -t * 0.01;
    if (axesRef.current) axesRef.current.rotation.z = -t * 0.005;
  });

  // Pre-compute all line objects (no useMemo inside .map!)

  // Constellation web lines: structured triangular patterns matching reference
  const constellationLines = useMemo(() => {
    const result: THREE.Line[] = [];
    const axes = 16;
    const ringRadii = [0.6, 0.9, 1.2, 1.5, 1.8, 2.2, 2.6, 3.0, 3.4, 3.8];

    const pos = (axisIdx: number, r: number) => {
      const a = (axisIdx / axes) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0);
    };

    const addLine = (a1: number, r1: number, a2: number, r2: number, opacity: number) => {
      const geom = new THREE.BufferGeometry().setFromPoints([pos(a1, r1), pos(a2, r2)]);
      const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, opacity * theme.scale) });
      result.push(new THREE.Line(geom, mat));
    };

    // 1. Adjacent axis connections on each ring (perimeter)
    for (const r of ringRadii) {
      for (let i = 0; i < axes; i++) {
        addLine(i, r, (i + 1) % axes, r, 0.2);
      }
    }

    // 2. Radial connections (same axis, consecutive rings)
    for (let i = 0; i < axes; i++) {
      for (let j = 0; j < ringRadii.length - 1; j++) {
        addLine(i, ringRadii[j], i, ringRadii[j + 1], 0.14);
      }
    }

    // 3. Upward triangles (dense)
    for (let j = 0; j < ringRadii.length - 1; j++) {
      for (let i = 0; i < axes; i++) {
        const r1 = ringRadii[j];
        const r2 = ringRadii[j + 1];
        addLine(i, r1, (i + 1) % axes, r1, 0.1);
        addLine((i + 1) % axes, r1, i, r2, 0.1);
        addLine(i, r2, i, r1, 0.1);
      }
    }

    // 4. Downward triangles (dense)
    for (let j = 0; j < ringRadii.length - 1; j++) {
      for (let i = 0; i < axes; i++) {
        const r1 = ringRadii[j];
        const r2 = ringRadii[j + 1];
        addLine(i, r2, (i + 1) % axes, r2, 0.08);
        addLine((i + 1) % axes, r2, (i + 1) % axes, r1, 0.08);
      }
    }

    // 5. Star pattern diagonals (skip-2, skip-3, skip-4, skip-5, skip-6)
    for (let skip = 2; skip <= 6; skip++) {
      for (let i = 0; i < axes; i++) {
        const a1 = i;
        const a2 = (i + skip) % axes;
        // Connect across 2 rings
        for (let j = 0; j < ringRadii.length - 2; j++) {
          addLine(a1, ringRadii[j], a2, ringRadii[j + 2], 0.06);
        }
      }
    }

    // 6. Long diagonals (opposite axes, cross rings)
    for (let i = 0; i < axes; i++) {
      const opp = (i + axes / 2) % axes;
      for (let j = 0; j < ringRadii.length - 3; j++) {
        addLine(i, ringRadii[j], opp, ringRadii[j + 3], 0.05);
      }
    }

    // 7. Extra web connections (skip-1 diagonals between non-adjacent rings)
    for (let i = 0; i < axes; i++) {
      for (let j = 0; j < ringRadii.length - 1; j++) {
        addLine(i, ringRadii[j], (i + 1) % axes, ringRadii[Math.min(j + 2, ringRadii.length - 1)], 0.06);
        addLine(i, ringRadii[j], (i - 1 + axes) % axes, ringRadii[Math.min(j + 2, ringRadii.length - 1)], 0.06);
      }
    }

    // 8. Cross-axis connections (every other axis)
    for (let i = 0; i < axes; i++) {
      for (let j = 0; j < ringRadii.length - 2; j++) {
        addLine(i, ringRadii[j], (i + 2) % axes, ringRadii[j + 1], 0.04);
        addLine(i, ringRadii[j], (i - 2 + axes) % axes, ringRadii[j + 1], 0.04);
      }
    }

    return result;
  }, [theme.line]);

  const hex1Edges = useMemo(() => {
    const result: THREE.Line[] = [];
    const r = 3.2;
    for (let i = 0; i < 6; i++) {
      const a1 = (i * Math.PI) / 3;
      const a2 = ((i + 1) * Math.PI) / 3;
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a1) * r, Math.sin(a1) * r, 0),
        new THREE.Vector3(Math.cos(a2) * r, Math.sin(a2) * r, 0),
      ]);
      const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.65 * theme.scale) });
      result.push(new THREE.Line(geom, mat));
    }
    return result;
  }, [theme.line]);

  const hex2Edges = useMemo(() => {
    const result: THREE.Line[] = [];
    const r = 1.6;
    for (let i = 0; i < 6; i++) {
      const a1 = (i * Math.PI) / 3;
      const a2 = ((i + 1) * Math.PI) / 3;
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a1) * r, Math.sin(a1) * r, 0),
        new THREE.Vector3(Math.cos(a2) * r, Math.sin(a2) * r, 0),
      ]);
      const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.6 * theme.scale) });
      result.push(new THREE.Line(geom, mat));
    }
    return result;
  }, [theme.line]);

  const hex3Edges = useMemo(() => {
    const result: THREE.Line[] = [];
    const r = 2.4;
    for (let i = 0; i < 6; i++) {
      const a1 = (i * Math.PI) / 3;
      const a2 = ((i + 1) * Math.PI) / 3;
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a1) * r, Math.sin(a1) * r, 0),
        new THREE.Vector3(Math.cos(a2) * r, Math.sin(a2) * r, 0),
      ]);
      const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.5 * theme.scale) });
      result.push(new THREE.Line(geom, mat));
    }
    return result;
  }, [theme.line]);

  const radialLines = useMemo(() => {
    const result: THREE.Line[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0),
        new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0),
      ]);
        const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.18 * theme.scale) });
      result.push(new THREE.Line(geom, mat));
    }
    return result;
  }, [theme.line]);

  const crossHexLines = useMemo(() => {
    const result: THREE.Line[] = [];
    const angles = [0.15, 0.4, 0.65, 0.9, 1.15, 1.4, 1.65, 1.9, 2.15, 2.4, 2.65, 2.9, 3.15, 3.4, 3.65, 3.9, 4.15, 4.4, 4.65, 4.9, 5.15, 5.4, 5.65, 5.9];
    const radii = [[1.0, 2.8], [1.2, 3.0], [0.9, 3.4], [1.5, 3.2], [1.8, 3.6], [0.8, 2.6], [1.3, 3.8], [2.0, 3.5], [1.6, 4.0], [1.1, 2.9], [2.2, 3.7], [0.7, 3.1], [1.4, 4.2], [1.9, 2.5], [2.4, 3.3], [1.7, 3.9], [0.6, 2.7], [2.1, 4.1], [1.0, 3.0], [2.3, 3.8], [0.8, 3.2], [1.5, 3.5], [2.0, 4.0], [1.2, 2.8]];
    angles.forEach((a, i) => {
      const r = radii[i % radii.length];
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a) * r[0], Math.sin(a) * r[0], 0),
        new THREE.Vector3(Math.cos(a + 0.06) * r[1], Math.sin(a + 0.06) * r[1], 0),
      ]);
      const mat = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: Math.min(1, 0.08 * theme.scale) });
      result.push(new THREE.Line(geom, mat));
    });
    return result;
  }, [theme.line]);

  return (
    <group ref={coreRef}>
      {/* ── Outer Rings ── */}
      <group ref={outerRef}>
        <CrispRing radius={2.8} opacity={0.9} glowRadius={0.008} />
        <CrispRing radius={2.84} opacity={0.5} />
        <CrispRing radius={3.0} opacity={0.95} glowRadius={0.008} />
        <CrispRing radius={3.2} opacity={1.0} glowRadius={0.01} />
        {/* Glow halo on brightest ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.2, 0.035, 16, 120]} />
          <meshBasicMaterial color={theme.glow} transparent opacity={Math.min(1, 0.18 * theme.scale)} />
        </mesh>
        <CrispRing radius={3.24} opacity={0.55} />
        <CrispRing radius={3.4} opacity={0.9} />
        <CrispRing radius={3.6} opacity={0.95} glowRadius={0.008} />
        <CrispRing radius={3.64} opacity={0.5} />
        <CrispRing radius={3.8} opacity={0.85} />
        <CrispRing radius={4.0} opacity={1.0} glowRadius={0.012} />
        {/* Glow halo on r=4.0 ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.0, 0.03, 16, 120]} />
          <meshBasicMaterial color={theme.glow} transparent opacity={Math.min(1, 0.15 * theme.scale)} />
        </mesh>
        <CrispRing radius={4.04} opacity={0.45} />
        <CrispRing radius={4.2} opacity={0.85} />
        <CrispRing radius={4.4} opacity={0.8} />
        <CrispRing radius={4.6} opacity={0.9} glowRadius={0.01} />
        {/* Glow halo on r=4.6 ring (outermost prominent) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.6, 0.04, 16, 120]} />
          <meshBasicMaterial color={theme.glow} transparent opacity={Math.min(1, 0.12 * theme.scale)} />
        </mesh>
        <CrispRing radius={4.8} opacity={0.7} />
        <CrispRing radius={5.0} opacity={0.6} />
        <TickRing radius={3.3} majorTicks={24} minorPerMajor={5} opacity={0.6} tickLength={0.1} />
        <TickRing radius={3.7} majorTicks={36} minorPerMajor={4} opacity={0.5} tickLength={0.08} />
        <TickRing radius={4.1} majorTicks={48} minorPerMajor={3} opacity={0.45} tickLength={0.07} />
        <TickRing radius={4.5} majorTicks={60} minorPerMajor={3} opacity={0.4} tickLength={0.06} />
        <ArcSegment radius={3.1} startAngle={0} endAngle={Math.PI * 0.3} opacity={0.6} />
        <ArcSegment radius={3.1} startAngle={Math.PI} endAngle={Math.PI * 1.3} opacity={0.6} />
        <ArcSegment radius={3.5} startAngle={Math.PI * 0.5} endAngle={Math.PI * 0.8} opacity={0.5} />
        <ArcSegment radius={3.5} startAngle={Math.PI * 1.5} endAngle={Math.PI * 1.8} opacity={0.5} />
      </group>

      {/* ── Mid Rings ── */}
      <group ref={midRef}>
        <CrispRing radius={0.8} opacity={0.8} />
        <CrispRing radius={1.0} opacity={0.75} />
        <CrispRing radius={1.2} opacity={0.85} glowRadius={0.006} />
        <CrispRing radius={1.24} opacity={0.45} />
        <CrispRing radius={1.4} opacity={0.75} />
        <CrispRing radius={1.6} opacity={0.8} glowRadius={0.006} />
        <CrispRing radius={1.64} opacity={0.45} />
        <CrispRing radius={1.8} opacity={0.8} />
        <CrispRing radius={2.0} opacity={0.85} glowRadius={0.006} />
        <CrispRing radius={2.04} opacity={0.45} />
        <CrispRing radius={2.2} opacity={0.75} />
        <CrispRing radius={2.4} opacity={0.85} glowRadius={0.006} />
        <CrispRing radius={2.6} opacity={0.7} />
        <TickRing radius={1.5} majorTicks={8} minorPerMajor={4} opacity={0.6} tickLength={0.09} />
        <TickRing radius={2.3} majorTicks={12} minorPerMajor={3} opacity={0.55} tickLength={0.08} />
        <ArcSegment radius={1.3} startAngle={Math.PI * 0.2} endAngle={Math.PI * 0.55} opacity={0.65} />
        <ArcSegment radius={1.7} startAngle={Math.PI * 0.7} endAngle={Math.PI * 1.05} opacity={0.6} />
        <ArcSegment radius={2.1} startAngle={Math.PI * 1.3} endAngle={Math.PI * 1.65} opacity={0.6} />
      </group>

      {/* ── Inner Static Rings ── */}
      <CrispRing radius={0.65} opacity={0.8} glowRadius={0.006} />
      <CrispRing radius={0.58} opacity={0.5} />
      <CrispRing radius={0.52} opacity={0.6} />
      <CrispRing radius={0.45} opacity={0.65} />
      <CrispRing radius={0.40} opacity={0.5} />
      <CrispRing radius={0.35} opacity={0.55} />
      <CrispRing radius={0.30} opacity={0.5} />
      <CrispRing radius={0.25} opacity={0.45} />
      <CrispRing radius={0.20} opacity={0.4} />

      {/* ── 8 Main Axes ── */}
      <group ref={axesRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <MainAxis key={`ax-${i}`} angle={(i * Math.PI) / 4} length={4.5} />
        ))}
      </group>

      <ConnectingChords />
      <TriangleGrid />

      {/* ── Constellation web lines ── */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {constellationLines.map((l, i) => <primitive key={`const-${i}`} object={l} />)}
      </group>

      {/* ── Diamond Frames ── */}
      <DiamondFrame size={0.55} opacity={0.65} />
      <DiamondFrame size={0.8} opacity={0.6} />
      <DiamondFrame size={1.2} opacity={0.5} />
      <DiamondFrame size={1.6} opacity={0.35} />
      <DiamondFrame size={2.0} opacity={0.25} />

      {/* ── Square Frames ── */}
      <SquareFrame size={0.95} opacity={0.45} />
      <SquareFrame size={1.4} opacity={0.35} />
      <SquareFrame size={1.8} opacity={0.25} />

      {/* ── Triangle Frames ── */}
      <TriangleFrame radius={1.0} rotation={0} opacity={0.42} />
      <TriangleFrame radius={1.0} rotation={Math.PI} opacity={0.42} />
      <TriangleFrame radius={1.5} rotation={Math.PI / 6} opacity={0.3} />
      <TriangleFrame radius={1.5} rotation={Math.PI + Math.PI / 6} opacity={0.3} />

      {/* ── Outer Hexagonal Frame ── */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * Math.PI) / 3;
          const r = 3.2;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          return (
            <group key={`hex-${i}`}>
              <GlowSprite position={[x, y, 0]} size={1.2} opacity={0.18} />
              <mesh position={[x, y, 0]}><sphereGeometry args={[0.15, 12, 12]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.35 * theme.scale)} /></mesh>
              <mesh position={[x, y, 0]}><sphereGeometry args={[0.06, 10, 10]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 1 * theme.scale)} /></mesh>
              <mesh position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.18, 0.002, 16, 32]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.55 * theme.scale)} /></mesh>
            </group>
          );
        })}
        {hex1Edges.map((l, i) => <primitive key={`hexl-${i}`} object={l} />)}
      </group>

      {/* ── Inner Hex (rotated 30°) ── */}
      <group rotation={[Math.PI / 2, 0, Math.PI / 6]}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * Math.PI) / 3;
          const r = 1.6;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          return (
            <group key={`hex2-${i}`}>
              <GlowSprite position={[x, y, 0]} size={0.8} opacity={0.15} />
              <mesh position={[x, y, 0]}><sphereGeometry args={[0.08, 10, 10]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.9 * theme.scale)} /></mesh>
              <mesh position={[x, y, 0]}><sphereGeometry args={[0.14, 10, 10]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.18 * theme.scale)} /></mesh>
            </group>
          );
        })}
        {hex2Edges.map((l, i) => <primitive key={`hex2l-${i}`} object={l} />)}
      </group>

      {/* ── Third Hex (rotated 15°) ── */}
      <group rotation={[Math.PI / 2, 0, Math.PI / 12]}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i * Math.PI) / 3;
          const r = 2.4;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          return (
            <group key={`hex3-${i}`}>
              <GlowSprite position={[x, y, 0]} size={0.9} opacity={0.15} />
              <mesh position={[x, y, 0]}><sphereGeometry args={[0.06, 10, 10]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.85 * theme.scale)} /></mesh>
              <mesh position={[x, y, 0]}><sphereGeometry args={[0.11, 10, 10]} /><meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.15 * theme.scale)} /></mesh>
            </group>
          );
        })}
        {hex3Edges.map((l, i) => <primitive key={`hex3l-${i}`} object={l} />)}
      </group>

      {/* ── Cross-hex radial lines ── */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {radialLines.map((l, i) => <primitive key={`rad-${i}`} object={l} />)}
      </group>

      {/* ── Central K ── */}
      <KermitLetter />

      {/* ── Central bright glow (sun) ── */}
      <GlowSprite position={[0, 0, 0.4]} size={6.0} opacity={0.09} soft />
      <GlowSprite position={[0, 0, 0.4]} size={3.5} opacity={0.12} soft />
      <GlowSprite position={[0, 0, 0.4]} size={2.0} opacity={0.2} />
      <GlowSprite position={[0, 0, 0.4]} size={1.2} opacity={0.35} />
      <GlowSprite position={[0, 0, 0.4]} size={0.6} opacity={0.5} />
      <mesh position={[0, 0, 0.4]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 0.4 * theme.scale)} />
      </mesh>
      <mesh position={[0, 0, 0.4]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={theme.line} transparent opacity={Math.min(1, 1 * theme.scale)} />
      </mesh>

      {/* ── Cross-hex diagonal connecting lines (more angles) ── */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {crossHexLines.map((l, i) => <primitive key={`ch-${i}`} object={l} />)}
      </group>
    </group>
  );
};

/* ── Arc Segment (line-based) ── */
const ArcSegment = ({ radius, startAngle, endAngle, color, opacity = 0.3 }: {
  radius: number; startAngle: number; endAngle: number; color?: string; opacity?: number;
}) => {
  const theme = useTheme();
  const lineColor = color ?? theme.line;
  const lineOpacity = Math.min(1, opacity * theme.scale);
  const line = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = startAngle + (endAngle - startAngle) * (i / 50);
      points.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: lineOpacity });
    return new THREE.Line(geom, mat);
  }, [radius, startAngle, endAngle, lineColor, lineOpacity]);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={line} />
    </group>
  );
};

/* ── MomentNode (data-driven, supports empty/filled states) ── */
const MomentNode = ({ moment, onClick, isTouchDevice = false, fontSize = 'medium' }: { moment: MomentData; onClick: () => void; isTouchDevice?: boolean; fontSize?: 'small' | 'medium' | 'large' }) => {
  const theme = useTheme();
  const isDark = theme.scale === 1;
  const [hovered, setHovered] = useState(false);
  const fontScale = (fontSize === 'small' ? 0.8 : fontSize === 'large' ? 1.35 : 1) * (isDark ? 1 : LIGHT_FONT_BOOST);
  const ref = useRef<THREE.Group>(null!);
  const ref2 = useRef<THREE.Group>(null!);
  const pulseRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const { playHover, playClick } = useSoundEffects();

  const hasContent = moment.media || moment.id === 'ABOUT_ME';
  const color = moment.color;

  useFrame(() => {
    const t = performance.now() * 0.001;
    if (ref.current) ref.current.rotation.z = t * 0.5;
    if (ref2.current) ref2.current.rotation.z = -t * 0.3;
    // Smooth scale animation on hover
    if (groupRef.current) {
      const target = hovered ? 1.25 : 1;
      const current = groupRef.current.scale.x;
      const next = current + (target - current) * 0.1;
      groupRef.current.scale.setScalar(next);
    }
    if (pulseRef.current) {
      const pulse = 0.6 + Math.sin(t * 2) * 0.4;
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, (hovered ? 0.35 : (hasContent ? 0.18 : 0.06)) * pulse * theme.scale);
      pulseRef.current.scale.setScalar(1 + pulse * 0.4);
    }
    if (glowRef.current) {
      const pulse = 0.7 + Math.sin(t * 1.5) * 0.3;
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(1, (hovered ? 0.28 : (hasContent ? 0.1 : 0.03)) * pulse * theme.scale);
    }
  });

  const connectorLine = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-moment.position[0] * 0.3, -moment.position[1] * 0.3, -moment.position[2] * 0.3),
    ]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: Math.min(1, (hasContent ? 0.25 : 0.08) * theme.scale) });
    const line = new THREE.Line(geom, mat);
    line.frustumCulled = false;
    return line;
  }, [moment.position, color, hasContent, theme.scale]);

  return (
    <group position={moment.position}>
      <primitive object={connectorLine} />
      <group ref={groupRef}>
        {/* Outer pulsing glow ring */}
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.005, 12, 32]} />
          <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hasContent ? 0.1 : 0.03) * theme.scale)} />
        </mesh>
        {/* Pulsing glow sphere */}
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hasContent ? 0.18 : 0.06) * theme.scale)} />
        </mesh>
        {/* Static outer glow sphere */}
        <mesh>
          <sphereGeometry args={[0.65, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hasContent ? 0.06 : 0.02) * theme.scale)} />
        </mesh>
        {/* Clickable sphere */}
        <mesh
          onClick={(e) => { e.stopPropagation(); if (hasContent) { playClick(); onClick(); } }}
          onPointerOver={isTouchDevice ? undefined : () => { setHovered(true); playHover(); }}
          onPointerOut={isTouchDevice ? undefined : () => setHovered(false)}
        >
          <sphereGeometry args={[isTouchDevice ? 0.4 : (hovered ? 0.36 : 0.26), 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hovered ? 0.3 : (hasContent ? 0.15 : 0.05)) * theme.scale)} />
        </mesh>
        {/* Core dot */}
        <mesh>
          <sphereGeometry args={[hovered ? 0.14 : 0.1, 12, 12]} />
          <meshBasicMaterial color={hovered ? theme.line : color} transparent opacity={Math.min(1, (hasContent ? 1 : 0.4) * theme.scale)} />
        </mesh>
        {/* Core glow halo */}
        <mesh>
          <sphereGeometry args={[0.16, 10, 10]} />
          <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hasContent ? (hovered ? 0.5 : 0.3) : 0.08) * theme.scale)} />
        </mesh>
        {/* Orbit ring 1 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.36, 0.004, 12, 32]} />
          <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hovered ? 0.7 : (hasContent ? 0.3 : 0.1)) * theme.scale)} />
        </mesh>
        {/* Orbit ring 2 (rotating) */}
        <group ref={ref}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.003, 10, 24]} />
            <meshBasicMaterial color={hovered ? theme.line : color} transparent opacity={Math.min(1, (hovered ? 0.5 : (hasContent ? 0.2 : 0.06)) * theme.scale)} />
          </mesh>
        </group>
        {/* Orbit ring 3 (counter-rotating) */}
        <group ref={ref2}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.003, 10, 24]} />
            <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hasContent ? 0.15 : 0.04) * theme.scale)} />
          </mesh>
        </group>
        {/* Cardinal dots */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, i) => (
          <group key={i}>
            <mesh position={[Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hovered ? 0.9 : (hasContent ? 0.4 : 0.12)) * theme.scale)} />
            </mesh>
            <mesh position={[Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0]}>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshBasicMaterial color={color} transparent opacity={Math.min(1, (hovered ? 0.35 : (hasContent ? 0.12 : 0.04)) * theme.scale)} />
            </mesh>
          </group>
        ))}
        {/* Label — always faces camera */}
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.16 * fontScale}
            color={theme.text}
            fillOpacity={Math.min(1, (hovered ? 1 : (hasContent ? 0.85 : 0.35)) * theme.scale)}
            anchorX="center"
            fontWeight="bold"
          >
            {moment.title}
          </Text>
          {/* Sub-label */}
          <Text
            position={[0, -0.86 - (fontScale - 1) * 0.1, 0]}
            fontSize={0.08 * fontScale}
            color={color}
            fillOpacity={Math.min(1, (hovered ? 0.95 : (hasContent ? 0.55 : 0.15)) * theme.scale)}
            anchorX="center"
          >
            {hasContent ? (hovered ? 'CLICK TO EXPLORE' : moment.subtitle || moment.category.toUpperCase()) : 'COMING SOON'}
          </Text>
          {/* Tooltip on hover — shows description */}
          {hovered && hasContent && (
            <group position={[0, 0.9, 0]}>
              <Text
                fontSize={0.065 * fontScale}
                color={theme.text}
                fillOpacity={Math.min(1, 0.9 * theme.scale)}
                anchorX="center"
                maxWidth={3}
              >
                {moment.description.length > 60 ? moment.description.slice(0, 60) + '...' : moment.description}
              </Text>
            </group>
          )}
        </Billboard>
      </group>
    </group>
  );
};

/* ── Category Connection Lines (arc between same-category nodes) ── */
const CategoryLines = () => {
  const theme = useTheme();
  const lines = useMemo(() => {
    const result: THREE.Line[] = [];
    // Group nodes by category
    const groups: Record<string, MomentData[]> = {};
    for (const m of momentList) {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    }
    // Draw arc between pairs in same category
    for (const cat of Object.keys(groups)) {
      const nodes = groups[cat];
      if (nodes.length < 2) continue;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = new THREE.Vector3(...nodes[i].position);
          const b = new THREE.Vector3(...nodes[j].position);
          const mid = a.clone().add(b).multiplyScalar(0.5);
          // Push midpoint away from center for arc effect
          const center = new THREE.Vector3(0, 0, 0);
          const toMid = mid.clone().sub(center);
          mid.add(toMid.normalize().multiplyScalar(1.5));
          // Quadratic bezier
          const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          const pts = curve.getPoints(32);
          const geom = new THREE.BufferGeometry().setFromPoints(pts);
          const color = nodes[0].color;
          const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: Math.min(1, 0.12 * theme.scale) });
          const line = new THREE.Line(geom, mat);
          line.frustumCulled = false;
          result.push(line);
        }
      }
    }
    return result;
  }, []);
  return (
    <group>
      {lines.map((l, i) => <primitive key={`catline-${i}`} object={l} />)}
    </group>
  );
};

/* ── Decorative Particles (sparse, subtle star-like dust) ── */
const DecorativeParticles = () => {
  const theme = useTheme();
  const particles = useMemo(() => {
    const result: { x: number; y: number; z: number; size: number; opacity: number }[] = [];
    const positions: [number, number, number][] = [
      [1.5, 0.8, -1], [-1.5, 0.8, -1], [0.8, 1.5, -1], [-0.8, 1.5, -1],
      [2.5, 1.2, -1.5], [-2.5, 1.2, -1.5], [1.2, 2.5, -1.5], [-1.2, 2.5, -1.5],
      [3.5, 1.8, -2], [-3.5, 1.8, -2], [1.8, 3.5, -2], [-1.8, 3.5, -2],
      [0.6, 0.3, -0.5], [-0.6, 0.3, -0.5], [0.3, 0.6, -0.5], [-0.3, 0.6, -0.5],
    ];
    for (const [x, y, z] of positions) {
      const dist = Math.sqrt(x * x + y * y);
      result.push({ x, y, z, size: dist > 2.5 ? 0.018 : 0.012, opacity: 0.25 });
    }
    return result;
  }, []);
  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial color={theme.star} transparent opacity={Math.min(1, p.opacity * theme.scale)} />
        </mesh>
      ))}
    </group>
  );
};

/* ── Scene ── */
export default function Scene({ onLocationChange, onNodeClick, onRegisterFlyTo, isTouchDevice = false, isDark = true, fontSize = 'medium' }: { onLocationChange: (loc: string) => void; onNodeClick: (nodeId: string) => void; onRegisterFlyTo?: (fn: (pos: [number, number, number], id: string) => void) => void; isTouchDevice?: boolean; isDark?: boolean; fontSize?: 'small' | 'medium' | 'large' }) {
  const { camera } = useThree();
  const theme = isDark ? darkTheme : lightTheme;

  const flyTo = useCallback((pos: [number, number, number], label: string) => {
    gsap.to(camera.position, {
      x: pos[0] * 0.6, y: pos[1] * 0.6, z: pos[2] + 3,
      duration: 2.5, ease: "expo.inOut",
      onUpdate: () => { camera.lookAt(0, 0, 0); },
      onComplete: () => {
        onLocationChange(label);
        onNodeClick(label);
      }
    });
  }, [camera, onLocationChange, onNodeClick]);

  useEffect(() => {
    if (onRegisterFlyTo) onRegisterFlyTo(flyTo);
  }, [flyTo, onRegisterFlyTo]);

  const resetCamera = useCallback(() => {
    gsap.to(camera.position, {
      x: 0, y: 0, z: 12,
      duration: 2.5, ease: "expo.inOut",
      onUpdate: () => { camera.lookAt(0, 0, 0); },
      onComplete: () => { onLocationChange("UNIVERSAL_ORIGIN"); }
    });
  }, [camera, onLocationChange]);

  return (
    <ThemeContext.Provider value={theme}>
      <>
        <color attach="background" args={[isDark ? '#020617' : '#f0f4f8']} />
      <ambientLight intensity={1} />
      <StarField />
      <NebulaStreaks />
      <FadeInOverlay />
      <KermitIdentityCore />
      <CategoryLines />
      <DecorativeParticles />
      {momentList.map((m) => (
        <MomentNode
          key={m.id}
          moment={m}
          onClick={() => flyTo(m.position, m.id)}
          isTouchDevice={isTouchDevice}
          fontSize={fontSize}
        />
      ))}
      {!isTouchDevice && <MouseTrail />}
      {!isTouchDevice && (
        <mesh position={[0, 0, 0]} onClick={() => resetCamera()}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
      </>
    </ThemeContext.Provider>
  );
}
