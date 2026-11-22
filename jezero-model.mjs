// Deterministic 4-billion-year planetary geology & paleohydrology model for Jezero Crater, Mars.
// Grounded in Fassett & Head (2005), Goudge et al. (2015), Mangold et al. (2021 Science),
// Stack et al. (2020/2024), Farley et al. (2022 Science), and Cuevas-Quinones et al. (2025,
// Communications Earth & Environment) on Jezero Mons. Strictly no rover traverse data.

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Geological age in billions of years ago (Ga) across normalized timeline p in [0, 1].
export function jezeroAgeGa(u) {
  const x = clamp(u, 0, 1);
  if (x <= 0.12) return mix(3.92, 3.86, x / 0.12);             // Impact excavation
  if (x <= 0.26) return mix(3.86, 3.76, (x - 0.12) / 0.14);    // Jezero Mons volcanism
  if (x <= 0.40) return mix(3.76, 3.70, (x - 0.26) / 0.14);    // Closed-basin lake & carbonates
  if (x <= 0.54) return mix(3.70, 3.62, (x - 0.40) / 0.14);    // Open-basin highstand & Pliva breach
  if (x <= 0.68) return mix(3.62, 3.52, (x - 0.54) / 0.14);    // Western & Northern delta progradation
  if (x <= 0.80) return mix(3.52, 3.38, (x - 0.68) / 0.12);    // Late-stage flash floods & boulder beds
  if (x <= 0.91) return mix(3.38, 0.45, (x - 0.80) / 0.11);    // Desiccation, wind erosion & Belva impact
  return x >= 1 ? 0 : mix(0.45, 0.0, (x - 0.91) / 0.09);        // Modern hyper-arid Mars
}

// Reconstructs Jezero Crater's volcanic, lacustrine, fluvial, and erosional state at timeline u in [0, 1].
export function jezeroEvolution(u) {
  const x = clamp(u, 0, 1);
  const ageGa = jezeroAgeGa(x);

  // 1. Jezero Mons volcanism on SE rim (peaks during u = 0.14..0.25)
  const volcOn = smooth(0.11, 0.15, x) * (1 - smooth(0.24, 0.29, x));
  const volcPulse = volcOn * (0.78 + 0.22 * Math.sin(x * 165));
  const lavaProgress = smooth(0.12, 0.26, x);

  // 2. Paleolake water surface elevation (MOLA areoid meters):
  //    Dry (-2700 m) -> Closed-basin (-2500 m) -> Open-basin highstand (-2395 m) ->
  //    Fluctuating delta progradation (-2425 m) -> Receding flash floods (-2550 m) -> Dry (-2700 m)
  let lakeMola = -2700;
  if (x >= 0.25 && x <= 0.84) {
    if (x < 0.40) {
      lakeMola = mix(-2670, -2500, smooth(0.26, 0.39, x));
    } else if (x < 0.54) {
      lakeMola = mix(-2500, -2395, smooth(0.40, 0.48, x));
    } else if (x < 0.68) {
      // Documented ~15-40 m lake-level drop & oscillation during Western Fan-Delta topset progradation (Mangold et al. 2021)
      // Keeps the growing Western Fan-Delta topset (-2401..-2455 m) emerging right at lake level!
      const swing = 16 * Math.sin((x - 0.54) / 0.14 * Math.PI * 2.5);
      lakeMola = mix(-2420, -2472, (x - 0.54) / 0.14) + swing;
    } else {
      lakeMola = mix(-2472, -2690, smooth(0.68, 0.83, x));
    }
  }
  const lakeActive = smooth(-2655, -2615, lakeMola);

  // 3. Fluvial discharge rates (0..1) — varies realistically from narrow early/late streams
  //    through strong highstand rivers, fluctuating delta flows, to catastrophic flash-flood surges!
  let inletFlow = 0;
  if (x >= 0.25 && x <= 0.85) {
    if (x < 0.40) {
      inletFlow = mix(0.14, 0.54, smooth(0.25, 0.40, x));
    } else if (x < 0.54) {
      inletFlow = mix(0.54, 0.86, smooth(0.40, 0.50, x));
    } else if (x < 0.68) {
      // Millennial discharge pulses matching documented 15-40 m lake-level swings
      const pulse = 0.22 * Math.sin((x - 0.54) / 0.14 * Math.PI * 2.5);
      inletFlow = clamp(0.62 + pulse, 0.34, 0.86);
    } else if (x < 0.78) {
      inletFlow = mix(0.65, 1.0, smooth(0.68, 0.73, x));
    } else {
      inletFlow = mix(1.0, 0.0, smooth(0.78, 0.85, x));
    }
  }
  const plivaFlow = smooth(-2422, -2398, lakeMola) * smooth(0.42, 0.48, x) * (1 - smooth(0.62, 0.69, x));
  const flashFlood = smooth(0.67, 0.72, x) * (1 - smooth(0.78, 0.83, x));

  // 4. Geomorphic terrain morphing weights:
  //    - deltaProgress: 0 (no western/northern deltas yet) -> 1 (full modern delta topography)
  //    - plivaFill: 1 (intact unbreached eastern rim before highstand) -> 0 (deeply incised Pliva Vallis)
  //    - belvaFill: 1 (pre-impact smooth delta surface) -> 0 (excavated Belva Crater)
  //    - carbonateBand: marginal carbonate shoreline precipitation (persists after closed-basin stage)
  const deltaProgress = smooth(0.32, 0.68, x);
  const plivaFill = 1 - smooth(0.43, 0.53, x);
  const belvaFill = 1 - smooth(0.82, 0.87, x);
  const carbonateBand = smooth(0.28, 0.42, x);
  const windDust = smooth(0.76, 0.85, x) * (1 - 0.55 * smooth(0.91, 0.98, x));

  // 5. Atmosphere wetness: thick pale blue-butterscotch Noachian sky -> dry dusty salmon modern Mars
  const skyWetness = smooth(0.22, 0.36, x) * (1 - smooth(0.68, 0.85, x));

  return {
    u: x,
    ageGa,
    volcOn,
    volcPulse,
    lavaProgress,
    lakeMola,
    lakeActive,
    inletFlow,
    plivaFlow,
    flashFlood,
    deltaProgress,
    plivaFill,
    belvaFill,
    carbonateBand,
    windDust,
    skyWetness,
  };
}

