/**
 * Debug: offset và kích thước cho tấm hình texture khảm lên mặt đường (và vỉa hè khi có texture).
 * Chỉ ảnh hưởng đến vị trí/kích thước của hình áp lên ô, không đổi vị trí ô.
 */
const STORAGE_KEY = 'isocity_debug_ground_tile'

const DEFAULT_WIDTH = 64
const DEFAULT_HEIGHT = 32

/**
 * @returns {{ offsetX: number, offsetY: number, width: number, height: number }}
 */
export function getDebugGroundTileOverrides() {
  const out = { offsetX: 0, offsetY: 1, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return out
    const o = JSON.parse(raw)
    if (typeof o.offsetX === 'number') out.offsetX = o.offsetX
    if (typeof o.offsetY === 'number') out.offsetY = o.offsetY
    if (typeof o.width === 'number' && o.width > 0) out.width = o.width
    if (typeof o.height === 'number' && o.height > 0) out.height = o.height
  } catch {}
  return out
}

/**
 * @param {{ offsetX?: number, offsetY?: number, width?: number, height?: number }} overrides
 */
export function setDebugGroundTileOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch (e) {
    console.warn('Debug ground tile save failed', e)
  }
}

export function clearDebugGroundTileOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
