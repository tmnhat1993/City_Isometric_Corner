/**
 * Nút float góc dưới phải: Hôm nay (mobile), Lịch sử task, Cài đặt.
 */
const ID = 'floating-action-buttons'

function createFAB(onHistory, onSettings) {
  const el = document.createElement('div')
  el.id = ID
  el.className = 'fab-container'
  el.innerHTML = `
    <button type="button" class="fab-btn fab-today" title="Hôm nay">Hôm nay</button>
    <button type="button" class="fab-btn" title="Lịch sử task">Lịch sử</button>
    <button type="button" class="fab-btn" title="Cài đặt">Cài đặt</button>
  `
  el.querySelectorAll('.fab-btn')[0]?.addEventListener('click', () => window.__toggleTodayPanel?.())
  el.querySelectorAll('.fab-btn')[1]?.addEventListener('click', () => onHistory?.())
  el.querySelectorAll('.fab-btn')[2]?.addEventListener('click', () => onSettings?.())
  return el
}

/**
 * @param {{ open: () => void }} taskHistory
 * @param {{ open: () => void }} settingsPanel
 */
export function initFloatingActionButtons(taskHistory, settingsPanel) {
  if (document.getElementById(ID)) return

  const el = createFAB(
    () => window.__openTaskHistory?.(),
    () => settingsPanel?.open?.()
  )
  el.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:1000;display:flex;gap:8px;font-family:\'Montserrat\',sans-serif'
  document.body.appendChild(el)

  el.querySelectorAll('.fab-btn').forEach((btn) => {
    btn.style.cssText = 'padding:7px 12px;font-size:9px;color:#e0f0ff;background:rgba(42,74,127,0.9);border:1px solid #4fc3f7;border-radius:4px;cursor:pointer'
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(79,195,247,0.3)' })
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(42,74,127,0.9)' })
  })
  const todayBtn = el.querySelector('.fab-today')
  if (todayBtn) {
    const showHideToday = () => {
      todayBtn.style.display = window.innerWidth <= 768 ? '' : 'none'
    }
    showHideToday()
    window.addEventListener('resize', showHideToday)
  }
}
