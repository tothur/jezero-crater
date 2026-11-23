import * as THREE from 'three';

export const DOCK_W = 1600;
export const DOCK_H = 330;
const DESK_SCALE = 0.65;
const MODEL_WIDTH = 0.65;
export const DRAWER_W = 1360;
export const DRAWER_H = 420;

// Backwards-compatible alias for layout width/height constants
export const PANEL_W = DOCK_W;
export const PANEL_H = DOCK_H;

export const STAGE_PILLS = [
  { id: 'impact', label: 'Impact Basin', sub: '3.90 Ga', anchor: 0.05, c: '#7a6354', c2: '#8c7260' },
  { id: 'volcanism', label: 'Jezero Mons', sub: '3.82 Ga', anchor: 0.19, c: '#df5c28', c2: '#f27834' },
  { id: 'closed_lake', label: 'Closed Lake', sub: '3.74 Ga', anchor: 0.33, c: '#3d8da6', c2: '#4fa3bd' },
  { id: 'highstand', label: 'Highstand', sub: '3.66 Ga', anchor: 0.47, c: '#2678b8', c2: '#3d95d6' },
  { id: 'deltas', label: 'Fan-Deltas', sub: '3.58 Ga', anchor: 0.60, c: '#3a98a8', c2: '#56b2c2' },
  { id: 'flash_floods', label: 'Flash Floods', sub: '3.45 Ga', anchor: 0.74, c: '#5c8a96', c2: '#7a9ca6' },
  { id: 'desiccation', label: 'Desiccation', sub: '2.0 Ga', anchor: 0.86, c: '#a66d4a', c2: '#b87c56' },
  { id: 'modern', label: 'Modern Mars', sub: 'Today', anchor: 0.96, c: '#b85c38', c2: '#cc6e46' },
];

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export const DOCK_LAYOUT = [
  { id: 'playPause', kind: 'button', x0: 28, y0: 56, x1: 166, y1: 220 },
  { id: 'prevStage', kind: 'button', x0: 194, y0: 57, x1: 280, y1: 147 },
  { id: 'nextStage', kind: 'button', x0: 858, y0: 57, x1: 944, y1: 147 },
  { id: 'timeline', kind: 'slider', x0: 194, y0: 156, x1: 944, y1: 239, tx0: 213, tx1: 925 },
  { id: 'drawerStages', kind: 'button', x0: 974, y0: 56, x1: 1132, y1: 220 },
  { id: 'drawerView', kind: 'button', x0: 1140, y0: 56, x1: 1287, y1: 220 },
  { id: 'placeAgain', kind: 'button', x0: 1295, y0: 56, x1: 1441, y1: 220 },
  { id: 'exitVR', kind: 'button', x0: 1449, y0: 56, x1: 1572, y1: 220 },
];

export const DRAWER_STAGES_LAYOUT = (() => {
  const rects = [
    { id: 'speed05', kind: 'button', x0: 560, y0: 28, x1: 648, y1: 96 },
    { id: 'speed1', kind: 'button', x0: 656, y0: 28, x1: 744, y1: 96 },
    { id: 'speed2', kind: 'button', x0: 752, y0: 28, x1: 840, y1: 96 },
    { id: 'speed4', kind: 'button', x0: 848, y0: 28, x1: 936, y1: 96 },
    { id: 'watchEruption', kind: 'button', x0: 968, y0: 26, x1: 1320, y1: 98 },
  ];
  const cols = 4;
  const xStart = 40;
  const xEnd = 1320;
  const gapX = 18;
  const cellW = (xEnd - xStart - gapX * (cols - 1)) / cols;
  for (let i = 0; i < STAGE_PILLS.length; i++) {
    const col = i % cols;
    const row = (i / cols) | 0;
    const x0 = xStart + col * (cellW + gapX);
    const y0 = row === 0 ? 120 : 264;
    rects.push({
      id: `stage:${STAGE_PILLS[i].id}`,
      kind: 'button',
      stageIndex: i,
      x0,
      y0,
      x1: x0 + cellW,
      y1: y0 + 124,
    });
  }
  return rects;
})();

export const DRAWER_VIEW_LAYOUT = [
  // Row 1: Size
  { id: 'scaleSlider', kind: 'slider', x0: 210, y0: 34, x1: 874, y1: 112, tx0: 228, tx1: 856 },
  { id: 'scale05', kind: 'button', x0: 896, y0: 38, x1: 1026, y1: 108 },
  { id: 'scale10', kind: 'button', x0: 1038, y0: 38, x1: 1168, y1: 108 },
  { id: 'scale20', kind: 'button', x0: 1180, y0: 38, x1: 1320, y1: 108 },
  // Row 2: Rotation
  { id: 'rotSlider', kind: 'slider', x0: 210, y0: 132, x1: 1132, y1: 210, tx0: 228, tx1: 1114 },
  { id: 'rotNorth', kind: 'button', x0: 1154, y0: 136, x1: 1320, y1: 206 },
  // Row 3: Exaggeration
  { id: 'exagSlider', kind: 'slider', x0: 210, y0: 230, x1: 794, y1: 308, tx0: 228, tx1: 776 },
  { id: 'exag1', kind: 'button', x0: 816, y0: 234, x1: 930, y1: 304 },
  { id: 'exag15', kind: 'button', x0: 942, y0: 234, x1: 1056, y1: 304 },
  { id: 'exag2', kind: 'button', x0: 1068, y0: 234, x1: 1182, y1: 304 },
  { id: 'exag3', kind: 'button', x0: 1194, y0: 234, x1: 1320, y1: 304 },
  // Row 4: Light & Overlays
  { id: 'lightDay', kind: 'button', x0: 40, y0: 330, x1: 204, y1: 396 },
  { id: 'lightDusk', kind: 'button', x0: 216, y0: 330, x1: 380, y1: 396 },
  { id: 'lightNight', kind: 'button', x0: 392, y0: 330, x1: 556, y1: 396 },
  { id: 'toggleGhost', kind: 'button', x0: 580, y0: 330, x1: 1040, y1: 396 },
  { id: 'resetView', kind: 'button', x0: 1064, y0: 330, x1: 1320, y1: 396 },
];

export const PANEL_LAYOUT = DOCK_LAYOUT;

// Standard 25-joint WebXR Hand Input topology for depth-buffer hand occlusion in passthrough MR.
export const HAND_JOINTS = [
  'wrist',
  'thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip',
  'index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip',
  'middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip',
  'ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip',
  'pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip',
];

export const HAND_BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8], [8, 9],
  [0, 10], [10, 11], [11, 12], [12, 13], [13, 14],
  [0, 15], [15, 16], [16, 17], [17, 18], [18, 19],
  [0, 20], [20, 21], [21, 22], [22, 23], [23, 24],
  // Knuckle & thumb-web cross-bridges to seal finger bases cleanly
  [6, 11], [11, 16], [16, 21], [2, 6], [1, 6],
];

const PALM_RING = [0, 1, 2, 6, 11, 16, 21, 20];
const HAND_DEFAULT_RADII = [
  0.024,
  0.014, 0.012, 0.010, 0.0085,
  0.013, 0.0105, 0.0088, 0.0078, 0.0068,
  0.013, 0.0108, 0.0090, 0.0080, 0.0070,
  0.012, 0.0100, 0.0085, 0.0075, 0.0066,
  0.011, 0.0090, 0.0076, 0.0068, 0.0060,
];

export function createPalmOccluderGeometry() {
  const n = PALM_RING.length;
  const pos = new Float32Array((n + 1) * 2 * 3);
  const idx = [];
  const botOff = n + 1;
  for (let k = 0; k < n; k++) {
    const a = 1 + k;
    const b = 1 + ((k + 1) % n);
    idx.push(0, a, b);
    idx.push(botOff, botOff + b, botOff + a);
    idx.push(a, botOff + a, b, b, botOff + a, botOff + b);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geom.setIndex(idx);
  return geom;
}

// WebXR exposes the hit surface normal as the Y column of its pose matrix.
export function isDeskSurface(matrix) {
  return matrix?.[5] >= Math.cos(Math.PI / 9);
}

// Map the starting hand midpoint to the current midpoint in the plane of the
// desk. Use the clamped scale in the position transform to retain the pivot
// even when the hands keep spreading past the zoom limit.
export function applyDeskGesture(holder, start, midpoint, distance, angle) {
  const scale = clamp(start.scale * distance / start.distance, 0.25, 3.5);
  const ratio = scale / start.scale;
  const turn = angle - start.angle;
  const dx = (start.position.x - start.mid.x) * ratio;
  const dz = (start.position.z - start.mid.z) * ratio;
  holder.position.set(midpoint.x + dx * Math.cos(turn) + dz * Math.sin(turn), start.position.y,
    midpoint.z - dx * Math.sin(turn) + dz * Math.cos(turn));
  holder.scale.setScalar(scale);
  holder.rotation.y = start.yaw + turn;
}

export function hitTestSurface(layout, width, height, u, v) {
  if (!Number.isFinite(u) || !Number.isFinite(v) || u < 0 || u > 1 || v < 0 || v > 1) return null;
  const px = u * width;
  const py = (1 - v) * height;
  for (const r of layout) {
    if (px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1) {
      const t = r.kind === 'slider' ? clamp((px - r.tx0) / Math.max(1, r.tx1 - r.tx0), 0, 1) : 0;
      return { id: r.id, kind: r.kind, t, rect: r };
    }
  }
  return null;
}

export function hitTestPanel(u, v) {
  return hitTestSurface(DOCK_LAYOUT, DOCK_W, DOCK_H, u, v);
}

/**
 * Build a summit-focused nonlinear high-resolution terrain grid.
 * Uses cubic coordinate warping so the central summit dome, crater and breach notch
 * receive ~23 m vertex spacing at 192x192 while keeping Quest 3 vertex load fast.
 */
export function buildTabletopTerrainGeometry(cx, cz, span = 78000, N = 224) {
  const G = N + 1;
  const count = G * G;
  const xs = new Float32Array(G);
  const zs = new Float32Array(G);
  const half = span * 0.5;
  // Balanced basin warp so the 45 km crater rim, Neretva/Pliva canyons, Western Delta & Jezero Mons
  // all receive crisp 3D vertex resolution across the full 78 km tabletop
  const warp = u => u * (0.78 + 0.22 * u * u);

  for (let i = 0; i <= N; i++) {
    const u = (i / N) * 2 - 1;
    const w = warp(u) * half;
    xs[i] = cx + w;
    zs[i] = cz + w;
  }

  const pos = new Float32Array(count * 3);
  const nrm = new Float32Array(count * 3);
  const steps = new Float32Array(count);

  for (let j = 0; j < G; j++) {
    const dz = j === 0 ? zs[1] - zs[0] : j === N ? zs[N] - zs[N - 1] : 0.5 * (zs[j + 1] - zs[j - 1]);
    for (let i = 0; i < G; i++) {
      const dx = i === 0 ? xs[1] - xs[0] : i === N ? xs[N] - xs[N - 1] : 0.5 * (xs[i + 1] - xs[i - 1]);
      const idx = j * G + i;
      pos[idx * 3] = xs[i];
      pos[idx * 3 + 1] = 0;
      pos[idx * 3 + 2] = zs[j];
      nrm[idx * 3 + 1] = 1;
      steps[idx] = Math.max(dx, dz);
    }
  }

  const indices = new Uint32Array(N * N * 6);
  let k = 0;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = j * G + i;
      indices[k++] = a;
      indices[k++] = a + G;
      indices[k++] = a + 1;
      indices[k++] = a + 1;
      indices[k++] = a + G;
      indices[k++] = a + G + 1;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  geometry.setAttribute('aStep', new THREE.BufferAttribute(steps, 1));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return geometry;
}

function createRoundedPanelGeometry(w, h, r, curveSeg = 14) {
  const hw = w * 0.5;
  const hh = h * 0.5;
  const rad = Math.min(r, hw, hh);
  const s = new THREE.Shape();
  s.moveTo(-hw + rad, -hh);
  s.lineTo(hw - rad, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + rad);
  s.lineTo(hw, hh - rad);
  s.quadraticCurveTo(hw, hh, hw - rad, hh);
  s.lineTo(-hw + rad, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - rad);
  s.lineTo(-hw, -hh + rad);
  s.quadraticCurveTo(-hw, -hh, -hw + rad, -hh);

  const g = new THREE.ShapeGeometry(s, curveSeg);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  }
  uv.needsUpdate = true;
  return g;
}

function createRoundedBorderGeometry(w, h, r, curveSeg = 14) {
  const hw = w * 0.5;
  const hh = h * 0.5;
  const rad = Math.min(r, hw, hh);
  const s = new THREE.Shape();
  s.moveTo(-hw + rad, -hh);
  s.lineTo(hw - rad, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + rad);
  s.lineTo(hw, hh - rad);
  s.quadraticCurveTo(hw, hh, hw - rad, hh);
  s.lineTo(-hw + rad, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - rad);
  s.lineTo(-hw, -hh + rad);
  s.quadraticCurveTo(-hw, -hh, -hw + rad, -hh);
  const pts = s.getPoints(curveSeg * 4);
  return new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y, 0)));
}