// CPU height morphing matching JEZERO_GLSL (radially prograding fan-deltas, intact Pliva rim, pre-Belva fill).
export function jezeroHeight(dMola, x, z, ev, g) {
  let h = dMola;
  // 1. Radially prograding Western & Northern fan-deltas growing outward from Neretva & Sava breach mouths!
  const prog = clamp(ev.deltaProgress, 0, 1);
  if (prog < 0.999) {
    const rW = Math.hypot(x - (-23100), z - (-8200));
    const frontW = mix(-1400, 9600, prog);
    const unbuiltW = smooth(frontW - 1400, frontW + 1700, rW);
    const dwx = (x - g.wDelta[0]) / 5600, dwz = (z - g.wDelta[1]) / 4900;
    const wMask = Math.exp(-(dwx * dwx + dwz * dwz)) * unbuiltW;

    const rN = Math.hypot(x - (-15200), z - (-18200));
    const frontN = mix(-1000, 7200, prog);
    const unbuiltN = smooth(frontN - 1200, frontN + 1400, rN);
    const dnx = (x - g.nDelta[0]) / 4200, dnz = (z - g.nDelta[1]) / 3600;
    const nMask = Math.exp(-(dnx * dnx + dnz * dnz)) * unbuiltN;

    // Lower unbuilt delta sediment cleanly down toward the ~-2620 m crater floor
    const aboveFloor = smooth(-2615, -2455, h);
    const dropFrac = clamp(Math.max(wMask, nMask), 0, 1);
    h -= aboveFloor * dropFrac * Math.max(0, h - (-2618)) * 0.92;
  }
  // 2. Before Pliva Vallis overtopping, restore the intact eastern crater rim (~+145 m across breach notch)
  if (ev.plivaFill > 0.001) {
    const dpx = (x - g.pliva[0]) / 2600, dpz = (z - g.pliva[1]) / 1800;
    const pMask = Math.exp(-(dpx * dpx + dpz * dpz));
    h += ev.plivaFill * 145 * pMask;
  }
  // 3. Before late Belva Crater impact on western delta, smooth over its ~1 km bowl
  if (ev.belvaFill > 0.001) {
    const db = Math.hypot(x - g.belva[0], z - g.belva[1]);
    if (db < 800) {
      h += ev.belvaFill * 68 * Math.exp(-(db * db) / (460 * 460));
    }
  }
  return h;
}

