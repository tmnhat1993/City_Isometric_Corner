import { Container, Sprite } from 'pixi.js'
import { getBlockDiamond } from '../core/GridSystem.js'
import { getDebugWestParkOverrides } from '../utils/DebugWestPark.js'
import { EventBus } from '../core/EventBus.js'

export const PARK_WEST_IMAGE_PATH = '/img/park-west.png'

/** Mặc định khi không có debug override (x, y, width, height) */
const BUILDING_WEST_DEFAULT = { x: 194, y: 441, width: 260, height: 198 }

/**
 * West Park — chỉ dùng PNG khi có texture; không vẽ procedural (để thay asset).
 */
export function buildBuildingWest(startCol, startRow, mode = 'day', texture = null) {
  const container = new Container()
  container.label = 'buildingWest'
  const size = 4
  const d = getBlockDiamond(startCol, startRow, size)

  if (texture) {
    const baseX = (d.west.x + d.east.x) / 2
    const baseY = d.south.y
    const baseWidth = d.east.x - d.west.x
    const baseHeight = d.south.y - d.north.y
    const overrides = getDebugWestParkOverrides() || {}
    const def = BUILDING_WEST_DEFAULT
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5, 1)
    sprite.x = overrides.offsetX !== undefined ? baseX + overrides.offsetX : baseX
    sprite.y = overrides.offsetY !== undefined ? baseY + overrides.offsetY : baseY
    sprite.width = overrides.width ?? def.width
    sprite.height = overrides.height ?? def.height
    container.addChild(sprite)
    EventBus.emit('buildingWestSpriteCreated', {
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
