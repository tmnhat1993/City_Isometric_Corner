import { Container, Sprite } from 'pixi.js'
import { gridToScreen, TILE_W } from '../core/GridSystem.js'
import { getApp } from '../core/App.js'
import { getDebugVehicleLaneOverrides } from '../utils/DebugVehicleLanes.js'
import { getDebugVehicleStopOffsets } from '../utils/DebugVehicleStopOffsets.js'
import { EventBus } from '../core/EventBus.js'
import { updateTrafficLight, mustStopForLane } from './TrafficLightController.js'

/** Target width of sedan on screen (fraction of tile) */
const SEDAN_DISPLAY_WIDTH = TILE_W * 0.85

/**
 * Lane definition: mỗi làn ứng đúng 1 tile đường (row 5/6 hoặc col 5/6).
 * - Đường ngang (rows 5, 6): làn 0 = row 5 (L→R), làn 1 = row 6 (R→L)
 * - Đường dọc (cols 5, 6):   làn 2 = col 5 (T→B), làn 3 = col 6 (B→T)
 */
export const LANES = [
  { axis: 'h', fromLeft: true, facing: 'se', row: 5 },   // Ngang L→R, tile row 5
  { axis: 'h', fromLeft: false, facing: 'nw', row: 6 },   // Ngang R→L, tile row 6
  { axis: 'v', fromTop: true, facing: 'sw', col: 5 },    // Dọc T→B, tile col 5
  { axis: 'v', fromTop: false, facing: 'ne', col: 6 },    // Dọc B→T, tile col 6
]

/**
 * Đường ngang (SE↔NW): [start, end] col. Progress 0 = spawn, 1 = despawn.
 * - SE→NW (lane 1): xuất hiện sớm 1 tile, kết thúc sớm 1 tile → 12.5..0.5
 * - NW→SE (lane 0): xuất hiện trễ 1 tile, kết thúc trễ 1 tile → 0.5..12.5
 */
const H_LANE_RANGES = [[0.5, 12.5], [12.5, 0.5]]

/**
 * Đường dọc (NE↔SW): [start, end] row. Progress 0 = spawn, 1 = despawn.
 * - SW→NE (lane 3): xuất hiện và kết thúc sớm 1 tile → 12.5..0.5
 * - NE→SW (lane 2): xuất hiện và kết thúc trễ 1 tile → 0.5..12.5
 */
const V_LANE_RANGES = [[0.5, 12.5], [12.5, 0.5]]

/**
 * Get screen position and facing for a point on the road (t in 0..1).
 * @param {number} laneId 0..3
 * @param {number} t progress 0..1
 * @returns {{ x: number, y: number, facing: string }}
 */
function getPositionOnLane(laneId, t) {
  const lane = LANES[laneId]
  let col, row
  if (lane.axis === 'h') {
    const [start, end] = H_LANE_RANGES[laneId]
    col = start + t * (end - start)
    row = lane.row
  } else {
    const [start, end] = V_LANE_RANGES[laneId - 2]
    col = lane.col
    row = start + t * (end - start)
  }
  const pos = gridToScreen(col, row)
  return { x: pos.x, y: pos.y, facing: lane.facing }
}

/**
 * Build the vehicle layer: sedans moving on the intersection roads.
 * @param {Object} textures - By color: { red: { ne, nw, se, sw }, green: {...}, blue: {...} } (random color when spawn)
 * @returns {{ container: Container, destroy: () => void }}
 */
