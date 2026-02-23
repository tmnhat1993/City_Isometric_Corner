/**
 * Panel cài đặt: Thời gian (Tự động / Ban ngày / Ban đêm), Thời tiết, Canvas (xe, particles), Tài khoản (tên + đổi tên).
 */
import { Storage } from '../utils/Storage.js'
import { getDayNightMode, setDayNightMode, getTimeMode, setTimeMode } from '../utils/DayNightState.js'
import { getWeather, setWeather } from '../utils/WeatherState.js'
import { EventBus } from '../core/EventBus.js'

const ID = 'settings-panel'

function createPanel() {
  const overlay = document.createElement('div')
  overlay.id = ID
  overlay.className = 'settings-panel-overlay'
  overlay.innerHTML = `
    <div class="settings-panel-dialog">
      <div class="settings-panel-header">
        <span>Cài đặt</span>
        <button type="button" class="settings-panel-close">×</button>
      </div>
      <div class="settings-panel-body">
        <section class="settings-section">
          <div class="settings-section-title">Thời gian</div>
          <div class="settings-row">
            <button type="button" class="settings-opt" data-time="auto">Tự động</button>
            <button type="button" class="settings-opt" data-time="day">Ban ngày</button>
            <button type="button" class="settings-opt" data-time="night">Ban đêm</button>
          </div>
        </section>
        <section class="settings-section">
          <div class="settings-section-title">Thời tiết</div>
          <div class="settings-row">
            <button type="button" class="settings-weather" data-weather="clear">Nắng</button>
            <button type="button" class="settings-weather" data-weather="rain">Mưa</button>
            <button type="button" class="settings-weather" data-weather="rain_heavy">Mưa Lớn</button>
            <button type="button" class="settings-weather" data-weather="snow">Tuyết</button>
            <button type="button" class="settings-weather" data-weather="snow_blizzard">Bão tuyết</button>
          </div>
        </section>
        <section class="settings-section">
          <div class="settings-section-title">Tài khoản</div>
          <p class="settings-greeting"></p>
          <button type="button" class="settings-rename-btn">Đổi tên</button>
        </section>
      </div>
    </div>
  `
  return overlay
}

/**
 * Gọi từ main. Trả về { open, close }.
 */
export function initSettingsPanel() {
  if (document.getElementById(ID)) return { open: () => {}, close: () => {} }

  const overlay = createPanel()
  overlay.style.cssText = 'position:fixed;inset:0;z-index:1050;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity 0.2s, visibility 0.2s'
  document.body.appendChild(overlay)

  const dialog = overlay.querySelector('.settings-panel-dialog')
  dialog.style.cssText = 'background:rgba(10,15,30,0.98);border:1px solid #2a4a7f;border-radius:8px;width:min(320px, calc(100vw - 24px));color:#e0f0ff'

  const closeBtn = overlay.querySelector('.settings-panel-close')
  const greetingEl = overlay.querySelector('.settings-greeting')
  const renameBtn = overlay.querySelector('.settings-rename-btn')

  function open() {
    overlay.style.opacity = '1'
    overlay.style.visibility = 'visible'
    const user = Storage.getUser()
    if (greetingEl) greetingEl.textContent = user?.name ? `Xin chào, ${user.name}!` : 'Chưa đăng nhập'
    updateTimeActive()
    updateWeatherActive()
  }

  function close() {
    overlay.style.opacity = '0'
    overlay.style.visibility = 'hidden'
  }

  function updateTimeActive() {
    const mode = getTimeMode()
    const dayNight = getDayNightMode()
    overlay.querySelectorAll('.settings-opt[data-time]').forEach((btn) => {
      const t = btn.dataset.time
      btn.classList.toggle('active', (t === 'auto' && mode === 'auto') || (t === 'day' && (mode === 'manual' && dayNight === 'day')) || (t === 'night' && (mode === 'manual' && dayNight === 'night')))
    })
  }

  function updateWeatherActive() {
    const w = getWeather()
    overlay.querySelectorAll('.settings-weather[data-weather]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.weather === w)
    })
  }

  overlay.querySelectorAll('.settings-opt[data-time]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.time
      if (v === 'auto') setTimeMode('auto')
      else {
        setTimeMode('manual')
        setDayNightMode(v)
      }
      updateTimeActive()
      EventBus.emit('timeModeChanged')
    })
  })

  overlay.querySelectorAll('.settings-weather[data-weather]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setWeather(btn.dataset.weather || 'clear')
      updateWeatherActive()
    })
  })

  renameBtn?.addEventListener('click', () => {
    const name = prompt('Tên mới:', Storage.getUser()?.name || '')
    if (name != null && name.trim()) {
      const user = Storage.getUser() || {}
      Storage.setUser({ ...user, name: name.trim() })
      if (greetingEl) greetingEl.textContent = `Xin chào, ${name.trim()}!`
    }
  })

  closeBtn?.addEventListener('click', close)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })

  return { open, close }
}
