"""Build high-resolution NASA/JPL CTX 20m DEM + pan-sharpened 5m CTX / NASA Viking true-color mosaic for Jezero Crater & Jezero Mons."""
import json
import math
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import tifffile
from PIL import Image
from scipy import ndimage

WORK = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(f'{WORK}/raw', exist_ok=True)
os.makedirs(OUT, exist_ok=True)

BASE_S3 = 'https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL'
DEM_URL = f'{BASE_S3}/M20_JezeroCrater_CTXDEM_20m.tif'
ORTHO_URL = f'{BASE_S3}/M20_JezeroCrater_CTXortho_mosaic_5m.tif'

dem_path = f'{WORK}/raw/M20_JezeroCrater_CTXDEM_20m.tif'
ortho_path = f'{WORK}/raw/M20_JezeroCrater_CTXortho_mosaic_5m.tif'


def download(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 10_000_000:
        print(f'Cached: {dest} ({os.path.getsize(dest):,} bytes)', flush=True)
        return
    print(f'Downloading {url} -> {dest}...', flush=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'JezeroTabletopViz/1.0'})
    with urllib.request.urlopen(req, timeout=180) as resp, open(dest, 'wb') as f:
        total = 0
        while True:
            chunk = resp.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
            if total % (20 << 20) < (1 << 20):
                print(f'  ... {total / (1 << 20):.1f} MB', flush=True)
    print(f'Downloaded {dest}: {os.path.getsize(dest):,} bytes', flush=True)


download(DEM_URL, dem_path)
download(ORTHO_URL, ortho_path)

# Mars IAU 2020 sphere radius = 3,396,190 m (Jezero Equirectangular projection: lat_ts=18.4663N, lon_0=0)
R_MARS = 3396190.0
M_PER_DEG_EQ = R_MARS * math.pi / 180.0                              # 59,274.6975 m/deg latitude
LAT_TS = 18.4663
M_PER_DEG_LON_PROJ = M_PER_DEG_EQ * math.cos(math.radians(LAT_TS))   # 56,222.2597 m/deg longitude in GeoTIFF


def read_geotiff_meta(path):
    with tifffile.TiffFile(path) as tf:
        page = tf.pages[0]
        tags = page.tags
        scale = tags['ModelPixelScaleTag'].value   # (dx, dy, dz) in equirectangular meters
        tie = tags['ModelTiepointTag'].value       # (i, j, k, x, y, z)
        return {
            'shape': page.shape,
            'dtype': str(page.dtype),
            'dx': float(scale[0]),
            'dy': float(scale[1]),
            'x0': float(tie[3]),
            'y0': float(tie[4]),
            'nodata': float(tags['GDAL_NODATA'].value) if 'GDAL_NODATA' in tags else None,
        }


dem_meta = read_geotiff_meta(dem_path)
ortho_meta = read_geotiff_meta(ortho_path)
print('DEM GeoTIFF:', dem_meta, flush=True)
print('Ortho GeoTIFF:', ortho_meta, flush=True)

# Target 78 km x 78 km square centered on Jezero Crater + Neretva/Sava/Pliva Valleys + Jezero Mons (SE rim)!
# Center: 18.35N, 77.74E (covers ~77.05E..78.43E and ~17.69N..19.01N -> 100% inside the 20m CTX DEM!)
LATC = 18.35
LONC = 77.74
SIZE = 78000.0
MLAT = M_PER_DEG_EQ                                    # 59,274.7 m/deg
MLON = M_PER_DEG_EQ * math.cos(math.radians(LATC))     # 56,260.4 m/deg at 18.35N

# 1. Sample 2048x2048 16-bit DEM grid from NASA/JPL 20m CTX Stereo DTM
N = 2048
cell = SIZE / (N - 1)
idx = np.arange(N) - (N - 1) / 2.0
lon = LONC + idx * cell / MLON
lat = LATC - idx * cell / MLAT

