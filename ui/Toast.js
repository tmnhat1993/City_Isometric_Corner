/**
 * Simple toast message for storage/error feedback.
 */
const ID = 'isocity-toast'
const DURATION_MS = 5000

let hideTimer = null

function getOrCreate() {
  let el = document.getElementById(ID)
  if (!el) {
    el = document.createElement('div')
    el.id = ID
    el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:10001;max-width:min(320px, calc(100vw - 24px));padding:9px 14px;font-family:\'Montserrat\',sans-serif;font-size:14px;color:#e0f0ff;background:rgba(20,30,50,0.95);border:1px solid #e57373;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:none'
    document.body.appendChild(el)
  }
  return el
}

export function showToast(message) {
  const el = getOrCreate()
  if (hideTimer) clearTimeout(hideTimer)
  el.textContent = message
  el.style.display = 'block'
  hideTimer = setTimeout(() => {
    el.style.display = 'none'
    hideTimer = null
  }, DURATION_MS)
}
