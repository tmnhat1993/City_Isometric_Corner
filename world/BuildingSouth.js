import { Container, Sprite } from 'pixi.js'
import { getBlockDiamond } from '../core/GridSystem.js'
import { getDebugSouthConstructionOverrides } from '../utils/DebugSouthConstruction.js'
import { EventBus } from '../core/EventBus.js'

export const PARK_SOUTH_IMAGE_PATH = '/img/park-south.png'

/** Mặc định khi không có debug override (x, y, width, height) — construction south / park south */
const BUILDING_SOUTH_DEFAULT = { x: 450, y: 568, width: 256, height: 140 }

/**
 * South Park — chỉ dùng PNG khi có texture (park-south.png); không vẽ procedural.
 */
export function buildBuildingSouth(startCol, startRow, mode = 'day', texture = null) {
  const container = new Container()
  container.label = 'buildingSouth'
  const size = 4
  const d = getBlockDiamond(startCol, startRow, size)

  if (texture) {
    const baseX = (d.west.x + d.east.x) / 2
    const baseY = d.south.y
    const baseWidth = d.east.x - d.west.x
    const baseHeight = d.south.y - d.north.y
    const overrides = getDebugSouthConstructionOverrides() || {}
    const def = BUILDING_SOUTH_DEFAULT
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5, 1)
    sprite.x = overrides.offsetX !== undefined ? baseX + overrides.offsetX : baseX
    sprite.y = overrides.offsetY !== undefined ? baseY + overrides.offsetY : baseY
    sprite.width = overrides.width ?? def.width
    sprite.height = overrides.height ?? def.height
    container.addChild(sprite)
    EventBus.emit('buildingSouthSpriteCreated', {
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