function buildTabletopSkirtGeometry(cx, cz, span = 16000, nE = 128) {
  const half = span * 0.5;
  const pos = [];
  const nrm = [];
  const top = [];
  const idx = [];
  const edges = [
    [k => [cx - half + k * span / nE, cz - half], [0, 0, -1]],
    [k => [cx - half + k * span / nE, cz + half], [0, 0, 1]],
    [k => [cx - half, cz - half + k * span / nE], [-1, 0, 0]],
    [k => [cx + half, cz - half + k * span / nE], [1, 0, 0]],
  ];
  for (const [f, nn] of edges) {
    const b = pos.length / 3;
    for (let k = 0; k <= nE; k++) {
      const [x, z] = f(k);
      pos.push(x, 0, z, x, 0, z);
      nrm.push(...nn, ...nn);
      top.push(1, 0);
    }
    for (let k = 0; k < nE; k++) {
      const a = b + k * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('aTop', new THREE.Float32BufferAttribute(top, 1));
  g.setIndex(idx);
  return g;
}

function buildGhostGeometry(D, ND, SIZE, cx, cz, span = 16000, N = 72, datumZero = 0) {
  const g = new THREE.PlaneGeometry(span, span, N, N).rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const halfSize = SIZE * 0.5;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx;
    const z = pos.getZ(i) + cz;
    const fx = clamp((x + halfSize) / SIZE, 0, 1) * (ND - 1);
    const fz = clamp((z + halfSize) / SIZE, 0, 1) * (ND - 1);
    const x0 = Math.min(fx | 0, ND - 2);
    const z0 = Math.min(fz | 0, ND - 2);
    const u = fx - x0;
    const v = fz - z0;
    const idx = z0 * ND + x0;
    const h = (D[idx] * (1 - u) + D[idx + 1] * u) * (1 - v) + (D[idx + ND] * (1 - u) + D[idx + ND + 1] * u) * v;
    pos.setXYZ(i, x, h - datumZero + 12, z);
  }
  pos.needsUpdate = true;
  return g;
}

const TURNTABLE_R_INNER = 0.514;
const TURNTABLE_R_OUTER = 0.562;
const TURNTABLE_R_MID = (TURNTABLE_R_INNER + TURNTABLE_R_OUTER) * 0.5;

function createTurntableTexture() {
  const S = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  const cx = S / 2;
  const cy = S / 2;
  ctx.clearRect(0, 0, S, S);

  const rIn = S * 0.5 * (TURNTABLE_R_INNER / TURNTABLE_R_OUTER);
  const rOut = S * 0.499;
  const rMid = (rIn + rOut) * 0.5;

  // Smoked obsidian architectural dial ring
  const bg = ctx.createRadialGradient(cx, cy, rIn, cx, cy, rOut);
  bg.addColorStop(0.0, 'rgba(22, 26, 34, 0.80)');
  bg.addColorStop(0.55, 'rgba(14, 17, 23, 0.74)');
  bg.addColorStop(1.0, 'rgba(10, 12, 17, 0.84)');
  ctx.beginPath();
  ctx.arc(cx, cy, rOut, 0, Math.PI * 2);
  ctx.arc(cx, cy, rIn, 0, Math.PI * 2, true);
  ctx.fillStyle = bg;
  ctx.fill();

  // Inner and outer frosted specular hairlines
  ctx.beginPath();
  ctx.arc(cx, cy, rOut - 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, rIn + 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Four brushed pearl rotation grip arcs at intercardinal diagonals
  ctx.lineCap = 'round';
  for (const deg of [45, 135, 225, 315]) {
    const a0 = (deg - 90 - 7.5) * Math.PI / 180;
    const a1 = (deg - 90 + 7.5) * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(cx, cy, rOut - 5.5, a0, a1);
    ctx.strokeStyle = 'rgba(235, 242, 252, 0.52)';
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }

  // Precision vernier compass graduations (skip narrow windows around cardinal labels)
  ctx.lineCap = 'butt';
  for (let deg = 0; deg < 360; deg += 3) {
    const distCardinal = Math.min(deg % 90, 90 - (deg % 90));
    if (distCardinal < 4 && deg % 90 !== 0) continue;
    if (deg % 90 === 0) continue;
    const rad = (deg - 90) * Math.PI / 180;
    const is45 = deg % 45 === 0;
    const is15 = deg % 15 === 0;
    const r0 = is45 ? rIn + 4 : is15 ? rIn + 8 : rIn + 14;
    const r1 = is45 ? rMid + 6 : is15 ? rMid + 3 : rMid;
    ctx.strokeStyle = is45
      ? 'rgba(242, 247, 255, 0.72)'
      : is15
        ? 'rgba(220, 230, 244, 0.42)'
        : 'rgba(200, 212, 228, 0.18)';
    ctx.lineWidth = is45 ? 3 : is15 ? 2 : 1.3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * r0, cy + Math.sin(rad) * r0);
    ctx.lineTo(cx + Math.cos(rad) * r1, cy + Math.sin(rad) * r1);
    ctx.stroke();
  }

  // Luminous volcanic-ember North pointer chevron at 0°
  ctx.save();
  ctx.translate(cx, cy - rIn - 4.5);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(7, 2);
  ctx.lineTo(-7, 2);
  ctx.closePath();
  ctx.fillStyle = '#ff934a';
  ctx.fill();
  ctx.restore();

  // Crisp cardinal compass markers
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [deg, lbl, col, offset] of [
    [0, 'N', '#ff9e59', 6.5],
    [90, 'E', 'rgba(240, 245, 252, 0.90)', 0],
    [180, 'S', 'rgba(240, 245, 252, 0.90)', 0],
    [270, 'W', 'rgba(240, 245, 252, 0.90)', 0],
  ]) {
    const rad = (deg - 90) * Math.PI / 180;
    const r = rMid + offset;
    ctx.save();
    ctx.translate(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
    ctx.rotate(rad + Math.PI / 2);
    ctx.fillStyle = col;
    ctx.fillText(lbl, 0, 0);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// Ultra-fast single-texture-lookup stereo smoke shader for Quest 3 (zero per-pixel pow/trig/divisions)
const TABLETOP_SMOKE_VS = /* glsl */`
attribute vec3 iPos;
attribute float iSize;
attribute float iRot;
attribute vec4 iCol;
attribute vec4 iPar;
uniform vec3 uCamRLocal, uCamULocal, uCamPosLocal, uSunDirLocal;
uniform float uPuffScale, uReliefBoost;
varying vec2 vAtlasUv;
varying float vUvY;
varying vec4 vCol;
varying vec2 vHeatShade;
varying vec2 vCS;
varying float vFade;
varying float vSilver;
void main() {
  vec2 q = position.xy;
  float c = cos(iRot), s = sin(iRot);
  vec2 r = vec2(c * q.x - s * q.y, s * q.x + c * q.y);
  float sz = max(iSize * uPuffScale, 1.0);
  vec3 basePos = vec3(iPos.x, iPos.y * uReliefBoost, iPos.z);
  vec3 wp = basePos + (uCamRLocal * r.x + uCamULocal * r.y) * sz;
  vec2 uv = q + 0.5;
  vec2 cell = vec2(mod(iPar.y, 2.0), floor(iPar.y * 0.5));
  vAtlasUv = (cell + uv) * 0.5;
  vUvY = uv.y;
  vCol = iCol;
  vHeatShade = vec2(iPar.x, iPar.w);
  vCS = vec2(c, s);
  vec3 toP = wp - uCamPosLocal;
  float dist = length(toP);
  vFade = smoothstep(-0.08, 0.30, (wp.y - iPar.z * uReliefBoost) / sz) * smoothstep(0.15, 0.80, dist / sz);
  float sf = dist > 1e-3 ? max(dot(toP / dist, uSunDirLocal), 0.0) : 0.0;
  float sf2 = sf * sf;
  vSilver = sf2 * sf2 * sf * 1.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(wp, 1.0);
}`;

const TABLETOP_SMOKE_FS = /* glsl */`
uniform sampler2D tAtlas;
uniform vec3 uCamRLocal, uCamULocal, uCamBLocal, uSunDirLocal, uSunCol, uSky, uBounce;
uniform float uSmokeBoost;
varying vec2 vAtlasUv;
varying float vUvY;
varying vec4 vCol;
varying vec2 vHeatShade;
varying vec2 vCS;
varying float vFade;
varying float vSilver;
void main() {
  vec4 tx = texture2D(tAtlas, vAtlasUv);
  float rawA = tx.a * vCol.a * vFade;
  if (rawA < 0.025) discard;
  float a = clamp(rawA * (uSmokeBoost - (uSmokeBoost - 1.0) * rawA), 0.0, 0.96);
  vec2 nxy = tx.rg * 2.0 - 1.0;
  float nz = sqrt(max(0.0, 1.0 - dot(nxy, nxy)));
  vec2 nr = vec2(vCS.x * nxy.x - vCS.y * nxy.y, vCS.y * nxy.x + vCS.x * nxy.y);
  vec3 n = normalize(uCamRLocal * nr.x + uCamULocal * nr.y + uCamBLocal * nz * 0.8);
  float diff = clamp((dot(n, uSunDirLocal) + 0.35) * 0.7407, 0.0, 1.0);
  float thick = tx.b;
  vec3 light = uSky * (0.65 + 0.35 * n.y) + uBounce * max(-n.y, 0.0) + uSunCol * diff * vHeatShade.y * (1.0 - 0.3 * thick);
  vec3 col = vCol.rgb * (light + uSunCol * vSilver * (1.0 - thick));
  vec3 underCol = mix(vec3(1.0, 0.26, 0.04), vec3(1.0, 0.62, 0.18), clamp(vHeatShade.x * 0.6, 0.0, 1.0));
  col += underCol * vHeatShade.x * (0.4 + thick) * smoothstep(0.88, 0.08, vUvY) * 3.5;
  gl_FragColor = vec4(col * a, a);
}`;

const TABLETOP_GLOW_VS = /* glsl */`
attribute vec3 iPos;
attribute vec3 iVel;
attribute float iSize;
attribute vec4 iCol;
uniform float uStreak, uWorldScale, uReliefBoost;
varying vec2 vQ;
varying vec4 vCol;
void main() {
  vec4 mv = modelViewMatrix * vec4(iPos.x, iPos.y * uReliefBoost, iPos.z, 1.0);
  float baseS = iSize * uWorldScale * 3.1;
  float minS = max(0.0016, -mv.z * 0.0038);
  float sz = max(baseS, minS);
  float dim = clamp(baseS / sz, 0.45, 1.0);
  vec3 vv = (modelViewMatrix * vec4(iVel, 0.0)).xyz;
  float sp = length(vv.xy);
  vec2 dir = sp > 1e-4 ? vv.xy / sp : vec2(0.0, 1.0);
  vec2 perp = vec2(dir.y, -dir.x);
  float len = sz + sp * uStreak * 3.8;
  mv.xy += dir * position.y * len + perp * position.x * sz;
  vQ = position.xy * 2.0;
  vCol = iCol * vec4(vec3(dim), 1.0);
  gl_Position = projectionMatrix * mv;
}`;

const TABLETOP_GLOW_FS = /* glsl */`
varying vec2 vQ;
varying vec4 vCol;
void main() {
  float r2 = dot(vQ, vQ);
  if (r2 > 1.0) discard;
  float r = sqrt(r2);
  float core = exp(-r2 * 4.8);
  float inv = 1.0 - r;
  float a = core + inv * inv * 0.55;
  gl_FragColor = vec4(vCol.rgb * (1.0 + 0.75 * core) * a * vCol.a, 1.0);
}`;

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
}

function drawIcon(g, name, cx, cy, s, col = '#f3f1ea') {
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = col;
  g.fillStyle = col;
  g.lineWidth = Math.max(2, s * 0.14);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (name === 'play') {
    g.beginPath();
    g.moveTo(-s * 0.42, -s * 0.56);
    g.lineTo(s * 0.62, 0);
    g.lineTo(-s * 0.42, s * 0.56);
    g.closePath();
    g.fill();
  } else if (name === 'pause') {
    const w = s * 0.28, h = s * 0.96, gap = s * 0.2;
    rrect(g, -gap - w, -h * 0.5, w, h, w * 0.35);
    g.fill();
    rrect(g, gap, -h * 0.5, w, h, w * 0.35);
    g.fill();
  } else if (name === 'prev' || name === 'next') {
    const dir = name === 'next' ? 1 : -1;
    g.beginPath();
    g.moveTo(-dir * s * 0.24, -s * 0.44);
    g.lineTo(dir * s * 0.28, 0);
    g.lineTo(-dir * s * 0.24, s * 0.44);
    g.stroke();
  } else if (name === 'layers') {
    for (const dy of [-0.36, 0, 0.36]) {
      g.beginPath();
      g.moveTo(-s * 0.55, dy * s);
      g.lineTo(0, (dy - 0.22) * s);
      g.lineTo(s * 0.55, dy * s);
      g.lineTo(0, (dy + 0.22) * s);
      g.closePath();
      g.stroke();
    }
  } else if (name === 'sliders') {
    for (const [yy, kx] of [[-0.36, -0.22], [0, 0.28], [0.36, -0.05]]) {
      g.beginPath();
      g.moveTo(-s * 0.56, yy * s);
      g.lineTo(s * 0.56, yy * s);
      g.stroke();
      g.beginPath();
      g.arc(kx * s, yy * s, s * 0.14, 0, Math.PI * 2);
      g.fill();
    }
  } else if (name === 'target') {
    g.beginPath();
    g.arc(0, 0, s * 0.46, 0, Math.PI * 2);
    g.stroke();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      g.beginPath();
      g.moveTo(dx * s * 0.32, dy * s * 0.32);
      g.lineTo(dx * s * 0.72, dy * s * 0.72);
      g.stroke();
    }
    g.beginPath();
    g.arc(0, 0, s * 0.14, 0, Math.PI * 2);
    g.fill();
  } else if (name === 'flame') {
    g.beginPath();
    g.moveTo(0, -s * 0.68);
    g.bezierCurveTo(s * 0.52, -s * 0.2, s * 0.62, s * 0.48, 0, s * 0.68);
    g.bezierCurveTo(-s * 0.62, s * 0.48, -s * 0.52, -s * 0.2, 0, -s * 0.68);
    g.fill();
  } else if (name === 'sun') {
    g.beginPath();
    g.arc(0, 0, s * 0.32, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      g.beginPath();
      g.moveTo(Math.cos(a) * s * 0.48, Math.sin(a) * s * 0.48);
      g.lineTo(Math.cos(a) * s * 0.66, Math.sin(a) * s * 0.66);
      g.stroke();
    }
  } else if (name === 'dusk') {
    g.beginPath();
    g.arc(0, s * 0.12, s * 0.38, Math.PI, 0);
    g.stroke();
    g.beginPath();
    g.moveTo(-s * 0.64, s * 0.26);
    g.lineTo(s * 0.64, s * 0.26);
    g.stroke();
  } else if (name === 'moon') {
    g.beginPath();
    g.arc(0, 0, s * 0.48, -Math.PI * 0.35, Math.PI * 0.95);
    g.bezierCurveTo(-s * 0.08, s * 0.12, -s * 0.08, -s * 0.18, s * 0.22, -s * 0.42);
    g.stroke();
  } else if (name === 'reset') {
    g.beginPath();
    g.arc(0, 0, s * 0.48, -Math.PI * 0.8, Math.PI * 0.65);
    g.stroke();
    g.beginPath();
    g.moveTo(-s * 0.56, -s * 0.16);
    g.lineTo(-s * 0.36, -s * 0.48);
    g.lineTo(-s * 0.12, -s * 0.18);
    g.stroke();
  } else if (name === 'exit') {
    g.beginPath();
    g.moveTo(-s * 0.38, -s * 0.38);
    g.lineTo(s * 0.38, s * 0.38);
    g.moveTo(s * 0.38, -s * 0.38);
    g.lineTo(-s * 0.38, s * 0.38);
    g.stroke();
  }
  g.restore();
}

export function createTabletop({
  renderer,
  camera,
  height,
  uniforms,
  euUniforms,
  commonGLSL,
  fragColorGLSL,
  fragEmisGLSL,
  smoke,
  glow,
  getEnvTexture,
  lightModes,
  cx,
  cz,
  dome,
  span = 78000,
  datumZero = 0,
  D,
  ND,
  SIZE,
  bands,
  state,
  setTime,
  goTo,
  chapter,
  togglePlay,
  watchEruption,
  getExag,
  setExag,
  getSpeed,
  setSpeed,
  getLight,
  setLight,
  getGhost,
  setGhost,
}) {
  const scene = new THREE.Scene();
  const holder = new THREE.Group();
  const model = new THREE.Group();
  scene.add(holder);
  holder.add(model);

  const baseScale = MODEL_WIDTH / span;
  const plinthDepth = Math.round(span * 0.0125);
  model.scale.setScalar(baseScale);
  model.position.set(-cx * baseScale, plinthDepth * baseScale, -cz * baseScale);
  holder.visible = false;

  const hemi = new THREE.HemisphereLight(0xcfe0f0, 0x51462f, 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.6);
  sun.castShadow = false;
  scene.add(sun, sun.target);
  const sunDirWorld = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(220));

  const domeX = dome?.x ?? (cx + 90);
  const domeZ = dome?.z ?? (cz - 60);
  const craterGlow = { value: 0 };

  const tableNormalMat = { value: new THREE.Matrix3() };
  const hasGPUShaders = !!(uniforms && commonGLSL && fragColorGLSL && fragEmisGLSL);

  // Sculptural tabletop relief multiplier for a 78 km wide Martian crater basin on a 42-65 cm desk
  const TABLETOP_RELIEF_BOOST = 2.4;

  // High-resolution basin-balanced terrain mesh (224x224 -> crisp 3D crater rim, canyons, delta & Jezero Mons)
  const terrainGeom = buildTabletopTerrainGeometry(cx, cz, span, 224);
  let terrainColors = null;
  let terrainMat;
  let bakeTerrain = null;

  if (hasGPUShaders) {
    const BAKE_N = 1024;
    const BAKE_STEP = span / BAKE_N;
    const canFloatRT = renderer.capabilities?.isWebGL2 &&
      (renderer.extensions?.has('EXT_color_buffer_float') || renderer.extensions?.has('EXT_color_buffer_half_float'));

    const rtAlbedo = new THREE.WebGLRenderTarget(BAKE_N, BAKE_N, {
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: true,
      depthBuffer: false,
      stencilBuffer: false,
    });
    const rtHeight = canFloatRT
      ? new THREE.WebGLRenderTarget(BAKE_N, BAKE_N, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      })
      : null;

    const bakeUniforms = {
      ...uniforms,
      uTableCenter: { value: new THREE.Vector2(cx, cz) },
      uTableSpan: { value: span },
      uBakeStep: { value: BAKE_STEP },
      uIsBake: { value: 1.0 },
    };

    const bakeScene = new THREE.Scene();
    const bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bakeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    bakeQuad.frustumCulled = false;
    bakeScene.add(bakeQuad);

    // Pure GLSL ES 3.00 bake shaders (matches texelFetch / textureLod / texture / const mat2 in commonGLSL & fragColorGLSL!)
    const BAKE_VS = /* glsl */`
      out vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `;

    const bakeHeightMat = rtHeight ? new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: bakeUniforms,
      vertexShader: BAKE_VS,
      fragmentShader: commonGLSL + /* glsl */`
        uniform vec2 uTableCenter;
        uniform float uTableSpan, uBakeStep;
        in vec2 vUv;
        out vec4 outColor;
        void main() {
          vec2 wp = uTableCenter + (vUv - 0.5) * uTableSpan;
          vec4 aux;
          float h = terrainH(wp, uBakeStep, aux);
          float e = uBakeStep;
          float hx1 = terrainH(wp + vec2(e, 0.0), uBakeStep, aux);
          float hx0 = terrainH(wp - vec2(e, 0.0), uBakeStep, aux);
          float hz1 = terrainH(wp + vec2(0.0, e), uBakeStep, aux);
          float hz0 = terrainH(wp - vec2(0.0, e), uBakeStep, aux);
          outColor = vec4(h, (hx1 - hx0) / (2.0 * e), (hz1 - hz0) / (2.0 * e), 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    }) : null;

    const bakeAlbedoMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: bakeUniforms,
      vertexShader: BAKE_VS,
      fragmentShader: commonGLSL + /* glsl */`
        uniform vec2 uTableCenter;
        uniform float uTableSpan, uBakeStep;
        in vec2 vUv;
        out vec4 outColor;
        void main() {
          vec2 wp = uTableCenter + (vUv - 0.5) * uTableSpan;
          vec4 aux, a_;
          float hC = terrainH(wp, uBakeStep, aux);
          float e = uBakeStep;
          float hx1 = terrainH(wp + vec2(e, 0.0), uBakeStep, a_);
          float hx0 = terrainH(wp - vec2(e, 0.0), uBakeStep, a_);
          float hz1 = terrainH(wp + vec2(0.0, e), uBakeStep, a_);
          float hz0 = terrainH(wp - vec2(0.0, e), uBakeStep, a_);
          vec3 vW = vec3(wp.x, hC, wp.y);
          vec4 vAux = aux;
          float vSEff = uBakeStep * 0.5;
          vec3 vNW = normalize(vec3(-(hx1 - hx0) / (2.0 * e), 1.0, -(hz1 - hz0) / (2.0 * e)));
          vec3 gNW = vNW;
          float gAO = 1.0, gRock = 0.0, gScree = 0.0;
          vec4 diffuseColor = vec4(1.0);
          vec3 totalEmissiveRadiance = vec3(0.0);
          ${fragColorGLSL.replaceAll('fwidth(vW.xz)', '(fwidth(vW.xz) * 0.25)')}
          ${fragEmisGLSL.replaceAll('fwidth(vW.xz)', '(fwidth(vW.xz) * 0.25)')}
          float em = clamp(max(totalEmissiveRadiance.r, max(totalEmissiveRadiance.g, totalEmissiveRadiance.b)) / 4.0, 0.0, 1.0);
          outColor = vec4(sqrt(clamp(diffuseColor.rgb * 0.5, 0.0, 1.0)), em);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });

    bakeTerrain = (bakeHeight = true) => {
      const prevXR = renderer.xr.enabled;
      const prevRT = renderer.getRenderTarget();
      renderer.xr.enabled = false;
      if (bakeHeight && rtHeight && bakeHeightMat) {
        bakeQuad.material = bakeHeightMat;
        renderer.setRenderTarget(rtHeight);
        renderer.render(bakeScene, bakeCam);
      }
      bakeQuad.material = bakeAlbedoMat;
      renderer.setRenderTarget(rtAlbedo);
      renderer.render(bakeScene, bakeCam);
      renderer.setRenderTarget(prevRT);
      renderer.xr.enabled = prevXR;
    };

    const liveUniforms = {
      uExag: uniforms.uExag,
      uReliefBoost: { value: TABLETOP_RELIEF_BOOST },
      uTime: uniforms.uTime,
      tNoise: uniforms.tNoise,
      tBakedAlbedo: { value: rtAlbedo.texture },
      tBakedHeight: { value: rtHeight ? rtHeight.texture : uniforms.tNoise.value },
      uTableCenter: { value: new THREE.Vector2(cx, cz) },
      uTableSpan: { value: span },
      uTabletopNMat: tableNormalMat,
      uDomePos: { value: new THREE.Vector2(domeX, domeZ) },
      uCraterGlow: craterGlow,
      uDepMode: uniforms.uDepMode || { value: 1 },
    };

    // Ultra-fast stereo terrain shader (1 VS height/grad tap, zero PMREM/PointLight passes)
    terrainMat = new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0, envMapIntensity: 0 });
    terrainMat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, rtHeight ? liveUniforms : { ...uniforms, ...liveUniforms });
      const vsDecl = rtHeight
        ? 'uniform sampler2D tBakedHeight; uniform vec2 uTableCenter; uniform float uTableSpan, uExag, uReliefBoost;\nvarying vec3 vW; varying vec3 vNW; varying vec2 vUvT;\n'
        : commonGLSL + 'uniform vec2 uTableCenter; uniform float uTableSpan, uReliefBoost;\nattribute float aStep;\nvarying vec3 vW; varying vec3 vNW; varying vec2 vUvT;\n';

      const vsBody = rtHeight
        ? `
          vec2 wp = position.xz;
          vec2 uvT = clamp((wp - uTableCenter) / uTableSpan + 0.5, 0.0, 1.0);
          vec3 hd = texture2D(tBakedHeight, uvT).rgb;
          float tExag = uExag * uReliefBoost;
          vW = vec3(wp.x, hd.r, wp.y);
          vec3 objectNormal = normalize(vec3(-hd.g * tExag, 1.0, -hd.b * tExag));
          vNW = objectNormal; vUvT = uvT;
        `
        : `
          vec2 wp = position.xz;
          vec2 uvT = clamp((wp - uTableCenter) / uTableSpan + 0.5, 0.0, 1.0);
          vec4 aux; float hC = baseH(wp, aux);
          float e = aStep;
          float hx1 = baseH(wp + vec2(e, 0.0), aux), hx0 = baseH(wp - vec2(e, 0.0), aux);
          float hz1 = baseH(wp + vec2(0.0, e), aux), hz0 = baseH(wp - vec2(0.0, e), aux);
          float tExag = uExag * uReliefBoost;
          vW = vec3(wp.x, hC, wp.y);
          vec3 objectNormal = normalize(vec3(-(hx1 - hx0) * tExag / (2.0 * e), 1.0, -(hz1 - hz0) * tExag / (2.0 * e)));
          vNW = objectNormal; vUvT = uvT;
        `;

      sh.vertexShader = vsDecl + sh.vertexShader
        .replace('#include <beginnormal_vertex>', vsBody)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(vW.x, vW.y * uExag * uReliefBoost, vW.z);');

      sh.fragmentShader = /* glsl */`
        uniform sampler2D tBakedAlbedo, tNoise;
        uniform float uExag, uTime, uCraterGlow, uDepMode;
        uniform vec2 uDomePos;
        uniform mat3 uTabletopNMat;
        varying vec3 vW; varying vec3 vNW; varying vec2 vUvT;
        vec3 gNW = vec3(0.0, 1.0, 0.0);
      ` + sh.fragmentShader
        .replace('#include <color_fragment>', /* glsl */`
          #include <color_fragment>
          vec4 baked = texture2D(tBakedAlbedo, vUvT);
          float micro = texture2D(tNoise, vW.xz / 140.0).r;
          float mx = texture2D(tNoise, (vW.xz + vec2(26.0, 0.0)) / 140.0).r - micro;
          float mz = texture2D(tNoise, (vW.xz + vec2(0.0, 26.0)) / 140.0).r - micro;
          diffuseColor.rgb = baked.rgb * baked.rgb * 2.0 * (0.92 + 0.16 * micro);
          gNW = normalize(vNW + vec3(-mx, 0.0, -mz) * 0.36 * uExag);
        `)
        .replace('#include <emissivemap_fragment>', /* glsl */`
          #include <emissivemap_fragment>
          if (baked.a > 0.002 && uDepMode < 1.5) {
            float pulse = 0.86 + 0.14 * sin(uTime * 1.4 + vW.x * 0.005 + vW.z * 0.005);
            float nFlow = texture2D(tNoise, vW.xz / 160.0 - vec2(uTime * 0.012, uTime * 0.006)).r;
            float fissure = 0.35 + 1.15 * smoothstep(0.36, 0.80, 1.0 - abs(2.0 * nFlow - 1.0));
            float em = baked.a * 3.0 * pulse * fissure;
            vec3 lCol = mix(vec3(0.88, 0.08, 0.01), vec3(1.0, 0.34, 0.03), clamp(baked.a * 1.5, 0.0, 1.0));
            lCol = mix(lCol, vec3(1.0, 0.76, 0.24), smoothstep(0.68, 0.98, baked.a));
            totalEmissiveRadiance += lCol * em;
          }
          if (uCraterGlow > 0.005) {
            vec2 cd = vW.xz - uDomePos;
            float cLit = uCraterGlow * exp(-dot(cd, cd) / 2800000.0);
            totalEmissiveRadiance += vec3(0.95, 0.22, 0.04) * cLit * diffuseColor.rgb;
          }
        `)
        .replace('#include <normal_fragment_begin>', /* glsl */`
          #include <normal_fragment_begin>
          normal = normalize((viewMatrix * vec4(normalize(uTabletopNMat * gNW), 0.0)).xyz);
        `);
    };
    terrainMat.customProgramCacheKey = () => 'tabletop-fast-terrain-jezero-v1';

    const terrain = new THREE.Mesh(terrainGeom, terrainMat);
    terrain.frustumCulled = false;
    model.add(terrain);

    // Cutaway geological strata skirt
    const skirtGeom = buildTabletopSkirtGeometry(cx, cz, span, 128);
    const skirtMat = new THREE.MeshStandardMaterial({ roughness: 0.94, envMapIntensity: 0, side: THREE.DoubleSide });
    skirtMat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, rtHeight ? liveUniforms : { ...uniforms, ...liveUniforms });
      const vsDecl = rtHeight
        ? 'uniform sampler2D tBakedHeight; uniform vec2 uTableCenter; uniform float uTableSpan, uExag, uReliefBoost;\nattribute float aTop;\nvarying vec3 vW; varying vec3 vNW;\n'
        : commonGLSL + 'uniform float uReliefBoost;\nattribute float aTop;\nvarying vec3 vW; varying vec3 vNW;\n';
      const vsBody = rtHeight
        ? `
          vec2 wp = position.xz;
          vec2 uvT = clamp((wp - uTableCenter) / uTableSpan + 0.5, 0.0, 1.0);
          float hC = texture2D(tBakedHeight, uvT).r;
          vW = vec3(wp.x, mix(-240.0, hC, aTop), wp.y);
          vec3 objectNormal = normal; vNW = normal;
        `
        : `
          vec2 wp = position.xz; vec4 aux; float hC = baseH(wp, aux);
          vW = vec3(wp.x, mix(-240.0, hC, aTop), wp.y);
          vec3 objectNormal = normal; vNW = normal;
        `;

      sh.vertexShader = vsDecl + sh.vertexShader
        .replace('#include <beginnormal_vertex>', vsBody)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(vW.x, vW.y * (aTop > 0.5 ? uExag * uReliefBoost : 1.0), vW.z);');

      sh.fragmentShader = /* glsl */`
        uniform sampler2D tNoise;
        uniform mat3 uTabletopNMat;
        varying vec3 vW; varying vec3 vNW;
      ` + sh.fragmentShader
        .replace('#include <color_fragment>', /* glsl */`
          #include <color_fragment>
          float band = texture2D(tNoise, vec2(vW.y / 85.0, 0.37)).r + 0.22 * texture2D(tNoise, vW.xz / 2400.0).r;
          vec3 c1 = pow(vec3(0.54, 0.31, 0.21), vec3(2.2));
          vec3 c2 = pow(vec3(0.32, 0.20, 0.16), vec3(2.2));
          diffuseColor.rgb = mix(c1, c2, smoothstep(0.45, 0.55, band)) * 0.72;
        `)
        .replace('#include <normal_fragment_begin>', /* glsl */`
          #include <normal_fragment_begin>
          normal = normalize((viewMatrix * vec4(normalize(uTabletopNMat * normalize(vNW)), 0.0)).xyz);
        `);
    };
    skirtMat.customProgramCacheKey = () => 'tabletop-fast-skirt-jezero-v1';
    const skirt = new THREE.Mesh(skirtGeom, skirtMat);
    skirt.frustumCulled = false;
    model.add(skirt);
  } else {
    const pos = terrainGeom.attributes.position;
    terrainColors = new Float32Array(pos.count * 3);
    terrainGeom.setAttribute('color', new THREE.BufferAttribute(terrainColors, 3));
    terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
    const terrain = new THREE.Mesh(terrainGeom, terrainMat);
    terrain.frustumCulled = false;
    model.add(terrain);
  }

  // Dark basalt plinth (top lid omitted & recessed strictly below y = 0 to prevent any Z-fighting)
  const plinthSideMat = new THREE.MeshStandardMaterial({ color: 0x161414, roughness: 0.88, metalness: 0.08, envMapIntensity: 0 });
  const plinthTopHidden = new THREE.MeshBasicMaterial({ visible: false });
  const plinthDrop = Math.max(120, Math.round(plinthDepth * 0.14));
  const plinthH = Math.max(100, plinthDepth - plinthDrop);
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(span, plinthH, span),
    [plinthSideMat, plinthSideMat, plinthTopHidden, plinthSideMat, plinthSideMat, plinthSideMat],
  );
  plinth.position.set(cx, -plinthDepth + plinthH * 0.5, cz);
  model.add(plinth);

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(span + 180, 52, span + 180),
    new THREE.MeshStandardMaterial({ color: 0x222730, roughness: 0.52, metalness: 0.24, envMapIntensity: 0 }),
  );
  trim.position.set(cx, -plinthDepth + 26, cz);
  model.add(trim);

  const plinthHalf = (span + 180) * 0.5 * baseScale;
  const plinthRimMat = new THREE.LineBasicMaterial({ color: 0xeaf0f8, toneMapped: false, transparent: true, opacity: 0.16 });
  const plinthRim = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-plinthHalf, 0.0024, -plinthHalf),
      new THREE.Vector3(plinthHalf, 0.0024, -plinthHalf),
      new THREE.Vector3(plinthHalf, 0.0024, plinthHalf),
      new THREE.Vector3(-plinthHalf, 0.0024, plinthHalf),
    ]),
    plinthRimMat,
  );
  holder.add(plinthRim);

  // Ghost wireframe of today's terrain
  let ghostMesh = null;
  if (D && ND && SIZE) {
    ghostMesh = new THREE.Mesh(
      buildGhostGeometry(D, ND, SIZE, cx, cz, span, 72, datumZero),
      new THREE.MeshBasicMaterial({ color: 0x9fd6ff, wireframe: true, transparent: true, opacity: 0.22, depthWrite: false }),
    );
    ghostMesh.visible = false;
    ghostMesh.frustumCulled = false;
    ghostMesh.renderOrder = 5;
    model.add(ghostMesh);
  }

  // Precision smoked-glass turntable rotator ring cleanly outside the corner handles
  const turntableTex = createTurntableTexture();
  const turntableRing = new THREE.Mesh(
    new THREE.RingGeometry(TURNTABLE_R_INNER, TURNTABLE_R_OUTER, 96).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: turntableTex, toneMapped: false, transparent: true, opacity: 0.88, side: THREE.DoubleSide, depthWrite: false }),
  );
  turntableRing.position.y = 0.002;
  holder.add(turntableRing);

  // Sculpted 3D specular outer bezel on the turntable ring for stereo depth & hover/drag illumination
  const turntableBezelMat = new THREE.MeshBasicMaterial({ color: 0xeef3fa, toneMapped: false, transparent: true, opacity: 0.26, depthWrite: false });
  const turntableBezel = new THREE.Mesh(
    new THREE.TorusGeometry(TURNTABLE_R_OUTER, 0.0018, 10, 96).rotateX(Math.PI / 2),
    turntableBezelMat,
  );
  turntableBezel.position.y = 0.0028;
  holder.add(turntableBezel);

  const ringHitMesh = new THREE.Mesh(
    new THREE.RingGeometry(TURNTABLE_R_INNER - 0.010, TURNTABLE_R_OUTER + 0.028, 56).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
  );
  ringHitMesh.position.y = 0.004;
  holder.add(ringHitMesh);

  // Fast 12-triangle bounding proxy for direct 1-hand / 2-hand model manipulation (pinch or trigger on volcano/plinth)
  const modelHitBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.24, 0.66),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  modelHitBox.position.y = 0.065;
  holder.add(modelHitBox);

  // Four sculpted visionOS-style curved corner resize handles hugging the plinth cleanly inside the rotator ring
  const cornerHandles = [];
  const cornerHitMeshes = [];
  const cornerCoords = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const cornerOffset = 0.344;
  const cornerArcR = 0.024;
  const cornerArcGeom = new THREE.TorusGeometry(cornerArcR, 0.0027, 12, 24, Math.PI / 2).rotateX(Math.PI / 2);
  const cornerShadowGeom = new THREE.TorusGeometry(cornerArcR, 0.0046, 8, 20, Math.PI / 2).rotateX(Math.PI / 2);
  const cornerCapGeom = new THREE.SphereGeometry(0.0027, 10, 8);
  const cornerOrbGeom = new THREE.SphereGeometry(0.0066, 16, 12);
  const cornerHaloGeom = new THREE.RingGeometry(0.0102, 0.0136, 28).rotateX(-Math.PI / 2);
  const cornerHitGeom = new THREE.SphereGeometry(0.036, 10, 10);

  for (const [sx, sz] of cornerCoords) {
    const group = new THREE.Group();
    group.position.set(sx * cornerOffset, 0.008, sz * cornerOffset);

    const rotY = sx > 0 && sz > 0 ? 0
      : sx > 0 && sz < 0 ? Math.PI * 0.5
        : sx < 0 && sz < 0 ? Math.PI
          : -Math.PI * 0.5;

    const arcPivot = new THREE.Group();
    arcPivot.position.set(-sx * 0.015, 0, -sz * 0.015);
    arcPivot.rotation.y = rotY;

    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x07090e, toneMapped: false, transparent: true, opacity: 0.42, depthWrite: false });
    const shadowArc = new THREE.Mesh(cornerShadowGeom, shadowMat);
    shadowArc.position.y = -0.0026;
    arcPivot.add(shadowArc);

    const armMat = new THREE.MeshBasicMaterial({ color: 0xedf2fa, toneMapped: false, transparent: true, opacity: 0.62 });
    const arc = new THREE.Mesh(cornerArcGeom, armMat);
    const capA = new THREE.Mesh(cornerCapGeom, armMat);
    capA.position.set(cornerArcR, 0, 0);
    const capB = new THREE.Mesh(cornerCapGeom, armMat);
    capB.position.set(0, 0, cornerArcR);
    arcPivot.add(arc, capA, capB);
    group.add(arcPivot);

    const orb = new THREE.Mesh(
      cornerOrbGeom,
      new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.78 }),
    );
    orb.position.set(sx * 0.0022, 0.0012, sz * 0.0022);
    orb.scale.set(1, 0.58, 1);
    group.add(orb);

    const ring = new THREE.Mesh(
      cornerHaloGeom,
      new THREE.MeshBasicMaterial({ color: 0xffb37a, toneMapped: false, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.position.set(sx * 0.0022, -0.002, sz * 0.0022);
    group.add(ring);

    const hitSphere = new THREE.Mesh(cornerHitGeom, new THREE.MeshBasicMaterial({ visible: false }));
    group.add(hitSphere);
    hitSphere.userData.cornerIndex = cornerHandles.length;

    holder.add(group);
    cornerHandles.push({ group, orb, ring, armMat, hitSphere, sx, sz });
    cornerHitMeshes.push(hitSphere);
  }

  // Physical size and rotation feedback pill floating above the model
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 360;
  badgeCanvas.height = 80;
  const badgeCtx = badgeCanvas.getContext('2d');
  const badgeTex = new THREE.CanvasTexture(badgeCanvas);
  badgeTex.colorSpace = THREE.SRGBColorSpace;
  const resizeBadge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.180, 0.040),
    new THREE.MeshBasicMaterial({ map: badgeTex, toneMapped: false, transparent: true, depthTest: false, side: THREE.DoubleSide }),
  );
  resizeBadge.visible = false;
  resizeBadge.renderOrder = 25;
  scene.add(resizeBadge);
  let lastBadgeText = '';

  function updateBadge(mesh, text, worldPos) {
    if (text !== lastBadgeText) {
      lastBadgeText = text;
      const g = badgeCtx;
      g.clearRect(0, 0, 360, 80);
      rrect(g, 4, 4, 352, 72, 36);
      const grad = g.createLinearGradient(0, 4, 0, 76);
      grad.addColorStop(0, 'rgba(30, 35, 45, 0.92)');
      grad.addColorStop(1, 'rgba(15, 18, 24, 0.96)');
      g.fillStyle = grad;
      g.fill();
      const rim = g.createLinearGradient(0, 4, 0, 76);
      rim.addColorStop(0, 'rgba(255, 255, 255, 0.44)');
      rim.addColorStop(1, 'rgba(255, 255, 255, 0.14)');
      g.strokeStyle = rim;
      g.lineWidth = 2;
      g.stroke();

      // Subtle warm-ember status pip
      g.beginPath();
      g.arc(36, 40, 5.5, 0, Math.PI * 2);
      g.fillStyle = '#ff9852';
      g.fill();

      g.fillStyle = '#f8fafc';
      g.font = '600 26px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(text, 192, 41);
      badgeTex.needsUpdate = true;
    }
    mesh.position.copy(worldPos);
    mesh.visible = true;
  }

  // Subtle vertical relief rail (only shown when View sheet is open or directly hovered)
  const reliefRoot = new THREE.Group();
  reliefRoot.visible = false;
  scene.add(reliefRoot);

  const reliefHeight = 0.18;
  const reliefRail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0022, 0.0022, reliefHeight, 12),
    new THREE.MeshBasicMaterial({ color: 0xeef3fa, toneMapped: false, transparent: true, opacity: 0.32 }),
  );
  reliefRail.position.y = reliefHeight * 0.5;
  reliefRoot.add(reliefRail);

  for (const frac of [0, 1 / 6, 1 / 3, 2 / 3, 1]) {
    const pip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0046, 0.0046, 0.0018, 14),
      new THREE.MeshBasicMaterial({ color: 0xeef3fa, toneMapped: false, transparent: true, opacity: 0.46 }),
    );
    pip.position.y = frac * reliefHeight;
    reliefRoot.add(pip);
  }

  const reliefOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.0115, 16, 14),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  );
  reliefRoot.add(reliefOrb);

  const reliefHitMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, reliefHeight + 0.05, 10),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  reliefHitMesh.position.y = reliefHeight * 0.5;
  reliefRoot.add(reliefHitMesh);

  const reliefLblCanvas = document.createElement('canvas');
  reliefLblCanvas.width = 240;
  reliefLblCanvas.height = 68;
  const reliefLblCtx = reliefLblCanvas.getContext('2d');
  const reliefLblTex = new THREE.CanvasTexture(reliefLblCanvas);
  reliefLblTex.colorSpace = THREE.SRGBColorSpace;
  const reliefLblMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 0.034),
    new THREE.MeshBasicMaterial({ map: reliefLblTex, toneMapped: false, transparent: true, side: THREE.DoubleSide }),
  );
  reliefLblMesh.position.set(0.076, 0, 0);
  reliefOrb.add(reliefLblMesh);
  let lastReliefLbl = '';

  function updateReliefLabel(ex) {
    const txt = `Relief · ${ex.toFixed(1)}×`;
    if (txt === lastReliefLbl) return;
    lastReliefLbl = txt;
    const g = reliefLblCtx;
    g.clearRect(0, 0, 240, 68);
    rrect(g, 4, 4, 232, 60, 30);
    const grad = g.createLinearGradient(0, 4, 0, 64);
    grad.addColorStop(0, 'rgba(30, 35, 45, 0.90)');
    grad.addColorStop(1, 'rgba(15, 18, 24, 0.95)');
    g.fillStyle = grad;
    g.fill();
    g.strokeStyle = 'rgba(255, 255, 255, 0.34)';
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = '#f8fafc';
    g.font = '600 23px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(txt, 120, 35);
    reliefLblTex.needsUpdate = true;
  }

  // Volumetric eruption plume & glowing bombs inside model
  let tabletopEU = null;
  if (euUniforms && smoke?.g && glow?.g) {
    tabletopEU = {
      tAtlas: euUniforms.tAtlas,
      uStreak: euUniforms.uStreak,
      uCamRLocal: { value: new THREE.Vector3(1, 0, 0) },
      uCamULocal: { value: new THREE.Vector3(0, 1, 0) },
      uCamBLocal: { value: new THREE.Vector3(0, 0, 1) },
      uCamPosLocal: { value: new THREE.Vector3(cx, 5000, cz + 10000) },
      uSunDirLocal: { value: sunDirWorld.clone() },
      uSunCol: { value: new THREE.Color(1.0, 0.93, 0.82).multiplyScalar(1.45) },
      uSky: { value: new THREE.Color(0.36, 0.40, 0.46) },
      uBounce: { value: new THREE.Color(0.14, 0.12, 0.10) },
      uPuffScale: { value: 1.24 },
      uSmokeBoost: { value: 1.62 },
      uWorldScale: { value: baseScale },
      uReliefBoost: { value: TABLETOP_RELIEF_BOOST },
    };

    const smokeMesh = new THREE.Mesh(
      smoke.g,
      new THREE.ShaderMaterial({
        uniforms: tabletopEU,
        vertexShader: TABLETOP_SMOKE_VS,
        fragmentShader: TABLETOP_SMOKE_FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      }),
    );
    smokeMesh.frustumCulled = false;
    smokeMesh.renderOrder = 10;
    model.add(smokeMesh);

    const glowMesh = new THREE.Mesh(
      glow.g,
      new THREE.ShaderMaterial({
        uniforms: tabletopEU,
        vertexShader: TABLETOP_GLOW_VS,
        fragmentShader: TABLETOP_GLOW_FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
      }),
    );
    glowMesh.frustumCulled = false;
    glowMesh.renderOrder = 11;
    model.add(glowMesh);
  }

  // Refined architectural placement reticle matching the true 42 cm desk footprint
  const reticle = new THREE.Group();
  reticle.visible = false;
  const footprint = MODEL_WIDTH * DESK_SCALE;
  const halfFoot = footprint * 0.5;
  const reticleFill = new THREE.Mesh(
    new THREE.PlaneGeometry(footprint, footprint).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x0e1218, toneMapped: false, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  reticle.add(reticleFill);

  const reticleOutline = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfFoot, 0.001, -halfFoot),
      new THREE.Vector3(halfFoot, 0.001, -halfFoot),
      new THREE.Vector3(halfFoot, 0.001, halfFoot),
      new THREE.Vector3(-halfFoot, 0.001, halfFoot),
    ]),
    new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.34 }),
  );
  reticle.add(reticleOutline);

  const edging = new THREE.MeshBasicMaterial({ color: 0xf4f7fc, toneMapped: false });
  const brkLen = 0.068;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const bx = new THREE.Mesh(new THREE.BoxGeometry(brkLen, 0.0022, 0.0036), edging);
      bx.position.set(sx * (halfFoot - brkLen * 0.5), 0.0014, sz * halfFoot);
      const bz = new THREE.Mesh(new THREE.BoxGeometry(0.0036, 0.0022, brkLen), edging);
      bz.position.set(sx * halfFoot, 0.0014, sz * (halfFoot - brkLen * 0.5));
      reticle.add(bx, bz);
    }
  }
  const northTick = new THREE.Mesh(
    new THREE.BoxGeometry(0.026, 0.0024, 0.0044),
    new THREE.MeshBasicMaterial({ color: 0xff934a, toneMapped: false }),
  );
  northTick.position.set(0, 0.0016, -halfFoot - 0.006);
  reticle.add(northTick);

  const centerMark = new THREE.Mesh(new THREE.RingGeometry(0.009, 0.0125, 32).rotateX(-Math.PI / 2), edging);
  centerMark.position.y = 0.0014;
  const centerDot = new THREE.Mesh(new THREE.CircleGeometry(0.0032, 16).rotateX(-Math.PI / 2), edging);
  centerDot.position.y = 0.0015;
  reticle.add(centerMark, centerDot);
  scene.add(reticle);

  const guideCanvas = document.createElement('canvas');
  guideCanvas.width = 1024;
  guideCanvas.height = 224;
  const guideCtx = guideCanvas.getContext('2d');
  const guideTexture = new THREE.CanvasTexture(guideCanvas);
  guideTexture.colorSpace = THREE.SRGBColorSpace;
  const guide = new THREE.Mesh(new THREE.PlaneGeometry(0.39, 0.0853),
    new THREE.MeshBasicMaterial({ map: guideTexture, transparent: true, toneMapped: false, depthTest: false }));
  guide.visible = false;
  guide.renderOrder = 26;
  scene.add(guide);
  let guideMode = '';
  function drawGuide(mode) {
    if (guideMode === mode) return;
    guideMode = mode;
    const g = guideCtx;
    g.clearRect(0, 0, 1024, 224);
    rrect(g, 4, 4, 1016, 216, 40);
    const bg = g.createLinearGradient(0, 4, 0, 220);
    bg.addColorStop(0, 'rgba(29, 34, 44, 0.92)');
    bg.addColorStop(1, 'rgba(13, 16, 22, 0.96)');
    g.fillStyle = bg;
    g.fill();
    g.save();
    rrect(g, 4, 4, 1016, 216, 40);
    g.clip();
    const sheen = g.createLinearGradient(0, 4, 0, 92);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    g.fillStyle = sheen;
    g.fillRect(4, 4, 1016, 88);
    g.restore();
    const rim = g.createLinearGradient(0, 4, 0, 220);
    rim.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    rim.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
    g.strokeStyle = rim;
    g.lineWidth = 2.5;
    rrect(g, 4, 4, 1016, 216, 40);
    g.stroke();

    // Ember pip + overline
    g.beginPath();
    g.arc(46, 52, 6, 0, Math.PI * 2);
    g.fillStyle = mode === 'surface' ? '#ff934a' : 'rgba(220, 230, 245, 0.55)';
    g.fill();
    g.fillStyle = mode === 'surface' ? '#ffb784' : 'rgba(215, 224, 238, 0.72)';
    g.font = '600 24px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText('JEZERO CRATER   ·   MARS TABLETOP', 68, 53);
    g.fillStyle = '#ffffff';
    g.font = '600 46px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
    g.fillText(mode === 'surface' ? 'Place on this surface' : 'Look at a clear desk', 40, 114);
    g.fillStyle = 'rgba(218, 226, 238, 0.76)';
    g.font = '400 30px -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif';
    g.fillText(mode === 'surface' ? 'Pinch or pull the trigger to set the volcano down.' :
      'Or select with your hand or controller at desk height.', 40, 172);
    guideTexture.needsUpdate = true;
  }

  // Near-field bare-hand pinch indicator spheres (for WebXR hand tracking)
  const handPinchOrbs = [0, 1].map(() => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.0075, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.78 }),
    );
    m.visible = false;
    scene.add(m);
    return m;
  });

  // Depth-only tracked hand occlusion meshes (render first so real passthrough hands occlude virtual terrain, smoke & UI)
  const handOccMat = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
  });
  const handJointInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 12, 10),
    handOccMat,
    HAND_JOINTS.length * 2,
  );
  handJointInst.count = 0;
  handJointInst.visible = false;
  handJointInst.frustumCulled = false;
  handJointInst.renderOrder = -100;
  scene.add(handJointInst);

  const handBoneInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(1, 1, 1, 10, 1),
    handOccMat,
    (HAND_BONES.length + 1) * 2,
  );
  handBoneInst.count = 0;
  handBoneInst.visible = false;
  handBoneInst.frustumCulled = false;
  handBoneInst.renderOrder = -100;
  scene.add(handBoneInst);

  const handPalmMeshes = [0, 1].map(() => {
    const mesh = new THREE.Mesh(createPalmOccluderGeometry(), handOccMat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    mesh.renderOrder = -100;
    scene.add(mesh);
    return mesh;
  });

  // Pre-allocated scratch buffers for zero-GC 90 Hz hand occlusion updates
  const handPosBuf = HAND_JOINTS.map(() => new THREE.Vector3());
  const handRadBuf = new Float32Array(HAND_JOINTS.length);
  const handValidBuf = new Uint8Array(HAND_JOINTS.length);
  const _hMat = new THREE.Matrix4();
  const _hQuat = new THREE.Quaternion();
  const _hScale = new THREE.Vector3();
  const _hDir = new THREE.Vector3();
  const _hMid = new THREE.Vector3();
  const _hNrm = new THREE.Vector3();
  const _hEdgeA = new THREE.Vector3();
  const _hEdgeB = new THREE.Vector3();
  const _hCenter = new THREE.Vector3();
  const _hIdentityQuat = new THREE.Quaternion();

  // Desk console, chapter/view sheet and independently animated playhead.
  const uiRoot = new THREE.Group();
  uiRoot.visible = false;
  scene.add(uiRoot);

  const dockPivot = new THREE.Group();
  dockPivot.rotation.x = -0.62;
  uiRoot.add(dockPivot);

  const dockPhysW = 0.43;
  const dockPhysH = dockPhysW * (DOCK_H / DOCK_W);
  const DOCK_CORNER_PX = 40;
  const dockRadius = (DOCK_CORNER_PX / DOCK_W) * dockPhysW;
  const dockCanvas = document.createElement('canvas');
  dockCanvas.width = DOCK_W;
  dockCanvas.height = DOCK_H;
  const dockCtx = dockCanvas.getContext('2d');
  const dockTex = new THREE.CanvasTexture(dockCanvas);
  dockTex.colorSpace = THREE.SRGBColorSpace;
  dockTex.anisotropy = 4;

  const dockGlassBack = new THREE.Mesh(
    createRoundedPanelGeometry(dockPhysW + 0.008, dockPhysH + 0.008, dockRadius + 0.003),
    new THREE.MeshBasicMaterial({ color: 0x06080d, toneMapped: false, transparent: true, opacity: 0.36, side: THREE.DoubleSide, depthWrite: false }),
  );
  dockGlassBack.position.z = -0.0045;
  dockPivot.add(dockGlassBack);

  const dockRimLine = new THREE.LineLoop(
    createRoundedBorderGeometry(dockPhysW + 0.0012, dockPhysH + 0.0012, dockRadius + 0.0006),
    new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.28 }),
  );
  dockRimLine.position.z = 0.0012;
  dockPivot.add(dockRimLine);

  const dockMesh = new THREE.Mesh(
    createRoundedPanelGeometry(dockPhysW, dockPhysH, dockRadius),
    new THREE.MeshBasicMaterial({ map: dockTex, toneMapped: false, transparent: true, side: THREE.DoubleSide }),
  );
  dockPivot.add(dockMesh);

  // Separate 90 Hz 3D pearl-white playhead orb on dockPivot
  const timelinePlayhead = new THREE.Group();
  const playheadCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.0064, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  );
  playheadCore.scale.set(1, 1, 0.45);
  const playheadHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.0070, 0.0098, 28),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.38, side: THREE.DoubleSide }),
  );
  timelinePlayhead.add(playheadCore, playheadHalo);
  timelinePlayhead.position.z = 0.0035;
  dockPivot.add(timelinePlayhead);

  // Refined visionOS window grab capsule beneath the console
  const dockGrabShadow = new THREE.Mesh(
    createRoundedPanelGeometry(0.098, 0.0085, 0.0042),
    new THREE.MeshBasicMaterial({ color: 0x06080d, toneMapped: false, transparent: true, opacity: 0.40, side: THREE.DoubleSide, depthWrite: false }),
  );
  dockGrabShadow.position.set(0, -dockPhysH * 0.5 - 0.017, 0.001);
  dockPivot.add(dockGrabShadow);

  const dockGrabPill = new THREE.Mesh(
    createRoundedPanelGeometry(0.090, 0.0052, 0.0026),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.46, side: THREE.DoubleSide }),
  );
  dockGrabPill.position.set(0, -dockPhysH * 0.5 - 0.017, 0.0022);
  dockPivot.add(dockGrabPill);

  const dockGrabHitMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.19, 0.044),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
  );
  dockGrabHitMesh.position.set(0, -dockPhysH * 0.5 - 0.017, 0.0022);
  dockPivot.add(dockGrabHitMesh);

  const drawerPivot = new THREE.Group();
  // Keep the summit in sight while adjusting relief or choosing a chapter.
  drawerPivot.position.set(-0.335, dockPhysH * 0.5 + 0.090, 0.005);
  drawerPivot.rotation.y = 0.18;
  drawerPivot.visible = false;
  dockPivot.add(drawerPivot);

  const drawerPhysW = 0.42;
  const drawerPhysH = drawerPhysW * (DRAWER_H / DRAWER_W);
  const DRAWER_CORNER_PX = 48;
  const drawerRadius = (DRAWER_CORNER_PX / DRAWER_W) * drawerPhysW;
  const drawerCanvas = document.createElement('canvas');
  drawerCanvas.width = DRAWER_W;
  drawerCanvas.height = DRAWER_H;
  const drawerCtx = drawerCanvas.getContext('2d');
  const drawerTex = new THREE.CanvasTexture(drawerCanvas);
  drawerTex.colorSpace = THREE.SRGBColorSpace;
  drawerTex.anisotropy = 4;

  const drawerGlassBack = new THREE.Mesh(
    createRoundedPanelGeometry(drawerPhysW + 0.008, drawerPhysH + 0.008, drawerRadius + 0.003),
    new THREE.MeshBasicMaterial({ color: 0x06080d, toneMapped: false, transparent: true, opacity: 0.36, side: THREE.DoubleSide, depthWrite: false }),
  );
  drawerGlassBack.position.z = -0.0045;
  drawerPivot.add(drawerGlassBack);

  const drawerRimLine = new THREE.LineLoop(
    createRoundedBorderGeometry(drawerPhysW + 0.0012, drawerPhysH + 0.0012, drawerRadius + 0.0006),
    new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.28 }),
  );
  drawerRimLine.position.z = 0.0012;
  drawerPivot.add(drawerRimLine);

  const drawerMesh = new THREE.Mesh(
    createRoundedPanelGeometry(drawerPhysW, drawerPhysH, drawerRadius),
    new THREE.MeshBasicMaterial({ map: drawerTex, toneMapped: false, transparent: true, side: THREE.DoubleSide }),
  );
  drawerPivot.add(drawerMesh);

  const cursorDot = new THREE.Group();
  const cursorCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.0032, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide }),
  );
  const cursorRing = new THREE.Mesh(
    new THREE.RingGeometry(0.0052, 0.0068, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  cursorDot.add(cursorCore, cursorRing);
  cursorDot.visible = false;
  dockPivot.add(cursorDot);

  // Controllers & pointer rays
  const controllers = [];
  const raycaster = new THREE.Raycaster();
  const _rot = new THREE.Matrix4();
  const _v = new THREE.Vector3();
  const _v2 = new THREE.Vector3();
  const _invModel = new THREE.Matrix4();
  const _invModelRot = new THREE.Matrix4();
  const _camPosW = new THREE.Vector3();
  const _vR = new THREE.Vector3();
  const _vU = new THREE.Vector3();
  const _vB = new THREE.Vector3();
  const _localFwd = new THREE.Vector3();
  const _plane = new THREE.Plane();
  const _hitW = new THREE.Vector3();
  const _up = new THREE.Vector3(0, 1, 0);
  const _rotMat4 = new THREE.Matrix4();
  const _lastSmokeFwd = new THREE.Vector3();

  let savedCamera = null;
  let session = null;
  let hitSource = null;
  let space = null;
  let placed = false;
  let lastP = -1;
  let lastBakedSeq = -1;
  let lastBakedHeightKey = null;
  let lastBakeAt = 0;
  let lastSmokeSeq = -1;
  let lastGlowSeq = -1;
  const smokeUploadOpts = { maxCount: 760, cx, cz, halfSpan: span * 0.56, skipFallout: true };
  let lastLight = '';
  let lastDockKey = '';
  let lastDockDraw = -Infinity;
  let lastDrawerKey = '';
  let grab = null;
  let two = null;
  const deskOrigin = new THREE.Vector3();
  const dockHome = new THREE.Vector3();
  let dockLateralOffset = 0;
  let homeYaw = 0;
  let generation = 0;
  let dockUserYOffset = 0;
  let dockUserDistOffset = 0;
  let openDrawer = null; // null | 'stages' | 'view'
  let drawerAnim = 0;
  let activeSlider = null; // { controller, surface: 'dock'|'drawer', id }
  let ringDrag = null;     // { controller, startAngle, startYaw }
  let cornerDrag = null;
  let modelPanDrag = null; // { controller, startHit, startPos }
  let reliefDrag = null;   // { controller }
  let dockDrag = null;     // { controller, startRayDist, startPoint, startYOff, startDistOff }
  let hoverDockId = null;
  let hoverDrawerId = null;
  let hoverCorner = -1;
  let hoverRelief = false;
  let hoverRing = false;
  let hoverModel = false;
  let hoverGrabBar = false;
  let prevHoverSig = '';
  let lastScrubPhase = '';
  const lastButtons = new Map();
  // Native select events own a pinch from start to release. Joint poses only
  // supply the contact position, so a menu pinch cannot also move the terrain.
  const contacts = [0, 1].map(() => ({
    joint: new THREE.Vector3(), jointTracked: false, point: new THREE.Vector3(), mode: null,
  }));

  function clearManipulation() {
    for (const c of controllers) {
      c.userData.grab = false;
      c.userData.modelSelect = false;
    }
    for (const contact of contacts) contact.mode = null;
    two = grab = activeSlider = ringDrag = cornerDrag = modelPanDrag = reliefDrag = dockDrag = null;
  }

  function pulseHaptic(controller, intensity = 0.25, duration = 14) {
    try {
      if (!session || !controller) return;
      const idx = controllers.indexOf(controller);
      const src = controllers[idx]?.userData.source;
      src?.gamepad?.hapticActuators?.[0]?.pulse?.(intensity, duration);
    } catch {
      // Haptics optional across XR devices
    }
  }

  const stageBands = bands?.length ? bands : STAGE_PILLS.map(s => ({
    phase: s.id, p0: s.anchor, p1: s.anchor, anchor: s.anchor, name: s.label, c: s.c, c2: s.c2,
  }));

  const clampScale = s => clamp(s, 0.25, 3.5);
  const scaleToT = s => clamp(Math.log(clampScale(s) / 0.25) / Math.log(3.5 / 0.25), 0, 1);
  const tToScale = t => clampScale(0.25 * Math.pow(3.5 / 0.25, clamp(t, 0, 1)));
  const normalizedYawDeg = () => {
    const deg = Math.round((((homeYaw - holder.rotation.y) * 180 / Math.PI) % 360 + 360) % 360);
    return deg === 360 ? 0 : deg;
  };

  function handleAction(id, controller = null) {
    const st = state();
    pulseHaptic(controller, 0.42, 18);
    if (id === 'exitVR') {
      session?.end?.().catch(() => {});
      return;
    } else if (id === 'playPause') {
      togglePlay();
    } else if (id === 'prevStage') {
      chapter?.(-1);
    } else if (id === 'nextStage') {
      chapter?.(1);
    } else if (id === 'drawerStages') {
      openDrawer = openDrawer === 'stages' ? null : 'stages';
    } else if (id === 'drawerView') {
      openDrawer = openDrawer === 'view' ? null : 'view';
    } else if (id === 'watchEruption') {
      watchEruption ? watchEruption() : (setTime(0.32), !st.playing && togglePlay());
      openDrawer = null;
    } else if (id === 'speed05') {
      setSpeed?.(0.5);
    } else if (id === 'speed1') {
      setSpeed?.(1);
    } else if (id === 'speed2') {
      setSpeed?.(2);
    } else if (id === 'speed4') {
      setSpeed?.(4);
    } else if (id === 'resetView') {
      clearManipulation();
      holder.position.copy(deskOrigin);
      holder.scale.setScalar(DESK_SCALE);
      holder.rotation.set(0, homeYaw, 0);
      dockLateralOffset = 0;
      dockUserYOffset = 0;
      dockUserDistOffset = 0;
      setExag?.(1);
    } else if (id === 'placeAgain') {
      placed = false;
      holder.visible = false;
      uiRoot.visible = false;
      reliefRoot.visible = false;
      resizeBadge.visible = false;
      cursorDot.visible = false;
      openDrawer = null;
      drawerAnim = 0;
      dockUserYOffset = 0;
      dockUserDistOffset = 0;
      clearManipulation();
      guide.visible = false;
      reticle.visible = false;
    } else if (id.startsWith('stage:')) {
      const ph = id.slice(6);
      const b = stageBands.find(x => x.phase === ph) || STAGE_PILLS.find(x => x.id === ph);
      if (b) goTo ? goTo(b.anchor) : setTime(b.anchor);
    } else if (id === 'scale05') {
      holder.scale.setScalar(0.5);
    } else if (id === 'scale10') {
      holder.scale.setScalar(1.0);
    } else if (id === 'scale20') {
      holder.scale.setScalar(2.0);
    } else if (id === 'rotNorth') {
      holder.rotation.set(0, homeYaw, 0);
    } else if (id === 'exag1') {
      setExag?.(1);
    } else if (id === 'exag15') {
      setExag?.(1.5);
    } else if (id === 'exag2') {
      setExag?.(2);
    } else if (id === 'exag3') {
      setExag?.(3);
    } else if (id === 'lightDay') {
      setLight?.('day');
    } else if (id === 'lightDusk') {
      setLight?.('dusk');
    } else if (id === 'lightNight') {
      setLight?.('night');
    } else if (id === 'toggleGhost') {
      setGhost?.(!(getGhost ? getGhost() : st.ghost));
    }
  }

  function applySlider(id, t, controller = null) {
    if (id === 'timeline') {
      setTime(clamp(t, 0, 1));
      const ph = state().phase;
      if (ph !== lastScrubPhase) {
        lastScrubPhase = ph;
        pulseHaptic(controller, 0.22, 12);
      }
    } else if (id === 'scaleSlider') {
      holder.scale.setScalar(tToScale(t));
    } else if (id === 'rotSlider') {
      holder.rotation.y = homeYaw + (0.5 - clamp(t, 0, 1)) * Math.PI * 2;
    } else if (id === 'exagSlider') {
      setExag?.(1 + clamp(t, 0, 1) * 3);
    }
  }

  function controllerRay(c) {
    _rot.extractRotation(c.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(c.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(_rot);
  }

  for (let i = 0; i < 2; i++) {
    const c = renderer.xr.getController(i);
    scene.add(c);
    controllers.push(c);

    const lineMat = new THREE.LineBasicMaterial({ color: 0xe6edf7, toneMapped: false, transparent: true, opacity: 0.28 });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -2.0)]),
      lineMat,
    );
    c.userData.line = line;
    c.userData.lineMat = lineMat;
    c.add(line);

    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.0032, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    );
    c.userData.tipMat = tip.material;
    c.add(tip);

    const contact = contacts[i];
    c.addEventListener('connected', e => { c.userData.source = e.data; });
    c.addEventListener('selectstart', () => {
      if (!session) return;
      if (!placed) {
        if (reticle.visible) holder.position.copy(reticle.position);
        else if (contact.jointTracked) holder.position.copy(contact.joint);
        else if (c.visible && !c.userData.source?.hand) c.getWorldPosition(holder.position);
        else return;
        deskOrigin.copy(holder.position);
        const eye = renderer.xr.getCamera(camera).getWorldPosition(_v);
        const yaw = Math.atan2(eye.x - holder.position.x, eye.z - holder.position.z);
        holder.rotation.set(0, yaw, 0);
        homeYaw = yaw;
        // Park the console on the operator's side. Zooming or turning the
        // mountain should never carry the controls into the operator's lap.
        dockHome.copy(deskOrigin);
        const reach = clamp(Math.hypot(eye.x - deskOrigin.x, eye.z - deskOrigin.z) - 0.24, 0.18, 0.30);
        dockHome.x += Math.sin(yaw) * reach;
        dockHome.z += Math.cos(yaw) * reach;
        dockLateralOffset = 0;
        guide.visible = false;
        holder.scale.setScalar(DESK_SCALE);
        holder.visible = true;
        uiRoot.visible = true;
        placed = true;
        reticle.visible = false;
        lastDockKey = '';
        lastDrawerKey = '';
        pulseHaptic(c, 0.45, 22);
        return;
      }

      if (c.userData.grab || activeSlider || dockDrag || reliefDrag) return;
      controllerRay(c);

      const target = pickTarget(i);
      if (target?.surface) {
        const { hit, surface, touch } = target;
        if (!hit) return;
        if (hit.kind === 'slider') {
          activeSlider = { controller: c, surface, id: hit.id, touch };
          lastScrubPhase = state().phase;
          applySlider(hit.id, hit.t, c);
          pulseHaptic(c, 0.25, 14);
        } else {
          handleAction(hit.id, c);
        }
        return;
      }
      if (target?.kind === 'dockHandle') {
        dockDrag = {
          controller: c, startRayDist: target.distance, startPoint: target.point.clone(),
          startLateral: dockLateralOffset, startYOff: dockUserYOffset, startDistOff: dockUserDistOffset,
        };
        pulseHaptic(c, 0.3, 16);
        return;
      }
      if (target?.kind === 'relief') {
        reliefDrag = { controller: c };
        pulseHaptic(c, 0.3, 16);
        return;
      }
      if (target) {
        contact.mode = target.touch ? 'joint' : 'ray';
        if (!contactPoint(i)) { contact.mode = null; return; }
        c.userData.modelSelect = true;
        const dx = contact.point.x - holder.position.x, dz = contact.point.z - holder.position.z;
        if (contacts[1 - i].mode) {
          cornerDrag = ringDrag = modelPanDrag = null;
        } else if (target.kind === 'corner') {
          cornerDrag = { contact, controller: c, cornerIndex: target.cornerIndex,
            startDist: Math.max(0.04, Math.hypot(dx, dz)), startScale: holder.scale.x };
        } else if (target.kind === 'ring') {
          ringDrag = { contact, controller: c, startAngle: Math.atan2(dx, dz), startYaw: holder.rotation.y };
        } else {
          modelPanDrag = { controller: c, startHit: contact.point.clone(), startPos: holder.position.clone() };
        }
        pulseHaptic(c, 0.30, 16);
        return;
      }

      // A selection on empty space dismisses the drawer.
      if (openDrawer) openDrawer = null;
    });

    const releaseSelect = () => {
      c.userData.modelSelect = false;
      if (!c.userData.grab) contact.mode = null;
      two = null;
      if (activeSlider?.controller === c) activeSlider = null;
      if (ringDrag?.controller === c) { ringDrag = null; resizeBadge.visible = false; }
      if (cornerDrag?.controller === c) { cornerDrag = null; resizeBadge.visible = false; }
      if (modelPanDrag?.controller === c) { modelPanDrag = null; resizeBadge.visible = false; }
      if (reliefDrag?.controller === c) reliefDrag = null;
      if (dockDrag?.controller === c) dockDrag = null;
    };
    c.userData.releaseSelect = releaseSelect;
    c.addEventListener('selectend', releaseSelect);
    c.addEventListener('squeezestart', () => {
      if (!placed || c.userData.modelSelect || c.userData.source?.hand || activeSlider || reliefDrag || dockDrag) return;
      controllerRay(c);
      if (!nearTerrain(c.position) && !raycaster.intersectObject(modelHitBox)[0]) return;
      c.userData.grab = true;
      contact.mode = 'grip';
      grab = null;
      pulseHaptic(c, 0.25, 14);
    });
    c.addEventListener('squeezeend', () => {
      if (!c.userData.grab) return;
      c.userData.grab = false;
      contact.mode = null;
      grab = two = null;
    });
    c.addEventListener('disconnected', () => {
      lastButtons.delete(c.userData.source);
      c.userData.source = null;
      c.userData.grab = false;
      contact.jointTracked = false;
      releaseSelect();
    });
  }

  function panelTouch(contact, mesh, width, height) {
    if (!contact.jointTracked) return null;
    mesh.worldToLocal(_v.copy(contact.joint));
    if (_v.z < -0.015 || _v.z > 0.035 || Math.abs(_v.x) > width / 2 || Math.abs(_v.y) > height / 2) return null;
    return { uv: { x: _v.x / width + 0.5, y: _v.y / height + 0.5 }, point: contact.joint };
  }

  function panelTarget(surface, intersection, touch) {
    const isDock = surface === 'dock';
    const layout = isDock ? DOCK_LAYOUT : openDrawer === 'stages' ? DRAWER_STAGES_LAYOUT : DRAWER_VIEW_LAYOUT;
    const { x, y } = intersection.uv;
    return { surface, touch, point: intersection.point,
      hit: hitTestSurface(layout, isDock ? DOCK_W : DRAWER_W, isDock ? DOCK_H : DRAWER_H, x, y) };
  }

  function pickTarget(i) {
    const contact = contacts[i];
    const drawerOpen = openDrawer && drawerPivot.visible;
    if (contact.jointTracked) {
      const drawer = drawerOpen && panelTouch(contact, drawerMesh, drawerPhysW, drawerPhysH);
      if (drawer) return panelTarget('drawer', drawer, true);
      const dock = panelTouch(contact, dockMesh, dockPhysW, dockPhysH);
      if (dock) return panelTarget('dock', dock, true);
      const p = contact.joint;
      for (const mesh of cornerHitMeshes) {
        if (mesh.getWorldPosition(_v).distanceToSquared(p) <= 0.034 ** 2) {
          return { kind: 'corner', cornerIndex: mesh.userData.cornerIndex, touch: true, point: p };
        }
      }
      const radius = Math.hypot(p.x - holder.position.x, p.z - holder.position.z);
      if (Math.abs(p.y - deskOrigin.y) < 0.035 && Math.abs(radius - TURNTABLE_R_MID * holder.scale.x) < 0.032) {
        return { kind: 'ring', touch: true, point: p };
      }
      if (nearTerrain(p)) return { kind: 'model', touch: true, point: p };
    }
    const drawer = drawerOpen && raycaster.intersectObject(drawerMesh)[0];
    if (drawer) return panelTarget('drawer', drawer, false);
    const dock = raycaster.intersectObject(dockMesh)[0];
    if (dock) return panelTarget('dock', dock, false);
    const handle = raycaster.intersectObject(dockGrabHitMesh)[0];
    if (handle) return { kind: 'dockHandle', point: handle.point, distance: handle.distance };
    const relief = reliefRoot.visible && raycaster.intersectObject(reliefHitMesh)[0];
    if (relief) return { kind: 'relief', point: relief.point };
    const corner = raycaster.intersectObjects(cornerHitMeshes, false)[0];
    if (corner) return { kind: 'corner', cornerIndex: corner.object.userData.cornerIndex, point: corner.point };
    const ring = raycaster.intersectObject(ringHitMesh)[0];
    if (ring) return { kind: 'ring', point: ring.point };
    const modelHit = raycaster.intersectObject(modelHitBox)[0];
    return modelHit ? { kind: 'model', point: modelHit.point } : null;
  }

  function nearTerrain(point) {
    _v.copy(point);
    holder.worldToLocal(_v);
    return Math.abs(_v.x) < 0.34 && Math.abs(_v.z) < 0.34 && _v.y >= -0.02 && _v.y < 0.19;
  }

  function contactPoint(i) {
    const c = controllers[i], contact = contacts[i];
    if (!contact.mode || !c.visible) return false;
    if (contact.mode === 'joint') {
      if (!contact.jointTracked) return false;
      contact.point.copy(contact.joint);
    } else if (contact.mode === 'grip') {
      c.getWorldPosition(contact.point);
    } else {
      controllerRay(c);
      _plane.setFromNormalAndCoplanarPoint(_up, deskOrigin);
      if (raycaster.ray.direction.y > -0.08 || !raycaster.ray.intersectPlane(_plane, contact.point)
        || contact.point.distanceToSquared(raycaster.ray.origin) > 9) return false;
    }
    contact.point.y = deskOrigin.y;
    return true;
  }

  function syncLighting(lightName) {
    const lm = lightModes?.[lightName] || lightModes?.day;
    if (!lm) return;
    lastLight = lightName;
    const deg = THREE.MathUtils.degToRad;
    sunDirWorld.setFromSphericalCoords(1, deg(90 - lm.el), deg(lm.az));
    sun.color.set(lm.col);
    sun.intensity = lightName === 'night' ? 1.15 : lightName === 'dusk' ? 3.1 : 3.7;
    hemi.color.set(lm.hs);
    hemi.groundColor.set(lm.hg);
    hemi.intensity = lightName === 'night' ? 0.42 : lightName === 'dusk' ? 0.76 : 1.25;
    renderer.toneMappingExposure = lightName === 'night' ? 1.48 : lightName === 'dusk' ? 1.05 : 0.80;
    if (tabletopEU) {
      tabletopEU.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity / Math.PI * 1.45);
      tabletopEU.uSky.value.setRGB(...lm.sky);
    }
  }

  const UI_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif';

  function drawPanel(g, w, h, radius) {
    // Layered smoked-obsidian visionOS glass
    rrect(g, 3, 3, w - 6, h - 6, radius);
    const bg = g.createLinearGradient(0, 3, 0, h - 3);
    bg.addColorStop(0, 'rgba(30, 35, 45, 0.90)');
    bg.addColorStop(0.55, 'rgba(18, 21, 29, 0.94)');
    bg.addColorStop(1, 'rgba(12, 15, 21, 0.96)');
    g.fillStyle = bg;
    g.fill();

    // Subtle upper specular glass catchlight
    g.save();
    rrect(g, 3, 3, w - 6, h - 6, radius);
    g.clip();
    const sheen = g.createLinearGradient(0, 3, 0, h * 0.42);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.085)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    g.fillStyle = sheen;
    g.fillRect(3, 3, w - 6, h * 0.42);
    g.restore();

    // Dual-tone specular glass rim
    const rim = g.createLinearGradient(0, 3, 0, h - 3);
    rim.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    rim.addColorStop(0.45, 'rgba(255, 255, 255, 0.16)');
    rim.addColorStop(1, 'rgba(255, 255, 255, 0.10)');
    rrect(g, 3, 3, w - 6, h - 6, radius);
    g.strokeStyle = rim;
    g.lineWidth = 2.5;
    g.stroke();
  }

  function drawPillButton(g, r, label, {
    active = false,
    accent = false,
    ember = false,
    danger = false,
    hover = false,
    icon = null,
    iconSize = 18,
    font = `500 24px ${UI_FONT}`,
    radius = 28,
  } = {}) {
    const w = r.x1 - r.x0;
    const h = r.y1 - r.y0;
    const cxB = (r.x0 + r.x1) * 0.5;
    const cyB = (r.y0 + r.y1) * 0.5;
    rrect(g, r.x0, r.y0, w, h, radius);
    const lit = accent || active;
    if (danger) {
      g.fillStyle = hover ? 'rgba(255, 88, 88, 0.34)' : 'rgba(255, 78, 78, 0.16)';
    } else if (ember) {
      const eg = g.createLinearGradient(0, r.y0, 0, r.y1);
      eg.addColorStop(0, hover ? 'rgba(255, 162, 96, 0.44)' : 'rgba(255, 138, 66, 0.28)');
      eg.addColorStop(1, hover ? 'rgba(232, 104, 42, 0.38)' : 'rgba(218, 88, 32, 0.22)');
      g.fillStyle = eg;
    } else if (lit) {
      const lg = g.createLinearGradient(0, r.y0, 0, r.y1);
      lg.addColorStop(0, hover ? '#ffffff' : '#f7f9fc');
      lg.addColorStop(1, hover ? '#edf2f8' : '#dfe6f0');
      g.fillStyle = lg;
    } else {
      g.fillStyle = hover ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.075)';
    }
    g.fill();

    g.strokeStyle = danger
      ? (hover ? 'rgba(255, 175, 175, 0.65)' : 'rgba(255, 145, 145, 0.30)')
      : ember
        ? (hover ? 'rgba(255, 198, 152, 0.85)' : 'rgba(255, 162, 98, 0.54)')
        : lit
          ? 'rgba(255, 255, 255, 0.96)'
          : hover
            ? 'rgba(255, 255, 255, 0.42)'
            : 'rgba(255, 255, 255, 0.14)';
    g.lineWidth = lit || hover || ember ? 2 : 1.5;
    g.stroke();

    const fg = danger ? '#ffe0e0' : ember ? '#ffead8' : lit ? '#11141c' : '#f4f7fb';
    g.fillStyle = fg;
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (icon && label) {
      const gap = 10;
      const tw = g.measureText(label).width;
      const total = iconSize * 1.3 + gap + tw;
      const startX = cxB - total * 0.5;
      drawIcon(g, icon, startX + iconSize * 0.65, cyB, iconSize, ember ? '#ff9d56' : fg);
      g.textAlign = 'left';
      g.fillText(label, startX + iconSize * 1.3 + gap, cyB + 1);
    } else if (icon) {
      drawIcon(g, icon, cxB, cyB, iconSize, fg);
    } else if (label) {
      g.fillText(label, cxB, cyB + 1);
    }
  }

  // visionOS capsule sliders used by the view controls.
  function drawSlider(g, r, t, hover) {
    const cy = (r.y0 + r.y1) * 0.5;
    const len = r.tx1 - r.tx0;
    const barH = 34;
    const rad = barH * 0.5;
    const clampedT = clamp(t, 0, 1);

    g.save();
    rrect(g, r.tx0, cy - rad, len, barH, rad);
    g.fillStyle = hover ? 'rgba(0, 0, 0, 0.42)' : 'rgba(0, 0, 0, 0.32)';
    g.fill();
    g.clip();

    const fillW = Math.max(barH, len * clampedT);
    rrect(g, r.tx0, cy - rad, fillW, barH, rad);
    const fg = g.createLinearGradient(0, cy - rad, 0, cy + rad);
    fg.addColorStop(0, hover ? '#ffffff' : '#f4f7fc');
    fg.addColorStop(1, hover ? '#e6edf6' : '#d8e1ee');
    g.fillStyle = fg;
    g.fill();

    // Subtle recessed thumb indicator inside the right end of the fill capsule
    const kx = r.tx0 + fillW - rad;
    g.beginPath();
    g.arc(kx, cy, 5.5, 0, Math.PI * 2);
    g.fillStyle = 'rgba(17, 20, 28, 0.42)';
    g.fill();
    g.restore();

    rrect(g, r.tx0, cy - rad, len, barH, rad);
    g.strokeStyle = hover ? 'rgba(255, 255, 255, 0.46)' : 'rgba(255, 255, 255, 0.16)';
    g.lineWidth = 1.5;
    g.stroke();
  }

  const dockButtons = Object.fromEntries(DOCK_LAYOUT.map(r => [r.id, r]));
  const dockTools = [
    ['drawerStages', 'Chapters', 'layers'], ['drawerView', 'View', 'sliders'],
    ['placeAgain', 'Place', 'target'], ['exitVR', 'Exit', 'exit'],
  ];

  function deskHint() {
    if (two) return 'Spread to resize  ·  Twist to turn';
    if (hoverGrabBar || dockDrag) return 'Drag the bar to reposition controls';
    if (hoverCorner >= 0 || cornerDrag) return 'Drag any corner arc to resize';
    if (hoverRing || ringDrag) return 'Drag along the compass ring to turn';
    if (hoverModel || modelPanDrag || grab) return 'Drag to slide  ·  Add a second hand to resize';
    return 'Slide terrain  ·  Turn dial  ·  Resize corners';
  }

  function drawDock(st) {
    const g = dockCtx;
    g.clearRect(0, 0, DOCK_W, DOCK_H);
    drawPanel(g, DOCK_W, DOCK_H, DOCK_CORNER_PX);

    // Primary Play / Pause sculpted tile
    const play = dockButtons.playPause;
    const playW = play.x1 - play.x0;
    const playH = play.y1 - play.y0;
    const playCx = (play.x0 + play.x1) * 0.5;
    const playHot = hoverDockId === 'playPause';
    rrect(g, play.x0, play.y0, playW, playH, 26);
    const playGrad = g.createLinearGradient(0, play.y0, 0, play.y1);
    if (st.erupting) {
      playGrad.addColorStop(0, playHot ? '#ffb87d' : '#ffa159');
      playGrad.addColorStop(1, playHot ? '#f5843c' : '#e66a28');
    } else {
      playGrad.addColorStop(0, playHot ? '#ffffff' : '#f6f8fc');
      playGrad.addColorStop(1, playHot ? '#e8eef7' : '#dce4f0');
    }
    g.fillStyle = playGrad;
    g.fill();
    g.strokeStyle = st.erupting ? 'rgba(255, 224, 196, 0.85)' : 'rgba(255, 255, 255, 0.95)';
    g.lineWidth = 2;
    g.stroke();

    const playInk = '#11141c';
    drawIcon(g, st.playing ? 'pause' : 'play', playCx, 114, 44, playInk);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = playInk;
    g.font = `600 28px ${UI_FONT}`;
    g.fillText(st.playing ? 'Pause' : 'Play', playCx, 178);

    // Previous / Next chapter glass buttons
    for (const [id, icon] of [['prevStage', 'prev'], ['nextStage', 'next']]) {
      drawPillButton(g, dockButtons[id], '', { hover: hoverDockId === id, icon, iconSize: 28, radius: 22 });
    }

    // Geological time / live eruption clock + stage title
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    const timeX = st.erupting ? 326 : 304;
    if (st.erupting) {
      g.beginPath();
      g.arc(310, 74, 6.5, 0, Math.PI * 2);
      g.fillStyle = '#ff8a3d';
      g.fill();
    }
    g.fillStyle = st.erupting ? '#ffbe8d' : 'rgba(205, 216, 232, 0.72)';
    g.font = `600 26px ${UI_FONT}`;
    g.fillText((st.erupting && st.clockText) || st.timeText || 'Geological time', timeX, 74, 510);

    g.fillStyle = '#ffffff';
    g.font = `600 44px ${UI_FONT}`;
    g.fillText(st.title || 'Jezero Crater', 304, 121, 534);

    // Clipped capsule timeline scrubber with subtle geological era spectrum
    const tl = dockButtons.timeline;
    const y = (tl.y0 + tl.y1) * 0.5;
    const len = tl.tx1 - tl.tx0;
    const trackH = 18;
    const trackR = trackH * 0.5;
    const tlHot = hoverDockId === 'timeline' || activeSlider?.id === 'timeline';
    const pClamped = clamp(st.p, 0, 1);

    g.save();
    rrect(g, tl.tx0, y - trackR, len, trackH, trackR);
    g.fillStyle = tlHot ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.10)';
    g.fill();
    g.clip();

    // Subtle geological era tinting along bottom edge of track
    g.globalAlpha = 0.34;
    for (let i = 0; i < stageBands.length; i++) {
      const b = stageBands[i];
      const bx0 = tl.tx0 + (b.p0 ?? b.anchor) * len;
      const bx1 = tl.tx0 + (b.p1 ?? (stageBands[i + 1]?.p0 ?? 1)) * len;
      if (bx1 > bx0) {
        g.fillStyle = b.c || '#8894a6';
        g.fillRect(bx0, y + trackR - 4.5, bx1 - bx0, 4.5);
      }
    }
    g.globalAlpha = 1;

    // Clipped progress capsule fill
    if (pClamped > 0.002) {
      const fillGrad = g.createLinearGradient(tl.tx0, 0, tl.tx0 + len, 0);
      if (st.erupting) {
        fillGrad.addColorStop(0, '#eef3fa');
        fillGrad.addColorStop(0.55, '#ffc18e');
        fillGrad.addColorStop(1, '#ff883c');
      } else {
        fillGrad.addColorStop(0, '#cfd9e8');
        fillGrad.addColorStop(1, '#ffffff');
      }
      g.fillStyle = fillGrad;
      rrect(g, tl.tx0, y - trackR, Math.max(trackH, len * pClamped), trackH, trackR);
      g.fill();
    }
    g.restore();

    // Track rim
    rrect(g, tl.tx0, y - trackR, len, trackH, trackR);
    g.strokeStyle = tlHot ? 'rgba(255, 255, 255, 0.38)' : 'rgba(255, 255, 255, 0.14)';
    g.lineWidth = 1.5;
    g.stroke();

    // Subtle chapter notches below the track
    for (let i = 1; i < stageBands.length; i++) {
      const b = stageBands[i];
      const x = tl.tx0 + b.p0 * len;
      const isEruptMark = b.phase === 'fountain' || b.phase === 'overflow';
      g.fillStyle = isEruptMark ? 'rgba(255, 148, 78, 0.78)' : 'rgba(218, 228, 242, 0.32)';
      rrect(g, x - 1.5, y + 14, 3, 7, 1.5);
      g.fill();
    }

    // Right-hand translucent glass tool tiles
    for (const [id, label, icon] of dockTools) {
      const r = dockButtons[id];
      const mid = (r.x0 + r.x1) * 0.5;
      const active = (id === 'drawerStages' && openDrawer === 'stages') || (id === 'drawerView' && openDrawer === 'view');
      const hov = hoverDockId === id;
      const isExit = id === 'exitVR';

      rrect(g, r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0, 24);
      if (isExit) {
        g.fillStyle = hov ? 'rgba(255, 86, 86, 0.30)' : 'rgba(255, 82, 82, 0.13)';
      } else if (active) {
        const ag = g.createLinearGradient(0, r.y0, 0, r.y1);
        ag.addColorStop(0, '#ffffff');
        ag.addColorStop(1, '#e1e8f2');
        g.fillStyle = ag;
      } else {
        g.fillStyle = hov ? 'rgba(255, 255, 255, 0.17)' : 'rgba(255, 255, 255, 0.07)';
      }
      g.fill();

      g.strokeStyle = isExit
        ? (hov ? 'rgba(255, 170, 170, 0.58)' : 'rgba(255, 138, 138, 0.28)')
        : active
          ? 'rgba(255, 255, 255, 0.96)'
          : hov
            ? 'rgba(255, 255, 255, 0.38)'
            : 'rgba(255, 255, 255, 0.13)';
      g.lineWidth = active || hov ? 2 : 1.5;
      g.stroke();

      const ink = isExit ? '#ffdede' : active ? '#11141c' : '#f0f4fa';
      drawIcon(g, icon, mid, 114, 38, ink);
      g.fillStyle = ink;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `500 26px ${UI_FONT}`;
      g.fillText(label, mid, 177);
    }

    // Footer status strip
    g.fillStyle = 'rgba(255, 255, 255, 0.10)';
    g.fillRect(32, 246, DOCK_W - 64, 1.5);

    // Subtle ember pip + wordmark
    g.beginPath();
    g.arc(48, 285, 5.5, 0, Math.PI * 2);
    g.fillStyle = st.erupting ? '#ff883c' : 'rgba(255, 152, 82, 0.78)';
    g.fill();

    g.fillStyle = 'rgba(240, 245, 252, 0.92)';
    g.font = `600 25px ${UI_FONT}`;
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText('JEZERO CRATER', 66, 286);

    g.fillStyle = 'rgba(202, 214, 230, 0.72)';
    g.font = `400 25px ${UI_FONT}`;
    g.fillText(deskHint(), 262, 286, 1120);

    // Right-aligned physical scale badge pill
    const sizeText = `${Math.round(holder.scale.x * MODEL_WIDTH * 100)} cm`;
    rrect(g, 1430, 263, 138, 44, 22);
    g.fillStyle = 'rgba(255, 255, 255, 0.08)';
    g.fill();
    g.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = '#eef3fa';
    g.textAlign = 'center';
    g.font = `600 24px ui-monospace, "SF Mono", Menlo, monospace`;
    g.fillText(sizeText, 1499, 286);

    dockTex.needsUpdate = true;
  }

  function drawDrawer(st) {
    if (!openDrawer) return;
    const g = drawerCtx;
    g.clearRect(0, 0, DRAWER_W, DRAWER_H);
    drawPanel(g, DRAWER_W, DRAWER_H, DRAWER_CORNER_PX);

    if (openDrawer === 'stages') {
      const byId = Object.fromEntries(DRAWER_STAGES_LAYOUT.map(x => [x.id, x]));
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = '#ffffff';
      g.font = `600 30px ${UI_FONT}`;
      g.fillText('Chapters', 44, 62);
      g.fillStyle = 'rgba(202, 214, 230, 0.62)';
      g.font = `500 25px ${UI_FONT}`;
      g.fillText('·   Playback speed', 194, 62);

      // Recessed segmented well behind speed pills
      rrect(g, 554, 22, 388, 80, 40);
      g.fillStyle = 'rgba(0, 0, 0, 0.28)';
      g.fill();
      g.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      g.lineWidth = 1.5;
      g.stroke();

      const curSpeed = getSpeed ? getSpeed() : (st.speed || 1);
      for (const [id, val, lbl] of [['speed05', 0.5, '0.5×'], ['speed1', 1, '1×'], ['speed2', 2, '2×'], ['speed4', 4, '4×']]) {
        drawPillButton(g, byId[id], lbl, {
          active: Math.abs(curSpeed - val) < 0.08,
          hover: hoverDrawerId === id,
          font: `600 24px ${UI_FONT}`,
          radius: 34,
        });
      }

      drawPillButton(g, byId.watchEruption, 'Watch History', {
        ember: true,
        hover: hoverDrawerId === 'watchEruption',
        icon: 'flame',
        iconSize: 18,
        font: `600 26px ${UI_FONT}`,
        radius: 36,
      });

      for (const pill of STAGE_PILLS) {
        const id = `stage:${pill.id}`;
        const r = byId[id];
        const act = st.phase === pill.id;
        const hov = hoverDrawerId === id;
        const w = r.x1 - r.x0;
        const h = r.y1 - r.y0;
        rrect(g, r.x0, r.y0, w, h, 26);
        if (act) {
          const ag = g.createLinearGradient(0, r.y0, 0, r.y1);
          ag.addColorStop(0, '#ffffff');
          ag.addColorStop(1, '#e1e8f2');
          g.fillStyle = ag;
        } else {
          g.fillStyle = hov ? 'rgba(255, 255, 255, 0.17)' : 'rgba(255, 255, 255, 0.07)';
        }
        g.fill();
        g.strokeStyle = act ? 'rgba(255, 255, 255, 0.96)' : hov ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.13)';
        g.lineWidth = act || hov ? 2 : 1.5;
        g.stroke();

        // Sleek geological era accent capsule
        rrect(g, r.x0 + 24, r.y0 + 22, 34, 7, 3.5);
        g.fillStyle = pill.c;
        g.fill();

        g.fillStyle = act ? '#11141c' : '#f6f8fc';
        g.font = `600 31px ${UI_FONT}`;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.fillText(pill.label, r.x0 + 24, r.y0 + 58);

        g.fillStyle = act ? 'rgba(17, 20, 28, 0.62)' : 'rgba(202, 214, 230, 0.68)';
        g.font = `500 23px ${UI_FONT}`;
        g.fillText(pill.sub, r.x0 + 24, r.y0 + 95);
      }
    } else if (openDrawer === 'view') {
      const byId = Object.fromEntries(DRAWER_VIEW_LAYOUT.map(x => [x.id, x]));
      const curScale = holder.scale.x;
      const yawDeg = normalizedYawDeg();
      const curExag = getExag ? getExag() : (st.exag || 1);
      const curLight = getLight ? getLight() : (st.light || 'day');
      const curGhost = getGhost ? getGhost() : !!st.ghost;

      // Clean two-tier row labels (caption + crisp tabular readout)
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const [caption, val, cy] of [
        ['SIZE', `${Math.round(MODEL_WIDTH * 100 * curScale)} cm`, 73],
        ['TURN', `${yawDeg}°`, 171],
        ['RELIEF', `${curExag.toFixed(1)}×`, 269],
      ]) {
        g.fillStyle = 'rgba(195, 208, 226, 0.62)';
        g.font = `600 18px ${UI_FONT}`;
        g.fillText(caption, 44, cy - 15);
        g.fillStyle = '#f6f8fc';
        g.font = `600 28px ui-monospace, "SF Mono", Menlo, monospace`;
        g.fillText(val, 44, cy + 14);
      }

      drawSlider(g, byId.scaleSlider, scaleToT(curScale), hoverDrawerId === 'scaleSlider' || activeSlider?.id === 'scaleSlider');
      drawPillButton(g, byId.scale05, '33 cm', { active: Math.abs(curScale - 0.5) < 0.06, hover: hoverDrawerId === 'scale05', radius: 34 });
      drawPillButton(g, byId.scale10, '65 cm', { active: Math.abs(curScale - 1.0) < 0.06, hover: hoverDrawerId === 'scale10', radius: 34 });
      drawPillButton(g, byId.scale20, '130 cm', { active: Math.abs(curScale - 2.0) < 0.08, hover: hoverDrawerId === 'scale20', radius: 34 });

      const rotNorm = (((0.5 + (homeYaw - holder.rotation.y) / (Math.PI * 2)) % 1) + 1) % 1;
      drawSlider(g, byId.rotSlider, rotNorm, hoverDrawerId === 'rotSlider' || activeSlider?.id === 'rotSlider');
      drawPillButton(g, byId.rotNorth, 'North · 0°', { active: yawDeg < 4 || yawDeg > 356, hover: hoverDrawerId === 'rotNorth', radius: 34 });

      drawSlider(g, byId.exagSlider, clamp((curExag - 1) / 3, 0, 1), hoverDrawerId === 'exagSlider' || activeSlider?.id === 'exagSlider');
      drawPillButton(g, byId.exag1, '1×', { active: Math.abs(curExag - 1.0) < 0.08, hover: hoverDrawerId === 'exag1', radius: 34 });
      drawPillButton(g, byId.exag15, '1.5×', { active: Math.abs(curExag - 1.5) < 0.08, hover: hoverDrawerId === 'exag15', radius: 34 });
      drawPillButton(g, byId.exag2, '2×', { active: Math.abs(curExag - 2.0) < 0.08, hover: hoverDrawerId === 'exag2', radius: 34 });
      drawPillButton(g, byId.exag3, '3×', { active: Math.abs(curExag - 3.0) < 0.08, hover: hoverDrawerId === 'exag3', radius: 34 });

      // Recessed segmented lighting tray
      rrect(g, 34, 324, 528, 78, 39);
      g.fillStyle = 'rgba(0, 0, 0, 0.28)';
      g.fill();
      g.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      g.lineWidth = 1.5;
      g.stroke();

      drawPillButton(g, byId.lightDay, 'Day', { active: curLight === 'day', hover: hoverDrawerId === 'lightDay', icon: 'sun', iconSize: 16, radius: 32 });
      drawPillButton(g, byId.lightDusk, 'Dusk', { active: curLight === 'dusk', hover: hoverDrawerId === 'lightDusk', icon: 'dusk', iconSize: 16, radius: 32 });
      drawPillButton(g, byId.lightNight, 'Night', { active: curLight === 'night', hover: hoverDrawerId === 'lightNight', icon: 'moon', iconSize: 16, radius: 32 });

      // Today's Rim toggle with genuine visual switch capsule
      const tg = byId.toggleGhost;
      const tgHov = hoverDrawerId === 'toggleGhost';
      rrect(g, tg.x0, tg.y0, tg.x1 - tg.x0, tg.y1 - tg.y0, 32);
      g.fillStyle = tgHov ? 'rgba(255, 255, 255, 0.18)' : curGhost ? 'rgba(255, 255, 255, 0.13)' : 'rgba(255, 255, 255, 0.075)';
      g.fill();
      g.strokeStyle = tgHov ? 'rgba(255, 255, 255, 0.42)' : curGhost ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.14)';
      g.lineWidth = tgHov || curGhost ? 2 : 1.5;
      g.stroke();
      g.fillStyle = '#f4f7fb';
      g.font = `500 25px ${UI_FONT}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText('Terrain Wireframe', tg.x0 + 28, (tg.y0 + tg.y1) * 0.5 + 1);

      // Pill switch on the right
      const swW = 68, swH = 38;
      const swX = tg.x1 - swW - 22;
      const swY = (tg.y0 + tg.y1 - swH) * 0.5;
      rrect(g, swX, swY, swW, swH, swH * 0.5);
      g.fillStyle = curGhost ? '#ff944d' : 'rgba(255, 255, 255, 0.18)';
      g.fill();
      g.beginPath();
      g.arc(curGhost ? swX + swW - swH * 0.5 : swX + swH * 0.5, swY + swH * 0.5, 14, 0, Math.PI * 2);
      g.fillStyle = '#ffffff';
      g.fill();

      drawPillButton(g, byId.resetView, 'Reset', { hover: hoverDrawerId === 'resetView', icon: 'reset', iconSize: 16, radius: 32 });
    }

    drawerTex.needsUpdate = true;
  }

  async function enter() {
    if (session) return;
    const token = ++generation;
    const s = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['local-floor'],
      optionalFeatures: ['hit-test', 'hand-tracking'],
    });
    session = s;
    savedCamera = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      near: camera.near,
      far: camera.far,
    };
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
    camera.near = 0.01;
    camera.far = 100;
    camera.updateProjectionMatrix();

    s.addEventListener('end', () => {
      generation++;
      session = null;
      if (savedCamera) {
        camera.position.copy(savedCamera.position);
        camera.quaternion.copy(savedCamera.quaternion);
        camera.near = savedCamera.near;
        camera.far = savedCamera.far;
        camera.updateProjectionMatrix();
      }
      const lm = lightModes?.[getLight?.() || 'day'];
      if (lm) renderer.toneMappingExposure = lm.exp;
      hitSource?.cancel();
      hitSource = null;
      space = null;
      clearManipulation();
      guide.visible = false;
      reticle.visible = false;
      holder.visible = false;
      uiRoot.visible = false;
      reliefRoot.visible = false;
      resizeBadge.visible = false;
      reticle.visible = false;
      cursorDot.visible = false;
      handPinchOrbs.forEach(o => { o.visible = false; });
      handJointInst.count = 0;
      handJointInst.visible = false;
      handBoneInst.count = 0;
      handBoneInst.visible = false;
      handPalmMeshes.forEach(m => { m.visible = false; });
      contacts.forEach(h => { h.jointTracked = false; });
      placed = false;
      openDrawer = null;
      drawerAnim = 0;
      dockUserYOffset = 0;
      dockUserDistOffset = 0;
      hoverDockId = null;
      hoverDrawerId = null;
      hoverCorner = -1;
      hoverRelief = false;
      hoverRing = false;
      hoverModel = false;
      hoverGrabBar = false;
      prevHoverSig = '';
      lastButtons.clear();
      document.body.classList.remove('in-xr');
      renderer.setClearColor(0x000000, 1);
    });

    s.addEventListener('visibilitychange', () => {
      if (s.visibilityState !== 'visible') clearManipulation();
    });
    renderer.xr.setReferenceSpaceType('local-floor');
    try {
      try { renderer.xr.setFramebufferScaleFactor?.(0.92); } catch {}
      await renderer.xr.setSession(s);
      try { renderer.xr.setFoveation?.(1.0); } catch {}
    } catch (error) {
      await s.end();
      throw error;
    }
    renderer.setClearColor(0x000000, 0);
    document.body.classList.add('in-xr');
    lastP = -1;
    lastBakedSeq = -1;
    lastBakedHeightKey = null;
    lastSmokeSeq = -1;
    lastGlowSeq = -1;
    lastLight = '';
    lastDockKey = '';
    lastDrawerKey = '';

    space = renderer.xr.getReferenceSpace();
    if (s.requestHitTestSource) {
      s.requestReferenceSpace('viewer')
        .then(viewer => token === generation ? s.requestHitTestSource({ space: viewer }) : null)
        .then(source => {
          if (token === generation) hitSource = source;
          else source?.cancel();
        })
        .catch(() => {}); // Manual placement stays available without surface detection.
    }
  }

  function update(frame, dt = 1 / 72) {
    if (!session) return;
    const st = state();

    if (st.light && st.light !== lastLight) {
      syncLighting(st.light);
    }

    // Re-bake terrain height & albedo caches when timeline/morph/lake/river state updates
    if (bakeTerrain) {
      const now = performance.now();
      const seq = st.seq ?? st.p;
      if (lastBakedSeq !== seq && (lastBakedSeq === -1 || !st.playing || now - lastBakeAt > 120)) {
        lastBakedSeq = seq;
        lastBakeAt = now;
        const m = uniforms.uMorph?.value;
        const hKey = [
          m ? `${m.x.toFixed(3)},${m.y.toFixed(3)},${m.z.toFixed(3)}` : '',
          uniforms.uLakeMola ? uniforms.uLakeMola.value.toFixed(1) : '',
          uniforms.uLakeActive ? uniforms.uLakeActive.value.toFixed(3) : '',
          uniforms.uRiverReach ? uniforms.uRiverReach.value.toFixed(3) : '',
          uniforms.uInletFlow ? uniforms.uInletFlow.value.toFixed(3) : '',
          uniforms.uPlivaFlow ? uniforms.uPlivaFlow.value.toFixed(3) : '',
          uniforms.uFlashFlood ? uniforms.uFlashFlood.value.toFixed(3) : '',
        ].join('|');
        const hDirty = lastBakedHeightKey === null || hKey !== lastBakedHeightKey;
        lastBakedHeightKey = hKey;
        bakeTerrain(hDirty);
      }
    }

    const eyeCam = renderer.xr.getCamera(camera);
    eyeCam.getWorldPosition(_camPosW);
    if (!placed) {
      const hits = frame && hitSource && space ? frame.getHitTestResults(hitSource) : [];
      let pose = null;
      for (const hit of hits) {
        const candidate = hit.getPose(space);
        if (candidate && isDeskSurface(candidate.transform.matrix)) { pose = candidate; break; }
      }
      reticle.visible = !!pose;
      guide.visible = true;
      if (pose) {
        const pos = pose.transform.position;
        reticle.position.set(pos.x, pos.y + 0.002, pos.z);
        reticle.rotation.y = Math.atan2(_camPosW.x - pos.x, _camPosW.z - pos.z);
        guide.position.copy(reticle.position);
        guide.position.y += 0.12;
      } else {
        eyeCam.getWorldDirection(_v);
        guide.position.copy(_camPosW).addScaledVector(_v, 0.62);
        guide.position.y -= 0.075;
      }
      drawGuide(pose ? 'surface' : 'manual');
      guide.lookAt(_camPosW);
    }

    let occJointCount = 0;
    let occBoneCount = 0;
    for (let i = 0; i < contacts.length; i++) {
      const c = controllers[i], contact = contacts[i], orb = handPinchOrbs[i], palmMesh = handPalmMeshes[i];
      const hand = c.userData.source?.hand;
      if (hand && space && frame?.getJointPose) {
        let trackedCount = 0;
        for (let j = 0; j < HAND_JOINTS.length; j++) {
          const js = hand.get(HAND_JOINTS[j]);
          const jp = js && frame.getJointPose(js, space);
          if (jp) {
            const p = jp.transform.position;
            handPosBuf[j].set(p.x, p.y, p.z);
            const rawR = jp.radius;
            handRadBuf[j] = Number.isFinite(rawR) && rawR > 0.002 ? clamp(rawR, 0.005, 0.034) : HAND_DEFAULT_RADII[j];
            handValidBuf[j] = 1;
            trackedCount++;
            const r = handRadBuf[j];
            _hScale.set(r, r, r);
            _hMat.compose(handPosBuf[j], _hIdentityQuat, _hScale);
            handJointInst.setMatrixAt(occJointCount++, _hMat);
          } else {
            handValidBuf[j] = 0;
          }
        }

        // Connect adjacent phalanges, metacarpals & knuckle bridges with depth-mask cylinders
        for (let b = 0; b < HAND_BONES.length; b++) {
          const [ia, ib] = HAND_BONES[b];
          if (!handValidBuf[ia] || !handValidBuf[ib]) continue;
          const pa = handPosBuf[ia], pb = handPosBuf[ib];
          _hDir.subVectors(pb, pa);
          const len = _hDir.length();
          if (len < 1e-4) continue;
          _hDir.multiplyScalar(1 / len);
          _hQuat.setFromUnitVectors(_up, _hDir);
          _hMid.addVectors(pa, pb).multiplyScalar(0.5);
          const r = (handRadBuf[ia] + handRadBuf[ib]) * 0.5;
          _hScale.set(r, len, r);
          _hMat.compose(_hMid, _hQuat, _hScale);
          handBoneInst.setMatrixAt(occBoneCount++, _hMat);
        }

        // Short wrist cuff extension behind the heel of the palm
        if (handValidBuf[0] && handValidBuf[10]) {
          _hDir.subVectors(handPosBuf[0], handPosBuf[10]);
          const dl = _hDir.length();
          if (dl > 1e-4) {
            _hDir.multiplyScalar(1 / dl);
            const cuffLen = 0.055;
            const cuffR = clamp(handRadBuf[0] * 1.06, 0.022, 0.036);
            _hQuat.setFromUnitVectors(_up, _hDir);
            _hMid.copy(handPosBuf[0]).addScaledVector(_hDir, cuffLen * 0.45);
            _hScale.set(cuffR, cuffLen, cuffR);
            _hMat.compose(_hMid, _hQuat, _hScale);
            handBoneInst.setMatrixAt(occBoneCount++, _hMat);
          }
        }

        // Solid anatomical palm hull so terrain & smoke never peek through the palm
        let palmOk = trackedCount >= 8;
        if (palmOk) {
          for (let k = 0; k < PALM_RING.length; k++) {
            if (!handValidBuf[PALM_RING[k]]) { palmOk = false; break; }
          }
        }
        if (palmOk) {
          _hEdgeA.subVectors(handPosBuf[6], handPosBuf[0]);
          _hEdgeB.subVectors(handPosBuf[21], handPosBuf[0]);
          _hNrm.crossVectors(_hEdgeA, _hEdgeB);
          const nLen = _hNrm.length();
          if (nLen > 1e-6) {
            _hNrm.multiplyScalar(1 / nLen);
            const halfThick = clamp((handRadBuf[10] || 0.012) * 0.90, 0.0085, 0.015);
            _hCenter.set(0, 0, 0);
            const n = PALM_RING.length;
            for (let k = 0; k < n; k++) _hCenter.add(handPosBuf[PALM_RING[k]]);
            _hCenter.multiplyScalar(1 / n);

            const attr = palmMesh.geometry.attributes.position;
            const arr = attr.array;
            const botOff = (n + 1) * 3;
            arr[0] = _hCenter.x + _hNrm.x * halfThick;
            arr[1] = _hCenter.y + _hNrm.y * halfThick;
            arr[2] = _hCenter.z + _hNrm.z * halfThick;
            arr[botOff] = _hCenter.x - _hNrm.x * halfThick;
            arr[botOff + 1] = _hCenter.y - _hNrm.y * halfThick;
            arr[botOff + 2] = _hCenter.z - _hNrm.z * halfThick;
            for (let k = 0; k < n; k++) {
              const p = handPosBuf[PALM_RING[k]];
              const topI = (1 + k) * 3;
              const botI = botOff + topI;
              arr[topI] = p.x + _hNrm.x * halfThick;
              arr[topI + 1] = p.y + _hNrm.y * halfThick;
              arr[topI + 2] = p.z + _hNrm.z * halfThick;
              arr[botI] = p.x - _hNrm.x * halfThick;
              arr[botI + 1] = p.y - _hNrm.y * halfThick;
              arr[botI + 2] = p.z - _hNrm.z * halfThick;
            }
            attr.needsUpdate = true;
            palmMesh.visible = true;
          } else {
            palmMesh.visible = false;
          }
        } else {
          palmMesh.visible = false;
        }

        // Reuse thumb-tip (4) and index-finger-tip (9) for pinch contact midpoint
        contact.jointTracked = !!(handValidBuf[4] && handValidBuf[9]);
        if (contact.jointTracked) {
          contact.joint.addVectors(handPosBuf[9], handPosBuf[4]).multiplyScalar(0.5);
          orb.position.copy(contact.joint);
        }
      } else {
        contact.jointTracked = false;
        palmMesh.visible = false;
      }
      orb.visible = placed && contact.jointTracked && (contact.mode === 'joint' || nearTerrain(contact.joint));
      if ((contact.mode && !contactPoint(i)) || (!c.visible &&
          (activeSlider?.controller === c || dockDrag?.controller === c || reliefDrag?.controller === c))) {
        c.userData.grab = false;
        c.userData.releaseSelect();
      }
    }
    handJointInst.count = occJointCount;
    handJointInst.visible = occJointCount > 0;
    if (occJointCount > 0) handJointInst.instanceMatrix.needsUpdate = true;
    handBoneInst.count = occBoneCount;
    handBoneInst.visible = occBoneCount > 0;
    if (occBoneCount > 0) handBoneInst.instanceMatrix.needsUpdate = true;

    const left = contacts[0], right = contacts[1];
    if (placed && left.mode && right.mode) {
      const a = left.point, b = right.point;
      const distance = Math.hypot(b.x - a.x, b.z - a.z);
      const mid = _v.copy(a).add(b).multiplyScalar(0.5);
      const angle = Math.atan2(b.x - a.x, b.z - a.z);
      ringDrag = cornerDrag = modelPanDrag = grab = null;
      if (distance < 0.045) {
        two = null;
      } else if (!two) {
        two = { mid: mid.clone(), distance, angle, scale: holder.scale.x,
          position: holder.position.clone(), yaw: holder.rotation.y };
      } else {
        applyDeskGesture(holder, two, mid, distance, angle);
      }
    } else {
      two = null;
      const held = left.mode ? left : right.mode ? right : null;
      if (placed && held && !ringDrag && !cornerDrag) {
        if (!modelPanDrag && grab?.contact !== held) {
          grab = { contact: held, startHit: held.point.clone(), startPos: holder.position.clone() };
        }
        const pan = modelPanDrag || grab;
        holder.position.copy(pan.startPos).add(held.point).sub(pan.startHit);
      } else grab = null;
    }

    // Dual thumbstick & button controls (zero per-frame array allocations)
    for (const source of session.inputSources) {
      const gp = source.gamepad;
      if (!gp) continue;
      let prev = lastButtons.get(source);
      if (!prev) { prev = [false, false]; lastButtons.set(source, prev); }
      const b4 = !!gp.buttons[4]?.pressed;
      const b5 = !!gp.buttons[5]?.pressed;
      if (placed && b4 && !prev[0]) togglePlay();
      if (placed && b5 && !prev[1]) handleAction('placeAgain');
      prev[0] = b4;
      prev[1] = b5;

      const ax = gp.axes.length >= 4 ? gp.axes[2] : (gp.axes[0] || 0);
      const ay = gp.axes.length >= 4 ? gp.axes[3] : (gp.axes[1] || 0);
      if (placed && !left.mode && !right.mode && !activeSlider && !dockDrag && !reliefDrag) {
        if (source.handedness === 'left') {
          if (Math.abs(ax) > 0.18) holder.rotation.y += ax * dt * 1.9;
          if (Math.abs(ay) > 0.18) holder.scale.setScalar(clampScale(holder.scale.x * Math.exp(-ay * dt * 1.1)));
        } else {
          if (Math.abs(ax) > 0.18) setTime(clamp(state().p + ax * dt * 0.24, 0, 1));
          if (Math.abs(ay) > 0.22 && setExag && getExag) setExag(clamp(getExag() - ay * dt * 1.4, 1, 4));
        }
      }
    }

    // Captured controls continue to track outside their initial hit targets.
    if (placed && activeSlider) {
      controllerRay(activeSlider.controller);
      const targetMesh = activeSlider.surface === 'drawer' ? drawerMesh : dockMesh;
      const physW = activeSlider.surface === 'drawer' ? drawerPhysW : dockPhysW;
      const canvW = activeSlider.surface === 'drawer' ? DRAWER_W : DOCK_W;
      const layout = activeSlider.surface === 'drawer'
        ? (openDrawer === 'stages' ? DRAWER_STAGES_LAYOUT : DRAWER_VIEW_LAYOUT)
        : DOCK_LAYOUT;
      const rect = layout.find(r => r.id === activeSlider.id);

      targetMesh.localToWorld(_v.set(0, 0, 0));
      targetMesh.localToWorld(_v2.set(0, 0, 1)).sub(_v).normalize();
      _plane.setFromNormalAndCoplanarPoint(_v2, _v);
      const contact = contacts[controllers.indexOf(activeSlider.controller)];
      const point = activeSlider.touch ? (contact.jointTracked && contact.joint) : raycaster.ray.intersectPlane(_plane, _hitW);
      if (!point && activeSlider.touch) activeSlider = null;
      if (rect && point) {
        _hitW.copy(point);
        targetMesh.worldToLocal(_hitW);
        const u = clamp(_hitW.x / physW + 0.5, 0, 1);
        const px = u * canvW;
        const t = clamp((px - rect.tx0) / Math.max(1, rect.tx1 - rect.tx0), 0, 1);
        applySlider(activeSlider.id, t, activeSlider.controller);
      }
    }

    if (placed && dockDrag) {
      controllerRay(dockDrag.controller);
      _hitW.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, dockDrag.startRayDist);
      const dy = _hitW.y - dockDrag.startPoint.y;
      const dr = (_hitW.x - dockDrag.startPoint.x) * Math.sin(homeYaw) + (_hitW.z - dockDrag.startPoint.z) * Math.cos(homeYaw);
      const lateral = (_hitW.x - dockDrag.startPoint.x) * Math.cos(homeYaw) - (_hitW.z - dockDrag.startPoint.z) * Math.sin(homeYaw);
      dockLateralOffset = clamp(dockDrag.startLateral + lateral, -0.55, 0.55);
      dockUserYOffset = clamp(dockDrag.startYOff + dy, -0.012, 0.28);
      dockUserDistOffset = clamp(dockDrag.startDistOff + dr, -0.14, 0.36);
    }

    if (placed && cornerDrag) {
      const pt = cornerDrag.contact.point;
      const distance = Math.hypot(pt.x - holder.position.x, pt.z - holder.position.z);
      holder.scale.setScalar(clampScale(cornerDrag.startScale * distance / cornerDrag.startDist));
    }

    if (placed && reliefDrag && setExag) {
      controllerRay(reliefDrag.controller);
      const xrCam = renderer.xr.getCamera(camera);
      _camPosW.setFromMatrixPosition(xrCam.matrixWorld);
      _v2.set(_camPosW.x - reliefRoot.position.x, 0, _camPosW.z - reliefRoot.position.z).normalize();
      _plane.setFromNormalAndCoplanarPoint(_v2, reliefRoot.position);
      if (raycaster.ray.intersectPlane(_plane, _hitW)) {
        const t = clamp((_hitW.y - reliefRoot.position.y) / reliefHeight, 0, 1);
        setExag(1 + t * 3);
      }
    }

    if (placed && ringDrag) {
      const pt = ringDrag.contact.point;
      holder.rotation.y = ringDrag.startYaw + Math.atan2(pt.x - holder.position.x, pt.z - holder.position.z) - ringDrag.startAngle;
    }

    // Hover feedback, micro-haptics & pearl cursor halo across controllers / hand rays
    hoverDockId = null;
    hoverDrawerId = null;
    hoverCorner = -1;
    hoverRelief = false;
    hoverRing = false;
    hoverModel = false;
    hoverGrabBar = false;
    cursorDot.visible = false;
    let hoveredCtrl = null;
    let hoveredKey = '';

    if (placed) {
      for (let i = 0; i < controllers.length; i++) {
        const c = controllers[i];
        if (!c.visible || !c.userData.source) continue;
        controllerRay(c);
        const target = pickTarget(i);
        const focused = target && (target.kind || target.hit);
        c.userData.line.scale.z = target ? raycaster.ray.origin.distanceTo(target.point) / 2 : 0.35;
        c.userData.line.visible = !target?.touch;
        c.userData.lineMat.color.setHex(focused ? 0xffffff : 0xd8e1ee);
        c.userData.lineMat.opacity = focused ? 0.68 : 0.20;
        if (!target) continue;
        if (target.surface && !cursorDot.visible) {
          dockPivot.worldToLocal(_v.copy(target.point));
          cursorDot.position.set(_v.x, _v.y, _v.z + 0.004);
          cursorDot.scale.setScalar(target.hit ? 1.25 : 0.9);
          cursorDot.visible = true;
          if (target.surface === 'dock') hoverDockId = target.hit?.id;
          else hoverDrawerId = target.hit?.id;
        } else if (target.kind === 'corner') hoverCorner = target.cornerIndex;
        else if (target.kind === 'ring') hoverRing = true;
        else if (target.kind === 'model') hoverModel = true;
        else if (target.kind === 'dockHandle') hoverGrabBar = true;
        else if (target.kind === 'relief') hoverRelief = true;
        if (focused && !hoveredCtrl) {
          hoveredCtrl = c;
          hoveredKey = target.hit?.id || target.kind;
        }
      }
    }

    if (hoveredKey !== prevHoverSig) {
      prevHoverSig = hoveredKey;
      if (hoveredKey && hoveredCtrl) pulseHaptic(hoveredCtrl, 0.14, 10);
    }

    // Update the parked console, drawer and manipulation feedback.
    const xrCam = renderer.xr.getCamera(camera);
    xrCam.updateMatrixWorld(true);
    _camPosW.setFromMatrixPosition(xrCam.matrixWorld);

    if (placed) {
      const sn = Math.sin(homeYaw), cs = Math.cos(homeYaw);
      uiRoot.position.set(
        dockHome.x + cs * dockLateralOffset + sn * dockUserDistOffset,
        dockHome.y + 0.066 + dockUserYOffset,
        dockHome.z - sn * dockLateralOffset + cs * dockUserDistOffset,
      );
      uiRoot.rotation.set(0, homeYaw, 0);

      // Highlight the grip while the console is being repositioned.
      const grabHot = hoverGrabBar || !!dockDrag;
      dockGrabPill.material.color.setHex(dockDrag ? 0xffa866 : 0xffffff);
      dockGrabPill.material.opacity = grabHot ? 0.96 : 0.44;
      dockGrabPill.scale.set(grabHot ? 1.12 : 1.0, grabHot ? 1.24 : 1.0, 1);
      dockGrabShadow.scale.set(grabHot ? 1.12 : 1.0, grabHot ? 1.24 : 1.0, 1);

      // Smooth 90 Hz 3D pearl-white timeline playhead orb aligned to DOCK_LAYOUT.timeline
      const tlRect = dockButtons.timeline;
      const tlPx = tlRect.tx0 + (tlRect.tx1 - tlRect.tx0) * clamp(st.p, 0, 1);
      const tlPy = (tlRect.y0 + tlRect.y1) * 0.5;
      timelinePlayhead.position.set(
        (tlPx / DOCK_W - 0.5) * dockPhysW,
        (0.5 - tlPy / DOCK_H) * dockPhysH,
        0.004,
      );
      const tlHot = hoverDockId === 'timeline' || activeSlider?.id === 'timeline';
      timelinePlayhead.scale.setScalar(tlHot ? 1.25 : 1.0);

      // Spring drawer open/close
      const targetDrawer = openDrawer ? 1 : 0;
      drawerAnim += (targetDrawer - drawerAnim) * (1 - Math.exp(-dt * 14));
      drawerPivot.visible = drawerAnim > 0.02;
      if (drawerPivot.visible) {
        drawerPivot.scale.setScalar(0.92 + 0.08 * drawerAnim);
        drawerPivot.position.y = dockPhysH * 0.5 + drawerPhysH * 0.5 + 0.006 + 0.008 * drawerAnim;
      }

      // Only show vertical relief rail when View sheet is open or dragging relief
      reliefRoot.visible = openDrawer === 'view' || !!reliefDrag;
      if (reliefRoot.visible) {
        const rightAngle = homeYaw + Math.PI * 0.44;
        const reliefR = Math.max(0.40, (TURNTABLE_R_OUTER + 0.025) * holder.scale.x) + 0.06;
        reliefRoot.position.set(
          holder.position.x + Math.sin(rightAngle) * reliefR,
          holder.position.y + 0.025,
          holder.position.z + Math.cos(rightAngle) * reliefR,
        );
        reliefRoot.rotation.set(0, homeYaw, 0);
        const curExag = getExag ? getExag() : (st.exag || 1);
        reliefOrb.position.y = clamp((curExag - 1) / 3, 0, 1) * reliefHeight;
        reliefOrb.scale.setScalar((hoverRelief || reliefDrag) ? 1.25 : 1.0);
        updateReliefLabel(curExag);
      }

      // Keep sculpted corner handles crisp and easy to acquire at every map scale.
      const invS = 1 / holder.scale.x;
      const modelAwake = !!grab || hoverModel || hoverRing || hoverCorner >= 0 || !!cornerDrag || !!ringDrag || !!modelPanDrag || !!two;
      const ringHot = hoverRing || !!ringDrag;
      for (let i = 0; i < cornerHandles.length; i++) {
        const ch = cornerHandles[i];
        const hot = hoverCorner === i || cornerDrag?.cornerIndex === i || !!two;
        ch.group.scale.setScalar(invS * (hot ? 1.18 : 1.0));
        ch.armMat.color.setHex(hot ? 0xffaa68 : 0xedf2fa);
        ch.armMat.opacity = hot ? 1.0 : modelAwake ? 0.86 : 0.62;
        ch.orb.material.color.setHex(hot ? 0xffe4cc : 0xffffff);
        ch.orb.material.opacity = hot ? 1.0 : modelAwake ? 0.90 : 0.72;
        ch.ring.material.color.setHex(hot ? 0xffa25e : 0xeef3fa);
        ch.ring.material.opacity = hot ? 0.85 : modelAwake ? 0.30 : 0.10;
      }

      if (two || cornerDrag || hoverCorner >= 0) {
        _v.set(holder.position.x, holder.position.y + 0.22 * holder.scale.x, holder.position.z);
        const s = holder.scale.x;
        updateBadge(resizeBadge, `Size · ${Math.round(s * MODEL_WIDTH * 100)} cm`, _v);
        resizeBadge.lookAt(_camPosW);
      } else if (ringDrag || hoverRing) {
        _v.set(holder.position.x, holder.position.y + 0.22 * holder.scale.x, holder.position.z);
        updateBadge(resizeBadge, `Rotate · ${normalizedYawDeg()}°`, _v);
        resizeBadge.lookAt(_camPosW);
      } else if (modelPanDrag || grab) {
        _v.set(holder.position.x, holder.position.y + 0.22 * holder.scale.x, holder.position.z);
        updateBadge(resizeBadge, `Move · ${Math.round(holder.scale.x * MODEL_WIDTH * 100)} cm`, _v);
        resizeBadge.lookAt(_camPosW);
      } else {
        resizeBadge.visible = false;
      }

      turntableRing.material.opacity = ringHot ? 1.0 : modelAwake ? 0.95 : 0.84;
      turntableBezelMat.color.setHex(ringDrag ? 0xff9e58 : hoverRing ? 0xffcf9e : 0xeef3fa);
      turntableBezelMat.opacity = ringDrag ? 0.95 : hoverRing ? 0.78 : modelAwake ? 0.36 : 0.22;
      plinthRimMat.opacity = modelAwake ? 0.38 : 0.16;
    }

    // Sync ghost wireframe, crater point light intensity & visibility
    const stNow = state();
    if (ghostMesh) {
      ghostMesh.visible = !!stNow.ghost;
      ghostMesh.scale.y = (stNow.exag || 1) * TABLETOP_RELIEF_BOOST;
    }

    const hotGlow = (stNow.erupting ? 1 : 0) * (stNow.hot ?? (stNow.phase === 'fountain' || stNow.phase === 'overflow' ? 1 : 0.4));
    const flicker = 0.85 + 0.15 * Math.sin(performance.now() * 0.011);
    craterGlow.value = hotGlow > 0.01 ? (0.35 + 0.95 * hotGlow) * flicker * (stNow.light === 'night' ? 1.6 : 1.0) : 0;

    // CPU terrain fallback when GPU shaders aren't supplied
    if (terrainColors && (Math.abs(stNow.p - lastP) > 0.001 || lastP < 0)) {
      lastP = stNow.p;
      const pos = terrainGeom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const h = height(x, z);
        pos.setY(i, h);
        const r = Math.hypot(x - cx, z - cz);
        const bare = stNow.active ? THREE.MathUtils.smoothstep(h, 950, 1200) * (1 - THREE.MathUtils.smoothstep(r, 2500, 6500)) : 0;
        terrainColors[i * 3] = 0.17 + bare * 0.17;
        terrainColors[i * 3 + 1] = 0.27 + bare * 0.045;
        terrainColors[i * 3 + 2] = 0.12 + bare * 0.17;
      }
      pos.needsUpdate = true;
      terrainGeom.attributes.color.needsUpdate = true;
      terrainGeom.computeVertexNormals();
    }

    // Pure orthonormal rotation matrix for world-space lighting normals (no scale float16 overflow)
    holder.updateMatrixWorld(true);
    _rotMat4.makeRotationFromQuaternion(holder.quaternion);
    tableNormalMat.value.setFromMatrix4(_rotMat4);

    if (tabletopEU && smoke?.upload && glow?.upload) {
      _invModel.copy(model.matrixWorld).invert();
      tabletopEU.uCamPosLocal.value.copy(_camPosW).applyMatrix4(_invModel);
      const me = xrCam.matrixWorld.elements;
      _vR.set(me[0], me[1], me[2]).normalize();
      _vU.set(me[4], me[5], me[6]).normalize();
      _vB.set(me[8], me[9], me[10]).normalize();
      _invModelRot.extractRotation(_invModel);
      tabletopEU.uCamRLocal.value.copy(_vR).applyMatrix4(_invModelRot).normalize();
      tabletopEU.uCamULocal.value.copy(_vU).applyMatrix4(_invModelRot).normalize();
      tabletopEU.uCamBLocal.value.copy(_vB).applyMatrix4(_invModelRot).normalize();
      _localFwd.copy(tabletopEU.uCamBLocal.value).negate();
      tabletopEU.uSunDirLocal.value.copy(sunDirWorld).applyMatrix4(_invModelRot).normalize();
      tabletopEU.uWorldScale.value = baseScale * holder.scale.x;

      const seq = stNow.seq ?? stNow.p;
      const angleDiff = _localFwd.dot(_lastSmokeFwd);
      if (lastSmokeSeq !== seq || angleDiff < 0.992) {
        lastSmokeSeq = seq;
        _lastSmokeFwd.copy(_localFwd);
        const thinFactor = smoke.upload(tabletopEU.uCamPosLocal.value, _localFwd, smokeUploadOpts) || 1;
        tabletopEU.uSmokeBoost.value = Math.min(2.05, 1.52 + 0.18 * Math.max(0, thinFactor - 1));
      }
      if (lastGlowSeq !== seq) {
        lastGlowSeq = seq;
        glow.upload();
      }
    }

    // Low-frequency dock redraw: 3D playhead handles 90 Hz motion; progress fill updates at ~120 steps
    const curSpd = getSpeed ? getSpeed() : (stNow.speed || 1);
    const dockKey = [
      Math.round(stNow.p * 120), deskHint(), Math.round(holder.scale.x * 65),
      stNow.phase,
      stNow.timeText || '',
      stNow.clockText || '',
      stNow.playing ? 1 : 0,
      stNow.erupting ? 1 : 0,
      openDrawer || '',
      hoverDockId || '',
      activeSlider?.surface === 'dock' ? activeSlider.id : '',
    ].join('|');
    const now = performance.now();
    if (placed && dockKey !== lastDockKey && (!lastDockKey || now - lastDockDraw >= 55)) {
      lastDockDraw = now;
      lastDockKey = dockKey;
      drawDock(stNow);
    }

    if (openDrawer) {
      const drawerKey = openDrawer === 'stages'
        ? [
          'stages',
          stNow.phase,
          stNow.playing ? 1 : 0,
          stNow.erupting ? 1 : 0,
          Math.round(curSpd * 100),
          hoverDrawerId || '',
        ].join('|')
        : [
          'view',
          Math.round(holder.scale.x * 100),
          normalizedYawDeg(),
          Math.round((getExag ? getExag() : (stNow.exag || 1)) * 20),
          stNow.light || 'day',
          stNow.ghost ? 1 : 0,
          hoverDrawerId || '',
          activeSlider?.surface === 'drawer' ? activeSlider.id : '',
        ].join('|');
      if (drawerKey !== lastDrawerKey) {
        lastDrawerKey = drawerKey;
        drawDrawer(stNow);
      }
    }
  }

  function renderPreview(cam) {
    const st = state();
    syncLighting(st.light || 'day');
    holder.visible = true;
    holder.position.set(0, 0, 0);
    holder.scale.setScalar(DESK_SCALE);
    holder.rotation.set(0, 0, 0);
    holder.updateMatrixWorld(true);
    _rotMat4.makeRotationFromQuaternion(holder.quaternion);
    tableNormalMat.value.setFromMatrix4(_rotMat4);
    if (bakeTerrain) bakeTerrain(true);
    renderer.render(scene, cam);
  }

  return {
    enter,
    update,
    renderPreview,
    scene,
    get active() { return !!session; },
  };
}
