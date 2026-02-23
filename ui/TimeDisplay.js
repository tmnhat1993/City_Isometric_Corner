/**
 * Đồng hồ pixel art góc trên trái: HH:MM:SS + Thứ, dd/mm/yyyy; màu theo ngày/đêm.
 */
import { getDayNightMode } from '../utils/DayNightState.js'
import { EventBus } from '../core/EventBus.js'

const ID = 'time-display'
const DAYS_VI = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

function pad(n) {
  return n < 10 ? '0' + n : String(n)
}

function formatTime(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatDate(d) {
  const thu = DAYS_VI[d.getDay()]
  const dd = pad(d.getDate())
  const mm = pad(d.getMonth() + 1)
  const yyyy = d.getFullYear()
  return `${thu}, ${dd}/${mm}/${yyyy}`
}

function createDisplay() {
  const el = document.createElement('div')
  el.id = ID
  el.className = 'time-display'
  el.innerHTML = `
    <div class="time-display-clock">00:00:00</div>
    <div class="time-display-date">--</div>
  `
  return el
}

/**
 * Gọi từ main: tạo và cập nhật mỗi giây; listen dayNightChanged để đổi màu.
 */
export function initTimeDisplay() {
  if (document.getElementById(ID)) return

  const el = createDisplay()
  el.style.position = 'fixed'
  el.style.top = '12px'
  el.style.left = '12px'
  el.style.zIndex = '1000'
  el.style.fontFamily = "'Montserrat', sans-serif"
  el.style.fontSize = '12px'
  el.style.lineHeight = '1.4'
  el.style.pointerEvents = 'none'
  document.body.appendChild(el)

  const clockEl = el.querySelector('.time-display-clock')
  const dateEl = el.querySelector('.time-display-date')

  function updateColor() {
    const isNight = getDayNightMode() === 'night'
    el.style.color = isNight ? '#8ba3c7' : '#e0f0ff'
  }

  function tick() {
    const d = new Date()
    if (clockEl) clockEl.textContent = formatTime(d)
    if (dateEl) dateEl.textContent = formatDate(d)
    updateColor()
  }

  const interval = setInterval(tick, 1000)
  tick()
  EventBus.on('dayNightChanged', updateColor)

  return () => {
    clearInterval(interval)
    EventBus.off('dayNightChanged', updateColor)
  }
}
