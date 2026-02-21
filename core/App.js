import { Application, Container } from 'pixi.js'
import { EventBus } from './EventBus.js'

/** @type {Application} */
let app = null

/** @type {Container} */
let worldContainer = null

/** @type {Container} */
let overlayContainer = null

/** @type {Container} */
let weatherContainer = null

/** @type {Container} */
let backgroundContainer = null

export async function initApp(canvasContainer) {
  app = new Application()

  await app.init({
    resizeTo: canvasContainer,
    backgroundColor: 0x1a1a2e,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })

  canvasContainer.appendChild(app.canvas)

  // Order: background (sky) → world → weather → overlay
  backgroundContainer = new Container()
  backgroundContainer.label = 'background'

  worldContainer = new Container()
  worldContainer.label = 'world'

  weatherContainer = new Container()
  weatherContainer.label = 'weather'

  overlayContainer = new Container()
  overlayContainer.label = 'overlay'

  app.stage.addChild(backgroundContainer)
  app.stage.addChild(worldContainer)
  app.stage.addChild(weatherContainer)
  app.stage.addChild(overlayContainer)

  // Emit resize so origin + world dùng đúng kích thước (tránh lệch trên Chrome Full HD khi layout chưa xong)
  const emitResize = () => {
    const w = app.screen.width
    const h = app.screen.height
    if (w > 0 && h > 0) {
      EventBus.emit('resize', { width: w, height: h })
    }
  }

  const syncResizeFromContainer = () => {
    if (typeof app.resize === 'function') {
      app.resize()
    }
    emitResize()
  }

  window.addEventListener('resize', syncResizeFromContainer)

  // ResizeObserver: container thay đổi kích thước (kể cả lần đầu khi layout xong) → sync Pixi và emit
  const resizeObserver = new ResizeObserver(() => {
    syncResizeFromContainer()
  })
  resizeObserver.observe(canvasContainer)

  // Sau first frame (layout đã ổn định) gửi lại resize để tránh Chrome Full HD dùng kích thước sai lúc init
  requestAnimationFrame(() => {
    syncResizeFromContainer()
  })

  // Khi quay lại tab, container có thể đã 0x0; force resize rồi emit
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      requestAnimationFrame(() => {
        syncResizeFromContainer()
      })
    }
  })

  // Emit ngay với kích thước hiện tại (có thể chưa đúng trên một số browser, ResizeObserver + rAF sẽ gửi lại)
  syncResizeFromContainer()

  return app
}

export function getApp() {
  return app
}

export function getWorldContainer() {
  return worldContainer
}

export function getOverlayContainer() {
  return overlayContainer
}

export function getWeatherContainer() {
  return weatherContainer
}

export function getBackgroundContainer() {
  return backgroundContainer
}
