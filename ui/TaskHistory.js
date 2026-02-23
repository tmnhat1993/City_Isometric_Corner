/**
 * Popup lịch sử task: filter Tuần này / Tháng này / Năm này / Tất cả, timeline theo ngày, stats.
 */
import { Storage } from '../utils/Storage.js'

const ID = 'task-history-popup'
const FILTERS = [
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'year', label: 'Năm này' },
  { key: 'all', label: 'Tất cả' },
]

function dateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDayHeader(d) {
  const thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
  return `${thu}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

function filterDays(days, filterKey) {
  const now = new Date()
  const today = dateKey(now)
  return days.filter((key) => {
    if (filterKey === 'all') return true
    const d = parseDateKey(key)
    if (filterKey === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return d >= weekAgo && key <= today
    }
    if (filterKey === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    if (filterKey === 'year') {
      return d.getFullYear() === now.getFullYear()
    }
    return true
  })
}

function getStats(days, filterKey) {
  const filtered = filterDays(days, filterKey)
  let total = 0
  let done = 0
  filtered.forEach((key) => {
    const tasks = Storage.getTasksForDay(key)
    tasks.forEach((t) => {
      total++
      if (t.done) done++
    })
  })
  return { total, done, days: filtered.length }
}

function createPopup() {
  const overlay = document.createElement('div')
  overlay.id = ID
  overlay.className = 'task-history-overlay'
  overlay.innerHTML = `
    <div class="task-history-dialog">
      <div class="task-history-header">
        <span>Lịch sử Task</span>
        <button type="button" class="task-history-close">×</button>
      </div>
      <div class="task-history-stats"></div>
      <div class="task-history-filters"></div>
      <div class="task-history-timeline"></div>
    </div>
  `
  return overlay
}

const ICON_LABELS = { film: 'Phim', task: 'Task', flower: 'Hoa', star: 'Sao', book: 'Sách', meeting: 'Meeting', goal: 'Mục tiêu', reminder: 'Nhắc' }

/**
 * Gọi từ main: tạo popup, mở bằng FAB hoặc nút. Render timeline từ Storage.getTaskDays() + getTasksForDay.
 */
export function initTaskHistory() {
  if (document.getElementById(ID)) return

  const overlay = createPopup()
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.zIndex = '1050'
  overlay.style.background = 'rgba(0,0,0,0.6)'
  overlay.style.display = 'flex'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'
  overlay.style.opacity = '0'
  overlay.style.visibility = 'hidden'
  overlay.style.transition = 'opacity 0.2s, visibility 0.2s'
  document.body.appendChild(overlay)

  const dialog = overlay.querySelector('.task-history-dialog')
  dialog.style.background = 'rgba(10,15,30,0.98)'
  dialog.style.border = '1px solid #2a4a7f'
  dialog.style.borderRadius = '8px'
  dialog.style.width = 'min(400px, calc(100vw - 24px))'
  dialog.style.maxHeight = '80vh'
  dialog.style.overflow = 'hidden'
  dialog.style.color = '#e0f0ff'

  const statsEl = overlay.querySelector('.task-history-stats')
  const filtersEl = overlay.querySelector('.task-history-filters')
  const timelineEl = overlay.querySelector('.task-history-timeline')
  const closeBtn = overlay.querySelector('.task-history-close')

  let currentFilter = 'week'

  function open() {
    overlay.style.opacity = '1'
    overlay.style.visibility = 'visible'
    render()
  }

  function close() {
    overlay.style.opacity = '0'
    overlay.style.visibility = 'hidden'
  }

  function render() {
    const days = Storage.getTaskDays()
    const { total, done } = getStats(days, currentFilter)
    statsEl.textContent = `7 ngày qua: ${done}/${total} tasks ✓`
    if (total > 0) statsEl.textContent = `${days.length} ngày: ${done}/${total} tasks ✓`

    filtersEl.innerHTML = ''
    FILTERS.forEach((f) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'task-history-filter-btn' + (currentFilter === f.key ? ' active' : '')
      btn.textContent = f.label
      btn.addEventListener('click', () => {
        currentFilter = f.key
        render()
      })
      filtersEl.appendChild(btn)
    })

    const filtered = filterDays(days, currentFilter)
    timelineEl.innerHTML = ''
    filtered.slice(0, 30).forEach((key) => {
      const d = parseDateKey(key)
      const tasks = Storage.getTasksForDay(key)
      if (tasks.length === 0) return
      const doneCount = tasks.filter((t) => t.done).length
      const section = document.createElement('div')
      section.className = 'task-history-day'
      section.innerHTML = `<div class="task-history-day-header">${formatDayHeader(d)} — ${doneCount}/${tasks.length} ✓</div><ul class="task-history-day-list"></ul>`
      const list = section.querySelector('.task-history-day-list')
      tasks.forEach((t) => {
        const li = document.createElement('li')
        li.className = t.done ? 'done' : ''
        const icon = ICON_LABELS[t.icon] || t.icon
        li.textContent = (t.done ? '✓ ' : '○ ') + `[${icon}] ${t.title}`
        list.appendChild(li)
      })
      timelineEl.appendChild(section)
    })
  }

  closeBtn?.addEventListener('click', close)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })

  window.__openTaskHistory = open
  return { open, close }
}
