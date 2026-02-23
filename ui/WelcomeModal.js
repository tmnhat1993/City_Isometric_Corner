/**
 * Modal chào mừng lần đầu: nhập tên, lưu user; đóng khi đã có user.
 */
import { Storage } from '../utils/Storage.js'
import { EventBus } from '../core/EventBus.js'

const ID = 'welcome-modal'

function createModal() {
  const overlay = document.createElement('div')
  overlay.id = ID
  overlay.className = 'welcome-modal-overlay'
  overlay.innerHTML = `
    <div class="welcome-modal-dialog">
      <div class="welcome-modal-body">
        <p class="welcome-modal-greeting">Chào mừng đến IsoCity!</p>
        <p class="welcome-modal-ask">Bạn tên gì?</p>
        <input type="text" id="welcome-name-input" class="welcome-modal-input" placeholder="Tên của bạn" maxlength="50" />
        <button type="button" id="welcome-submit-btn" class="welcome-modal-btn">Bắt đầu</button>
      </div>
    </div>
  `
  return overlay
}

function show(overlay) {
  overlay.classList.add('welcome-modal--open')
  const input = overlay.querySelector('#welcome-name-input')
  if (input) {
    input.value = ''
    setTimeout(() => input.focus(), 100)
  }
}

function hide(overlay) {
  overlay.classList.remove('welcome-modal--open')
}

/**
 * Gọi từ main: nếu chưa có user thì hiện modal; submit lưu user và đóng.
 */
export function initWelcomeModal() {
  if (document.getElementById(ID)) return

  const overlay = createModal()
  document.body.appendChild(overlay)

  const input = overlay.querySelector('#welcome-name-input')
  const btn = overlay.querySelector('#welcome-submit-btn')

  function submit() {
    const name = (input?.value || '').trim()
    if (name.length < 1) return
    Storage.setUser({ name, joinDate: new Date().toISOString() })
    hide(overlay)
    EventBus.emit('welcomeCompleted', { name })
  }

  btn?.addEventListener('click', submit)
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit()
  })

  if (!Storage.checkUser()) show(overlay)
}
