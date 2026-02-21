export const TILE_W = 64
export const TILE_H = 32
export const GRID_W = 12
export const GRID_H = 12

// Origin offset — will be set after canvas size is known
let ORIGIN_X = 0
let ORIGIN_Y = 0

export function setOrigin(x, y) {
  ORIGIN_X = x
  ORIGIN_Y = y
}

export function getOrigin() {
  return { x: ORIGIN_X, y: ORIGIN_Y }
}

/**
 * Convert grid (col, row) to screen (x, y)
 * Returns the CENTER of the tile diamond
 */
export function gridToScreen(col, row) {
  return {
    x: (col - row) * (TILE_W / 2) + ORIGIN_X,
    y: (col + row) * (TILE_H / 2) + ORIGIN_Y,
  }
}

/**
 * Convert screen (x, y) to grid (col, row)
 */
export function screenToGrid(x, y) {
  const dx = (x - ORIGIN_X) / (TILE_W / 2)
  const dy = (y - ORIGIN_Y) / (TILE_H / 2)
  return {
    col: Math.floor((dx + dy) / 2),
    row: Math.floor((dy - dx) / 2),
  }
}

/**
 * Calculate the total pixel dimensions of the isometric grid
 */
export function getGridPixelSize() {
  const width = (GRID_W + GRID_H) * (TILE_W / 2)
  const height = (GRID_W + GRID_H) * (TILE_H / 2)
  return { width, height }
}

/**
 * Get the 4 corner points of an isometric diamond tile at (col, row)
 */
export function getTileDiamondPoints(col, row) {
  const center = gridToScreen(col, row)
  const hw = TILE_W / 2
  const hh = TILE_H / 2
  return [
    center.x, center.y - hh,   // top
    center.x + hw, center.y,    // right
    center.x, center.y + hh,    // bottom
    center.x - hw, center.y,    // left
  ]
}

/**
 * Get the 4 outer diamond vertices for a block of tiles
 * from (startCol, startRow) spanning `size` tiles in each axis.
 *
 * For a 4x4 block starting at (0,0), tiles are (0,0)..(3,3).
 * The diamond footprint vertices are:
 *   north = top of tile (startCol, startRow)
 *   east  = right of tile (startCol+size-1, startRow)
 *   south = bottom of tile (startCol+size-1, startRow+size-1)
 *   west  = left of tile (startCol, startRow+size-1)
 */
export function getBlockDiamond(startCol, startRow, size) {
  const hw = TILE_W / 2
  const hh = TILE_H / 2

  const nCenter = gridToScreen(startCol, startRow)
  const eCenter = gridToScreen(startCol + size - 1, startRow)
  const sCenter = gridToScreen(startCol + size - 1, startRow + size - 1)
  const wCenter = gridToScreen(startCol, startRow + size - 1)

  return {
    north: { x: nCenter.x, y: nCenter.y - hh },    // top vertex of NW tile
    east:  { x: eCenter.x + hw, y: eCenter.y },     // right vertex of NE tile
    south: { x: sCenter.x, y: sCenter.y + hh },     // bottom vertex of SE tile
    west:  { x: wCenter.x - hw, y: wCenter.y },     // left vertex of SW tile
  }
}

/**
 * Helper to darken a hex color
 */
export function darken(color, amount) {
  const r = ((color >> 16) & 0xff) * (1 - amount)
  const g = ((color >> 8) & 0xff) * (1 - amount)
  const b = (color & 0xff) * (1 - amount)
  return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b)
}
