/**
 * Filter theo thời tiết: nắng = tăng brightness + vibrant ~5% (kể cả mặt đường); mưa/tuyết = hơi sẫm.
 */
import { ColorMatrixFilter } from 'pixi.js'

/** brightness (<1 tối, >1 sáng), saturate. Plan 8.3: Clear Night, Rainy Day/Night, Snowy Day/Night. */
const WEATHER_FILTER = {
  clear: { day: { brightness: 1.05, saturate: 0.05 }, night: { brightness: 0.35, saturate: 0.02 } },
  rain: { day: { brightness: 0.88, saturate: 0.02 }, night: { brightness: 0.25, saturate: 0.01 } },
  rain_heavy: { day: { brightness: 0.70, saturate: 0.01 }, night: { brightness: 0.20, saturate: 0 } },
  snow: { day: { brightness: 0.86, saturate: 0 }, night: { brightness: 0.30, saturate: 0 } },
  snow_heavy: { day: { brightness: 0.84, saturate: 0 }, night: { brightness: 0.28, saturate: 0 } },
  snow_blizzard: { day: { brightness: 0.45, saturate: 0 }, night: { brightness: 0.22, saturate: 0 } },
}

let sharedFilter = null

/**
 * Lấy filter đã cấu hình cho weather + day/night. Dùng chung một instance, chỉ đổi tham số.
 * @param {string} weather
 * @param {'day'|'night'} [mode]
 * @returns {ColorMatrixFilter}
 */
/**
 * Ban đêm không dùng filter tối — chỉ có layer navy phủ canvas.
 */
export function getWeatherFilter(weather, mode = 'day') {
  if (!sharedFilter) sharedFilter = new ColorMatrixFilter()
  const w = WEATHER_FILTER[weather] ?? WEATHER_FILTER.clear
  const cfg = mode === 'night' ? w.day : (w[mode] ?? w.day ?? w)
  sharedFilter.brightness(cfg.brightness, false)
  sharedFilter.saturate(cfg.saturate ?? 0, true)
  return sharedFilter
}
