export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(date) {
  const d = new Date(date)
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const day = days[d.getDay()]
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${day}, ${dd}/${mm}/${yyyy}`
}

export function formatTime(date) {
  const d = new Date(date)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function uuid() {
  return crypto.randomUUID()
}
