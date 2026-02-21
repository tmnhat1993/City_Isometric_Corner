/**
 * Debug thứ 2: click vào tile sẽ hiện tọa độ (col, row).
 * Dùng để gán filename hình ảnh cho đúng theo tọa độ.
 */
import { getApp, getWorldContainer } from '../core/App.js'
import { screenToGrid, GRID_W, GRID_H } from '../core/GridSystem.js'

const OVERLAY_ID = 'debug-tile-picker-overlay'

function createOverlay() {
  if (document.getElementById(OVERLAY_ID)) return document.getElementById(OVERLAY_ID)
  const el = document.createElement('div')
  el.id = OVERLAY_ID
  el.className = 'debug-tile-picker-overlay'
  el.innerHTML = '<span class="debug-tile-picker-label">Tile: —</span> <span class="debug-tile-picker-coords"></span>'
  el.setAttribute('aria-live', 'polite')
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '12px',
    left: '12px',
    zIndex: 9999,
    padding: '6px 10px',
    background: 'rgba(10, 15, 30, 0.9)',
    color: '#E0F0FF',
    fontFamily: 'monospace',
    fontSize: '13px',
    borderRadius: '4px',
    pointerEvents: 'none',
    border: '1px solid #2A4A7F',
  })
  document.body.appendChild(el)
  return el
}

function updateOverlay(col, row, isValid) {
  const el = document.getElementById(OVERLAY_ID)
  if (!el) return
  const label = el.querySelector('.debug-tile-picker-label')
  const coords = el.querySelector('.debug-tile-picker-coords')
  if (!label || !coords) return
  label.textContent = 'Tile:'
  if (isValid) {
    coords.textContent = `Ngang (col)=${col}, Dọc (row)=${row}`
    coords.title = `Dùng để gán filename, ví dụ: tile-${col}-${row}.png`
  } else {
    coords.textContent = `Ngang=${col}, Dọc=${row} — ngoài lưới`
  }
}

let app = null

/**
 * Chuyển vị trí click (client) sang tọa độ world local (để screenToGrid).
 */
function clientToWorldLocal(clientX, clientY, canvas, world) {
  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  const scaleX = app.screen.width / rect.width
  const scaleY = app.screen.height / rect.height
  const stageX = (clientX - rect.left) * scaleX
  const stageY = (clientY - rect.top) * scaleY
  const local = world.toLocal({ x: stageX, y: stageY })
  return local
}

/**
 * Gọi từ main.js sau khi có app và world. Bắt click trên canvas (DOM) → chuyển sang world local → screenToGrid → hiện Ngang/Dọc.
 */
export function initDebugTilePicker() {
  createOverlay()
  app = getApp()
  const world = getWorldContainer()
  if (!app?.canvas || !world) return

  const canvas = app.canvas
  canvas.addEventListener('click', (e) => {
    const local = clientToWorldLocal(e.clientX, e.clientY, canvas, world)
    if (!local) return
    const { col, row } = screenToGrid(local.x, local.y)
    const isValid = col >= 0 && col < GRID_W && row >= 0 && row < GRID_H
    updateOverlay(col, row, isValid)
  })
}
