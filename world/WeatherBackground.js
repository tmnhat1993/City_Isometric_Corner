/**
 * Nền trời theo thời tiết: nắng = gradient vàng pastel nghiêng ~15°, mưa/tuyết = xám.
 */
import { Graphics, Sprite, Texture, Container } from 'pixi.js'
import { getApp } from '../core/App.js'

// Nắng: vàng pastel chiếm ưu thế, gradient nghiêng ~15°
const SUNNY_TOP = '#E4F6FF'     // sáng + xanh pastel rực rỡ (đỉnh)
const SUNNY_MID = '#FFFACD'     // lemon chiffon
const SUNNY_BOTTOM = '#E0CEB0'  // cream cam đậm hơn (đáy)

const RAIN_BG = 0x6e6e86
const RAIN_HEAVY_BG = 0x3c3c52
const SNOW_BG = 0x5a5a72
const SNOW_BLIZZARD_BG = 0x1a1c24

/**
 * Cập nhật container nền (full screen) theo weather. Gọi khi đổi thời tiết hoặc resize.
 * @param {import('pixi.js').Container} container
 * @param {string} weather
 */
export function updateWeatherBackground(container, weather) {
  container.removeChildren()

  const app = getApp()
  if (!app) return
  const w = app.screen.width
  const h = app.screen.height
  if (w <= 0 || h <= 0) return

  if (weather === 'clear') {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    // Gradient nghiêng ~15° (từ thẳng đứng): từ (0,0) đến (h*tan(15°), h)
    const tilt = h * Math.tan((15 * Math.PI) / 180)
    const grad = ctx.createLinearGradient(0, 0, tilt, h)
    grad.addColorStop(0, SUNNY_TOP)
    grad.addColorStop(0.5, SUNNY_MID)
    grad.addColorStop(1, SUNNY_BOTTOM)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    const texture = Texture.from(canvas)
    const sprite = new Sprite(texture)
    sprite.width = w
    sprite.height = h
    container.addChild(sprite)
  } else {
    const gfx = new Graphics()
    let color = SNOW_BG
    if (weather === 'rain') color = RAIN_BG
    else if (weather === 'rain_heavy') color = RAIN_HEAVY_BG
    else if (weather === 'snow_blizzard') color = SNOW_BLIZZARD_BG
    else if (weather === 'snow' || weather === 'snow_heavy') color = SNOW_BG
    gfx.rect(0, 0, w, h)
    gfx.fill({ color })
    container.addChild(gfx)
    // Mưa to: thêm container trống cho ánh chớp (WeatherLayer vẽ vào đây, nằm phía sau world)
    if (weather === 'rain_heavy') {
      const lightningContainer = new Container()
      lightningContainer.label = 'lightning'
      container.addChild(lightningContainer)
    }
  }
}
