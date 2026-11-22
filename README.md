# Jezero Crater, Mars — Interactive 3D Deep-Time & Paleohydrology Model

Live site: **https://tothur.github.io/jezero-crater/**

An interactive WebGL 2 and Meta Quest 3 WebXR passthrough tabletop reconstruction of **Jezero Crater** (`18.35° N, 77.74° E`, `78 × 78 km`) and **Jezero Mons**, tracing ~3.9 billion years of Martian volcanism, lacustrine paleohydrology, braided fan-delta progradation, and wind erosion on real NASA/JPL MRO CTX terrain.

## Highlights
- **Real NASA/JPL Martian Topography & Imagery**: Built from the `20 m/px` MRO CTX stereo DTM (`M20_JezeroCrater_CTXDEM_20m`, MOLA areoid datum) and `5 m/px` MRO CTX orthomosaic fused with calibrated Martian mineral tones and Viking MDIM 2.1 chromaticity.
- **8 Geological Epochs (`3.92 Ga` → Today)**:
  1. **Impact Basin Excavation** (`~3.90 Ga`) — pre-delta flat Noachian crater floor.
  2. **Jezero Mons Volcanism** (`~3.82 Ga`) — `21 km`-wide, `~2 km`-tall SE rim composite volcano (*Cuevas-Quiñones et al., Commun. Earth Environ. 2025*) erupting ash plumes, Martian-gravity (`3.72 m/s²`) fire-fountain clots, and basaltic lava flows.
  3. **Closed-Basin Paleolake** (`~3.74 Ga`) — alkaline lake (`~−2,500 m` MOLA) precipitating marginal carbonates.
  4. **Open-Basin Highstand & Breach** (`~3.66 Ga`) — lake rises to `−2,395 m` MOLA (`~246 m` deep) and overtops the northeastern rim to carve **Pliva Vallis**.
  5. **Western & Northern Fan-Deltas** (`~3.58 Ga`) — Neretva and Sava Valles prograde braided alluvial fan-deltas radially into the oscillating paleolake (*Mangold et al., Science 2021*).
  6. **Late-Stage Flash Floods** (`~3.45 Ga`) — episodic high-discharge muddy surges swelling rivers wall-to-wall.
  7. **Desiccation & Wind Erosion** (`3.38–0.45 Ga`) — lake evaporation, wind stripping, Kodiak Butte isolation, and Belva Crater impact.
  8. **Modern Jezero Crater** — hyper-arid Martian basin today.
- **Physical Open-Channel & Optical Water Model**: Flat horizontal cross-section river depths intersected directly against the CTX DTM, per-pixel 2D downstream flow-map advection, Beer-Lambert depth absorption over submerged bedrock, capillary wet-rock banks, and Schlick Fresnel reflections of a custom Martian sky dome (Butterscotch Day, Noachian Pale Sky, forward-scattered **Blue Dusk**, and starry Night).

## Local Development & Tests
```bash
node --test tests/jezero.test.mjs
python3 -m http.server 8789
```
