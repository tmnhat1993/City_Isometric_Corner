import { getWorldContainer } from './App.js'
import { EventBus } from './EventBus.js'

const ZOOM_LEVELS = [0.6, 0.8, 1.0, 1.25, 1.5]
let currentZoomIndex = 2 // start at 1.0

let isDragging = false
let dragStart = { x: 0, y: 0 }
let containerStart = { x: 0, y: 0 }

export function initCamera(canvas) {
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerUp)
}

function onWheel(e) {
  e.preventDefault()
  const world = getWorldContainer()
  if (!world) return

  if (e.deltaY < 0 && currentZoomIndex < ZOOM_LEVELS.length - 1) {
    currentZoomIndex++
  } else if (e.deltaY > 0 && currentZoomIndex > 0) {
    currentZoomIndex--
  }

  const scale = ZOOM_LEVELS[currentZoomIndex]
  world.scale.set(scale, scale)
  EventBus.emit('zoom', { scale })
}

function onPointerDown(e) {
  isDragging = true
  const world = getWorldContainer()
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  containerStart.x = world.x
  containerStart.y = world.y
}

function onPointerMove(e) {
  if (!isDragging) return
  const world = getWorldContainer()
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  world.x = containerStart.x + dx
  world.y = containerStart.y + dy
}

function onPointerUp() {
  isDragging = false
}

export function centerCamera(screenWidth, screenHeight) {
  const world = getWorldContainer()
  if (!world) return
  // The world container pivot is at 0,0
  // We position it so the grid center is at screen center
  // This will be called after origin is set
  // World's content is already offset by origin, so just center the container
  world.x = 0
  world.y = 0
}

export function getZoom() {
  return ZOOM_LEVELS[currentZoomIndex]
}
