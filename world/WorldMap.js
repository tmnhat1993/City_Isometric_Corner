import { Container } from 'pixi.js'
import { buildGroundLayer } from './GroundLayer.js'
import { buildDecorations } from './Decoration.js'
import { buildBuildingNorth } from './BuildingNorth.js'
import { buildBuildingEast } from './BuildingEast.js'
import { buildBuildingWest } from './BuildingWest.js'
import { buildBuildingSouth } from './BuildingSouth.js'
import { buildVehicleLayer } from './VehicleLayer.js'
import { buildTrafficLights } from './TrafficLights.js'

/**
 * 12x12 grid layout:
 *
 *   NW (North office):       cols 0-3,  rows 0-3
 *   NE (East restaurant):    cols 8-11, rows 0-3
 *   SW (West park):          cols 0-3,  rows 8-11
 *   SE (South construction): cols 8-11, rows 8-11
 *
 *   Sidewalk: col 4, col 7, row 4, row 7
 *   Road:     col 5-6, row 5-6
 *
 * @param {object} [assets] - Optional: { northTexture, eastTexture, westTexture, southTexture, sedanTextures } for building/park/construction and sedan (ne, nw, se, sw)
 */
export function buildWorldMap(worldContainer, mode = 'day', assets = {}) {
  if (worldContainer._vehicleDestroy) {
    worldContainer._vehicleDestroy()
    worldContainer._vehicleDestroy = null
  }
  if (worldContainer._trafficLightsDestroy) {
    worldContainer._trafficLightsDestroy()
    worldContainer._trafficLightsDestroy = null
  }

  worldContainer.removeChildren()

  // Ground layer (edges + tiles + road texture + sidewalk corner 1..4)
  const roadTileTextures = assets.roadTileTextures ?? null
  const sidewalkCornerTextures = assets.sidewalkCornerTextures ?? null
  const { container: groundContainer, tileMap } = buildGroundLayer(mode, roadTileTextures, sidewalkCornerTextures)
  worldContainer.addChild(groundContainer)

  // Decorations: street lights + benches (đèn đường, ghế vỉa hè)
  const decorationsContainer = buildDecorations(mode)
  worldContainer.addChild(decorationsContainer)

  const northTexture = assets.northTexture ?? null
  const eastTexture = assets.eastTexture ?? null
  const westTexture = assets.westTexture ?? null
  const southTexture = assets.southTexture ?? null

  // Nhóm 1: Bắc + Tây — layer thấp, xe vẽ đè lên (giữ như hiện tại)
  const buildingsBehind = new Container()
  buildingsBehind.label = 'buildingsBehind'
  buildingsBehind.sortableChildren = true
  const northBuilding = buildBuildingNorth(0, 0, mode, northTexture)
  const westBuilding = buildBuildingWest(0, 8, mode, westTexture)
  buildingsBehind.addChild(northBuilding)
  buildingsBehind.addChild(westBuilding)
  worldContainer.addChild(buildingsBehind)

  // Vehicles (giữa hai nhóm công trình)
  const sedanTextures = assets.sedanTextures ?? {}
  const { container: vehicleContainer, destroy: vehicleDestroy } = buildVehicleLayer(sedanTextures)
  worldContainer.addChild(vehicleContainer)
  worldContainer._vehicleDestroy = vehicleDestroy

  // Nhóm 2: Nam + Đông — layer cao, che xe (vẽ sau vehicles)
  const buildingsFront = new Container()
  buildingsFront.label = 'buildingsFront'
  buildingsFront.sortableChildren = true
  const eastBuilding = buildBuildingEast(8, 0, mode, eastTexture)
  const southBuilding = buildBuildingSouth(8, 8, mode, southTexture)
  buildingsFront.addChild(eastBuilding)
  buildingsFront.addChild(southBuilding)
  worldContainer.addChild(buildingsFront)

  // Đèn giao thông debug (đỏ/vàng/xanh) — node nhỏ, tạm thời
  const { container: trafficLightsContainer, destroy: trafficLightsDestroy } = buildTrafficLights()
  worldContainer.addChild(trafficLightsContainer)
  worldContainer._trafficLightsDestroy = trafficLightsDestroy

  return { tileMap }
}
