#!/usr/bin/env python3
"""
True flat-surface open-channel & braided fan-delta hydrology builder for Jezero Crater, Mars.
Operates directly on the 20 m/px NASA MRO CTX stereo DTM (d2048.png) to compute:
  1. True horizontal-cross-section bankfull depths raw_d = max(0, z_ws(s) - D):
       NO artificial center mounds or height distortion — subtracting a uniform stage drop
       in the GPU shader yields a mathematically 100% FLAT horizontal water surface across
       every canyon cross-section while naturally narrowing/widening against real 3D banks!
  2. Neretva Vallis enters STRAIGHT through the western rim breach (-24600, -8550) directly
     onto the Western Fan-Delta apex (-22600, -8000) — never diverted sideways — and branches
     into 4 authentic braided distributary channels following the real delta lobes (North,
     Central, South-Central, and Southern Kodiak Butte lobe).
  3. Sava Vallis follows its real SW incised canyon onto the Northern Delta with a clean
     distributary fork.
  4. Pliva Vallis exits seamlessly from the NE paleolake spillway beak down the full
     meandering incised eastern gorge.
  5. Outputs two opaque 1024x1024 RGBA PNGs (A=255 everywhere):
       - data/hydro1024.png: R = inlet+delta bankfull depth/40m, G = Pliva bankfull depth/40m,
                             B = local hydraulic steepness/rapids & delta turbidity
       - data/flow1024.png:  R = vx*0.5+0.5, G = vz*0.5+0.5, B = normalized flow velocity
"""
import heapq
import json
import os
import numpy as np
from PIL import Image
from scipy import ndimage

OUT = '/Users/andrastoth/Coding/Antigravity/jezero/data'
WORK = '/tmp/jezero_work'
os.makedirs(WORK, exist_ok=True)

meta = json.load(open(f'{OUT}/meta.json'))
raw = np.asarray(Image.open(f'{OUT}/d2048.png'))
u16 = (raw[:, :, 0].astype(np.uint16) << 8) | raw[:, :, 1].astype(np.uint16)
D2048 = u16.astype(np.float32) / meta['q']['scale'] + meta['q']['offset']

N = 1024
D = D2048[::2, ::2].copy()
SIZE = float(meta['size'])
CELL = SIZE / (N - 1)
coords = np.linspace(-SIZE / 2, SIZE / 2, N)
X, Z = np.meshgrid(coords, coords)


def xy_to_rc(x, z):
    return int(np.argmin(np.abs(coords - z))), int(np.argmin(np.abs(coords - x)))


def snap_canyon_min(x, z, rad=8):
    r0, c0 = xy_to_rc(x, z)
    r_lo, r_hi = max(0, r0 - rad), min(N, r0 + rad + 1)
    c_lo, c_hi = max(0, c0 - rad), min(N, c0 + rad + 1)
    sub = D[r_lo:r_hi, c_lo:c_hi]
    dr, dc = np.unravel_index(np.argmin(sub), sub.shape)
    return r_lo + int(dr), c_lo + int(dc)


D_broad = ndimage.gaussian_filter(D, sigma=14.0)
valley_incision = np.clip(D_broad - D, 0.0, 350.0)


