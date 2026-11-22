import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jezeroAgeGa, jezeroEvolution, jezeroHeight, JEZERO_GLSL, createJezeroSim } from '../jezero-model.mjs';
import { clipmapCenter } from '../terrain-lod.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/meta.json'), 'utf8'));

test('jezeroAgeGa decreases monotonically from ~3.92 Ga to 0.0 Ga', () => {
  let prev = jezeroAgeGa(0);
  assert.ok(prev > 3.85 && prev < 4.0);
  for (let i = 1; i <= 100; i++) {
    const cur = jezeroAgeGa(i / 100);
    assert.ok(cur <= prev + 1e-9, `Age increased at u=${i / 100}: ${cur} > ${prev}`);
    prev = cur;
  }
  assert.equal(jezeroAgeGa(1), 0);
});

test('jezeroEvolution models volcanism, closed lake, open-basin highstand, deltas, and modern Mars accurately', () => {
  const impact = jezeroEvolution(0.05);
  assert.equal(impact.lakeActive, 0);
  assert.equal(impact.volcOn, 0);
  assert.equal(impact.plivaFill, 1);

  const volc = jezeroEvolution(0.19);
  assert.ok(volc.volcOn > 0.8, `Expected Jezero Mons active volcanism, got ${volc.volcOn}`);
  assert.equal(volc.lakeActive, 0);

  const closed = jezeroEvolution(0.36);
  assert.ok(closed.lakeActive > 0.9);
  assert.ok(closed.lakeMola < -2480 && closed.lakeMola > -2560, `Closed lake expected ~-2500 m, got ${closed.lakeMola}`);
  assert.equal(closed.plivaFlow, 0);

  const high = jezeroEvolution(0.49);
  assert.ok(high.lakeActive > 0.99);
  assert.ok(Math.abs(high.lakeMola - (-2395)) < 2, `Highstand expected -2395 m MOLA, got ${high.lakeMola}`);
  assert.ok(high.plivaFlow > 0.8, `Expected active Pliva spillway breach flow, got ${high.plivaFlow}`);

  const modern = jezeroEvolution(0.98);
  assert.equal(modern.lakeActive, 0);
  assert.equal(modern.deltaProgress, 1);
  assert.equal(modern.plivaFill, 0);
  assert.equal(modern.belvaFill, 0);
});

test('jezeroHeight morphs pre-delta depression, intact Pliva rim, and pre-Belva surface smoothly', () => {
  const g = {
    wDelta: meta.features.westernDelta,
    nDelta: meta.features.northernDelta,
    pliva: meta.features.plivaBreach,
    belva: meta.features.belvaCrater,
  };
  const evEarly = jezeroEvolution(0.05);
  const evModern = jezeroEvolution(0.98);

  // Western delta should be ~80+ m lower before delta progradation
  const hDeltaEarly = jezeroHeight(-2485, g.wDelta[0], g.wDelta[1], evEarly, g);
  const hDeltaModern = jezeroHeight(-2485, g.wDelta[0], g.wDelta[1], evModern, g);
  assert.ok(hDeltaModern - hDeltaEarly > 60, `Expected pre-delta lowering, diff=${hDeltaModern - hDeltaEarly}`);

  // Pliva breach rim should be restored (~+145 m) before overtopping
  const hPlivaEarly = jezeroHeight(-2450, g.pliva[0], g.pliva[1], evEarly, g);
  const hPlivaModern = jezeroHeight(-2450, g.pliva[0], g.pliva[1], evModern, g);
  assert.ok(hPlivaEarly - hPlivaModern > 120, `Expected unbreached Pliva rim restoration, diff=${hPlivaEarly - hPlivaModern}`);

  // Belva crater filled after delta progradation (u=0.75) before late impact (u=0.98)
  const evPreBelva = jezeroEvolution(0.75);
  const hBelvaBefore = jezeroHeight(-2550, g.belva[0], g.belva[1], evPreBelva, g);
  const hBelvaModern = jezeroHeight(-2550, g.belva[0], g.belva[1], evModern, g);
  assert.ok(hBelvaBefore - hBelvaModern > 50, `Expected pre-Belva fill, diff=${hBelvaBefore - hBelvaModern}`);

  assert.match(JEZERO_GLSL, /float jezeroH\(/);
});

test('createJezeroSim produces finite volcanic lava flows, ballistic bombs, river deposits, and dust plumes', () => {
  const g = {
    craterCenter: meta.features.craterCenter,
    jezeroMons: meta.features.jezeroMons,
    wDelta: meta.features.westernDelta,
    nDelta: meta.features.northernDelta,
    neretva: meta.features.neretvaMouth,
    sava: meta.features.savaMouth,
    pliva: meta.features.plivaBreach,
    belva: meta.features.belvaCrater,
    canyons: meta.canyons,
  };
  // Simple smooth bowl + SE volcano surrogate terrain
  const terrain = (x, z) => {
    const dc = Math.hypot(x - g.craterCenter[0], z - g.craterCenter[1]);
    const dm = Math.hypot(x - g.jezeroMons[0], z - g.jezeroMons[1]);
    return -2640 + Math.min(700, (dc / 22000) ** 2 * 500) + 1800 * Math.exp(-(dm * dm) / (8000 * 8000));
  };
  const sim = createJezeroSim(g, terrain);
  assert.equal(sim.lavaPaths.length, 4);
  assert.equal(sim.riverPaths.length, 6);

  const sVolc = sim.sample(0.19);
  assert.equal(sVolc.depMode, 1);
  assert.ok(sVolc.smoke.length > 100);
  assert.ok(sVolc.glow.length > 50);
  assert.ok(sVolc.flowDeposits.length > 50);
  for (const p of [...sVolc.smoke, ...sVolc.glow]) {
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
  }

  const sHigh = sim.sample(0.49);
  assert.equal(sHigh.depMode, 1);
  assert.equal(sHigh.flowDeposits.length, 0, 'Rivers must use physical CTX DEM hydro1024.png, not painted lava deposits');
  assert.equal(sHigh.smoke.length, 0, 'Pliva Vallis and rivers must emit zero random smoke puffs');
  assert.ok(fs.statSync(path.join(root, 'data/hydro1024.png')).size > 10000, 'Expected physical hydro1024.png hydrology map');
  assert.ok(fs.statSync(path.join(root, 'data/flow1024.png')).size > 10000, 'Expected physical flow1024.png 2D flow-vector map');

  const sMod = sim.sample(0.96);
  assert.equal(sMod.flowDeposits.length, 0);
  assert.ok(sMod.smoke.length > 20, 'Expected Amazonian dust plumes');
});

test('data/meta.json & index.html contain strictly geological features and zero Perseverance rover data', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const metaStr = JSON.stringify(meta);
  assert.doesNotMatch(html, /perseverance|ingenuity|octavia|traverse|landing ellipse/i);
  assert.doesNotMatch(metaStr, /perseverance|ingenuity|octavia|traverse|landing ellipse/i);
  assert.ok(meta.canyons.neretva.length > 20);
  assert.ok(meta.canyons.sava.length > 20);
  assert.ok(meta.canyons.pliva.length > 20);
});

test('clipmapCenter snaps cleanly', () => {
  const c = clipmapCenter(1234, -5678, 16, false);
  assert.equal(Math.abs(c.x % 32), 0);
  assert.equal(Math.abs(c.z % 32), 0);
});
