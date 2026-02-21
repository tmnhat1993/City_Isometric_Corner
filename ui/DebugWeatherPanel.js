/**
 * Debug: chọn phase thời tiết — Nắng, Mưa, Mưa to, Tuyết, Tuyết nặng.
 */
import { getWeather, setWeather } from '../utils/WeatherState.js'

const WEATHER_OPTIONS = [
  { value: 'clear', label: 'Nắng' },
  { value: 'rain', label: 'Mưa' },
  { value: 'rain_heavy', label: 'Mưa to' },
  { value: 'snow', label: 'Tuyết' },
  { value: 'snow_heavy', label: 'Tuyết nặng' },
  { value: 'snow_blizzard', label: 'Tuyết lớn' },
]

function mountSection(container, syncFns) {
  const section = document.createElement('div')
  section.className = 'debug-modal-section'
  const buttonsHtml = WEATHER_OPTIONS.map(
    (opt) =>
      `<button type="button" class="debug-weather-btn" data-weather="${opt.value}">${opt.label}</button>`
  ).join(' ')
  section.innerHTML = `
    <div class="debug-modal-section-title">Thời tiết</div>
    <p class="debug-panel-hint">Nắng / Mưa / Mưa to (chớp) / Tuyết / Tuyết nặng / Tuyết lớn (bão tuyết).</p>
    <div class="debug-weather-buttons">
      ${buttonsHtml}
    </div>
  `
  container.appendChild(section)

  function updateActive() {
    const current = getWeather()
    section.querySelectorAll('.debug-weather-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.weather === current)
    })
  }

  section.querySelectorAll('.debug-weather-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setWeather(btn.dataset.weather || 'clear')
      updateActive()
    })
  })

  if (Array.isArray(syncFns)) syncFns.push(updateActive)
  updateActive()
}

export function initDebugWeatherPanel(container, syncFns) {
  if (!container) return
  mountSection(container, syncFns)
}