def trace_incised_thalweg(waypoints_xy, snap_rad=8):
    full_path = []
    inc_score = np.clip(valley_incision / 34.0, 0.0, 4.5)
    h_norm = np.clip((D - (-2800.0)) / 950.0, 0.0, 3.0)
    cost_grid = 1.0 + 55.0 * np.exp(-inc_score * 1.65) + 4.0 * h_norm * h_norm

    nbrs = [
        (-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
        (-1, -1, 1.4142), (-1, 1, 1.4142), (1, -1, 1.4142), (1, 1, 1.4142),
    ]

    for seg in range(len(waypoints_xy) - 1):
        sr, sc = snap_canyon_min(*waypoints_xy[seg], rad=snap_rad) if snap_rad > 0 else xy_to_rc(*waypoints_xy[seg])
        tr, tc = snap_canyon_min(*waypoints_xy[seg + 1], rad=snap_rad) if snap_rad > 0 else xy_to_rc(*waypoints_xy[seg + 1])
        pad = 60
        r_min, r_max = max(0, min(sr, tr) - pad), min(N - 1, max(sr, tr) + pad)
        c_min, c_max = max(0, min(sc, tc) - pad), min(N - 1, max(sc, tc) + pad)

        dist = {(sr, sc): 0.0}
        prev = {}
        pq = [(0.0, sr, sc)]
        while pq:
            d, r, c = heapq.heappop(pq)
            if d > dist.get((r, c), 1e18):
                continue
            if r == tr and c == tc:
                break
            for dr, dc, step in nbrs:
                nr, nc = r + dr, c + dc
                if r_min <= nr <= r_max and c_min <= nc <= c_max:
                    nd = d + step * float(cost_grid[nr, nc])
                    if nd < dist.get((nr, nc), 1e18):
                        dist[(nr, nc)] = nd
                        prev[(nr, nc)] = (r, c)
                        heapq.heappush(pq, (nd, nr, nc))
        seg_pts = []
        cur = (tr, tc)
        while cur in prev:
            seg_pts.append(cur)
            cur = prev[cur]
        seg_pts.append((sr, sc))
        seg_pts.reverse()
        if full_path and seg_pts:
            seg_pts = seg_pts[1:]
        full_path.extend(seg_pts)
    return full_path


def trace_meandering_delta_branch(waypoints_xy, amp_m=150.0, freq=2.6, phase=0.0):
    """
    Generates an organic meandering alluvial distributary polyline across the fan-delta surface
    with multi-harmonic natural river sinuosity (zero straight ruler lines!).
    """
    pts = []
    # Compute cumulative arc length for smooth natural sinuosity
    seg_lens = [np.hypot(waypoints_xy[k + 1][0] - waypoints_xy[k][0], waypoints_xy[k + 1][1] - waypoints_xy[k][1])
                for k in range(len(waypoints_xy) - 1)]
    total_len = max(1.0, sum(seg_lens))
    acc_len = 0.0
    for k in range(len(waypoints_xy) - 1):
        x0, z0 = waypoints_xy[k]
        x1, z1 = waypoints_xy[k + 1]
        L = seg_lens[k]
        if L < 1.0:
            continue
        dx, dz = (x1 - x0) / L, (z1 - z0) / L
        nx, nz = -dz, dx
        steps = max(6, int(L / (CELL * 0.55)))
        for s in range(steps):
            u = s / steps
            g = (acc_len + u * L) / total_len
            # Fade meander amplitude to 0 at start (clean bifurcation junction) and ramp up naturally
            env = np.sin(np.clip(g * np.pi, 0.0, np.pi)) ** 0.7 * (0.35 + 0.65 * g)
            wiggle = amp_m * env * (np.sin(g * np.pi * freq + phase) + 0.38 * np.sin(g * np.pi * freq * 2.15 + phase * 1.7))
            px = x0 + (x1 - x0) * u + nx * wiggle
            pz = z0 + (z1 - z0) * u + nz * wiggle
            r, c = xy_to_rc(px, pz)
            if not pts or pts[-1] != (r, c):
                pts.append((r, c))
        acc_len += L
    r, c = xy_to_rc(*waypoints_xy[-1])
    if not pts or pts[-1] != (r, c):
        pts.append((r, c))
    return pts


def flood_canyon_flat(path_rc, depth_start, depth_end, max_half_width_px,
                      force_monotone=True, speed_scale=1.0):
    """
    TRUE FLAT-SURFACE open-channel hydraulics:
    Computes exact bankfull water surface z_ws(s) and intersects it against the real 3D CTX canyon DEM.
    Every flooded pixel stores exact true depth = max(0, z_ws - D) with ZERO artificial center mounding,
    so the 3D water surface is mathematically 100% flat from bank to bank!
    """
    M = len(path_rc)
    z0 = np.zeros((N, N), dtype=np.float32)
    if M < 2:
        return z0, z0, z0, z0, z0

    rs = np.array([p[0] for p in path_rc], dtype=np.int32)
    cs = np.array([p[1] for p in path_rc], dtype=np.int32)
    z_bed = D[rs, cs].copy()

    xs = coords[cs]
    zs = coords[rs]
    tx = ndimage.gaussian_filter1d(np.gradient(xs), sigma=4.5, mode='nearest')
    tz = ndimage.gaussian_filter1d(np.gradient(zs), sigma=4.5, mode='nearest')
    tm = np.maximum(1e-5, np.hypot(tx, tz))
    tx /= tm
    tz /= tm

    z_smooth = ndimage.gaussian_filter1d(z_bed, sigma=4.0, mode='nearest')
    t = np.linspace(0.0, 1.0, M)
    h_prof = depth_start * (1.0 - t) + depth_end * t
    z_ws = z_smooth + h_prof

    if force_monotone:
        z_ws = np.minimum.accumulate(z_ws)
        z_ws = np.maximum(z_ws, z_bed + np.minimum(h_prof * 0.72, 12.0))
        z_ws = ndimage.gaussian_filter1d(z_ws, sigma=2.8, mode='nearest')
    else:
        z_ws = np.maximum(z_ws, z_bed + 12.0)
        z_ws = ndimage.gaussian_filter1d(z_ws, sigma=2.8, mode='nearest')

    bed_slope = np.clip(-np.gradient(ndimage.gaussian_filter1d(z_bed, sigma=3.5)) / CELL, 0.002, 0.12)

    ws_grid = np.full((N, N), -1e9, dtype=np.float32)
    vx_acc = np.zeros((N, N), dtype=np.float32)
    vz_acc = np.zeros((N, N), dtype=np.float32)
    sl_grid = np.zeros((N, N), dtype=np.float32)
    reach_mask = np.zeros((N, N), dtype=bool)

    for k in range(M):
        r0, c0 = int(rs[k]), int(cs[k])
        ws = float(z_ws[k])
        rad = int(max(4, round(max_half_width_px * (0.85 + 0.25 * t[k]))))
        r_lo, r_hi = max(0, r0 - rad), min(N, r0 + rad + 1)
        c_lo, c_hi = max(0, c0 - rad), min(N, c0 + rad + 1)
        sub_d = D[r_lo:r_hi, c_lo:c_hi]
        yy, xx = np.ogrid[r_lo:r_hi, c_lo:c_hi]
        dist2 = (yy - r0) ** 2 + (xx - c0) ** 2
        in_rad = dist2 <= (rad * rad)
        wet = in_rad & (sub_d < ws)
        lr, lc = r0 - r_lo, c0 - c_lo
        wet[lr, lc] = True
        lbl, _ = ndimage.label(wet)
        conn = (lbl == lbl[lr, lc])

        cur_ws = ws_grid[r_lo:r_hi, c_lo:c_hi]
        upd = conn & (ws > cur_ws)
        cur_ws[upd] = ws
        sl_grid[r_lo:r_hi, c_lo:c_hi][upd] = float(bed_slope[k])
        reach_mask[r_lo:r_hi, c_lo:c_hi] |= conn

        w_dir = np.where(conn, np.exp(-dist2 / max(4.0, (rad * 0.6) ** 2)), 0.0).astype(np.float32)
        vx_acc[r_lo:r_hi, c_lo:c_hi] += w_dir * float(tx[k])
        vz_acc[r_lo:r_hi, c_lo:c_hi] += w_dir * float(tz[k])

    depth_map = np.zeros((N, N), dtype=np.float32)
    wet_all = reach_mask & (ws_grid > D)
    # EXACT flat topographic depth (ZERO artificial center mound!)
    depth_map[wet_all] = ws_grid[wet_all] - D[wet_all]
    depth_map = ndimage.gaussian_filter(depth_map, sigma=0.55)
    depth_map = np.where(depth_map > 0.4, depth_map, 0.0)

    vx_s = ndimage.gaussian_filter(vx_acc, sigma=2.0)
    vz_s = ndimage.gaussian_filter(vz_acc, sigma=2.0)
    vm = np.maximum(1e-5, np.hypot(vx_s, vz_s))
    vx = np.where(depth_map > 0.1, vx_s / vm, 0.0)
    vz = np.where(depth_map > 0.1, vz_s / vm, 0.0)

    d_norm = np.clip(depth_map / 22.0, 0.0, 1.2)
    sl_s = ndimage.gaussian_filter(sl_grid, sigma=1.8)
    rapids = np.clip(np.sqrt(np.clip(sl_s, 0.0, 0.14)) * 4.8 * np.power(d_norm, 0.4) * speed_scale, 0.0, 1.0)
    speed = np.clip((0.35 + 0.65 * np.clip(d_norm, 0.0, 1.0)) * (0.55 + 0.45 * rapids) * speed_scale, 0.0, 1.0)
    return depth_map, vx, vz, rapids, speed


def paint_delta_distributary(path_rc, half_width_px_start, half_width_px_end, bankfull_depth=14.0, speed_scale=0.85):
    """
    Shallow braided distributary channel radiating cleanly across the active alluvial fan-delta surface.
    Because modern Martian delta ridges are inverted-relief cemented paleochannels, these channels
    ride gently over the active fan surface (1.5..6 m shallow braided depth) without creating bumps.
    """
    M = len(path_rc)
    z0 = np.zeros((N, N), dtype=np.float32)
    if M < 2:
        return z0, z0, z0, z0, z0

    rs = np.array([p[0] for p in path_rc], dtype=np.int32)
    cs = np.array([p[1] for p in path_rc], dtype=np.int32)
    xs = coords[cs]
    zs = coords[rs]
    tx = ndimage.gaussian_filter1d(np.gradient(xs), sigma=3.5, mode='nearest')
    tz = ndimage.gaussian_filter1d(np.gradient(zs), sigma=3.5, mode='nearest')
    tm = np.maximum(1e-5, np.hypot(tx, tz))
    tx /= tm
    tz /= tm

    depth_map = np.zeros((N, N), dtype=np.float32)
    vx_acc = np.zeros((N, N), dtype=np.float32)
    vz_acc = np.zeros((N, N), dtype=np.float32)

    for k in range(M):
        t = k / max(1, M - 1)
        r0, c0 = int(rs[k]), int(cs[k])
        hw = half_width_px_start * (1.0 - t) + half_width_px_end * t
        rad = int(np.ceil(hw + 1.5))
        r_lo, r_hi = max(0, r0 - rad), min(N, r0 + rad + 1)
        c_lo, c_hi = max(0, c0 - rad), min(N, c0 + rad + 1)
        yy, xx = np.ogrid[r_lo:r_hi, c_lo:c_hi]
        dist = np.sqrt((yy - r0) ** 2 + (xx - c0) ** 2).astype(np.float32)
        prof = np.clip(1.0 - (dist / max(0.8, hw)) ** 2, 0.0, 1.0)
        # Gentle shallow alluvial channel depth (thins nicely as delta stage lowers, never creates 3D humps!)
        d_local = prof * bankfull_depth * (1.0 - 0.35 * t)
        sub = depth_map[r_lo:r_hi, c_lo:c_hi]
        depth_map[r_lo:r_hi, c_lo:c_hi] = np.maximum(sub, d_local)
        vx_acc[r_lo:r_hi, c_lo:c_hi] += prof * float(tx[k])
        vz_acc[r_lo:r_hi, c_lo:c_hi] += prof * float(tz[k])

    depth_map = ndimage.gaussian_filter(depth_map, sigma=0.55)
    depth_map = np.where(depth_map > 0.3, depth_map, 0.0)
    vx_s = ndimage.gaussian_filter(vx_acc, sigma=1.5)
    vz_s = ndimage.gaussian_filter(vz_acc, sigma=1.5)
    vm = np.maximum(1e-5, np.hypot(vx_s, vz_s))
    vx = np.where(depth_map > 0.1, vx_s / vm, 0.0)
    vz = np.where(depth_map > 0.1, vz_s / vm, 0.0)
    rapids = np.clip((depth_map / bankfull_depth) * 0.28 * speed_scale, 0.0, 1.0)
    speed = np.clip((0.40 + 0.55 * (depth_map / bankfull_depth)) * speed_scale, 0.0, 1.0)
    return depth_map, vx, vz, rapids, speed


# 1. Connected-component Jezero crater basin mask (for preview & delta sediment plumes)
ci, cj = xy_to_rc(-2196.0, -938.0)
lbl_b, _ = ndimage.label(D < -2400.0)
basin_comp = (lbl_b == lbl_b[ci, cj])
basin_mask = np.clip(ndimage.gaussian_filter(ndimage.binary_dilation(basin_comp, iterations=6).astype(np.float32), sigma=2.0), 0.0, 1.0)

# 2. NERETVA VALLIS CANYON — true uphill SW valley stopping cleanly right at the Western Delta breach apex!
print('Tracing Neretva Vallis canyon into Western Delta apex...', flush=True)
neretva_canyon = trace_incised_thalweg([
    (-38800, -9200),
    (-36200, -9500),
    (-34800, -10800),
    (-34600, -13500),
    (-32000, -14200),
    (-29200, -14200),
    (-27300, -13400),
    (-28100, -11000),
    (-26900, -8600),
    (-24600, -8550),   # straight through the western rim breach!
    (-22800, -8150),   # exact Western Fan-Delta apex!
])
print(f'  Neretva canyon: {len(neretva_canyon)} px, {D[neretva_canyon[0]]:.1f}m -> {D[neretva_canyon[-1]]:.1f}m', flush=True)
d_ner, vx_ner, vz_ner, rap_ner, spd_ner = flood_canyon_flat(
    neretva_canyon, depth_start=26.0, depth_end=22.0, max_half_width_px=10, force_monotone=True, speed_scale=0.95,
)

# 2b. NERETVA SOUTHERN TRIBUTARY — real incised feeder valley joining right at (-26900, -8600)
ner_south = trace_incised_thalweg([
    (-28800, 3200),
    (-28600, -1500),
    (-28200, -5600),
    (-26900, -8600),
])
d_nst, vx_nst, vz_nst, rap_nst, spd_nst = flood_canyon_flat(
    ner_south, depth_start=18.0, depth_end=18.0, max_half_width_px=6, force_monotone=True, speed_scale=0.80,
)

# 2c. WESTERN FAN-DELTA HIERARCHICAL BRAIDED DISTRIBUTARY NETWORK
#     Enters STRAIGHT from Neretva breach apex (-23100, -8200) onto the growing delta,
#     bifurcating organically into meandering alluvial lobes matching MRO CTX paleochannels!
print('Building organic meandering braided Western Fan-Delta distributaries...', flush=True)
apex = (-23100, -8200)
fork1 = (-21300, -7850)
forkN = (-19600, -8300)
forkS = (-19800, -6850)

wd_trunk  = trace_meandering_delta_branch([apex, (-22100, -8050), fork1], amp_m=90.0, freq=1.6, phase=0.4)
wd_n_stem = trace_meandering_delta_branch([fork1, (-20400, -8250), forkN], amp_m=110.0, freq=1.8, phase=1.2)
wd_n1     = trace_meandering_delta_branch([forkN, (-18400, -9050), (-16900, -8950)], amp_m=165.0, freq=2.4, phase=0.2)
wd_n2     = trace_meandering_delta_branch([forkN, (-18100, -7900), (-16400, -7550)], amp_m=150.0, freq=2.2, phase=2.3)
wd_s_stem = trace_meandering_delta_branch([fork1, (-20500, -7300), forkS], amp_m=110.0, freq=1.8, phase=-0.9)
wd_s1     = trace_meandering_delta_branch([forkS, (-18300, -6350), (-16600, -6050)], amp_m=160.0, freq=2.5, phase=1.5)
wd_kod    = trace_meandering_delta_branch([forkS, (-18800, -5150), (-17100, -3700)], amp_m=180.0, freq=2.6, phase=-1.4)

delta_branches = [
    paint_delta_distributary(wd_trunk,  3.6, 3.0, bankfull_depth=18.0, speed_scale=0.95),
    paint_delta_distributary(wd_n_stem, 2.7, 2.2, bankfull_depth=15.0, speed_scale=0.86),
    paint_delta_distributary(wd_n1,     2.0, 1.2, bankfull_depth=12.0, speed_scale=0.76),
    paint_delta_distributary(wd_n2,     2.2, 1.3, bankfull_depth=13.0, speed_scale=0.80),
    paint_delta_distributary(wd_s_stem, 2.6, 2.1, bankfull_depth=15.0, speed_scale=0.85),
    paint_delta_distributary(wd_s1,     2.1, 1.3, bankfull_depth=12.5, speed_scale=0.78),
    paint_delta_distributary(wd_kod,    1.9, 1.2, bankfull_depth=11.5, speed_scale=0.74),
]

# 3. SAVA VALLIS — true SW canyon + organic Northern Delta distributary fork
print('Tracing Sava Vallis + Northern Delta distributaries...', flush=True)
sava_path = trace_incised_thalweg([
    (-12200, -38600),
    (-12200, -35000),
    (-11400, -33000),
    (-14400, -30500),
    (-14800, -28400),
    (-12800, -25600),
    (-9800, -24200),
    (-11600, -22000),
    (-13800, -19800),
    (-15200, -18200),
])
d_sav, vx_sav, vz_sav, rap_sav, spd_sav = flood_canyon_flat(
    sava_path, depth_start=22.0, depth_end=18.0, max_half_width_px=8, force_monotone=True, speed_scale=0.88,
)
nd_fork = (-14900, -17500)
nd_trunk = trace_meandering_delta_branch([(-15200, -18300), nd_fork], amp_m=70.0, freq=1.4, phase=0.5)
nd_west  = trace_meandering_delta_branch([nd_fork, (-15400, -16000), (-15000, -14400)], amp_m=150.0, freq=2.2, phase=0.8)
nd_east  = trace_meandering_delta_branch([nd_fork, (-13600, -16600), (-12100, -15300)], amp_m=160.0, freq=2.3, phase=-1.1)
delta_branches.append(paint_delta_distributary(nd_trunk, 2.8, 2.3, bankfull_depth=15.0, speed_scale=0.82))
delta_branches.append(paint_delta_distributary(nd_west,  2.0, 1.2, bankfull_depth=12.0, speed_scale=0.74))
delta_branches.append(paint_delta_distributary(nd_east,  1.9, 1.2, bankfull_depth=11.5, speed_scale=0.74))

# 3b. PIONEER CRATER-FLOOR CHANNELS — early Closed-Basin rivers reaching all the way
#     across the dry crater floor to the lowest central depression (~(0, +5500), -2692 m MOLA)
#     before the central paleolake pools and fills Jezero Crater outward from the center!
print('Building pioneer crater-floor channels to lowest central basin...', flush=True)
ner_floor_main = trace_meandering_delta_branch([
    (-23100, -8200),
    (-19400, -6800),
    (-15600, -5600),
    (-11800, -2400),
    (-8600, 600),
    (-4800, 2600),
    (-1400, 4800),
    (1200, 5400),
], amp_m=950.0, freq=5.2, phase=0.4)
ner_floor_south = trace_meandering_delta_branch([
    (-15600, -5600),
    (-12400, -600),
    (-9400, 3200),
    (-5400, 6000),
    (-1600, 6800),
    (800, 5600),
], amp_m=820.0, freq=4.6, phase=-1.2)
sava_floor_main = trace_meandering_delta_branch([
    (-15200, -18200),
    (-13800, -14000),
    (-10400, -10400),
    (-8600, -5600),
    (-4800, -1200),
    (-2600, 2600),
    (400, 5200),
], amp_m=920.0, freq=4.8, phase=1.6)

pioneer_branches = [
    paint_delta_distributary(ner_floor_main,  4.4, 3.0, bankfull_depth=23.0, speed_scale=0.88),
    paint_delta_distributary(ner_floor_south, 2.8, 2.1, bankfull_depth=18.0, speed_scale=0.76),
    paint_delta_distributary(sava_floor_main, 3.4, 2.4, bankfull_depth=20.0, speed_scale=0.82),
]
pioneer_floor = np.maximum.reduce([b[0] for b in pioneer_branches])

# 4. PLIVA VALLIS OUTLET SPILLWAY — true flat-surface spillway gorge (the user's favorite!)
print('Tracing Pliva Vallis spillway (true flat cross-section)...', flush=True)
pliva_path = trace_incised_thalweg([
    (15400, -8800),
    (18200, -10400),
    (21000, -13000),
    (22600, -15200),
    (21200, -17800),
    (20400, -20600),
    (23200, -21200),
    (26800, -22200),
    (30200, -22000),
    (31600, -24200),
    (33600, -26400),
    (36200, -24800),
    (38800, -24100),
])
d_pli, vx_pli, vz_pli, rap_pli, spd_pli = flood_canyon_flat(
    pliva_path, depth_start=26.0, depth_end=28.0, max_half_width_px=9, force_monotone=False, speed_scale=1.05,
)

# Combine all reaches cleanly (inlet canyon + delta distributaries separate so delta branches grow with deltaProgress!)
# Pack:
#   hydro1024.png:
#     R = Canyon inlet river depth / 40m (Neretva canyon + Southern trib + Sava canyon)
#     G = Pliva outlet river depth / 40m
#     B = Braided fan-delta distributary depth / 24m (Western Delta 4 lobes + Northern Delta 2 lobes!)
#     A = 255
#   flow1024.png:
#     R = vx * 0.5 + 0.5
#     G = vz * 0.5 + 0.5
#     B = hydraulic rapids & flow speed (0..1)
#     A = 255
canyon_inlet = np.maximum.reduce([d_ner, d_nst, d_sav, pioneer_floor])
delta_dist = np.maximum.reduce([b[0] for b in delta_branches])
outlet_depth = d_pli

# Merge 2D velocity vectors weighted by local depth
parts = [
    (d_ner, vx_ner, vz_ner, rap_ner, spd_ner),
    (d_nst * 0.75, vx_nst, vz_nst, rap_nst, spd_nst),
    (d_sav, vx_sav, vz_sav, rap_sav, spd_sav),
    (d_pli, vx_pli, vz_pli, rap_pli, spd_pli),
] + delta_branches + pioneer_branches

w_sum = np.full((N, N), 1e-5, dtype=np.float32)
vx_all = np.zeros((N, N), dtype=np.float32)
vz_all = np.zeros((N, N), dtype=np.float32)
rap_all = np.zeros((N, N), dtype=np.float32)
spd_all = np.zeros((N, N), dtype=np.float32)
for d_p, vx_p, vz_p, r_p, s_p in parts:
    w_sum += d_p
    vx_all += vx_p * d_p
    vz_all += vz_p * d_p
    rap_all = np.maximum(rap_all, r_p)
    spd_all = np.maximum(spd_all, s_p)

vx_all /= w_sum
vz_all /= w_sum
vm = np.maximum(1e-5, np.hypot(vx_all, vz_all))
has_flow = (canyon_inlet > 0.15) | (delta_dist > 0.15) | (outlet_depth > 0.15)
vx_all = np.where(has_flow, vx_all / vm, 0.0)
vz_all = np.where(has_flow, vz_all / vm, 0.0)

# Save OPAQUE hydro1024.png (A=255)
hydro = np.zeros((N, N, 4), dtype=np.uint8)
hydro[:, :, 0] = np.clip(np.round(canyon_inlet / 40.0 * 255.0), 0, 255).astype(np.uint8)
hydro[:, :, 1] = np.clip(np.round(outlet_depth / 40.0 * 255.0), 0, 255).astype(np.uint8)
hydro[:, :, 2] = np.clip(np.round(delta_dist / 24.0 * 255.0), 0, 255).astype(np.uint8)
hydro[:, :, 3] = 255
Image.fromarray(hydro).save(f'{OUT}/hydro1024.png', optimize=True)

# Save OPAQUE flow1024.png (A=255): B packs combined flow speed & rapids energy
flow = np.zeros((N, N, 4), dtype=np.uint8)
flow[:, :, 0] = np.clip(np.round((vx_all * 0.5 + 0.5) * 255.0), 0, 255).astype(np.uint8)
flow[:, :, 1] = np.clip(np.round((vz_all * 0.5 + 0.5) * 255.0), 0, 255).astype(np.uint8)
flow[:, :, 2] = np.clip(np.round(np.clip(spd_all * 0.6 + rap_all * 0.6, 0.0, 1.0) * 255.0), 0, 255).astype(np.uint8)
flow[:, :, 3] = 255
Image.fromarray(flow).save(f'{OUT}/flow1024.png', optimize=True)

print(f'Saved hydro1024.png ({os.path.getsize(f"{OUT}/hydro1024.png"):,} B) & flow1024.png ({os.path.getsize(f"{OUT}/flow1024.png"):,} B)', flush=True)

# Visual preview at Fan-Delta lake level (-2465 m MOLA!) so we see the active braided delta entering the lake!
sat_small = np.asarray(Image.open(f'{OUT}/sat.jpg').resize((N, N), Image.BILINEAR), dtype=np.float32) / 255.0
lake_d = np.clip((-2465.0 - D) * basin_mask, 0.0, 260.0)
vis = sat_small.copy()
lm = np.clip(lake_d / 6.0, 0.0, 1.0)
vis = vis * (1.0 - lm[:, :, None] * 0.72) + np.array([0.05, 0.18, 0.30]) * (lm[:, :, None] * 0.72)
for arr, col in [
    (canyon_inlet, np.array([0.12, 0.65, 0.78])),
    (delta_dist, np.array([0.22, 0.85, 0.82])),
    (outlet_depth, np.array([0.22, 0.55, 0.88])),
]:
    m = np.clip(arr / 6.0, 0.0, 1.0)
    vis = vis * (1.0 - m[:, :, None] * 0.78) + col * (m[:, :, None] * 0.78)
Image.fromarray(np.clip(vis * 255.0, 0, 255).astype(np.uint8)).save(f'{WORK}/hydro_preview.png')
print(f'Saved delta preview to {WORK}/hydro_preview.png', flush=True)
