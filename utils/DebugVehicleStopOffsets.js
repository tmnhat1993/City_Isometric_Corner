/**
 * Offset điểm dừng đèn đỏ cho từng làn (0..3).
 * stopProgress = BASE (4.5/11) + offset[laneId]. Âm = dừng sớm hơn, dương = dừng trễ hơn.
 */
const STORAGE_KEY = 'isocity_debug_vehicle_stop_offsets'

/** Mặc định offset điểm dừng cho 4 chiều: 0=L→R, 1=R→L, 2=T→B, 3=B→T */
const DEFAULT_STOP_OFFSETS = {
  0: 0.02,   // L→R
  1: -0.24,  // R→L
  2: 0.02,   // T→B
  3: -0.24,  // B→T
}

/**
 * @returns {{ [laneId: number]: number }}
 */
export function getDebugVehicleStopOffsets() {
  const out = { ...DEFAULT_STOP_OFFSETS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return out
    const o = JSON.parse(raw)
    for (let i = 0; i <= 3; i++) {
      const v = o[i] ?? o[String(i)]
      if (typeof v === 'number') out[i] = v
    }
  } catch {
    // ignore, dùng mặc định
  }
  return out
}

/**
 * @param {{ [laneId: number]: number }} offsets
 */
export function setDebugVehicleStopOffsets(offsets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offsets))
  } catch (e) {
    console.warn('Debug vehicle stop offsets save failed', e)
  }
}

export function clearDebugVehicleStopOffsets() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
