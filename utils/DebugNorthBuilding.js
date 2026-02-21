/**
 * Debug overrides for North building (image sprite).
 * Stores OFFSET from grid-computed base (offsetX, offsetY) and optional size (width, height).
 * Base position is always computed from the map; debug only fine-tunes.
 */
const STORAGE_KEY = 'isocity_debug_north_building'

/**
 * @returns {{ offsetX?: number, offsetY?: number, width?: number, height?: number } | null}
 */
export function getDebugNorthOverrides() {
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

/**
 * @param {{ offsetX?: number, offsetY?: number, width?: number, height?: number }} overrides
 */
export function setDebugNorthOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch (e) {
    console.warn('Debug north overrides save failed', e)
  }
}

export function clearDebugNorthOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
