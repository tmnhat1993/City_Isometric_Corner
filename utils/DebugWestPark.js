/**
 * Debug overrides for West park (image sprite).
 * Stores OFFSET from grid-computed base (offsetX, offsetY) and optional size (width, height).
 */
const STORAGE_KEY = 'isocity_debug_west_park'

/**
 * @returns {{ offsetX?: number, offsetY?: number, width?: number, height?: number } | null}
 */
export function getDebugWestParkOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    return {
      offsetX: typeof o.offsetX === 'number' ? o.offsetX : undefined,
      offsetY: typeof o.offsetY === 'number' ? o.offsetY : undefined,
      width: typeof o.width === 'number' ? o.width : undefined,
      height: typeof o.height === 'number' ? o.height : undefined,
    }
  } catch {
    return null
  }
}

export function setDebugWestParkOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch (e) {
    console.warn('Debug west park overrides save failed', e)
  }
}

export function clearDebugWestParkOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
