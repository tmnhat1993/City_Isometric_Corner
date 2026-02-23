import { Assets } from 'pixi.js'
import { initApp, getApp, getWorldContainer, getWeatherContainer, getBackgroundContainer } from './core/App.js'
import { setOrigin, getGridPixelSize, GRID_W, GRID_H, TILE_W, TILE_H } from './core/GridSystem.js'
import { initCamera, centerCamera } from './core/Camera.js'
import { buildWorldMap } from './world/WorldMap.js'
import { EventBus } from './core/EventBus.js'
import { BUILDING_NORTH_IMAGE_PATH } from './world/BuildingNorth.js'
import { MART_EAST_IMAGE_PATH } from './world/BuildingEast.js'
import { PARK_WEST_IMAGE_PATH } from './world/BuildingWest.js'
import { PARK_SOUTH_IMAGE_PATH } from './world/BuildingSouth.js'

const SEDAN_COLORS = ['red', 'green', 'blue']
const SEDAN_FACINGS = [
  { key: 'ne', file: 'northeast' },
  { key: 'nw', file: 'northwest' },
  { key: 'se', file: 'southeast' },
  { key: 'sw', file: 'southwest' },
]
function getSedanPath(color, facingKey) {
  const f = SEDAN_FACINGS.find((x) => x.key === facingKey)
  return `/img/sedan-assets/sedan-${color}-${f ? f.file : facingKey}.png`
}
import { initWeatherDayNightFloating } from './ui/WeatherDayNightFloating.js'
import { initDayNightCycle } from './environment/DayNightCycle.js'
import { initBuildingWindowLights } from './environment/BuildingWindowLights.js'
import { initWelcomeModal } from './ui/WelcomeModal.js'
import { initTimeDisplay } from './ui/TimeDisplay.js'
import { initTodayTasksPanel } from './ui/TodayTasksPanel.js'
import { initTaskHistory } from './ui/TaskHistory.js'
import { initSettingsPanel } from './ui/SettingsPanel.js'
import { initFloatingActionButtons } from './ui/FloatingActionButtons.js'
import { tickFps, initFpsMonitor } from './utils/FpsMonitor.js'
import { setStorageErrorHandler } from './utils/Storage.js'
import { showToast } from './ui/Toast.js'
import { getWeather } from './utils/WeatherState.js'
import { getDayNightMode } from './utils/DayNightState.js'
import { buildWeatherLayer } from './world/WeatherLayer.js'
import { updateWeatherBackground } from './world/WeatherBackground.js'
import { getWeatherFilter } from './world/WeatherFilter.js'

function initAppInfoPopup() {
  const btn = document.getElementById('app-info-btn')
  const popup = document.getElementById('app-info-popup')
  if (!btn || !popup) return
  const overlay = popup.querySelector('.app-info-popup-overlay')
  const closeBtn = popup.querySelector('.app-info-popup-close')
  function open() {
    popup.classList.add('is-open')
    popup.setAttribute('aria-hidden', 'false')
  }
  function close() {
    popup.classList.remove('is-open')
    popup.setAttribute('aria-hidden', 'true')
  }
  btn.addEventListener('click', open)
  closeBtn?.addEventListener('click', close)
  overlay?.addEventListener('click', close)
}

