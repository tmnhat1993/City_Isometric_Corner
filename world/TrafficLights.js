import { Container, Graphics } from 'pixi.js'
import { gridToScreen } from '../core/GridSystem.js'
import { getApp } from '../core/App.js'
import { updateTrafficLight, isRedForLane, isYellowForLane, getPhase, getSubPhase } from './TrafficLightController.js'

/** Vị trí 4 cột đèn (grid): trước 4 ô trung tâm (5,5),(5,6),(6,5),(6,6) */
const LIGHT_POSITIONS = [
  { col: 4, row: 5, laneId: 0 },   // Ngang L→R, trước col 5
  { col: 7, row: 6, laneId: 1 },   // Ngang R→L, sau col 6
  { col: 5, row: 4, laneId: 2 },   // Dọc T→B, trước row 5
  { col: 6, row: 7, laneId: 3 },   // Dọc B→T, sau row 6
]

/** Debug: kích thước nhỏ để không ảnh hưởng cảnh */
const POLE_HEIGHT = 16
const LAMP_RADIUS = 2
const RED = 0xe53935
const YELLOW = 0xffb300
const GREEN = 0x43a047
const GRAY = 0x546e7a

/**
 * Vẽ 1 cột đèn debug (đỏ/vàng/xanh) — node nhỏ, tạm thời cho debug.
 */
function drawOneLight(gfx, screenX, screenY, isRed, isYellow) {
  const baseY = screenY
  gfx.moveTo(screenX, baseY)
  gfx.lineTo(screenX, baseY - POLE_HEIGHT)
  gfx.stroke({ color: 0x37474f, width: 1 })

  const step = LAMP_RADIUS * 2 + 2
  let y = baseY - POLE_HEIGHT - LAMP_RADIUS - 1
  gfx.circle(screenX, y, LAMP_RADIUS)
  gfx.fill({ color: isRed ? RED : GRAY })
  y -= step
  gfx.circle(screenX, y, LAMP_RADIUS)
  gfx.fill({ color: isYellow ? YELLOW : GRAY })
  y -= step
  gfx.circle(screenX, y, LAMP_RADIUS)
  gfx.fill({ color: !isRed && !isYellow ? GREEN : GRAY })
}

/**
 * Build container 4 cột đèn; cập nhật màu mỗi frame theo TrafficLightController.
 */
export function buildTrafficLights() {
  const container = new Container()
  container.label = 'trafficLights'

  const gfx = new Graphics()
  container.addChild(gfx)

  const app = getApp()
  if (!app || !app.ticker) {
    return { container, destroy: () => {} }
  }

  let lastPhase = -1
  let lastSubPhase = null
  const update = (ticker) => {
    const now = performance.now()
    updateTrafficLight(now)
    const p = getPhase()
    const sub = getSubPhase()
    if (p !== lastPhase || sub !== lastSubPhase) {
      lastPhase = p
      lastSubPhase = sub
      gfx.clear()
      for (const { col, row, laneId } of LIGHT_POSITIONS) {
        const pos = gridToScreen(col, row)
        const isYellow = isYellowForLane(laneId)
        drawOneLight(gfx, pos.x, pos.y, isRedForLane(laneId) && !isYellow, isYellow)
      }
    }
  }

  // Vẽ lần đầu
  gfx.clear()
  lastSubPhase = getSubPhase()
  for (const { col, row, laneId } of LIGHT_POSITIONS) {
    const pos = gridToScreen(col, row)
    const isYellow = isYellowForLane(laneId)
    drawOneLight(gfx, pos.x, pos.y, isRedForLane(laneId) && !isYellow, isYellow)
  }
  lastPhase = getPhase()

  app.ticker.add(update)

  function destroy() {
    app.ticker.remove(update)
    container.destroy({ children: true })
  }

  return { container, destroy }
}
