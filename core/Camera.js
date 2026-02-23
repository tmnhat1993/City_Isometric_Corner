import { getApp, getWorldContainer } from './App.js'
import { EventBus } from './EventBus.js'

const ZOOM_LEVELS = [0.6, 0.8, 1.0, 1.25, 1.5]
let currentZoomIndex = 2 // start at 1.0

let isDragging = false
let dragStart = { x: 0, y: 0 }
let containerStart = { x: 0, y: 0 }

let pinchStartDist = 0
let pinchStartScale = 1
let lastTapTime = 0

function dist(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

function onTouchStart(e) {
  if (e.touches.length === 2) {
    pinchStartDist = dist(e.touches[0], e.touches[1])
    pinchStartScale = ZOOM_LEVELS[currentZoomIndex]
  }
}

function onTouchMove(e) {
  if (e.touches.length === 2 && pinchStartDist > 0) {
    e.preventDefault()
    const d = dist(e.touches[0], e.touches[1])
    const ratio = d / pinchStartDist
    let newScale = pinchStartScale * ratio
    let idx = ZOOM_LEVELS.findIndex((z) => z >= newScale)
    if (idx < 0) idx = ZOOM_LEVELS.length - 1
    if (newScale < ZOOM_LEVELS[0]) idx = 0
    if (newScale > ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) idx = ZOOM_LEVELS.length - 1
    currentZoomIndex = idx
    const world = getWorldContainer()
    if (world) world.scale.set(ZOOM_LEVELS[currentZoomIndex], ZOOM_LEVELS[currentZoomIndex])
    EventBus.emit('zoom', { scale: ZOOM_LEVELS[currentZoomIndex] })
  }
}

function onTouchEnd(e) {
  if (e.touches.length < 2) pinchStartDist = 0
}

function onDoubleTap(e) {
  const now = Date.now()
  if (now - lastTapTime < 350) {
    lastTapTime = 0
    e.preventDefault()
    const app = getApp()
    if (app) centerCamera(app.screen.width, app.screen.height)
    currentZoomIndex = 2
    const world = getWorldContainer()
    if (world) world.scale.set(1, 1)
    world.x = 0
    world.y = 0
    EventBus.emit('zoom', { scale: 1 })
    return
  }
  lastTapTime = now
}

export function initCamera(canvas) {
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerUp)

  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })

  canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0 && e.changedTouches?.length === 1) onDoubleTap(e)
  }, { passive: false })
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
