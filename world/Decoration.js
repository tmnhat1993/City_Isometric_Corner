import { Graphics, Container } from 'pixi.js'
import { gridToScreen } from '../core/GridSystem.js'
import { COLORS, getColor } from '../utils/Colors.js'

/**
 * Đèn đường: chỉ cột + bóng đèn (không vẽ chụp đèn / bảng để tránh nhầm biển chỉ đường). Có thể thay bằng asset sau.
 */
function drawStreetLight(gfx, col, row, mode) {
  const center = gridToScreen(col, row)
  const postColor = COLORS.lightPost
  const lampH = 28
  const postW = 3

  gfx.rect(center.x - postW / 2, center.y - lampH, postW, lampH)
  gfx.fill({ color: postColor })

  const bulbColor = mode === 'night' ? 0xfff8e1 : 0x78909c
  gfx.rect(center.x - 2, center.y - lampH - 2, 4, 4)
  gfx.fill({ color: bulbColor, alpha: mode === 'night' ? 0.95 : 0.6 })
}

/**
 * Chỉ đèn đường (4 góc ngã tư). Các object khác bỏ — thay bằng assets khi cần.
 */
export function buildDecorations(mode = 'day') {
  const container = new Container()
  container.label = 'decorations'
  container.sortableChildren = true

  const gfxLights = new Graphics()
  const lightPositions = [
    { col: 4, row: 4 },
    { col: 4, row: 7 },
    { col: 7, row: 4 },
    { col: 7, row: 7 },
  ]
  lightPositions.forEach(({ col, row }) => {
    drawStreetLight(gfxLights, col, row, mode)
  })

  container.addChild(gfxLights)
  container.zIndex = 0
  return container
}
