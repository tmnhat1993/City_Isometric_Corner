/**
 * Chế độ sáng/tối. Manual (Sáng/Tối) hoặc auto theo giờ thực; đổi state emit 'dayNightChanged'.
 */
import { EventBus } from '../core/EventBus.js'

const VALID = ['day', 'night']
const TIME_MODES = ['auto', 'manual']

/** @type {'day' | 'night'} */
let current = 'day'

/** @type {'auto' | 'manual'} */
let timeMode = 'manual'

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

export function getTimeMode() {
  return timeMode
}

/**
 * @param {'auto' | 'manual'} mode
 */
export function setTimeMode(mode) {
  if (!TIME_MODES.includes(mode)) return
  if (timeMode === mode) return
  timeMode = mode
  EventBus.emit('timeModeChanged', timeMode)
}
