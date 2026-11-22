// Snap a clipmap level's world origin to its parent's 2-cell grid, or lock the
// coarsest level to the terrain centre so its outer skirt never walks.
export function clipmapCenter(cx, cz, cell, coarsest = false) {
  if (coarsest) return { x: 0, z: 0 };
  const s = cell * 2;
  return { x: Math.round(cx / s) * s, z: Math.round(cz / s) * s };
}
