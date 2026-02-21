const PREFIX = 'isocity_'

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
}