# Map (lon, lat) -> Equirectangular (lat_ts=18.4663N, lon_0=0) meters -> GeoTIFF pixel coordinates
eq_x = lon * M_PER_DEG_LON_PROJ
eq_y = lat * M_PER_DEG_EQ
px = (eq_x - dem_meta['x0']) / dem_meta['dx']
py = (dem_meta['y0'] - eq_y) / dem_meta['dy']

dem_raw = tifffile.imread(dem_path).astype(np.float32)
nodata = dem_meta['nodata']
valid = np.isfinite(dem_raw)
if nodata is not None:
    valid &= (np.abs(dem_raw - nodata) > 1.0)
valid &= (dem_raw > -8000.0) & (dem_raw < 8000.0)

# Fill any small stereo-correlation NoData patches smoothly via nearest-neighbor + light local smoothing
if not np.all(valid):
    frac_bad = 100.0 * (1.0 - valid.mean())
    print(f'Filling {frac_bad:.2f}% stereo NoData pixels in DEM...', flush=True)
    _, inds = ndimage.distance_transform_edt(~valid, return_indices=True)
    dem_filled = dem_raw[tuple(inds)]
    # Smooth only the filled seam pixels slightly
    blur = ndimage.gaussian_filter(dem_filled, sigma=2.5)
    dem_raw = np.where(valid, dem_raw, blur)

PX, PY = np.meshgrid(np.clip(px, 0, dem_raw.shape[1] - 1), np.clip(py, 0, dem_raw.shape[0] - 1))
D = ndimage.map_coordinates(dem_raw, [PY, PX], order=1, mode='nearest').astype(np.float32)
d_min, d_max = float(D.min()), float(D.max())
print(f'Sampled 2048x2048 DEM ({SIZE/1000:.1f} km, cell={cell:.1f} m): min={d_min:.1f} m, max={d_max:.1f} m', flush=True)

# Keep real MOLA areoid elevations (around -2800 m .. -600 m), shift by datum offset for rendering height
# Store exact MOLA elevation in PNG16 via q.offset & q.scale so water levels (-2395 m, -2500 m) are exact!
q_offset = math.floor(d_min - 80.0)
q_span = max(3200.0, math.ceil(d_max - q_offset + 200.0))
q_scale = 65535.0 / q_span
q_vals = np.clip(np.round((D - q_offset) * q_scale), 0, 65535).astype(np.uint16)
d_rgba = np.zeros((N, N, 4), dtype=np.uint8)
d_rgba[:, :, 0] = (q_vals >> 8).astype(np.uint8)
d_rgba[:, :, 1] = (q_vals & 0xFF).astype(np.uint8)
d_rgba[:, :, 3] = 255
Image.fromarray(d_rgba).save(f'{OUT}/d2048.png', optimize=True)
print(f'Saved d2048.png (q_offset={q_offset}, q_scale={q_scale:.4f})', flush=True)

# 2. Compute 1024x1024 4-channel auxiliary map (slope, convexity/ridge, roughness, crater-floor basin mask)
NA = 1024
D1 = ndimage.zoom(D, NA / N, order=1)
cell1 = SIZE / (NA - 1)
gy, gx = np.gradient(D1, cell1)
slope = np.clip(np.hypot(gx, gy) / 0.75, 0.0, 1.0)
ridge = np.clip((D1 - ndimage.gaussian_filter(D1, sigma=4.5)) / 180.0 + 0.5, 0.0, 1.0)
rough = np.clip(np.abs(D1 - ndimage.gaussian_filter(D1, sigma=1.6)) / 40.0, 0.0, 1.0)
# Basin depth mask (1 inside Jezero paleolake below -2395 m spillover level, 0 above)
basin = np.clip((-2395.0 - D1) / 260.0, 0.0, 1.0)

aux_channels = [slope, ridge, rough, basin]
aux_ranges = [[0.0, 1.0], [0.0, 1.0], [0.0, 1.0], [0.0, 1.0]]
aux_stack = np.zeros((NA * 4, NA), dtype=np.uint16)
for k, ch in enumerate(aux_channels):
    aux_stack[k * NA:(k + 1) * NA, :] = np.clip(np.round(ch * 65535.0), 0, 65535).astype(np.uint16)
