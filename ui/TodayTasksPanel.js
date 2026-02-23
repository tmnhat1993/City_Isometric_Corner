/**
 * Panel "Hôm nay" bên phải: danh sách task, checkbox, thêm task, icon picker 8 icon.
 */
import { Storage } from '../utils/Storage.js'
import { EventBus } from '../core/EventBus.js'
import { showConfetti } from './Confetti.js'

const ID = 'today-tasks-panel'
const ICONS = [
  { key: 'film', label: 'Phim' },
  { key: 'task', label: 'Task' },
  { key: 'flower', label: 'Hoa' },
  { key: 'star', label: 'Sao' },
  { key: 'book', label: 'Sách' },
  { key: 'meeting', label: 'Meeting' },
  { key: 'goal', label: 'Mục tiêu' },
  { key: 'reminder', label: 'Nhắc nhở' },
]

function dateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2)
}

function formatPanelDate(d) {
  const thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
  return `${thu}, ${d.getDate()}/${d.getMonth() + 1}`
}

function formatPanelTime(d) {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function getTodayTasks() {
  return Storage.getTasksForDay(dateKey(new Date()))
}

function setTodayTasks(tasks) {
  Storage.setTasksForDay(dateKey(new Date()), tasks)
}

function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth <= 768
}

function createPanel() {
  const el = document.createElement('div')
  el.id = ID
  el.className = 'today-tasks-panel'
  el.innerHTML = `
    <div class="today-tasks-header">
      <div class="today-tasks-greeting"></div>
      <div class="today-tasks-datetime">
        <span class="today-tasks-title">Hôm nay</span>
        <span class="today-tasks-date"></span>
        <span class="today-tasks-time"></span>
      </div>
    </div>
    <ul class="today-tasks-list"></ul>
    <div class="today-tasks-add">
      <button type="button" class="today-tasks-add-btn">+ Thêm task</button>
    </div>
    <div class="today-tasks-add-form" hidden>
      <div class="today-tasks-icon-picker"></div>
      <input type="text" class="today-tasks-input" placeholder="Nội dung task" />
      <button type="button" class="today-tasks-save-btn">Thêm</button>
    </div>
  `
  return el
}

function renderList(listEl, tasks, onToggle, onDelete) {
  listEl.innerHTML = ''
  tasks.forEach((t) => {
    const li = document.createElement('li')
    li.className = 'today-tasks-item' + (t.done ? ' today-tasks-item--done' : '')
    li.dataset.id = t.id
    const iconLabel = ICONS.find((i) => i.key === t.icon)?.label || t.icon
    li.innerHTML = `
      <label class="today-tasks-item-label">
        <input type="checkbox" class="today-tasks-checkbox" ${t.done ? 'checked' : ''} />
        <span class="today-tasks-item-icon">[${iconLabel}]</span>
        <span class="today-tasks-item-title">${escapeHtml(t.title)}</span>
      </label>
    `
    const cb = li.querySelector('.today-tasks-checkbox')
    cb?.addEventListener('change', () => onToggle(t.id, li))
    listEl.appendChild(li)
  })
}

function escapeHtml(s) {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function setupBottomSheet(el, getOpen, setOpen) {
  const handle = document.createElement('div')
  handle.className = 'today-tasks-sheet-handle'
  handle.setAttribute('aria-label', 'Kéo để đóng')
  el.prepend(handle)

  const overlay = document.createElement('div')
  overlay.className = 'today-tasks-sheet-overlay'
  overlay.setAttribute('aria-hidden', 'true')
  document.body.insertBefore(overlay, el)

  let touchStartY = 0
  handle.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY
  }, { passive: true })
  handle.addEventListener('touchend', (e) => {
    const y = e.changedTouches?.[0]?.clientY ?? touchStartY
    if (y - touchStartY > 40) setOpen(false)
  }, { passive: true })
  overlay.addEventListener('click', () => setOpen(false))

  function syncOpen() {
    const open = getOpen()
    el.classList.toggle('bottom-sheet-open', open)
    overlay.classList.toggle('sheet-overlay-open', open)
    overlay.setAttribute('aria-hidden', String(!open))
  }
  return syncOpen
}

