/**
 * Debug overrides cho 4 làn xe: offsetX, offsetY per lane (0..3).
 * Lane 0 = ngang L→R (row 5), 1 = ngang R→L (row 6), 2 = dọc T→B (col 5), 3 = dọc B→T (col 6).
 */
const STORAGE_KEY = 'isocity_debug_vehicle_lanes'

/** Mặc định offsetX cho từng làn (offsetY = 0). Debug đã lưu sẽ ghi đè. */
export const DEFAULT_VEHICLE_LANE_OFFSETS = {
  0: { offsetX: -42, offsetY: 0 },   // Ngang L→R
  1: { offsetX: -52, offsetY: 0 },   // Ngang R→L
  2: { offsetX: 42, offsetY: 0 },    // Dọc T→B
  3: { offsetX: 52, offsetY: 0 },    // Dọc B→T
}

/**
 * @returns {{ [laneId: number]: { offsetX: number, offsetY: number } }}
 */
export function getDebugVehicleLaneOverrides() {
  const out = {}
  for (let i = 0; i <= 3; i++) {
    out[i] = { ...DEFAULT_VEHICLE_LANE_OFFSETS[i] }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return out
    const o = JSON.parse(raw)
    for (let i = 0; i <= 3; i++) {
      const lane = o[i] || o[String(i)]
      if (lane) {
        if (typeof lane.offsetX === 'number') out[i].offsetX = lane.offsetX
        if (typeof lane.offsetY === 'number') out[i].offsetY = lane.offsetY
      }
    }
  } catch {}
  return out
}

/**
 * @param {{ [laneId: number]: { offsetX?: number, offsetY?: number } }} overrides
 */
export function setDebugVehicleLaneOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch (e) {
    console.warn('Debug vehicle lanes save failed', e)
  }
}

export function clearDebugVehicleLaneOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
