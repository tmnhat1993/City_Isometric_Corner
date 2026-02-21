/**
 * Filter theo thời tiết: nắng = tăng brightness + vibrant ~5% (kể cả mặt đường); mưa/tuyết = hơi sẫm.
 */
import { ColorMatrixFilter } from 'pixi.js'

/** brightness (<1 tối, >1 sáng), saturate (0 = không đổi, >0 = vibrant hơn) */
const WEATHER_FILTER = {
  clear: { brightness: 1.05, saturate: 0.05 },
  rain: { brightness: 0.88, saturate: 0.02 },
  rain_heavy: { brightness: 0.70, saturate: 0.01 },
  snow: { brightness: 0.86, saturate: 0.0 },
  snow_heavy: { brightness: 0.84, saturate: 0.0 },
  snow_blizzard: { brightness: 0.45, saturate: 0.0 },
}

let sharedFilter = null

/**
 * Lấy filter đã cấu hình cho weather. Dùng chung một instance, chỉ đổi tham số.
 * @param {string} weather
 * @returns {ColorMatrixFilter}
 */
export function getWeatherFilter(weather) {
  if (!sharedFilter) sharedFilter = new ColorMatrixFilter()
  const cfg = WEATHER_FILTER[weather] ?? WEATHER_FILTER.clear
  sharedFilter.brightness(cfg.brightness, false)
  sharedFilter.saturate(cfg.saturate, true)
  return sharedFilter
}
