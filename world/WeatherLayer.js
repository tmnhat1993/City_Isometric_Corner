/**
 * Layer thời tiết: nắng, mưa (và mưa to + chớp), tuyết (và tuyết nặng).
 * Mưa to: hạt nhiều dày; chớp vẽ ở background (nền #14151A + img/lightning-effect.jpg), không đè lên canvas, không dùng blend mode.
 */
import { Graphics, Sprite, Container } from 'pixi.js'
import { getApp } from '../core/App.js'
import { COLORS } from '../utils/Colors.js'


const RAIN_COUNT = 120
const RAIN_HEAVY_COUNT = 280
const RAIN_LENGTH = 10
const RAIN_SPEED_Y = 8
const RAIN_WIND = -0.8

const SNOW_COUNT = 140
const SNOW_HEAVY_COUNT = 220
const SNOW_BLIZZARD_COUNT = 300
const SNOW_SPEED_Y = 1.0
const SNOW_HEAVY_SPEED_Y = 0.7
const SNOW_BLIZZARD_SPEED_Y = 3.8
const SNOW_WOBBLE = 1.2
const SNOW_BLIZZARD_WOBBLE = 4.0
const LARGE_SNOWFLAKE_SIZE = 20 // 5x bông tuyết nhỏ (radius ~2 → 5*4)

const LIGHTNING_INTERVAL_MIN = 2400   // 80% của 3000 – tần suất chớp tăng ~20%
const LIGHTNING_INTERVAL_MAX = 5600   // 80% của 7000
const FLASH1_DURATION = 120
const FLASH2_DELAY_MIN = 60
const FLASH2_DELAY_MAX = 140
const FLASH2_DURATION = 100
const FLASH_ALPHA1 = 0.45
const FLASH_ALPHA2 = 0.35
const LIGHTNING_BG_COLOR = 0x14151a
const LIGHTNING_SCALE_MIN = 0.75
const LIGHTNING_SCALE_MAX = 2
// Chớp màn hình đè lên canvas, lệch pha so với chớp nền (bổ trợ sấm chớp)
const FLASH_OVERLAY_DELAY = 45       // ms sau khi chớp nền bắt đầu
const FLASH_OVERLAY_DURATION = 385   // lâu hơn 0.2s so với ban đầu
const FLASH_OVERLAY_ALPHA = 0.22

function createRainParticles(w, h, count) {
  const particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * (w + 80) - 40,
      y: Math.random() * (h + 50) - 50,
      speedY: RAIN_SPEED_Y + Math.random() * 4,
      length: RAIN_LENGTH + Math.random() * 6,
      alpha: 0.4 + Math.random() * 0.4,
    })
  }
  return particles
}

function createSnowParticles(w, h, count, speedY) {
  const particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * (w + 60) - 30,
      y: Math.random() * (h + 40) - 40,
      speedY: speedY + Math.random() * 0.6,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      radius: 1 + Math.random() * 1.5,
      alpha: 0.7 + Math.random() * 0.3,
    })
  }
  return particles
}

/** Bông tuyết to (sprite img/snowflake.png), animation giống tuyết bình thường */
function createLargeSnowParticles(w, h, count, speedY, texture) {
  if (!texture) return []
  const particles = []
  for (let i = 0; i < count; i++) {
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5, 0.5)
    sprite.width = LARGE_SNOWFLAKE_SIZE
    sprite.height = LARGE_SNOWFLAKE_SIZE
    sprite.alpha = 0.6 + Math.random() * 0.35
    particles.push({
      x: Math.random() * (w + 80) - 40,
      y: Math.random() * (h + 60) - 60,
      speedY: speedY + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      sprite,
    })
  }
  return particles
}

function isRain(weather) {
  return weather === 'rain' || weather === 'rain_heavy'
}

function isSnow(weather) {
  return weather === 'snow' || weather === 'snow_heavy' || weather === 'snow_blizzard'
}

/**
 * @param {import('pixi.js').Container} container - weather container (mưa/tuyết đè lên world)
 * @param {string} weather
 * @param {import('pixi.js').Texture|null} [lightningTexture] - ảnh chớp (mưa to), null = dùng flash trắng
 * @param {import('pixi.js').Container|null} [backgroundContainer] - container nền; chớp vẽ vào đây (phía sau world)
 * @param {import('pixi.js').Texture|null} [snowflakeTexture] - img/snowflake.png cho bông tuyết to (5x)
 * @returns {{ destroy: () => void }}
 */
