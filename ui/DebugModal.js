/**
 * Modal debug chung: gom tất cả debug (buildings, xe làn, xe dừng) vào một dialog.
 * Một nút "Debug" mở modal; bên trong có các section cuộn được, dễ thêm debug mới sau này.
 */
import { initDebugBuildingNorthPanel } from './DebugBuildingNorthPanel.js'
import { initDebugBuildingEastPanel } from './DebugBuildingEastPanel.js'
import { initDebugBuildingWestPanel } from './DebugBuildingWestPanel.js'
import { initDebugBuildingSouthPanel } from './DebugBuildingSouthPanel.js'
import { initDebugVehicleLanesPanel } from './DebugVehicleLanesPanel.js'
import { initDebugVehicleStopPanel } from './DebugVehicleStopPanel.js'
import { initDebugGroundTilePanel } from './DebugGroundTilePanel.js'
import { initDebugTileCoordsPanel } from './DebugTileCoordsPanel.js'
const MODAL_ID = 'debug-modal'
const OVERLAY_ID = 'debug-modal-overlay'
const TOGGLE_ID = 'debug-modal-toggle'

function createModal() {
  if (document.getElementById(OVERLAY_ID)) return

  const overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  overlay.className = 'debug-modal-overlay'
  overlay.setAttribute('aria-hidden', 'true')

  const dialog = document.createElement('div')
  dialog.className = 'debug-modal-dialog'
  dialog.innerHTML = `
    <div class="debug-modal-header">
      <span>Debug</span>
      <button type="button" class="debug-modal-close" aria-label="Đóng">×</button>
    </div>
    <div class="debug-modal-body"></div>
  `

  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  const bodyEl = dialog.querySelector('.debug-modal-body')

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal()
  })
  dialog.querySelector('.debug-modal-close').addEventListener('click', closeModal)

  function closeModal() {
    overlay.classList.remove('debug-modal--open')
    overlay.setAttribute('aria-hidden', 'true')
  }

  function openModal() {
    overlay.classList.add('debug-modal--open')
    overlay.setAttribute('aria-hidden', 'false')
    if (typeof bodyEl.syncAll === 'function') bodyEl.syncAll()
  }

  overlay.closeModal = closeModal
  overlay.openModal = openModal
  return { overlay, bodyEl }
}

function createToggle(openModal) {
  if (document.getElementById(TOGGLE_ID)) return
  const btn = document.createElement('button')
  btn.id = TOGGLE_ID
  btn.type = 'button'
  btn.className = 'debug-modal-toggle-btn'
  btn.textContent = 'Debug'
  btn.title = 'Mở panel debug (buildings, xe làn, dừng đèn đỏ, tile tọa độ)'
  btn.addEventListener('click', openModal)
  document.body.appendChild(btn)
}

/**
 * Gọi từ main.js: tạo một nút Debug, một modal, và gắn nội dung từng panel vào modal.
 */
export function initDebugModal() {
  const { overlay, bodyEl } = createModal()

  const syncFns = []
  bodyEl.syncAll = () => {
    syncFns.forEach((fn) => { if (typeof fn === 'function') fn() })
  }

  initDebugBuildingNorthPanel(bodyEl, syncFns)
  initDebugBuildingEastPanel(bodyEl, syncFns)
  initDebugBuildingWestPanel(bodyEl, syncFns)
  initDebugBuildingSouthPanel(bodyEl, syncFns)
  initDebugVehicleLanesPanel(bodyEl, syncFns)
  initDebugVehicleStopPanel(bodyEl, syncFns)
  initDebugGroundTilePanel(bodyEl, syncFns)
  initDebugTileCoordsPanel(bodyEl)

  createToggle(() => overlay.openModal())
}
