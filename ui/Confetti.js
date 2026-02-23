/**
 * Small confetti burst when a task is marked done. Uses DOM + CSS animation.
 */
const COLORS = ['#4fc3f7', '#81d4fa', '#ffb74d', '#a5d6a7', '#ce93d8']
const PARTICLE_COUNT = 12
const DURATION_MS = 900

export function showConfetti(anchorEl) {
  const rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: window.innerWidth / 2 - 40, top: window.innerHeight / 2 - 40, width: 80, height: 80 }
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:10000'
  document.body.appendChild(container)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div')
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5
    const vel = 80 + Math.random() * 120
    const tx = Math.cos(angle) * vel
    const ty = Math.sin(angle) * vel - 60
    const size = 4 + Math.random() * 4
    const rot = (Math.random() - 0.5) * 360
    const animName = `confetti-${Date.now()}-${i}`
    const style = document.createElement('style')
    style.textContent = `@keyframes ${animName}{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(${tx}px,${ty}px) rotate(${rot}deg);opacity:0}}`
    document.head.appendChild(style)
    p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${COLORS[i % COLORS.length]};border-radius:1px;animation:${animName} ${DURATION_MS}ms ease-out forwards`
    container.appendChild(p)
    setTimeout(() => style.remove(), DURATION_MS + 100)
  }
  setTimeout(() => container.remove(), DURATION_MS + 50)
}
