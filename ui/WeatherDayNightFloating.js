/**
 * Panel nổi góc trái trên: Mưa lớn, Mưa nhỏ, Nắng, Tuyết, Sáng/Tối.
 * Dùng WeatherState + DayNightState; không nằm trong debug modal.
 */
import { EventBus } from '../core/EventBus.js'
import { getWeather, setWeather } from '../utils/WeatherState.js'
import { getDayNightMode, setDayNightMode } from '../utils/DayNightState.js'

const CONTAINER_ID = 'weather-daynight-floating'

const WEATHER_OPTIONS = [
  { value: 'clear', label: 'Nắng' },
  { value: 'rain', label: 'Mưa nhỏ' },
  { value: 'rain_heavy', label: 'Mưa Lớn' },
  { value: 'snow', label: 'Tuyết' },
  { value: 'snow_heavy', label: 'Tuyết nặng' },
  { value: 'snow_blizzard', label: 'Bão tuyết' },
]

function updateActive(container) {
  const currentWeather = getWeather()
  const currentMode = getDayNightMode()
  container.querySelectorAll('.weather-daynight-btn[data-weather]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.weather === currentWeather)
  })
  container.querySelectorAll('.weather-daynight-btn[data-mode]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === currentMode)
  })
}

/**
 * Gọi từ main.js: tạo panel nổi góc trái trên, subscribe weatherChanged/dayNightChanged để sync.
 */
export function initWeatherDayNightFloating() {
  if (document.getElementById(CONTAINER_ID)) return

  const container = document.createElement('div')
  container.id = CONTAINER_ID
  container.className = 'weather-daynight-floating'

  const weatherHtml = WEATHER_OPTIONS.map(
    (opt) =>
      `<button type="button" class="weather-daynight-btn" data-weather="${opt.value}" title="${opt.label}">${opt.label}</button>`
  ).join('')

  container.innerHTML = `
    <div class="weather-daynight-row">
      ${weatherHtml}
    </div>
    <div class="weather-daynight-row">
      <button type="button" class="weather-daynight-btn" data-mode="day" title="Sáng">Sáng</button>
      <button type="button" class="weather-daynight-btn" data-mode="night" title="Tối">Tối</button>
    </div>
  `

  container.querySelectorAll('.weather-daynight-btn[data-weather]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setWeather(btn.dataset.weather || 'clear')
      updateActive(container)
    })
  })
  container.querySelectorAll('.weather-daynight-btn[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setDayNightMode(btn.dataset.mode || 'day')
      updateActive(container)
    })
  })

  document.body.appendChild(container)
  updateActive(container)

  EventBus.on('weatherChanged', () => updateActive(container))
  EventBus.on('dayNightChanged', () => updateActive(container))
}
