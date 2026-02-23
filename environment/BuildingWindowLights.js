/**
 * Đèn cửa sổ building ban đêm: grid windows + flicker mỗi 2–5s.
 * Lắng nghe building*SpriteCreated, thêm layer lights vào container building.
 */
import { Graphics, Container } from 'pixi.js'
import { getApp } from '../core/App.js'
import { EventBus } from '../core/EventBus.js'
import { COLORS } from '../utils/Colors.js'

const WINDOW_COLOR = COLORS.officeWindow?.night ?? 0xffe566
const FLICKER_INTERVAL_MIN = 2000
const FLICKER_INTERVAL_MAX = 5000

/**
 * Tạo grid cửa sổ (mỗi ô là một Graphics rect) trong container, tọa độ theo baseX, baseY, baseWidth, baseHeight.
 * @param {import('pixi.js').Container} parent - building container
 * @param {{ baseX: number, baseY: number, baseWidth: number, baseHeight: number }} bounds
 * @param {{ cols: number, rows: number }} grid
 */
function addWindowLights(parent, bounds, grid = { cols: 8, rows: 6 }) {
  const { baseX, baseY, baseWidth, baseHeight } = bounds
  const { cols, rows } = grid
  const marginX = baseWidth * 0.08
  const marginY = baseHeight * 0.06
  const w = (baseWidth - 2 * marginX) / cols
  const h = (baseHeight - 2 * marginY) / rows
  const pad = 2
  const lightsContainer = new Container()
  lightsContainer.label = 'windowLights'
  lightsContainer.alpha = 0

  const windows = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = baseX - baseWidth / 2 + marginX + col * (baseWidth - 2 * marginX) / cols + pad
      const y = baseY - baseHeight + marginY + row * (baseHeight - 2 * marginY) / rows + pad
      const g = new Graphics()
      g.rect(x, y, Math.max(2, w - pad * 2), Math.max(2, h - pad * 2))
      g.fill({ color: WINDOW_COLOR, alpha: 0.9 })
      g.visible = Math.random() < 0.7
      lightsContainer.addChild(g)
      windows.push(g)
    }
  }
  parent.addChild(lightsContainer)
  return { lightsContainer, windows }
}

let registered = []
let flickerTimer = 0
let nextFlickerAt = FLICKER_INTERVAL_MIN + Math.random() * (FLICKER_INTERVAL_MAX - FLICKER_INTERVAL_MIN)

function onBuildingCreated(payload, grid) {
  const parent = payload.sprite?.parent
  if (!parent) return
  const bounds = { baseX: payload.baseX, baseY: payload.baseY, baseWidth: payload.baseWidth, baseHeight: payload.baseHeight }
  const { lightsContainer, windows } = addWindowLights(parent, bounds, grid)
  registered.push({ lightsContainer, windows })
}

function update(_ticker) {
  for (let i = registered.length - 1; i >= 0; i--) {
    const { lightsContainer } = registered[i]
    if (lightsContainer.destroyed) {
      registered.splice(i, 1)
      continue
    }
    lightsContainer.alpha = 0
    continue

    flickerTimer += _ticker.deltaMS
    if (flickerTimer >= nextFlickerAt) {
      flickerTimer = 0
      nextFlickerAt = FLICKER_INTERVAL_MIN + Math.random() * (FLICKER_INTERVAL_MAX - FLICKER_INTERVAL_MIN)
      const n = Math.random() < 0.5 ? 1 : 2
      for (let k = 0; k < n && windows.length > 0; k++) {
        const w = windows[Math.floor(Math.random() * windows.length)]
        if (w && !w.destroyed) w.visible = !w.visible
      }
    }
  }
}

/**
 * Khởi tạo: subscribe building events, ticker cập nhật alpha + flicker.
 */
export function initBuildingWindowLights() {
  const app = getApp()
  if (!app?.ticker) return { destroy: () => {} }

  const onNorth = (e) => onBuildingCreated(e, { cols: 8, rows: 6 })
  const onEast = (e) => onBuildingCreated(e, { cols: 6, rows: 4 })
  const onWest = (e) => onBuildingCreated(e, { cols: 6, rows: 3 })

  EventBus.on('buildingNorthSpriteCreated', onNorth)
  EventBus.on('buildingEastSpriteCreated', onEast)
  EventBus.on('buildingWestSpriteCreated', onWest)

  app.ticker.add(update)

  function destroy() {
    app.ticker.remove(update)
    EventBus.off('buildingNorthSpriteCreated', onNorth)
    EventBus.off('buildingEastSpriteCreated', onEast)
    EventBus.off('buildingWestSpriteCreated', onWest)
    registered = []
  }

  return { destroy }
}
