import { Container, Sprite } from 'pixi.js'
import { getBlockDiamond } from '../core/GridSystem.js'
import { getDebugNorthOverrides } from '../utils/DebugNorthBuilding.js'
import { EventBus } from '../core/EventBus.js'

/** Default path for north building image (in public/img) */
export const BUILDING_NORTH_IMAGE_PATH = '/img/building-north.png'

/** Default position and size when no debug overrides (X, Y, Width, Height) */
const BUILDING_NORTH_DEFAULT = { x: 450, y: 311, width: 259, height: 295 }

/**
 * North Building — chỉ dùng PNG khi có texture; không vẽ procedural fallback (để thay asset).
 */
export function buildBuildingNorth(startCol, startRow, mode = 'day', texture = null) {
  const container = new Container()
  container.label = 'buildingNorth'
  const size = 4
  const d = getBlockDiamond(startCol, startRow, size)

  if (texture) {
    const baseX = (d.west.x + d.east.x) / 2
    const baseY = d.south.y
    const baseWidth = d.east.x - d.west.x
    const baseHeight = d.south.y - d.north.y
    const overrides = getDebugNorthOverrides() || {}
    const def = BUILDING_NORTH_DEFAULT
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5, 1)
    sprite.x = overrides.offsetX !== undefined ? baseX + overrides.offsetX : baseX
    sprite.y = overrides.offsetY !== undefined ? baseY + overrides.offsetY : baseY
    sprite.width = overrides.width ?? def.width
    sprite.height = overrides.height ?? def.height
    container.addChild(sprite)
    EventBus.emit('buildingNorthSpriteCreated', {
      sprite,
      baseX,
      baseY,
      baseWidth,
      baseHeight,
    })
  }

  container.zIndex = (startRow + size) + (startCol + size)
  return container
}
