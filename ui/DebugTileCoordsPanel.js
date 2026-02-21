/**
 * Debug: section giải thích tile picker — click vào tile sẽ hiện (col, row) ở góc dưới trái.
 */
function mountSection(container) {
  const section = document.createElement('div')
  section.className = 'debug-modal-section'
  section.innerHTML = `
    <div class="debug-modal-section-title">Tile tọa độ (click để xem)</div>
    <p class="debug-panel-hint">Click vào một <strong>tile</strong> trên canvas → tọa độ <strong>Ngang (col)</strong> và <strong>Dọc (row)</strong> hiện ở góc dưới trái. Dùng để gán filename ảnh, ví dụ: <code>tile-5-6.png</code>.</p>
  `
  container.appendChild(section)
}

export function initDebugTileCoordsPanel(container) {
  if (!container) return
  mountSection(container)
}
