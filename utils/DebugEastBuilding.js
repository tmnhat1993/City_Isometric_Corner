/**
 * Debug overrides for East building (image sprite).
 * Stores OFFSET from grid-computed base (offsetX, offsetY) and optional size (width, height).
 */
const STORAGE_KEY = 'isocity_debug_east_building'

/**
 * @returns {{ offsetX?: number, offsetY?: number, width?: number, height?: number } | null}
 */
export function getDebugEastBuildingOverrides() {
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

export function setDebugEastBuildingOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch (e) {
    console.warn('Debug east building overrides save failed', e)
  }
}

export function clearDebugEastBuildingOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
