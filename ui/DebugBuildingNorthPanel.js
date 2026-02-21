/**
 * Debug section: offset x, y, width, height của North building (image).
 * Gắn vào container (modal body) khi có container.
 */
import { EventBus } from '../core/EventBus.js'
import { setDebugNorthOverrides, clearDebugNorthOverrides } from '../utils/DebugNorthBuilding.js'

let spriteRef = null
let baseRef = null

function onBuildingNorthSpriteCreated({ sprite, baseX, baseY, baseWidth, baseHeight }) {
  spriteRef = sprite
  baseRef = { baseX, baseY, baseWidth, baseHeight }
  const inputX = document.getElementById('debug-north-x')
  const inputY = document.getElementById('debug-north-y')
  const inputW = document.getElementById('debug-north-width')
  const inputH = document.getElementById('debug-north-height')
  if (inputX) { inputX.value = Math.round(spriteRef.x); inputX.placeholder = String(Math.round(baseX)) }
  if (inputY) { inputY.value = Math.round(spriteRef.y); inputY.placeholder = String(Math.round(baseY)) }
  if (inputW) { inputW.value = Math.round(spriteRef.width); inputW.placeholder = String(Math.round(baseWidth)) }
  if (inputH) { inputH.value = Math.round(spriteRef.height); inputH.placeholder = String(Math.round(baseHeight)) }
}

function mountSection(container, syncFns) {
  const section = document.createElement('div')
  section.className = 'debug-modal-section'
  section.innerHTML = '<div class="debug-modal-section-title">Building North (image)</div><p class="debug-panel-hint">Căn chỉnh offset / size. Lưu tự động.</p><div class="debug-panel-row"><label>X</label><input type="number" id="debug-north-x" step="1" /></div><div class="debug-panel-row"><label>Y</label><input type="number" id="debug-north-y" step="1" /></div><div class="debug-panel-row"><label>Width</label><input type="number" id="debug-north-width" step="1" min="1" /></div><div class="debug-panel-row"><label>Height</label><input type="number" id="debug-north-height" step="1" min="1" /></div><div class="debug-panel-actions"><button type="button" id="debug-north-reset">Reset (mặc định)</button></div>'
  container.appendChild(section)
  const inputX = document.getElementById('debug-north-x')
  const inputY = document.getElementById('debug-north-y')
  const inputW = document.getElementById('debug-north-width')
  const inputH = document.getElementById('debug-north-height')
  const resetBtn = document.getElementById('debug-north-reset')
  function updateSprite() {
    if (!spriteRef || !baseRef) return
    const x = Number(inputX.value), y = Number(inputY.value), w = Number(inputW.value), h = Number(inputH.value)
    if (!Number.isNaN(x)) spriteRef.x = x
    if (!Number.isNaN(y)) spriteRef.y = y
    if (!Number.isNaN(w) && w > 0) spriteRef.width = w
    if (!Number.isNaN(h) && h > 0) spriteRef.height = h
    setDebugNorthOverrides({ offsetX: spriteRef.x - baseRef.baseX, offsetY: spriteRef.y - baseRef.baseY, width: spriteRef.width, height: spriteRef.height })
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
  resetBtn.addEventListener('click', () => { clearDebugNorthOverrides(); window.location.reload() })
  if (Array.isArray(syncFns)) syncFns.push(syncFromSprite)
}

export function initDebugBuildingNorthPanel(container, syncFns) {
  if (!container) return
  mountSection(container, syncFns)
  EventBus.on('buildingNorthSpriteCreated', onBuildingNorthSpriteCreated)
}
