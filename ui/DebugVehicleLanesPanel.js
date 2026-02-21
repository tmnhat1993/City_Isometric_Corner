/**
 * Debug section: offset X/Y 4 làn xe. Gắn vào container (modal body) khi có container.
 */
import { EventBus } from '../core/EventBus.js'
import {
  getDebugVehicleLaneOverrides,
  setDebugVehicleLaneOverrides,
  clearDebugVehicleLaneOverrides,
} from '../utils/DebugVehicleLanes.js'

const LANE_LABELS = [
  'Làn 0: Ngang L→R (row 5)',
  'Làn 1: Ngang R→L (row 6)',
  'Làn 2: Dọc T→B (col 5)',
  'Làn 3: Dọc B→T (col 6)',
]

function mountSection(container, syncFns) {
  const section = document.createElement('div')
  section.className = 'debug-modal-section'
  const lanesHtml = LANE_LABELS.map(
    (label, i) => `
    <div class="debug-panel-section" data-lane="${i}">
      <div class="debug-panel-section-title">${label}</div>
      <div class="debug-panel-row">
        <label>offsetX</label>
        <input type="number" id="debug-vehicle-lane${i}-x" step="1" />
      </div>
      <div class="debug-panel-row">
        <label>offsetY</label>
        <input type="number" id="debug-vehicle-lane${i}-y" step="1" />
      </div>
    </div>
  `
  ).join('')
  section.innerHTML = `
    <div class="debug-modal-section-title">Xe — 4 làn (offset vị trí)</div>
    <p class="debug-panel-hint">Cân vị trí sprite từng làn. Lưu tự động, áp dụng ngay.</p>
    ${lanesHtml}
    <div class="debug-panel-actions">
      <button type="button" id="debug-vehicle-lanes-reset">Reset tất cả</button>
    </div>
  `
  container.appendChild(section)

  function getOverridesFromInputs() {
    const o = {}
    for (let i = 0; i < 4; i++) {
      const ix = document.getElementById(`debug-vehicle-lane${i}-x`)
      const iy = document.getElementById(`debug-vehicle-lane${i}-y`)
      const x = ix ? Number(ix.value) : 0
      const y = iy ? Number(iy.value) : 0
      if (!Number.isNaN(x) || !Number.isNaN(y)) {
        o[i] = { offsetX: Number.isNaN(x) ? 0 : x, offsetY: Number.isNaN(y) ? 0 : y }
      }
    }
    return o
  }

  function saveAndEmit() {
    const overrides = getOverridesFromInputs()
    setDebugVehicleLaneOverrides(overrides)
    EventBus.emit('vehicleLaneOverridesChanged', overrides)
  }

  for (let i = 0; i < 4; i++) {
    const ix = document.getElementById(`debug-vehicle-lane${i}-x`)
    const iy = document.getElementById(`debug-vehicle-lane${i}-y`)
    if (ix) ix.addEventListener('input', saveAndEmit)
    if (iy) iy.addEventListener('input', saveAndEmit)
  }

  const resetBtn = document.getElementById('debug-vehicle-lanes-reset')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearDebugVehicleLaneOverrides()
      EventBus.emit('vehicleLaneOverridesChanged', null)
      syncFromStorage()
      window.location.reload()
    })
  }

  function syncFromStorage() {
    const o = getDebugVehicleLaneOverrides() || {}
    for (let i = 0; i < 4; i++) {
      const ix = document.getElementById(`debug-vehicle-lane${i}-x`)
      const iy = document.getElementById(`debug-vehicle-lane${i}-y`)
      const lane = o[i] || {}
      if (ix) ix.value = lane.offsetX ?? 0
      if (iy) iy.value = lane.offsetY ?? 0
    }
  }

  if (Array.isArray(syncFns)) syncFns.push(syncFromStorage)
}

export function initDebugVehicleLanesPanel(container, syncFns) {
  if (!container) return
  mountSection(container, syncFns)
}
