/**
 * Auto day/night theo giờ thực. Ban đêm: chỉ một layer navy đen sâu phủ toàn canvas (không hiệu ứng khác).
 */
import { Graphics } from 'pixi.js'
import { getApp, getOverlayContainer } from '../core/App.js'
import { getTimeMode, getDayNightMode, setDayNightMode } from '../utils/DayNightState.js'
import { EventBus } from '../core/EventBus.js'

/** Màu navy đen sâu; alpha giảm ~35% so với trước để đêm bớt đậm */
const NIGHT_OVERLAY_COLOR = 0x050814
const NIGHT_OVERLAY_ALPHA = 0.6
const LERP_SPEED = 0.08
const DAY_START = 6
const DAY_END = 18
const DAWN_START = 5
const DAWN_END = 6
const DUSK_START = 18
const DUSK_END = 20

function getTransitionValue(hour) {
  if (hour >= DAY_START && hour < DAY_END) return 1
  if (hour >= DUSK_START && hour < DUSK_END) return 1 - (hour - DUSK_START) / (DUSK_END - DUSK_START)
  if (hour >= DAWN_START && hour < DAWN_END) return (hour - DAWN_START) / (DAWN_END - DAWN_START)
  return 0
}

export function initDayNightCycle() {
  const app = getApp()
  const overlayContainer = getOverlayContainer()
  if (!app?.ticker || !overlayContainer) return { destroy: () => {} }

  const nightOverlay = new Graphics()
  nightOverlay.label = 'nightOverlay'
  nightOverlay.eventMode = 'none'
  overlayContainer.addChild(nightOverlay)
  let currentOverlayAlpha = 0

  function drawNightOverlay() {
    const w = app.screen.width
    const h = app.screen.height
    if (w <= 0 || h <= 0) return
    nightOverlay.clear()
    nightOverlay.rect(0, 0, w, h)
    nightOverlay.fill({ color: NIGHT_OVERLAY_COLOR, alpha: 1 })
  }

  const update = () => {
    let targetAlpha
    if (getTimeMode() === 'auto') {
      const now = new Date()
      const hour = now.getHours() + now.getMinutes() / 60
      const t = getTransitionValue(hour)
      setDayNightMode(t >= 0.5 ? 'day' : 'night')
      targetAlpha = (1 - t) * NIGHT_OVERLAY_ALPHA
    } else {
      targetAlpha = getDayNightMode() === 'night' ? NIGHT_OVERLAY_ALPHA : 0
    }
    currentOverlayAlpha += (targetAlpha - currentOverlayAlpha) * LERP_SPEED
    if (Math.abs(currentOverlayAlpha - targetAlpha) < 0.005) currentOverlayAlpha = targetAlpha
    nightOverlay.alpha = currentOverlayAlpha
    drawNightOverlay()
  }

  app.ticker.add(update)
  EventBus.on('resize', drawNightOverlay)
  update()

  function destroy() {
    app.ticker.remove(update)
    EventBus.off('resize', drawNightOverlay)
    nightOverlay.destroy()
  }

  return { destroy }
}