export function buildWeatherLayer(container, weather, lightningTexture = null, backgroundContainer = null, snowflakeTexture = null) {
  container.removeChildren()

  const app = getApp()
  if (!app?.ticker) return { destroy: () => {} }

  const overlayGfx = new Graphics()
  const particleGfx = new Graphics()
  const flashOverlayGfx = new Graphics()
  const snowSpriteContainer = new Container()
  snowSpriteContainer.label = 'largeSnowflakes'
  container.addChild(overlayGfx)
  container.addChild(particleGfx)
  container.addChild(snowSpriteContainer)
  container.addChild(flashOverlayGfx)

  // Chớp vẽ ở background (container nền có label 'lightning'), không đè lên canvas
  let bgLightningContainer = null
  let lightningSprite = null
  const lightningDarkGfx = new Graphics()
  const lightningWhiteGfx = new Graphics()
  if (weather === 'rain_heavy' && backgroundContainer) {
    bgLightningContainer = backgroundContainer.children.find((c) => c.label === 'lightning') || null
    if (lightningTexture) {
      lightningSprite = new Sprite(lightningTexture)
      lightningSprite.anchor.set(0.5, 0) // center top làm transform origin
    }
  }

  const w = () => app.screen.width
  const h = () => app.screen.height

  let rainParticles = []
  let snowParticles = []
  let largeSnowParticles = []
  const isBlizzard = weather === 'snow_blizzard'

  if (isRain(weather)) {
    const count = weather === 'rain_heavy' ? RAIN_HEAVY_COUNT : RAIN_COUNT
    rainParticles = createRainParticles(w(), h(), count)
  } else if (isSnow(weather)) {
    const count = isBlizzard ? SNOW_BLIZZARD_COUNT : (weather === 'snow_heavy' ? SNOW_HEAVY_COUNT : SNOW_COUNT)
    const speedY = isBlizzard ? SNOW_BLIZZARD_SPEED_Y : (weather === 'snow_heavy' ? SNOW_HEAVY_SPEED_Y : SNOW_SPEED_Y)
    snowParticles = createSnowParticles(w(), h(), count, speedY)
    const largeCount = Math.max(12, Math.floor(count * 0.15))
    largeSnowParticles = createLargeSnowParticles(w(), h(), largeCount, speedY, snowflakeTexture)
    largeSnowParticles.forEach((p) => snowSpriteContainer.addChild(p.sprite))
  }

  let nextLightningAt = performance.now() + LIGHTNING_INTERVAL_MIN + Math.random() * (LIGHTNING_INTERVAL_MAX - LIGHTNING_INTERVAL_MIN)
  let flashPhase = 0
  let flashUntil = 0
  let flash2At = 0
  let currentFlashX = 0
  let currentFlashFlip = 1
  let currentFlashScale = 1
  let flashStart = 0

  const update = (ticker) => {
    const W = w()
    const H = h()
    const now = performance.now()
    const dt = ticker.deltaMS

    overlayGfx.clear()
    particleGfx.clear()
    flashOverlayGfx.clear()

    if (bgLightningContainer) {
      bgLightningContainer.removeChildren()
      if (flashPhase === 1 || flashPhase === 3) {
        const alpha = flashPhase === 1 ? FLASH_ALPHA1 : FLASH_ALPHA2
        lightningDarkGfx.clear()
        lightningDarkGfx.rect(0, 0, W, H)
        lightningDarkGfx.fill({ color: LIGHTNING_BG_COLOR })
        bgLightningContainer.addChild(lightningDarkGfx)
        if (lightningSprite) {
          lightningSprite.x = currentFlashX
          lightningSprite.y = 0
          const baseScaleY = (H / lightningSprite.texture.height) * currentFlashScale
          lightningSprite.scale.set(currentFlashFlip * baseScaleY, baseScaleY)
          lightningSprite.alpha = alpha
          bgLightningContainer.addChild(lightningSprite)
        } else {
          lightningWhiteGfx.clear()
          lightningWhiteGfx.rect(0, 0, W, H)
          lightningWhiteGfx.fill({ color: 0xffffff, alpha })
          bgLightningContainer.addChild(lightningWhiteGfx)
        }
      }
    }

    if (isRain(weather)) {
      overlayGfx.rect(0, 0, W, H)
      overlayGfx.fill({
        color: COLORS.overlayRain.color,
        alpha: weather === 'rain_heavy' ? COLORS.overlayRain.alpha * 1.15 : COLORS.overlayRain.alpha,
      })
      const rainColor = COLORS.rainDrop
      for (const p of rainParticles) {
        p.y += p.speedY
        p.x += RAIN_WIND * (p.speedY * 0.5)
        if (p.y > H + 20) {
          p.y = -20
          p.x = Math.random() * (W + 80) - 40
        }
        if (p.x < -30) p.x = W + 30
        if (p.x > W + 30) p.x = -30
        particleGfx.moveTo(p.x, p.y)
        particleGfx.lineTo(p.x + RAIN_WIND * p.length, p.y + p.length)
        particleGfx.stroke({ color: rainColor, width: 1, alpha: p.alpha })
      }

      if (flashPhase === 0 && now >= nextLightningAt) {
        flashPhase = 1
        flashUntil = now + FLASH1_DURATION
        flashStart = now
        flash2At = now + FLASH1_DURATION + FLASH2_DELAY_MIN + Math.random() * (FLASH2_DELAY_MAX - FLASH2_DELAY_MIN)
        currentFlashX = Math.random() * W
        currentFlashFlip = Math.random() < 0.5 ? -1 : 1
        currentFlashScale = LIGHTNING_SCALE_MIN + Math.random() * (LIGHTNING_SCALE_MAX - LIGHTNING_SCALE_MIN)
      }
      if (flashPhase === 1) {
        if (now >= flashUntil) flashPhase = 2
      }
      if (flashPhase === 2 && now >= flash2At) {
        flashPhase = 3
        flashUntil = now + FLASH2_DURATION
        flashStart = now
        currentFlashX = Math.random() * W
        currentFlashFlip = Math.random() < 0.5 ? -1 : 1
        currentFlashScale = LIGHTNING_SCALE_MIN + Math.random() * (LIGHTNING_SCALE_MAX - LIGHTNING_SCALE_MIN)
      }
      // Chớp màn hình lệch pha: hiện sau một chút so với chớp nền, bổ trợ hiệu ứng
      if (flashPhase === 1 || flashPhase === 3) {
        const elapsed = now - flashStart
        if (elapsed >= FLASH_OVERLAY_DELAY && elapsed < FLASH_OVERLAY_DELAY + FLASH_OVERLAY_DURATION) {
          const t = (elapsed - FLASH_OVERLAY_DELAY) / FLASH_OVERLAY_DURATION
          const alpha = FLASH_OVERLAY_ALPHA * (1 - t) // fade out nhẹ
          flashOverlayGfx.rect(0, 0, W, H)
          flashOverlayGfx.fill({ color: 0xffffff, alpha })
        }
      }
      if (flashPhase === 3) {
        if (now >= flashUntil) {
          flashPhase = 0
          nextLightningAt = now + LIGHTNING_INTERVAL_MIN + Math.random() * (LIGHTNING_INTERVAL_MAX - LIGHTNING_INTERVAL_MIN)
        }
      }
    } else if (isSnow(weather)) {
      const wobbleAmt = isBlizzard ? SNOW_BLIZZARD_WOBBLE : (weather === 'snow_heavy' ? SNOW_WOBBLE * 1.1 : SNOW_WOBBLE)
      const overlayCfg = isBlizzard ? COLORS.overlayBlizzard : COLORS.overlaySnow
      const overlayAlpha = isBlizzard ? overlayCfg.alpha : (weather === 'snow_heavy' ? COLORS.overlaySnow.alpha * 1.2 : COLORS.overlaySnow.alpha)
      overlayGfx.rect(0, 0, W, H)
      overlayGfx.fill({ color: overlayCfg.color, alpha: overlayAlpha })
      const snowColor = COLORS.snowFlake
      for (const p of snowParticles) {
        p.y += p.speedY
        p.wobble += p.wobbleSpeed
        p.x += Math.sin(p.wobble) * wobbleAmt
        if (p.y > H + 15) {
          p.y = -15
          p.x = Math.random() * (W + 60) - 30
        }
        if (p.x < -20) p.x = W + 20
        if (p.x > W + 20) p.x = -20
        particleGfx.circle(p.x, p.y, p.radius)
        particleGfx.fill({ color: snowColor, alpha: p.alpha })
      }
      for (const p of largeSnowParticles) {
        p.y += p.speedY
        p.wobble += p.wobbleSpeed
        p.x += Math.sin(p.wobble) * wobbleAmt
        if (p.y > H + 25) {
          p.y = -25
          p.x = Math.random() * (W + 80) - 40
        }
        if (p.x < -30) p.x = W + 30
        if (p.x > W + 30) p.x = -30
        p.sprite.x = p.x
        p.sprite.y = p.y
      }
    }
  }

  app.ticker.add(update)
  update({ deltaMS: 0 })

  function destroy() {
    app.ticker.remove(update)
    container.removeChildren()
    if (bgLightningContainer) bgLightningContainer.removeChildren()
  }

  return { destroy }
}
