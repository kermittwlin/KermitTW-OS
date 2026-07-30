# KERMIT-OS / KermitTW — Development Log

## Project Overview
- **Name:** KermitTW — Digital Identity OS
- **URL:** https://kermittwlin.github.io/KermitTW-OS/
- **Tech:** Next.js 16, React 19, Three.js, R3F, Drei, GSAP, Tailwind CSS 4, TypeScript
- **Repo:** https://github.com/kermittwlin/KermitTW-OS

---

## v0.3.0 — Light Theme & UI Overhaul (2026-07-31)

### Light Theme Contrast Fix
- Redesigned opacity strategy: `lightTheme.scale` from `4.0` → `2.0` (less aggressive clamping)
- Added `opacityScale()` and `opacityFloor()` helper functions in Scene.tsx
- Fixed missing `theme.scale` in StarField, NebulaStreaks, MouseTrail components
- Fixed DiamondFrame, SquareFrame, TriangleFrame not using `theme.scale`
- Added `useTheme()` to NebulaStreaks component

### ContentPanel Theme-Aware
- Added `isDark` prop to ContentPanel
- Replaced all 8 hardcoded dark-theme colors with conditional `isDark ? dark : light`
- Panel background, title, subtitle, date, description, drag handle, close button — all adaptive
- Pass `isDark` from page.tsx to ContentPanel

### NodeNav Fixes
- Fixed hardcoded `text-white` on active "ALL" button → `bg-blue-100 text-blue-800` in light mode
- Fixed hardcoded `text-white` on active category → `text-gray-800` in light mode
- Fixed hover state `hover:bg-white/5` → `hover:bg-black/5` in light mode
- Added `panelOpen` prop — arrow hides completely (`opacity-0 pointer-events-none`) when content panel is open

### Scrollbar
- Changed scrollbar from white-based `rgba(255,255,255,...)` to neutral gray `rgba(128,128,128,...)`

### Dead Code Cleanup
- Removed unused `textMuted` from darkTheme and lightTheme definitions

---

## Branding: KERMIT OS → KermitTW

### Logo Redesign
- Removed entire `BottomLabels` 3D component (~152 lines) — KERMIT text was invisible from front, cluttered bottom of screen
- Created new "KermitTW" logo in top-left UI overlay: "Kermit" (font-light) + "TW" (font-bold)
- Subtitle: "Digital Identity OS"

### Global Rename
- LoadingScreen: `KERMIT OS` → `KermitTW` (styled logo)
- OnboardingGuide: `WELCOME TO KERMIT OS` → `WELCOME TO KermitTW`
- ContentPanel footer: `KERMIT OS ·` → `KermitTW ·`
- layout.tsx: page title and og:title → `KermitTW | Digital Identity OS`

---

## 3D Text & Font

### Font Size Boost
- Created `LIGHT_FONT_BOOST = 1.25` constant
- Applied to MomentNode title (`0.16`), subtitle (`0.08`), tooltip (`0.065`)
- Now applies to **both** dark and light modes (not just light)

### Previous Changes
- MomentNode title: `0.12` → `0.16`, subtitle: `0.06` → `0.08`, tooltip: `0.05` → `0.065`
- fontSize wired from page.tsx → Scene → MomentNode via `settings.fontSize`

---

## UI Layout Fixes

### ContentPanel Position
- Default `panelPosition` changed from `'right'` → `'left'` (avoids blocking settings gear and node nav arrow)
- Panel positioned at **top-left** (`items-start` instead of `items-end`)

### NodeNav Arrow
- Arrow completely hidden when content panel is open (opacity-0 + pointer-events-none)
- Prevents arrow from overlaying the content panel

### start.bat Fix
- Fixed dev server URL: `localhost:3000` → `localhost:3000/KermitTW-OS/` (basePath issue)

---

## Theme System

### Architecture
- `ThemeContext` + `useTheme()` hook in Scene.tsx
- `darkTheme` / `lightTheme` objects with: `line`, `lineFaint`, `lineMed`, `text`, `glow`, `nebula`, `star`, `scale`
- All 3D elements use `theme.scale` multiplier for opacity

### GlowSprite Theme-Aware
- Dark/light glow textures created at module scope
- Texture selection based on `theme.scale === 1`
- Opacity scaled by `theme.scale`

### Glow Halo Torus
- Changed from hardcoded light-blue to `theme.glow` in KermitIdentityCore

---

## Deployment

### GitHub Pages
- GitHub Actions workflow: Node.js 22, `next build` + `next export`
- `next.config.ts`: `output: 'export'`, `basePath: '/KermitTW-OS'`
- Auto-deploys on push to `main`

### Git Setup
- Git path: `C:\Program Files\Git\cmd\git.exe`
- Remote: `https://github.com/kermittwlin/KermitTW-OS.git`

---

## File Structure (Current)

```
kermit-os/
├── app/
│   ├── page.tsx              # Main page — Canvas, UI, Loading, Settings, Nav
│   ├── layout.tsx            # Root layout (title: KermitTW)
│   └── globals.css           # Scrollbar (neutral gray), touch optimization
├── components/
│   ├── canvas/
│   │   └── Scene.tsx         # ALL 3D scene (~1320 lines, BottomLabels removed)
│   └── ui/
│       ├── ContentPanel.tsx   # Theme-aware detail panel (isDark prop)
│       ├── SettingsPanel.tsx  # Theme, font, position settings
│       ├── OnboardingGuide.tsx # Welcome overlay
│       ├── NodeNav.tsx        # Right-side nav (panelOpen prop)
│       ├── Lightbox.tsx       # Full-screen image viewer
│       └── LoadingScreen.tsx  # Loading animation (KermitTW branding)
├── hooks/
│   └── useSoundEffects.ts
├── data/
│   └── moments.ts
├── types/
│   └── moment.ts
├── start.bat                 # Auto-start launcher
├── AGENTS.md
├── LOG.md                    # This file
└── package.json
```

---

## Critical WebGL Pitfalls (Reference)

1. `AdditiveBlending` crashes WebGL — use `transparent` + `opacity`
2. `@react-three/postprocessing` crashes — fake glow with layered geometry
3. `bufferAttribute` requires `args` prop
4. `<line>` JSX conflicts with SVG — use `<primitive object={threeLine} />`
5. drei Text `opacity` doesn't work — use `fillOpacity`
6. NO `useMemo` inside `.map()` — pre-compute at component top-level
7. FadeInOverlay: mutate `ref.current.material.opacity` directly (no useState)
8. K letter disappearing — set `frustumCulled = false`, position `z=0.5`
9. UTF-8 BOM in .bat files — `cmd.exe` corrupts first line
10. drei `<Text>` — `depthTest` and `renderOrder` are not valid props

---

## Next Steps

- [ ] Add 4 new nodes (tools/journey categories)
- [ ] Expand types/categories system
- [ ] Performance optimization for mobile
- [ ] Accessibility improvements
