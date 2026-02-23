/**
 * Simple FPS monitor. Optionally show a small on-screen display.
 * Can be used to throttle particles when FPS is low (call getFps() from WeatherLayer).
 */
const ID = 'isocity-fps-monitor'
let lastTime = 0
let frameCount = 0
let fps = 60
let fpsUpdateAt = 0

export function tickFps(now = performance.now()) {
  if (lastTime === 0) lastTime = now
  frameCount++
  if (now - fpsUpdateAt >= 500) {
    const elapsed = (now - lastTime) / 1000
    fps = elapsed > 0 ? Math.round(frameCount / elapsed) : 60
    frameCount = 0
    lastTime = now
    fpsUpdateAt = now
  }
}

export function getFps() {
  return fps
}

/**
 * Show a small FPS display (fixed top-right under clock/weather). Call once from main.
 */
export function initFpsMonitor(show = true) {
  if (document.getElementById(ID)) return
  const el = document.createElement('div')
  el.id = ID
  el.style.cssText = 'position:fixed;top:52px;right:12px;z-index:999;font-family:\'Montserrat\',sans-serif;font-size:13px;color:#8ba3c7;pointer-events:none'
  el.textContent = '— FPS'
  document.body.appendChild(el)
  const update = () => {
    el.textContent = `${getFps()} FPS`
    el.style.display = show ? '' : 'none'
  }
  const iv = setInterval(update, 500)
  return () => {
    clearInterval(iv)
    el.remove()
  }
}