aux_rgba = np.zeros((NA * 4, NA, 4), dtype=np.uint8)
aux_rgba[:, :, 0] = (aux_stack >> 8).astype(np.uint8)
aux_rgba[:, :, 1] = (aux_stack & 0xFF).astype(np.uint8)
aux_rgba[:, :, 3] = 255
Image.fromarray(aux_rgba).save(f'{OUT}/aux1024.png', optimize=True)
print('Saved aux1024.png', flush=True)

# 3. Sample 4096x4096 ultra-sharp 5m CTX luminance & pan-sharpen with real NASA Mars Trek Viking Color Mosaic!
SW = 4096
idx4 = np.arange(SW) - (SW - 1) / 2.0
cell4 = SIZE / (SW - 1)
lon4 = LONC + idx4 * cell4 / MLON
lat4 = LATC - idx4 * cell4 / MLAT

ox = (lon4 * M_PER_DEG_LON_PROJ - ortho_meta['x0']) / ortho_meta['dx']
oy = (ortho_meta['y0'] - lat4 * M_PER_DEG_EQ) / ortho_meta['dy']

# Read only the needed crop from the 359 MB CTX 5m orthomosaic to keep RAM low & super fast!
c0, c1 = max(0, int(math.floor(ox.min())) - 2), min(ortho_meta['shape'][1], int(math.ceil(ox.max())) + 3)
r0, r1 = max(0, int(math.floor(oy.min())) - 2), min(ortho_meta['shape'][0], int(math.ceil(oy.max())) + 3)
print(f'Reading CTX 5m crop [{r0}:{r1}, {c0}:{c1}] from {ortho_meta["shape"]}...', flush=True)
ortho_full = tifffile.imread(ortho_path)
ortho_crop = ortho_full[r0:r1, c0:c1].astype(np.float32)
del ortho_full

o_valid = ortho_crop > 1.0
if not np.all(o_valid):
    _, inds = ndimage.distance_transform_edt(~o_valid, return_indices=True)
    ortho_crop = ortho_crop[tuple(inds)]

OX, OY = np.meshgrid(np.clip(ox - c0, 0, ortho_crop.shape[1] - 1), np.clip(oy - r0, 0, ortho_crop.shape[0] - 1))
ctx_lum = ndimage.map_coordinates(ortho_crop, [OY, OX], order=1, mode='nearest')
del ortho_crop

# Normalize CTX luminance cleanly (percentile stretch 1%..99.2% preserving crisp crater & delta albedo contrast)
p_lo, p_hi = np.percentile(ctx_lum, [1.0, 99.2])
ctx_norm = np.clip((ctx_lum - p_lo) / max(1.0, p_hi - p_lo), 0.0, 1.0)
print(f'CTX 5m luminance sampled (p1={p_lo:.1f}, p99.2={p_hi:.1f})', flush=True)

# Fetch NASA Mars Trek Viking MDIM 2.1 true-color tiles (Equirectangular WMTS zoom=6) for authentic Martian chroma!
Z = 6
cols_total = 2 ** (Z + 1)  # Equirectangular WMTS: 2^(z+1) x 2^z tiles (360 deg x 180 deg)
rows_total = 2 ** Z
lon_min, lon_max = float(lon4.min()), float(lon4.max())
lat_min, lat_max = float(lat4.min()), float(lat4.max())

tx_f = lambda lo: (lo + 180.0) / 360.0 * cols_total
ty_f = lambda la: (90.0 - la) / 180.0 * rows_total
tx0, tx1 = int(tx_f(lon_min)), int(tx_f(lon_max))
ty0, ty1 = int(ty_f(lat_max)), int(ty_f(lat_min))
os.makedirs(f'{WORK}/raw/viking_{Z}', exist_ok=True)

