# KERMIT-OS

A 3D immersive "Digital Identity OS" website that visualizes a personal knowledge system as an interactive universe with sacred geometry.

## Features

- **Sacred Geometry** — Concentric rings, hexagonal frames, diamond frames, triangle grids
- **Central "K"** — Double-stroke technical drawing style with concentric diamond frames
- **8 Main Axes** — Radiating lines with glowing endpoint circles
- **Constellation Web** — 70+ connecting lines forming structured patterns
- **Interactive Nodes** — AI Lab, Web3 Universe, Knowledge Archive, Explorer
- **Mouse Trail** — 12-particle comet following cursor
- **Nebula** — Blue nebula patches on left/right sides
- **Energy Pulses** — 7 orbiting dots along rings
- **64 Sparkle Dots** — Bright star-like points scattered throughout
- **Bottom Labels** — "K E R M I T" with hexagonal containers and curved arc lines

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (Turbopack) |
| UI | React 19.2.4, Tailwind CSS 4 |
| 3D | Three.js 0.185.1, React Three Fiber 9.6.1, Drei 10.7.7 |
| Animation | GSAP 3.15.0 |
| Language | TypeScript 5 |

## Getting Started

### Prerequisites
- Node.js 18+
- Windows PowerShell (for execution policy)

### Run Development Server

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
D:
cd "D:\0001.AI\資料庫研究obsidian\kermit-os"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
npm run build
npm start
```

## Project Structure

```
kermit-os/
├── app/
│   ├── page.tsx              # Main page — Canvas, UI overlay, node data
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles (Tailwind)
├── components/
│   ├── canvas/
│   │   └── Scene.tsx         # ALL 3D scene (~1100 lines)
│   └── ui/
│       └── ContentPanel.tsx  # Detail panel for node clicks
├── data/
│   └── nodeContent.ts        # Node content data
├── AGENTS.md                 # Agent rules and conventions
├── CHANGELOG.md              # Development log
└── README.md                 # This file
```

## Scene Architecture

The 3D scene is built with ~25 reusable components:

| Component | Purpose |
|-----------|---------|
| `StarField` | 3-layer particle starfield (3800 particles) |
| `NebulaStreaks` | 8 blue nebula patches |
| `CrispRing` | Line-based concentric circles |
| `TickRing` | Compass-like tick marks |
| `ArcSegment` | Line-based arc segments |
| `DotPulse` | Pulsing dots with animation |
| `IntersectionDots` | Dots at ring×axis intersections |
| `ConnectingChords` | Chord lines between axes |
| `TriangleGrid` | Sacred geometry triangles |
| `DiamondFrame` | Diamond/rhombus outlines |
| `SquareFrame` | Square outlines |
| `TriangleFrame` | Triangle outlines |
| `MainAxis` | 8 axes with endpoint circles |
| `EnergyPulse` | Orbiting dots along rings |
| `MouseTrail` | Cursor-following comet |
| `FadeInOverlay` | 2s load fade |
| `KermitLetter` | Double-stroke K |
| `BottomLabels` | "K E R M I T" section |
| `SparkleDots` | Bright star points |
| `Node` | Interactive clickable nodes |
| `ContentPanel` | Node detail panel (HTML) |

## WebGL Constraints

This project has hard constraints due to WebGL limitations:

- **No AdditiveBlending** — causes silent WebGL failures
- **No postprocessing** — Bloom/EffectComposer crashes WebGL
- **No useMemo in loops** — breaks React hooks ordering
- **No `<line>` JSX** — conflicts with SVG elements
- **Use `fillOpacity`** for drei Text (not `opacity`)

See `AGENTS.md` for full details.

## Reference

Visual reference: `D:\獨角獸\封面\S__89006084_0.jpg`