export function buildVehicleLayer(textures = {}) {
  const container = new Container()
  container.label = 'vehicles'
  container.sortableChildren = true

  const colorKeys = Object.keys(textures).filter(
    (k) => textures[k] && textures[k].ne && textures[k].nw && textures[k].se && textures[k].sw
  )

  let laneOverrides = getDebugVehicleLaneOverrides() || {}
  let stopOffsets = getDebugVehicleStopOffsets()

  const cars = []
  const BASE_SPEED = 0.15
  /** Gia tốc khi từ dừng → chạy (progress/s²). Dừng luôn ngay lập tức (currentSpeed = 0). */
  const ACCELERATION = 0.45
  const MAX_CARS_PER_LANE = 3
  const SPAWN_INTERVAL_MS = 1200

  function spawnCarAtEdge(laneId) {
    const facing = LANES[laneId].facing
    const colorSet = colorKeys.length > 0 ? textures[colorKeys[Math.floor(Math.random() * colorKeys.length)]] : textures
    const texture = (colorSet && colorSet[facing]) || (colorSet && colorSet.ne)
    if (!texture) return
    const countInLane = cars.filter((c) => c.laneId === laneId).length
    if (countInLane >= MAX_CARS_PER_LANE) return

    const carsInLane = cars.filter((c) => c.laneId === laneId)
    const minProgressInLane = carsInLane.length === 0 ? 1 : Math.min(...carsInLane.map((c) => c.progress))
    const desiredSpawn = getSpawnProgress(laneId)
    const progress = Math.max(0, Math.min(desiredSpawn, minProgressInLane - CLEARANCE_PROGRESS))
    if (carsInLane.length > 0 && minProgressInLane - progress < CLEARANCE_PROGRESS) return

    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5, 1)
    if (sprite.width > 0) sprite.scale.set(SEDAN_DISPLAY_WIDTH / sprite.width)
    const speed = BASE_SPEED * (0.8 + Math.random() * 0.4)
    const { x, y } = getPositionOnLane(laneId, progress)
    sprite.x = x
    sprite.y = y
    container.addChild(sprite)
    /** currentSpeed: tốc độ thực mỗi frame; dừng = 0, chạy tăng dần tới speed. */
    cars.push({ sprite, laneId, progress, speed, currentSpeed: 0 })
  }

  const app = getApp()
  if (!app || !app.ticker) {
    return { container, destroy: () => {} }
  }

  /**
   * Vạch dừng đèn đỏ: cố định theo tọa độ lưới (như bản cũ), không phụ thuộc đoạn spawn/despawn.
   * Chuyển vị trí lưới đó sang progress theo từng làn.
   */
  const STOP_LINE_GRID = [4.5, 6.5, 4.5, 6.5] // col lane 0,1; row lane 2,3 — vị trí dừng cố định, không phụ thuộc spawn/despawn
  function getStopLineProgress(laneId) {
    const off = stopOffsets[laneId] ?? 0
    let progress
    if (laneId <= 1) {
      const [start, end] = H_LANE_RANGES[laneId]
      progress = (STOP_LINE_GRID[laneId] - start) / (end - start)
    } else {
      const [start, end] = V_LANE_RANGES[laneId - 2]
      progress = (STOP_LINE_GRID[laneId] - start) / (end - start)
    }
    return Math.max(0.15, Math.min(0.6, progress + off))
  }
  /** Spawn luôn nằm trước vạch dừng. */
  const SPAWN_MARGIN_BEFORE_STOP = 0.45
  function getSpawnProgress(laneId) {
    return Math.max(0, getStopLineProgress(laneId) - SPAWN_MARGIN_BEFORE_STOP)
  }
  /** Khoảng cách tối thiểu (theo progress) giữa 2 xe cùng làn — tránh đụng nhau, tạo nối đuôi */
  const CLEARANCE_PROGRESS = 0.14
  const VEHICLE_START_DELAY_MS = 2500
  let vehicleStartTime = null
  let lastSpawnTime = null
  let nextSpawnLane = 0

  const update = (ticker) => {
    const dt = ticker.deltaMS / 1000
    const now = performance.now()
    updateTrafficLight(now)

    if (vehicleStartTime == null) vehicleStartTime = now
    if (now - vehicleStartTime < VEHICLE_START_DELAY_MS) {
      container.sortChildren()
      return
    }

    if (lastSpawnTime == null) lastSpawnTime = now
    if (now - lastSpawnTime >= SPAWN_INTERVAL_MS) {
      lastSpawnTime = now
      spawnCarAtEdge(nextSpawnLane)
      nextSpawnLane = (nextSpawnLane + 1) % 4
    }

    for (let i = cars.length - 1; i >= 0; i--) {
      const car = cars[i]
      const stopLine = getStopLineProgress(car.laneId)
      const mustStop = mustStopForLane(car.laneId)
      const sameLane = cars.filter((c) => c.laneId === car.laneId)
      const minAhead = sameLane.reduce((min, c) => {
        if (c.progress > car.progress && (min == null || c.progress < min)) return c.progress
        return min
      }, null)

      let nextProgress
      const wouldCrossStopLine = mustStop && car.progress <= stopLine && (car.progress + car.speed * dt) > stopLine
      const blockedByCarAhead = minAhead != null && minAhead - car.progress < CLEARANCE_PROGRESS

      if (wouldCrossStopLine) {
        nextProgress = stopLine
        car.currentSpeed = 0
      } else if (blockedByCarAhead) {
        nextProgress = car.progress
        car.currentSpeed = 0
      } else {
        car.currentSpeed = Math.min(car.currentSpeed + ACCELERATION * dt, car.speed)
        nextProgress = car.progress + car.currentSpeed * dt
      }

      if (nextProgress >= 1) {
        car.sprite.destroy()
        cars.splice(i, 1)
        continue
      }
      if (nextProgress < 0) nextProgress = 0
      car.progress = nextProgress

      const { x, y } = getPositionOnLane(car.laneId, car.progress)
      const o = laneOverrides[car.laneId] || {}
      car.sprite.x = x + (o.offsetX ?? 0)
      car.sprite.y = y + (o.offsetY ?? 0)
      car.sprite.zIndex = car.sprite.y + car.progress * 1000
    }
    container.sortChildren()
  }

  app.ticker.add(update)

  const onOverridesChanged = (next) => {
    laneOverrides = next || {}
  }
  const onStopOffsetsChanged = (next) => {
    stopOffsets = next || {}
  }
  EventBus.on('vehicleLaneOverridesChanged', onOverridesChanged)
  EventBus.on('vehicleStopOffsetsChanged', onStopOffsetsChanged)

  function destroy() {
    app.ticker.remove(update)
    EventBus.off('vehicleLaneOverridesChanged', onOverridesChanged)
    EventBus.off('vehicleStopOffsetsChanged', onStopOffsetsChanged)
    container.destroy({ children: true })
  }

  return { container, destroy }
}