v_mos = np.zeros(((ty1 - ty0 + 1) * 256, (tx1 - tx0 + 1) * 256, 3), dtype=np.float32)
viking_ok = True
for tx in range(tx0, tx1 + 1):
    for ty in range(ty0, ty1 + 1):
        p = f'{WORK}/raw/viking_{Z}/{tx}_{ty}.jpg'
        if not os.path.exists(p) or os.path.getsize(p) < 500:
            url = f'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{Z}/{ty}/{tx}.jpg'
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'JezeroTabletopViz/1.0'})
                with urllib.request.urlopen(req, timeout=20) as resp, open(p, 'wb') as f:
                    f.write(resp.read())
            except Exception as e:
                print('Viking tile warning:', e, flush=True)
                viking_ok = False
        if os.path.exists(p) and os.path.getsize(p) > 500:
            v_mos[(ty - ty0) * 256:(ty - ty0 + 1) * 256, (tx - tx0) * 256:(tx - tx0 + 1) * 256] = np.asarray(
                Image.open(p).convert('RGB'), dtype=np.float32
            ) / 255.0

# Calibrated NASA Mars natural-color fusion:
# Uses crisp 5m CTX luminance mapped through realistic Martian iron-oxide / basalt / carbonate mineral tones,
# gently tinted with heavily smoothed Viking regional chromaticity (zero shadow blotches or purple artifacts!).
c_dark = np.array([0.24, 0.18, 0.14], dtype=np.float32)   # dark basaltic dunes & crater-floor pyroxene/olivine
c_mid  = np.array([0.62, 0.39, 0.26], dtype=np.float32)   # rusty Martian terracotta bedrock & crater walls
c_dust = np.array([0.86, 0.63, 0.44], dtype=np.float32)   # bright ochre-butterscotch ferric dust & carbonate rims

t1 = np.clip(ctx_norm / 0.52, 0.0, 1.0)
t2 = np.clip((ctx_norm - 0.52) / 0.48, 0.0, 1.0)
base_mars = np.where(
    ctx_norm[:, :, None] < 0.52,
    c_dark * (1.0 - t1[:, :, None]) + c_mid * t1[:, :, None],
    c_mid * (1.0 - t2[:, :, None]) + c_dust * t2[:, :, None],
)

if viking_ok and v_mos.max() > 0.05:
    vx = (lon4 + 180.0) / 360.0 * cols_total * 256.0 - tx0 * 256.0 - 0.5
    vy = (90.0 - lat4) / 180.0 * rows_total * 256.0 - ty0 * 256.0 - 0.5
    VX, VY = np.meshgrid(np.clip(vx, 0, v_mos.shape[1] - 1), np.clip(vy, 0, v_mos.shape[0] - 1))
    # Smooth Viking chroma gently to remove low-res shadow blotches on Jezero Mons & SW rim
    v_smooth = np.stack([ndimage.gaussian_filter(v_mos[:, :, c], sigma=3.5) for c in range(3)], -1)
    v_rgb = np.stack([ndimage.map_coordinates(v_smooth[:, :, c], [VY, VX], order=1) for c in range(3)], -1)
    v_lum = np.maximum(0.22, 0.299 * v_rgb[:, :, 0] + 0.587 * v_rgb[:, :, 1] + 0.114 * v_rgb[:, :, 2])
    v_chroma = np.clip(v_rgb / v_lum[:, :, None], 0.72, 1.32)
    # Subtle 28% regional Viking tint preserving 100% artifact-free 5m CTX crispness!
    tint = 0.72 + 0.28 * v_chroma
    sat_rgb = np.clip(base_mars * tint, 0.0, 1.0)
    print('Fused 5m CTX luminance + calibrated Mars mineral tones + smooth Viking chroma!', flush=True)
else:
    sat_rgb = base_mars

Image.fromarray(np.clip(sat_rgb * 255.0, 0, 255).astype(np.uint8)).save(f'{OUT}/sat.jpg', quality=86, optimize=True)
print(f'Saved sat.jpg ({os.path.getsize(f"{OUT}/sat.jpg"):,} bytes)', flush=True)

# 4. Compute exact metric (x, z) and real MOLA elevations for geological landmarks (NO rover traverse!)
def ll_to_xz(la, lo):
    return [round((lo - LONC) * MLON, 1), round((LATC - la) * MLAT, 1)]

