# KERMIT-OS — Development Log

## v0.3.0 — Interactive Experience (2026-07-17)

### Phase 13: Performance Optimization
- **MouseTrail** — Reduced 12→8 particles; pre-allocated `THREE.Vector3` objects to avoid GC pressure per frame
- **FadeInOverlay** — Stops `useFrame` after fade completes (uses `done.current` flag)
- **MomentNode geometry** — Torus segments 64→32, sphere segments 32→12
- **Canvas** — `dpr` reduced from `[1, 2]` to `[1, 1.5]`; added `powerPreference: 'high-performance'`
- **OrbitControls** — Added `dampingFactor: 0.05`, `rotateSpeed: 0.5`, `zoomSpeed: 0.8` for smoother scroll

### Phase 14: Node Interaction Upgrade
- **Sphere size** — Base radius 0.2→0.26 (+30%), orbit rings scaled proportionally
- **Hover animation** — Smooth scale interpolation (1→1.25x) via `groupRef.scale.setScalar()`
- **Hover brightness** — Core opacity 0.15→0.3, glow halo 0.3→0.5, orbit ring 0.3→0.7
- **Text size** — Title fontSize 0.09→0.12 (+33%), subtitle 0.045→0.06 (+33%)
- **Hover tooltip** — Shows first 60 chars of description above node on hover

### Phase 15: Category Connection Lines
- **CategoryLines** component — Draws quadratic Bezier curves between same-category nodes
- Groups nodes by `moment.category`, pairs all nodes within each group
- Midpoint pushed outward from center for natural arc shape
- Semi-transparent (opacity 0.12), color-matched to category

### Phase 16: Decorative Particles
- **DecorativeParticles** — 16 sparse white dots at key positions
- Size varies by distance (inner: 0.012, outer: 0.018)
- Adds depth without clutter (opacity 0.25)

### Phase 17: Sound Effects
- **useSoundEffects hook** (`hooks/useSoundEffects.ts`) — Web Audio API synthesis, no external files
- **Hover sound** — Rising sine 800→1200Hz, 0.12s, volume 0.04
- **Click sound** — Dual-phase sine 600→1400→800Hz, 0.2s, volume 0.06
- AudioContext created on first user interaction (hover/click)

### Phase 18: Loading Screen
- **LoadingScreen** (`components/ui/LoadingScreen.tsx`) — Ceremonial intro
- SVG "K" letter + diamond frame with pulse animation
- Fake progress bar with random increments (80ms interval)
- Status text: INITIALIZING → LOADING MOMENTS → PREPARING UNIVERSE → SYSTEM READY
- Fades out on completion, triggers UI fade-in

### Phase 19: Navigation Sidebar
- **NodeNav** (`components/ui/NodeNav.tsx`) — Right-side collapsible panel
- Toggle button (chevron) on right edge
- Category filter buttons (ALL / MUSIC / LIVE / PARTY / BUSINESS / LEARNING)
- Scrollable node list with color dots, category icons, subtitles
- Click node → camera fly-to + panel open
- Footer shows explored/total count

### Phase 20: Image Lightbox
- **Lightbox** (`components/ui/Lightbox.tsx`) — Full-screen image viewer
- GSAP fade + scale animation
- ESC key or click-outside to close
- Caption overlay at bottom

### Phase 21: Mobile Responsive
- **ContentPanel** — `p-3 sm:p-6`, `rounded-t-2xl sm:rounded-2xl` (bottom sheet on mobile)
- Mobile drag handle indicator
- UI overlay text adapts (full vs short version)
- Hint text: "拖曳旋轉 · 滑動縮放" on mobile

### Phase 22: Dev Tools & BAT Launcher
- **start.bat** — Auto-start dev server + open browser after 5s
- Uses `%~dp0` to avoid Chinese path encoding issues
- UTF-8 no-BOM file (stripped BOM via PowerShell)

---

## v0.2.0 — Content Platform (2026-07-12)

### Phase 10: Content Platform Architecture
- **Types** — `types/moment.ts` with MomentData, MomentMedia, MomentCategory, CATEGORIES
- **Data layer** — `data/moments.ts` with initial 9 moments (identity, music, party, business)
- **MomentNode** — Data-driven 3D node component replacing hardcoded Node
  - Supports empty/filled states (dimmed vs bright)
  - Hover: scale up, glow increase, cursor pointer
  - Click: camera fly-to + panel open (only if has content)
  - Tooltip shows "COMING SOON" for empty nodes

### Phase 11: Media Embedding
- **ContentPanel** — Supports 5 media types:
  - YouTube (iframe embed)
  - Vimeo (iframe embed)
  - SoundCloud (widget embed, visual mode 300px)
  - Image (with lightbox click)
  - Audio (HTML5 player)
- Panel shows: title, subtitle, date, media, description, tags

### Phase 12: Scene Cleanup
- Removed IntersectionDots (84 dots) — too cluttered
- Removed SparkleDots (64 dots) — too cluttered
- Removed EnergyPulse (7 orbiting dots) — too cluttered
- Scene reduced from ~298 white dots to ~27 decorative nodes

---

## v0.1.0 — Visual Foundation (2026-07-11)

### Phase 1-9: See original log (scaffold, 3D scene, K letter, hex structure, bottom labels, interactive nodes, visual fidelity passes)

---

## Content Inventory

| # | Node ID | Title | Category | Media | Status |
|---|---------|-------|----------|-------|--------|
| 1 | ABOUT_ME | ABOUT ME | identity | — | ✅ Complete |
| 2 | hot-mv | HOT(辣) MV | music | YouTube: Z_qfNV3nzcE | ✅ Complete |
| 3 | animation-score | 動畫配樂 | music | Vimeo: 25065555 | ✅ Complete |
| 4 | soundcloud-works | SOUNDCLOUD | music | SoundCloud widget | ✅ Complete |
| 5 | party-curation | PARTY 策展 | party | — | ⏳ Awaiting photos |
| 6 | beauty-metaverse | 美業元宇宙 | business | — | ⏳ Awaiting content |
| 7 | beauty-marketing | 美業行銷企劃 | business | — | ⏳ Awaiting content |
| 8 | esports-curation | 電玩實況大型策展 | business | — | ⏳ Awaiting content |
| 9 | self-media | 自媒體策展統籌 | business | — | ⏳ Awaiting content |

---

## Known Issues

### WebGL Limitations
- `AdditiveBlending` causes silent WebGL failures — use `transparent` + `opacity` only
- `@react-three/postprocessing` (Bloom/EffectComposer) causes WebGL crashes
- `THREE.Clock` deprecation warning (cosmetic, non-blocking)

### Windows/BAT Encoding
- UTF-8 BOM in `.bat` files causes `cmd.exe` to corrupt first line
- Solution: strip BOM; use `%~dp0` instead of hardcoded Chinese paths

## Future Improvements

- [ ] Party event photos + descriptions
- [ ] Business case study images
- [ ] SEO (generateMetadata for static export)
- [ ] Ambient background audio
- [ ] Node detail pages (separate routes)
- [ ] Vercel deployment
