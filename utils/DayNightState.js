/**
 * Chế độ sáng/tối. Debug hoặc floating panel set; đổi state sẽ emit 'dayNightChanged'.
 */
import { EventBus } from '../core/EventBus.js'

const VALID = ['day', 'night']

/** @type {'day' | 'night'} */
let current = 'day'

export function getDayNightMode() {
  return current
}

/**
 * @param {'day' | 'night'} mode
 */
export function setDayNightMode(mode) {
  if (!VALID.includes(mode)) return
  if (current === mode) return
  current = mode
  EventBus.emit('dayNightChanged', current)
}