export const JEZERO_GLSL = /* glsl */`
uniform vec3 uMorph; // x = preDelta (1..0), y = plivaFill (1..0), z = belvaFill (1..0)
uniform vec2 uWDelta, uNDelta, uPliva, uBelva;
float deltaUnbuiltMask(vec2 xz) {
  float prog = clamp(1.0 - uMorph.x, 0.0, 1.0);
  if (prog > 0.999) return 0.0;
  float rW = length(xz - vec2(-23100.0, -8200.0));
  float frontW = mix(-1400.0, 9600.0, prog);
  float unbuiltW = smoothstep(frontW - 1400.0, frontW + 1700.0, rW);
  vec2 dw = (xz - uWDelta) / vec2(5600.0, 4900.0);
  float wMask = exp(-dot(dw, dw)) * unbuiltW;

  float rN = length(xz - vec2(-15200.0, -18200.0));
  float frontN = mix(-1000.0, 7200.0, prog);
  float unbuiltN = smoothstep(frontN - 1200.0, frontN + 1400.0, rN);
  vec2 dn = (xz - uNDelta) / vec2(4200.0, 3600.0);
  float nMask = exp(-dot(dn, dn)) * unbuiltN;
  return clamp(max(wMask, nMask), 0.0, 1.0);
}
float jezeroH(float dMola, vec2 xz) {
  float h = dMola;
  if (uMorph.x > 0.001) {
    float dropFrac = deltaUnbuiltMask(xz);
    float aboveFloor = smoothstep(-2615.0, -2455.0, h);
    h -= aboveFloor * dropFrac * max(0.0, h - (-2618.0)) * 0.92;
  }
  if (uMorph.y > 0.001) {
    vec2 dp = (xz - uPliva) / vec2(2600.0, 1800.0);
    h += uMorph.y * 145.0 * exp(-dot(dp, dp));
  }
  if (uMorph.z > 0.001) {
    vec2 db = (xz - uBelva) / 460.0;
    h += uMorph.z * 68.0 * exp(-dot(db, db));
  }
  return h;
}
`;

// Trace steepest-descent channels across the real 20 m NASA CTX DEM for:
//  - Jezero Mons basaltic lava flows (NW flank onto SE Jezero floor)
//  - Neretva Vallis (west inlet -> Western Delta -> crater floor)
//  - Sava Vallis (north inlet -> Northern Delta -> crater floor)
//  - Pliva Vallis (eastern rim spillway -> Isidis Planitia)
function tracePath(terrain, x0, z0, vx0, vz0, steps, stepLen, stopFn, half = 38000) {
  let x = x0, z = z0, vx = vx0, vz = vz0;
  const pts = [];
  let s = 0;
  for (let k = 0; k < steps; k++) {
    const h = terrain(x, z);
    pts.push({ x, z, h, s });
    if (stopFn && stopFn(x, z, h, k)) break;
    if (Math.abs(x) > half || Math.abs(z) > half) break;
    const e = 140;
    const gx = (terrain(x + e, z) - terrain(x - e, z)) / (2 * e);
    const gz = (terrain(x, z + e) - terrain(x, z - e)) / (2 * e);
    const gm = Math.hypot(gx, gz);
    if (gm > 1e-4) {
      vx = vx * 0.42 - (gx / gm) * 0.58;
      vz = vz * 0.42 - (gz / gm) * 0.58;
    }
    const vm = Math.hypot(vx, vz) || 1;
    vx /= vm;
    vz /= vm;
    x += vx * stepLen;
    z += vz * stepLen;
    s += stepLen;
  }
  return { points: pts, length: s };
}

const COLORS = {
  ash: [0.24, 0.21, 0.20],
  warmAsh: [0.36, 0.27, 0.22],
  marsDust: [0.76, 0.50, 0.34],
  mist: [0.76, 0.86, 0.94],
};

