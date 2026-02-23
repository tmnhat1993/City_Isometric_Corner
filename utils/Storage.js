const PREFIX = 'isocity_'

let onStorageError = null
/** Call to show user-visible message when storage fails (e.g. toast). */
export function setStorageErrorHandler(fn) {
  onStorageError = fn
}

export const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage full or unavailable:', e)
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        typeof onStorageError === 'function' && onStorageError('Bộ nhớ đã đầy. Xóa bớt dữ liệu hoặc task cũ để tiếp tục.')
      } else {
        typeof onStorageError === 'function' && onStorageError('Không thể lưu dữ liệu.')
      }
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },

  getUser() {
    return this.get('user')
  },

  setUser(data) {
    this.set('user', data)
  },

  checkUser() {
    return this.getUser() !== null
  },

  /** @param {string} dateKey YYYY-MM-DD */
  getTasksForDay(dateKey) {
    const list = this.get('tasks_' + dateKey)
    return Array.isArray(list) ? list : []
  },

  /** @param {string} dateKey YYYY-MM-DD */
  setTasksForDay(dateKey, tasks) {
    this.set('tasks_' + dateKey, tasks)
    const days = this.get('task_days') || []
    if (!days.includes(dateKey)) {
      days.push(dateKey)
      days.sort((a, b) => b.localeCompare(a))
      this.set('task_days', days)
    }
  },

  getTaskDays() {
    return this.get('task_days') || []
  },
}
