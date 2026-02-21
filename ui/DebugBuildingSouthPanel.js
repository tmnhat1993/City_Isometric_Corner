/**
 * Debug section: offset x, y, width, height của South construction (image).
 * Gắn vào container (modal body) khi có container.
 */
import { EventBus } from '../core/EventBus.js'
import { setDebugSouthConstructionOverrides, clearDebugSouthConstructionOverrides } from '../utils/DebugSouthConstruction.js'

let spriteRef = null
let baseRef = null

function onBuildingSouthSpriteCreated({ sprite, baseX, baseY, baseWidth, baseHeight }) {
  spriteRef = sprite
  baseRef = { baseX, baseY, baseWidth, baseHeight }
  const inputX = document.getElementById('debug-south-x')
  const inputY = document.getElementById('debug-south-y')
  const inputW = document.getElementById('debug-south-width')
  const inputH = document.getElementById('debug-south-height')
  if (inputX) {
    inputX.value = Math.round(spriteRef.x)
    inputX.placeholder = String(Math.round(baseX))
  }
  if (inputY) {
    inputY.value = Math.round(spriteRef.y)
    inputY.placeholder = String(Math.round(baseY))
  }
  if (inputW) {
    inputW.value = Math.round(spriteRef.width)
    inputW.placeholder = String(Math.round(baseWidth))
  }
  if (inputH) {
    inputH.value = Math.round(spriteRef.height)
    inputH.placeholder = String(Math.round(baseHeight))
  }
}

function mountSection(container, syncFns) {
  const section = document.createElement('div')
  section.className = 'debug-modal-section'
  section.innerHTML = `
    <div class="debug-modal-section-title">Construction South (image)</div>
    <p class="debug-panel-hint">Căn chỉnh offset / size. Lưu tự động.</p>
    <div class="debug-panel-row">
      <label>X</label>
      <input type="number" id="debug-south-x" step="1" />
    </div>
    <div class="debug-panel-row">
      <label>Y</label>
      <input type="number" id="debug-south-y" step="1" />
    </div>
    <div class="debug-panel-row">
      <label>Width</label>
      <input type="number" id="debug-south-width" step="1" min="1" />
    </div>
    <div class="debug-panel-row">
      <label>Height</label>
      <input type="number" id="debug-south-height" step="1" min="1" />
    </div>
    <div class="debug-panel-actions">
      <button type="button" id="debug-south-reset">Reset (mặc định)</button>
    </div>
  `
  container.appendChild(section)

  const inputX = document.getElementById('debug-south-x')
  const inputY = document.getElementById('debug-south-y')
  const inputW = document.getElementById('debug-south-width')
  const inputH = document.getElementById('debug-south-height')
  const resetBtn = document.getElementById('debug-south-reset')

  function updateSprite() {
    if (!spriteRef || !baseRef) return
    const x = Number(inputX.value)
    const y = Number(inputY.value)
    const w = Number(inputW.value)
    const h = Number(inputH.value)
    if (!Number.isNaN(x)) spriteRef.x = x
    if (!Number.isNaN(y)) spriteRef.y = y
    if (!Number.isNaN(w) && w > 0) spriteRef.width = w
    if (!Number.isNaN(h) && h > 0) spriteRef.height = h
    setDebugSouthConstructionOverrides({
      offsetX: spriteRef.x - baseRef.baseX,
      offsetY: spriteRef.y - baseRef.baseY,
      width: spriteRef.width,
      height: spriteRef.height,
    })
  }

  function syncFromSprite() {
    if (!spriteRef) return
    inputX.value = Math.round(spriteRef.x)
    inputY.value = Math.round(spriteRef.y)
    inputW.value = Math.round(spriteRef.width)
    inputH.value = Math.round(spriteRef.height)
  }

  inputX.addEventListener('input', updateSprite)
  inputY.addEventListener('input', updateSprite)
  inputW.addEventListener('input', updateSprite)
  inputH.addEventListener('input', updateSprite)

  resetBtn.addEventListener('click', () => {
    clearDebugSouthConstructionOverrides()
    window.location.reload()
  })

  if (Array.isArray(syncFns)) syncFns.push(syncFromSprite)
}

export function initDebugBuildingSouthPanel(container, syncFns) {
  if (!container) return
  mountSection(container, syncFns)
  EventBus.on('buildingSouthSpriteCreated', onBuildingSouthSpriteCreated)
}
