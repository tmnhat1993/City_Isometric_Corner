/**
 * Phase thời tiết: nắng, mưa, mưa to, tuyết, tuyết nặng.
 * Debug có thể set; đổi state sẽ emit 'weatherChanged'.
 */

import { EventBus } from '../core/EventBus.js'

const VALID = ['clear', 'rain', 'rain_heavy', 'snow', 'snow_heavy', 'snow_blizzard']

/** @type {string} */
let current = 'clear'

export function getWeather() {
  return current
}

/**
 * @param {string} weather
 */
export function setWeather(weather) {
  if (!VALID.includes(weather)) return
  if (current === weather) return
  current = weather
  EventBus.emit('weatherChanged', current)
}
