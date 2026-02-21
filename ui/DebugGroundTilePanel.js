/**
 * Debug: offset và kích thước chung cho tile mặt đường và vỉa hè.
 * Áp dụng cho tất cả ô road (texture + màu) và sidewalk.
 */
import { EventBus } from '../core/EventBus.js'
import {
  getDebugGroundTileOverrides,
  setDebugGroundTileOverrides,
  clearDebugGroundTileOverrides,
} from '../utils/DebugGroundTile.js'

function mountSection(container, syncFns) {
  const section = document.createElement('div')
  section.className = 'debug-modal-section'
  section.innerHTML = `
    <div class="debug-modal-section-title">Hình khảm mặt đường &amp; vỉa hè</div>
    <p class="debug-panel-hint">Offset và kích thước chỉ áp dụng cho <strong>tấm hình texture</strong> khảm lên ô (road-tile). Vị trí ô không đổi; dùng để căn cho hình khớp với mặt tile. Để trống width/height = kích thước gốc ảnh.</p>
    <div class="debug-panel-section">
      <div class="debug-panel-row">
        <label>offsetX</label>
        <input type="number" id="debug-ground-tile-offset-x" step="1" placeholder="0" />
      </div>
      <div class="debug-panel-row">
        <label>offsetY</label>
        <input type="number" id="debug-ground-tile-offset-y" step="1" value="1" />
      </div>
      <div class="debug-panel-row">
        <label>width</label>
        <input type="number" id="debug-ground-tile-width" step="1" min="1" value="64" title="Mặc định 64" />
      </div>
      <div class="debug-panel-row">
        <label>height</label>
        <input type="number" id="debug-ground-tile-height" step="1" min="1" value="32" title="Mặc định 32" />
      </div>
    </div>
    <div class="debug-panel-actions">
      <button type="button" id="debug-ground-tile-reset">Reset</button>
    </div>
  `
  container.appendChild(section)

  function getOverridesFromInputs() {
    const ox = Number(document.getElementById('debug-ground-tile-offset-x')?.value)
    const oy = Number(document.getElementById('debug-ground-tile-offset-y')?.value)
    const w = Number(document.getElementById('debug-ground-tile-width')?.value)
    const h = Number(document.getElementById('debug-ground-tile-height')?.value)
    return {
      offsetX: Number.isNaN(ox) ? 0 : ox,
      offsetY: Number.isNaN(oy) ? 1 : oy,
      width: !Number.isNaN(w) && w > 0 ? w : 64,
      height: !Number.isNaN(h) && h > 0 ? h : 32,
    }
  }

  function saveAndEmit() {
    const overrides = getOverridesFromInputs()
    setDebugGroundTileOverrides(overrides)
    EventBus.emit('groundTileOverridesChanged', overrides)
  }

  const inputs = ['debug-ground-tile-offset-x', 'debug-ground-tile-offset-y', 'debug-ground-tile-width', 'debug-ground-tile-height']
  inputs.forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.addEventListener('input', saveAndEmit)
  })

  const resetBtn = document.getElementById('debug-ground-tile-reset')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearDebugGroundTileOverrides()
      EventBus.emit('groundTileOverridesChanged', { offsetX: 0, offsetY: 1, width: 64, height: 32 })
      syncFromStorage()
    })
  }

  function syncFromStorage() {
    const o = getDebugGroundTileOverrides()
    const xEl = document.getElementById('debug-ground-tile-offset-x')
    const yEl = document.getElementById('debug-ground-tile-offset-y')
    const wEl = document.getElementById('debug-ground-tile-width')
    const hEl = document.getElementById('debug-ground-tile-height')
    if (xEl) xEl.value = o.offsetX ?? ''
    if (yEl) yEl.value = o.offsetY ?? ''
    if (wEl) wEl.value = o.width ?? ''
    if (hEl) hEl.value = o.height ?? ''
  }

  if (Array.isArray(syncFns)) syncFns.push(syncFromStorage)
}

export function initDebugGroundTilePanel(container, syncFns) {
  if (!container) return
  mountSection(container, syncFns)
}
