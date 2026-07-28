# KERMIT-OS — Agent Rules

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Project Overview

**KERMIT-OS** is a 3D immersive "Digital Identity OS" website that visualizes Kermit's personal exhibition universe — DJ performances, music compositions, event curation, and business projects — as an interactive 3D constellation with sacred geometry.

## Tech Stack

- **Framework:** Next.js 16.2.10 (Turbopack)
- **UI:** React 19.2.4, Tailwind CSS 4
- **3D:** Three.js 0.185.1, React Three Fiber 9.6.1, Drei 10.7.7
- **Animation:** GSAP 3.15.0
- **Icons:** lucide-react 1.23.0
- **Language:** TypeScript 5

## How to Run

**Option A: Double-click `start.bat`** (auto-opens browser after 5s)

**Option B: Manual**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
D:
cd "D:\0001.AI\資料庫研究obsidian\kermit-os"
npm run dev
```

## Build & Verify

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
npm run build
```

## File Structure

```
kermit-os/
├── app/
│   ├── page.tsx              # Main page — Canvas, UI, Loading, Settings, Nav
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles, scrollbar-thin
├── components/
│   ├── canvas/
│   │   └── Scene.tsx         # ALL 3D scene (~1360 lines)
│   └── ui/
│       ├── ContentPanel.tsx   # Detail panel with media embedding
│       ├── SettingsPanel.tsx  # Theme, font, position settings
│       ├── OnboardingGuide.tsx
│       ├── NodeNav.tsx        # Right-side navigation sidebar
│       ├── Lightbox.tsx       # Full-screen image viewer
│       └── LoadingScreen.tsx  # Ceremonial loading animation
├── hooks/
│   └── useSoundEffects.ts    # Web Audio API hover/click sounds
├── data/
│   └── moments.ts            # Moment data & helper functions
├── types/
│   └── moment.ts             # TypeScript types
├── start.bat                 # Auto-start launcher (no BOM!)
├── AGENTS.md                 # This file
├── CHANGELOG.md              # Development log
└── package.json
```

## Scene.tsx Component Hierarchy

```
Scene (export default)
├── StarField                 # 3-layer particle starfield
├── NebulaStreaks             # 8 blue nebula patches (sprites, fixed)
├── FadeInOverlay             # 2s fade from dark on load (stops after)
├── KermitIdentityCore        # Main assembly group
│   ├── Outer Rings           # 15 CrispRings (r=2.8–4.8) + glow halos + tick rings
│   ├── Mid Rings             # 13 CrispRings (r=0.8–2.6) + tick rings
│   ├── Inner Static Rings    # 9 CrispRings (r=0.2–0.65)
│   ├── 8 Main Axes           # Lines with endpoint circles + inner circles
│   ├── ConnectingChords      # Chord lines between axes
│   ├── TriangleGrid          # Sacred geometry triangle web
│   ├── ConstellationLines    # 70+ structured connecting lines
│   ├── Diamond Frames        # 5 concentric diamonds
│   ├── Square Frames         # 3 squares
│   ├── Triangle Frames       # 4 triangles
│   ├── 3 Hex Frames          # Outer/Inner/Third hex at r=3.2/1.6/2.4
│   ├── Radial Lines          # 12 lines from r=0.8 to r=3.2
│   ├── Cross-Hex Lines       # 24 connecting lines
│   ├── Central Glow          # 3-layer sphere glow at origin
│   └── KermitLetter          # Double-stroke K with 4 concentric diamonds
├── BottomLabels              # "K E R M I T" with hex frames + arc lines
├── CategoryLines             # Bezier arcs between same-category nodes
├── DecorativeParticles       # 16 sparse white dots
├── MomentNode ×9             # Data-driven interactive nodes
│   ├── groupRef              # Smooth scale animation (1→1.25x on hover)
│   ├── connectorLine         # Line toward center
│   ├── GlowSprite layers     # Pulsing glow rings + spheres
│   ├── Clickable sphere      # 0.26 base radius, 0.36 on hover
│   ├── Core dot              # 0.1 base, 0.14 on hover
│   ├── Orbit rings ×3        # Static + rotating + counter-rotating
│   ├── Cardinal dots ×4      # Directional markers
│   ├── Title text            # fontSize 0.12
│   ├── Subtitle text         # fontSize 0.06
│   └── Hover tooltip         # Description preview (60 chars)
├── MouseTrail                # 8-particle comet trail (pre-allocated vectors)
└── Reset camera sphere       # Invisible, click to reset view
```

## Critical WebGL Pitfalls

These are hard-won lessons. **DO NOT** repeat these mistakes:

1. **`AdditiveBlending` crashes WebGL** — Use `transparent` + `opacity` only
2. **`@react-three/postprocessing` crashes** — Fake glow with layered geometry
3. **`bufferAttribute` requires `args`** — `<bufferAttribute args={[count, array, itemSize]} />`
4. **`<line>` JSX conflicts with SVG** — Use `<primitive object={threeLine} />`
5. **drei Text `opacity` doesn't work** — Use `fillOpacity`
6. **NO useMemo inside .map()** — Pre-compute at component top-level
7. **FadeInOverlay useState + useFrame lag** — Mutate `ref.current.material.opacity` directly
8. **K letter disappearing** — Set `line.frustumCulled = false`, position at `z=0.5`
9. **UTF-8 BOM in .bat files** — `cmd.exe` corrupts first line; strip BOM, use `%~dp0`

## Performance Rules

- `dpr={[1, 1.5]}` — never `[1, 2]` on high-DPI
- `powerPreference: 'high-performance'` on Canvas gl
- Pre-allocate Vector3 objects for useFrame (never `new` in loop)
- Stop useFrame callbacks when animation completes (use `done.current` flag)
- Reduce geometry: torus ≤32 segments, sphere ≤16 segments for small objects
- OrbitControls: `dampingFactor: 0.05`, `rotateSpeed: 0.5`, `zoomSpeed: 0.8`

## Interaction Model

1. **Click a Node** → GSAP camera fly-to → ContentPanel slides in with media
2. **Click center sphere** → Camera resets to default position
3. **Hover Node** → Smooth scale 1.25x, glow brightens, tooltip appears, hover sound plays
4. **Click Node** → Click sound plays, panel opens
5. **Navigation Sidebar** → Click node list → Same fly-to + panel
6. **ESC key** → Closes ContentPanel or Lightbox

## Code Conventions

- All 3D components in `Scene.tsx` (single file)
- Pre-compute THREE.Line arrays with top-level `useMemo`
- Use `<primitive object={...} />` for pre-created Three.js objects
- `frustumCulled = false` for objects that must never disappear
- Opacity-based glow only (no additive blending, no postprocessing)
- GSAP for camera animations and UI panel transitions
- `fillOpacity` (not `opacity`) for drei `<Text>` components
- Web Audio API for sound effects (no external audio files)