/**
 * Gọi từ main: tạo panel, render từ Storage, CRUD + icon picker.
 * Trên mobile: hiển thị dạng bottom sheet (swipe up), mở bằng FAB "Hôm nay".
 */
export function initTodayTasksPanel() {
  if (document.getElementById(ID)) return

  const el = createPanel()
  el.style.position = 'fixed'
  el.style.top = '12px'
  el.style.right = '12px'
  el.style.width = 'min(280px, calc(100vw - 24px))'
  el.style.maxHeight = 'calc(100vh - 24px)'
  el.style.overflow = 'auto'
  el.style.zIndex = '1000'
  el.style.fontFamily = "'Montserrat', sans-serif"
  el.style.fontSize = '10px'
  el.style.color = '#ffffff'
  el.style.background = 'rgba(10, 15, 30, 0.52)'
  el.style.border = '1px solid #2a4a7f'
  el.style.borderRadius = '6px'
  el.style.padding = '11px'
  document.body.appendChild(el)

  let bottomSheetOpen = false
  let syncOpen = null
  if (isMobile()) {
    el.classList.add('bottom-sheet')
    syncOpen = setupBottomSheet(el, () => bottomSheetOpen, (v) => {
      bottomSheetOpen = v
      syncOpen?.()
    })
    syncOpen()
  }

  const greetingEl = el.querySelector('.today-tasks-greeting')
  const titleEl = el.querySelector('.today-tasks-title')
  const dateEl = el.querySelector('.today-tasks-date')
  const timeEl = el.querySelector('.today-tasks-time')
  const listEl = el.querySelector('.today-tasks-list')
  const addBtn = el.querySelector('.today-tasks-add-btn')
  const addForm = el.querySelector('.today-tasks-add-form')
  const iconPicker = el.querySelector('.today-tasks-icon-picker')
  const input = el.querySelector('.today-tasks-input')
  const saveBtn = el.querySelector('.today-tasks-save-btn')

  let selectedIcon = 'task'

  function refresh() {
    const d = new Date()
    const user = Storage.getUser()
    const name = user?.name?.trim() || 'bạn'
    if (greetingEl) greetingEl.textContent = `Xin chào, ${name}!`
    if (dateEl) dateEl.textContent = formatPanelDate(d)
    if (timeEl) timeEl.textContent = formatPanelTime(d)
    const tasks = getTodayTasks()
    renderList(listEl, tasks, toggleTask, () => {})
  }

  setInterval(() => {
    const d = new Date()
    if (timeEl) timeEl.textContent = formatPanelTime(d)
    if (dateEl) dateEl.textContent = formatPanelDate(d)
  }, 1000)

  function toggleTask(id, rowEl) {
    const tasks = getTodayTasks().map((t) =>
      t.id === id ? { ...t, done: !t.done, completedAt: t.done ? null : new Date().toISOString() } : t
    )
    const newlyDone = tasks.find((t) => t.id === id && t.done)
    setTodayTasks(tasks)
    if (newlyDone && rowEl) showConfetti(rowEl)
    refresh()
    EventBus.emit('tasksChanged')
  }

  addBtn?.addEventListener('click', () => {
    addForm?.removeAttribute('hidden')
    iconPicker?.focus()
    input?.focus()
  })

  ICONS.forEach(({ key, label }) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'today-tasks-icon-btn' + (key === selectedIcon ? ' active' : '')
    btn.textContent = label
    btn.addEventListener('click', () => {
      selectedIcon = key
      iconPicker?.querySelectorAll('.today-tasks-icon-btn').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
    })
    iconPicker?.appendChild(btn)
  })

  saveBtn?.addEventListener('click', () => {
    const title = (input?.value || '').trim()
    if (!title) return
    const tasks = getTodayTasks()
    tasks.push({
      id: uuid(),
      title,
      icon: selectedIcon,
      done: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    })
    setTodayTasks(tasks)
    input.value = ''
    addForm?.setAttribute('hidden', '')
    refresh()
    EventBus.emit('tasksChanged')
  })
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn?.click()
  })

  refresh()
  EventBus.on('tasksChanged', refresh)

  function toggleTodayPanel() {
    if (!el.classList.contains('bottom-sheet')) return
    bottomSheetOpen = !bottomSheetOpen
    syncOpen?.()
  }
  window.__toggleTodayPanel = toggleTodayPanel
}
