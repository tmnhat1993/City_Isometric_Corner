/**
 * Debug section: offset điểm dừng đèn đỏ 4 chiều. Gắn vào container (modal body) khi có container.
 */
import { EventBus } from '../core/EventBus.js'
import {
  getDebugVehicleStopOffsets,
  setDebugVehicleStopOffsets,
  clearDebugVehicleStopOffsets,
} from '../utils/DebugVehicleStopOffsets.js'

const LANE_LABELS = [
  'L→R: offset điểm dừng',
  'R→L: offset điểm dừng',
  'T→B: offset điểm dừng',
  'B→T: offset điểm dừng',
]

function mountSection(container, syncFns) {
  const section = document.createElement('div')
  section.className = 'debug-modal-section'
  const lanesHtml = LANE_LABELS.map(
    (label, i) => `
    <div class="debug-panel-section" data-lane="${i}">
      <div class="debug-panel-section-title">${label}</div>
      <div class="debug-panel-row">
        <label>offset</label>
        <input type="number" id="debug-vehicle-stop${i}" step="0.01" placeholder="0" />
      </div>
    </div>
  `
  ).join('')
  section.innerHTML = `
    <div class="debug-modal-section-title">Đèn đỏ — offset điểm dừng</div>
    <p class="debug-panel-hint">Âm = dừng sớm, dương = dừng trễ. Lưu tự động, áp dụng ngay.</p>
    ${lanesHtml}
    <div class="debug-panel-actions">
      <button type="button" id="debug-vehicle-stop-reset">Reset tất cả</button>
    </div>
  `
  container.appendChild(section)

  function getOffsetsFromInputs() {
    const o = {}
    for (let i = 0; i < 4; i++) {
      const input = document.getElementById(`debug-vehicle-stop${i}`)
      if (!input) continue
      const v = Number(input.value)
      if (!Number.isNaN(v)) o[i] = v
    }
    return o
  }

  function saveAndEmit() {
    const offsets = getOffsetsFromInputs()
    setDebugVehicleStopOffsets(offsets)
    EventBus.emit('vehicleStopOffsetsChanged', offsets)
  }

  for (let i = 0; i < 4; i++) {
    const input = document.getElementById(`debug-vehicle-stop${i}`)
    if (input) input.addEventListener('input', saveAndEmit)
  }

  const resetBtn = document.getElementById('debug-vehicle-stop-reset')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearDebugVehicleStopOffsets()
      EventBus.emit('vehicleStopOffsetsChanged', {})
      syncFromStorage()
    })
  }

  function syncFromStorage() {
    const o = getDebugVehicleStopOffsets()
    for (let i = 0; i < 4; i++) {
      const input = document.getElementById(`debug-vehicle-stop${i}`)
      if (input) input.value = o[i] ?? ''
    }
  }

  if (Array.isArray(syncFns)) syncFns.push(syncFromStorage)
}

export function initDebugVehicleStopPanel(container, syncFns) {
  if (!container) return
  mountSection(container, syncFns)
}