export function createJezeroSim(g, terrain) {
  const R = random(20250519); // Cuevas-Quinones Jezero Mons seed
  const jmX = g.jezeroMons[0], jmZ = g.jezeroMons[1];
  const jmY = terrain(jmX, jmZ);

  // 1. Trace Jezero Mons volcanic lava flow paths descending NW/W toward Jezero's SE crater floor
  const lavaPaths = [
    tracePath(terrain, jmX - 1600, jmZ - 1400, -0.82, -0.57, 95, 220, (x, z, h, k) => k > 15 && h < -2610),
    tracePath(terrain, jmX - 2200, jmZ - 400, -0.92, -0.38, 95, 220, (x, z, h, k) => k > 15 && h < -2610),
    tracePath(terrain, jmX - 900, jmZ - 2100, -0.68, -0.73, 85, 220, (x, z, h, k) => k > 15 && h < -2610),
    tracePath(terrain, jmX + 1200, jmZ - 1400, 0.55, -0.83, 65, 220, (x, z, h, k) => k > 15 && h < -2650),
  ];

  // 2. Ancient Martian river channels: use exact DEM-traced canyon thalwegs when provided, else steepest descent
  const toPath = (arr) => ({
    points: arr.map(([x, z, h], idx) => ({ x, z, h: h ?? terrain(x, z), s: idx * 300 })),
    length: arr.length * 300,
  });
  const neretvaMain = g.canyons?.neretva?.length
    ? toPath(g.canyons.neretva)
    : tracePath(terrain, g.neretva[0] - 8500, g.neretva[1] - 1200, 0.94, 0.25, 110, 220, (x, z, h, k) => k > 30 && h < -2615);
  // Distributary fan channels branching across the Western Delta from Neretva's canyon mouth
  const nm = neretvaMain.points[neretvaMain.points.length - 1] || { x: g.neretva[0], z: g.neretva[1] };
  const wDeltaNorth = tracePath(
    terrain, nm.x, nm.z, 0.90, -0.42, 42, 180,
    (x, z, h, k) => k > 10 && h < -2605,
  );
  const wDeltaMid = tracePath(
    terrain, nm.x, nm.z, 0.96, 0.14, 46, 180,
    (x, z, h, k) => k > 10 && h < -2610,
  );
  const wDeltaSouth = tracePath(
    terrain, nm.x, nm.z, 0.72, 0.69, 44, 180,
    (x, z, h, k) => k > 10 && h < -2605,
  );
  const savaMain = g.canyons?.sava?.length
    ? toPath(g.canyons.sava)
    : tracePath(terrain, g.sava[0] - 1200, g.sava[1] - 12000, 0.18, 0.98, 95, 220, (x, z, h, k) => k > 25 && h < -2610);
  const plivaOut = g.canyons?.pliva?.length
    ? toPath(g.canyons.pliva)
    : tracePath(terrain, g.pliva[0] - 1800, g.pliva[1] + 200, 0.96, -0.26, 95, 220, (x, z, h, k) => k > 35 && x > 36500);

  // Pre-build Jezero Mons volcanic plume & fountain clots (Stage 2)
  const volcClots = Array.from({ length: 240 }, (_, i) => {
    const a = R() * Math.PI * 2;
    const el = i < 120 ? (1.28 + R() * 0.26) : (0.75 + R() * 0.55);
    const v = i < 120 ? (75 + R() * 48) : (55 + R() * 52);
    const period = 9 + R() * 7;
    return {
      x: jmX + (R() - 0.5) * 320,
      y: jmY + 30,
      z: jmZ + (R() - 0.5) * 320,
      vx: Math.cos(a) * Math.cos(el) * v,
      vy: Math.sin(el) * v,
      vz: Math.sin(a) * Math.cos(el) * v,
      period,
      phase: R() * period,
      size: i < 120 ? (110 + R() * 85) : (75 + R() * 70),
    };
  });

  const dustDevils = Array.from({ length: 160 }, (_, i) => ({
    x0: -26000 + R() * 52000,
    z0: -26000 + R() * 52000,
    speed: 140 + R() * 220,
    size: 420 + R() * 780,
    seed: R() * 6.283,
    phase: R() * 60,
  }));

  function sample(u, surface = terrain) {
    const ev = jezeroEvolution(u);
    const smoke = [];
    const glow = [];
    const flowDeposits = [];
    const ashDeposits = [];
    const simT = u * 2400; // smooth animation phase for scrubbing & playback

    // A. Stage 2: Jezero Mons Volcanic Eruption (SE rim composite volcano)
    if (ev.volcOn > 0.02) {
      // Cohesive buoyant ash column rising from Jezero Mons caldera, drifting NW over Jezero basin
      const nPlume = 260;
      for (let i = 0; i < nPlume; i++) {
        const period = 52 + (i % 9) * 3.5;
        const age = (((simT + i * 1.93) % period) + period) % period;
        const f = age / period;
        const a = i * 2.39996 + simT * 0.02;
        const spread = 200 + Math.pow(f, 1.15) * 2050;
        const rise = 100 + Math.pow(f, 0.88) * 7600 * (0.55 + 0.45 * ev.volcOn);
        const x = jmX - Math.pow(f, 1.2) * 7800 + Math.cos(a) * spread;
        const z = jmZ - Math.pow(f, 1.2) * 3900 + Math.sin(a) * spread;
        const fade = smooth(0, 0.06, f) * (1 - smooth(0.65, 1.0, f));
        const heat = ev.volcPulse * Math.exp(-f * 3.2) * 1.18;
        smoke.push({
          kind: 0,
          x,
          y: jmY + rise,
          z,
          size: (720 + f * 2650) * (0.68 + 0.32 * ev.volcOn),
          alpha: 0.54 * ev.volcOn * fade,
          color: i % 2 === 0 ? COLORS.warmAsh : COLORS.ash,
          age,
          life: period,
          heat,
          seed: a,
          gy: jmY,
        });
      }

      // Incandescent volcanic bombs & fire fountain at Jezero Mons summit vent
      const nClots = Math.floor(volcClots.length * ev.volcOn);
      for (let i = 0; i < nClots; i++) {
        const fc = volcClots[i];
        const age = (((simT + fc.phase) % fc.period) + fc.period) % fc.period;
        const tf = age * 0.95;
        // Martian gravity g = 3.72 m/s^2! Ballistic arcs soar 2.6x higher than on Earth!
        const y = fc.y + fc.vy * tf - 0.5 * 3.72 * tf * tf;
        if (y < jmY - 250) continue;
        glow.push({
          x: fc.x + fc.vx * tf,
          y,
          z: fc.z + fc.vz * tf,
          vx: fc.vx,
          vy: fc.vy - 3.72 * tf,
          vz: fc.vz,
          size: fc.size * (0.7 + 0.35 * ev.volcPulse),
          temp: clamp((1.08 * ev.volcPulse) * Math.exp(-tf / 16), 0.2, 1.15),
        });
      }
    }

    // Jezero Mons basaltic lava flow deposits (mode 1 = molten/cooling lava during u in [0.12..0.28])
    if (u >= 0.12 && u < 0.28) {
      const prog = smooth(0.12, 0.25, u);
      const cool = 1 - smooth(0.23, 0.28, u);
      for (const path of lavaPaths) {
        const nMax = Math.floor(path.points.length * prog);
        for (let j = 0; j < nMax; j++) {
          const pt = path.points[j];
          const df = j / Math.max(1, path.points.length);
          flowDeposits.push({
            x: pt.x,
            z: pt.z,
            radius: 340 + 380 * df,
            amount: 24,
            heat: clamp((1.0 - 0.48 * df) * cool, 0.08, 1.0),
          });
        }
      }
    }

    // B. Stages 3–6: Active Martian Rivers & Paleolake are modeled physically on the GPU/CPU
    //    via the CTX DEM open-channel hydraulic depth field (hydro1024.png) — zero blob stamps,
    //    zero artificial smoke/mist puffs in Pliva or Neretva canyons.

    // C. Stages 7–8: Amazonian Wind Erosion & Drifting Martian Dust Plumes
    if (ev.windDust > 0.04) {
      const nDust = Math.floor(dustDevils.length * clamp(ev.windDust * 1.1, 0.25, 1));
      for (let i = 0; i < nDust; i++) {
        const dd = dustDevils[i];
        const age = (((simT * 0.4 + dd.phase) % 60) + 60) % 60;
        const f = age / 60;
        const x = ((dd.x0 + f * dd.speed * 40 + 36000) % 72000) - 36000;
        const z = ((dd.z0 + f * dd.speed * 18 + 36000) % 72000) - 36000;
        const gy = surface(x, z);
        const fade = smooth(0, 0.15, f) * (1 - smooth(0.65, 1.0, f));
        smoke.push({
          kind: 3,
          x,
          y: gy + 160 + f * 950,
          z,
          size: dd.size * (0.7 + 0.5 * f),
          alpha: 0.22 * ev.windDust * fade,
          color: COLORS.marsDust,
          age,
          life: 60,
          heat: 0,
          seed: dd.seed,
          gy,
        });
      }
    }

    return {
      smoke,
      glow,
      flowDeposits,
      ashDeposits,
      evolution: ev,
      depMode: 1, // tDep is dedicated strictly to Stage 2 Jezero Mons volcanic lava flows
    };
  }

  return { lavaPaths, riverPaths: [neretvaMain, wDeltaNorth, wDeltaMid, wDeltaSouth, savaMain, plivaOut], sample };
}