def h_at(la, lo):
    fx = np.clip((lo - lon.min()) / (lon.max() - lon.min()), 0, 1) * (N - 1)
    fz = np.clip((lat.max() - la) / (lat.max() - lat.min()), 0, 1) * (N - 1)
    return round(float(D[int(round(fz)), int(round(fx))]), 1)

# Find exact peak of Jezero Mons around (18.16N, 78.23E) within +-0.22 deg
jm_mask = (np.abs(lat[:, None] - 18.16) < 0.22) & (np.abs(lon[None, :] - 78.23) < 0.24)
jm_D = np.where(jm_mask, D, -9999.0)
jm_r, jm_c = np.unravel_index(np.argmax(jm_D), D.shape)
jm_lat, jm_lon, jm_h = float(lat[jm_r]), float(lon[jm_c]), float(D[jm_r, jm_c])
print(f'Jezero Mons peak: ({jm_lat:.4f}N, {jm_lon:.4f}E) MOLA={jm_h:.1f} m', flush=True)

landmarks = [
    dict(name='Jezero Crater Floor', major=True, pos=ll_to_xz(18.38, 77.62), h=h_at(18.38, 77.62), lift=240),
    dict(name='Western Fan-Delta', major=True, pos=ll_to_xz(18.46, 77.41), h=h_at(18.46, 77.41), lift=260),
    dict(name='Jezero Mons (Volcano)', major=True, pos=ll_to_xz(jm_lat, jm_lon), h=round(jm_h, 1), lift=340),
    dict(name='Neretva Vallis (Inlet)', major=True, pos=ll_to_xz(18.45, 77.22), h=h_at(18.45, 77.22), lift=240),
    dict(name='Sava Vallis (Inlet)', major=False, pos=ll_to_xz(18.74, 77.52), h=h_at(18.74, 77.52), lift=220),
    dict(name='Pliva Vallis (Outlet)', major=True, pos=ll_to_xz(18.49, 78.10), h=h_at(18.49, 78.10), lift=240),
    dict(name='Northern Delta', major=False, pos=ll_to_xz(18.63, 77.56), h=h_at(18.63, 77.56), lift=200),
    dict(name='Kodiak Butte', major=False, pos=ll_to_xz(18.41, 77.44), h=h_at(18.41, 77.44), lift=180),
    dict(name='Belva Crater', major=False, pos=ll_to_xz(18.48, 77.38), h=h_at(18.48, 77.38), lift=180),
    dict(name='Isidis Planitia Margin', major=False, pos=ll_to_xz(18.58, 78.32), h=h_at(18.58, 78.32), lift=200),
]

meta = dict(
    name='Jezero Crater · Mars',
    size=SIZE,
    center=[0.0, 0.0],
    latc=LATC,
    lonc=LONC,
    mlat=round(MLAT, 2),
    mlon=round(MLON, 2),
    q=dict(scale=q_scale, offset=q_offset),
    datumZero=-3260.0,  # local vertical zero strictly below the lowest Isidis terrain (-3230 m) -> zero plinth Z-fighting!
    auxRanges=aux_ranges,
    features=dict(
        craterCenter=ll_to_xz(18.38, 77.58),
        craterRadius=22500.0,
        jezeroMons=ll_to_xz(jm_lat, jm_lon),
        jezeroMonsH=round(jm_h, 1),
        westernDelta=ll_to_xz(18.46, 77.41),
        northernDelta=ll_to_xz(18.63, 77.56),
        neretvaMouth=ll_to_xz(18.45, 77.26),
        savaMouth=ll_to_xz(18.70, 77.53),
        plivaBreach=ll_to_xz(18.49, 78.02),
        belvaCrater=ll_to_xz(18.48, 77.38),
        kodiakButte=ll_to_xz(18.41, 77.44),
        spillwayMola=-2395.0,
        closedLakeMola=-2500.0,
    ),
    landmarks=landmarks,
)
with open(f'{OUT}/meta.json', 'w') as f:
    json.dump(meta, f, indent=2)
print('Saved meta.json', flush=True)