async function main() {
  const canvasContainer = document.getElementById('canvas-container')

  // Init PixiJS
  const app = await initApp(canvasContainer)

  // Load building/park/construction images from public/img (fallback to procedural if missing)
  let northTexture = null
  let eastTexture = null
  let westTexture = null
  let southTexture = null
  try {
    northTexture = await Assets.load(BUILDING_NORTH_IMAGE_PATH)
  } catch (e) {
    console.warn('Building north image not found at', BUILDING_NORTH_IMAGE_PATH, '- using procedural drawing.')
  }
  try {
    eastTexture = await Assets.load(MART_EAST_IMAGE_PATH)
  } catch (e) {
    console.warn('Mart east image not found at', MART_EAST_IMAGE_PATH, '- using procedural drawing.')
  }
  try {
    westTexture = await Assets.load(PARK_WEST_IMAGE_PATH)
  } catch (e) {
    console.warn('Park west image not found at', PARK_WEST_IMAGE_PATH, '- using procedural drawing.')
  }
  try {
    southTexture = await Assets.load(PARK_SOUTH_IMAGE_PATH)
  } catch (e) {
    console.warn('Park south image not found at', PARK_SOUTH_IMAGE_PATH, '- South slot empty.')
  }

  const ROAD_TILE_VARIANTS = ['ne', 'nw', 'se', 'sw', 'se-cross', 'se-cross-2', 'ne-cross', 'ne-cross-2', 'nw-cross', 'nw-cross-2', 'sw-cross', 'sw-cross-2']
  const roadTileTextures = {}
  const customRoadPaths = {
    'se-cross': '/img/road-tile/road-se-cross.png',
    'se-cross-2': '/img/road-tile/road-se-cross-2.png',
    'ne-cross': '/img/road-tile/road-ne-cross.png',
    'ne-cross-2': '/img/road-tile/road-ne-cross-2.png',
    'nw-cross': '/img/road-tile/road-nw-cross.png',
    'nw-cross-2': '/img/road-tile/road-nw-cross-2.png',
    'sw-cross': '/img/road-tile/road-sw-cross.png',
    'sw-cross-2': '/img/road-tile/road-sw-cross-2.png',
  }
  const optionalVariants = ['se-cross', 'se-cross-2', 'ne-cross', 'ne-cross-2', 'nw-cross', 'nw-cross-2', 'sw-cross', 'sw-cross-2']
  for (const v of ROAD_TILE_VARIANTS) {
    try {
      const path = customRoadPaths[v] ?? `/img/road-tile/road-${v}.png`
      roadTileTextures[v] = await Assets.load(path)
    } catch (e) {
      if (!optionalVariants.includes(v)) console.warn(`Road tile /img/road-tile/road-${v}.png not found – variant ${v} will use solid color.`)
    }
  }
  const hasAnyRoadTexture = ['ne', 'nw', 'se', 'sw'].some((v) => roadTileTextures[v])
  const roadTileTexturesToPass = hasAnyRoadTexture ? roadTileTextures : null

  // Góc vỉa hè: corner-ne, corner-nw, corner-sw, corner-se từ /img/road-tile/
  const sidewalkCornerTextures = {}
  for (const key of ['ne', 'nw', 'sw', 'se']) {
    try {
      sidewalkCornerTextures[key] = await Assets.load(`/img/road-tile/corner-${key}.png`)
    } catch (e) {
      sidewalkCornerTextures[key] = null
    }
  }

  let sedanTextures = {}
  try {
    for (const color of SEDAN_COLORS) {
      const facings = {}
      let ok = true
      for (const { key, file } of SEDAN_FACINGS) {
        try {
          facings[key] = await Assets.load(getSedanPath(color, key))
        } catch (e) {
          ok = false
          break
        }
      }
      if (ok) sedanTextures[color] = facings
    }
    if (Object.keys(sedanTextures).length === 0) {
      sedanTextures = {}
      throw new Error('No sedan color set loaded')
    }
  } catch (e) {
    console.warn('Sedan assets not found under /img/sedan-assets/ – vehicles disabled.', e)
  }

  // Calculate origin so the grid is centered on screen
  const screenW = app.screen.width
  const screenH = app.screen.height

  // 12x12 grid: width = 24 * 32 = 768, height = 24 * 16 = 384
  // Origin = north corner of tile (0,0), centered on screen
  // Add extra vertical offset to account for building heights above + edge depth below
  const gridPixels = getGridPixelSize()
  const originX = screenW / 2
  const originY = (screenH - gridPixels.height) / 2 + TILE_H * 3

  setOrigin(originX, originY)

  setStorageErrorHandler(showToast)
  initAppInfoPopup()
  initWeatherDayNightFloating()
  initDayNightCycle()
  initBuildingWindowLights()
  initWelcomeModal()
  initTimeDisplay()
  initTodayTasksPanel()
  initTaskHistory()
  const settingsPanel = initSettingsPanel()
  initFloatingActionButtons(null, settingsPanel)
  app.ticker.add(() => tickFps(performance.now()))
  initFpsMonitor(false)

  const worldContainer = getWorldContainer()
  const weatherContainer = getWeatherContainer()
  function buildWorld() {
    buildWorldMap(worldContainer, getDayNightMode(), { northTexture, eastTexture, westTexture, southTexture, roadTileTextures: roadTileTexturesToPass, sidewalkCornerTextures, sedanTextures })
  }
  buildWorld()

  let lightningTexture = null
  try {
    lightningTexture = await Assets.load('/img/lightning-effect.jpg')
  } catch (e) {
    console.warn('Lightning effect image not found at /img/lightning-effect.jpg – using white flash.')
  }
  let snowflakeTexture = null
  try {
    snowflakeTexture = await Assets.load('/img/snowflake.png')
  } catch (e) {
    console.warn('Snowflake image not found at /img/snowflake.png – bông tuyết to sẽ không hiển thị.')
  }

  let weatherDestroy = null
  function refreshWeatherVisuals() {
    const weather = getWeather()
    updateWeatherBackground(getBackgroundContainer(), weather)
    worldContainer.filters = [getWeatherFilter(weather, getDayNightMode())]
    if (weatherDestroy) weatherDestroy()
    weatherDestroy = buildWeatherLayer(weatherContainer, weather, lightningTexture, getBackgroundContainer(), snowflakeTexture).destroy
  }
  refreshWeatherVisuals()

  EventBus.on('weatherChanged', () => refreshWeatherVisuals())
  EventBus.on('dayNightChanged', () => {
    buildWorld()
    refreshWeatherVisuals()
  })

  // Init camera (pan + zoom)
  initCamera(canvasContainer)
  centerCamera(screenW, screenH)

  // Handle resize (origin làm tròn để tránh lệch sub-pixel giữa Chrome và Cursor)
  EventBus.on('resize', ({ width, height }) => {
    const newOriginX = Math.round(width / 2)
    const newOriginY = Math.round((height - gridPixels.height) / 2 + TILE_H * 3)
    setOrigin(newOriginX, newOriginY)
    buildWorld()
    refreshWeatherVisuals()
  })

  EventBus.on('groundTileOverridesChanged', () => {
    buildWorld()
    refreshWeatherVisuals()
  })

  console.log('IsoCity Sprint 1 initialized!')
}

main().catch(console.error)
