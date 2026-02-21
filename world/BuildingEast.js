import { Container, Sprite } from 'pixi.js'
import { getBlockDiamond } from '../core/GridSystem.js'
import { getDebugEastBuildingOverrides } from '../utils/DebugEastBuilding.js'
import { EventBus } from '../core/EventBus.js'

export const MART_EAST_IMAGE_PATH = '/img/mart-east.png'
const BUILDING_EAST_DEFAULT = { x: 707, y: 437, width: 249, height: 211 }

/**
 * East Building — chỉ dùng PNG khi có texture; không vẽ procedural (để thay asset).
 */
export function buildBuildingEast(startCol, startRow, mode = 'day', texture = null) {
  const container = new Container()
  container.label = 'buildingEast'
  const size = 4
  const d = getBlockDiamond(startCol, startRow, size)

  if (texture) {
    const baseX = (d.west.x + d.east.x) / 2
    const baseY = d.south.y
    const baseWidth = d.east.x - d.west.x
    const baseHeight = d.south.y - d.north.y
    const overrides = getDebugEastBuildingOverrides() || {}
    const def = BUILDING_EAST_DEFAULT
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5, 1)
    sprite.x = overrides.offsetX !== undefined ? baseX + overrides.offsetX : baseX
    sprite.y = overrides.offsetY !== undefined ? baseY + overrides.offsetY : baseY
    sprite.width = overrides.width ?? def.width
    sprite.height = overrides.height ?? def.height
    container.addChild(sprite)
    EventBus.emit('buildingEastSpriteCreated', {
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
