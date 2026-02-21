export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
