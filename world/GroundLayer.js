import { Graphics, Container, Sprite } from "pixi.js";
import {
  GRID_W,
  GRID_H,
  TILE_W,
  TILE_H,
  gridToScreen,
  getTileDiamondPoints,
  darken,
} from "../core/GridSystem.js";
import { COLORS, getColor } from "../utils/Colors.js";
import { getDebugGroundTileOverrides } from "../utils/DebugGroundTile.js";

/** Ô đường không dùng texture: 4 ô trung tâm + vạch đi bộ (trừ các ô dùng cross texture) */
const ROAD_TILE_EXCLUDED = new Set([
  "(5,5)",
  "(5,6)",
  "(6,5)",
  "(6,6)", // 4 ô trung tâm
  // (7,6) ne-cross-2; (4,5) ne-cross, (4,6) sw-cross-2, (5,4) nw-cross, (5,7) nw-cross-2, (6,4) se-cross-2, (6,7) se-cross, (7,4) sw-cross không loại trừ
]);
function isRoadTileExcluded(col, row) {
  return ROAD_TILE_EXCLUDED.has(`(${col},${row})`);
}

/** Chọn variant texture road (ne/nw/se/sw/.../ne-cross/...). (6,7)=se-cross, (6,4)=se-cross-2, (5,7)=nw-cross-2, (5,4)=nw-cross, (4,6)=sw-cross-2, (4,5)=ne-cross. */
function getRoadTileVariant(col, row) {
  if (col === 6 && row === 7) return "se-cross";
  if (col === 6 && row === 4) return "se-cross-2";
  if (col === 5 && row === 7) return "nw-cross-2";
  if (col === 5 && row === 4) return "nw-cross";
  if (col === 4 && row === 6) return "sw-cross-2";
  if (col === 4 && row === 5) return "ne-cross";
  if (col === 7 && row === 6) return "sw-cross";
  if (col === 7 && row === 5) return "ne-cross-2";
  const onVertical = col === 5 || col === 6;
  const onHorizontal = row === 5 || row === 6;
  if (onHorizontal && row === 5) return "ne";
  if (onHorizontal && row === 6) return "sw";
  if (onVertical && !onHorizontal && col === 5) return "nw";
  if (onVertical && !onHorizontal && col === 6) return "se";
  return "nw";
}

/**
 * 12x12 grid layout:
 *   cols 0-3:  NW quadrant (North building top-left, West building bottom-left)
 *   cols 4-5:  sidewalk(4) + road(5) vertical
 *   cols 6-7:  road(6) + sidewalk(7) vertical
 *   cols 8-11: NE quadrant (East building top-right, South building bottom-right)
 *
 *   rows 0-3:  top buildings
 *   rows 4-5:  sidewalk(4) + road(5) horizontal
 *   rows 6-7:  road(6) + sidewalk(7) horizontal
 *   rows 8-11: bottom buildings
 *
 * Tile types: 0=grass, 1=road, 2=sidewalk
 */
function createTileMap() {
  const map = Array.from({ length: GRID_H }, () =>
    Array.from({ length: GRID_W }, () => 0),
  );

  // Road: cols 5,6 full height + rows 5,6 full width
  for (let i = 0; i < GRID_W; i++) {
    map[5][i] = 1;
    map[6][i] = 1;
  }
  for (let i = 0; i < GRID_H; i++) {
    map[i][5] = 1;
    map[i][6] = 1;
  }

  // Sidewalk: col 4, col 7 full height + row 4, row 7 full width
  for (let i = 0; i < GRID_W; i++) {
    if (map[4][i] === 0) map[4][i] = 2;
    if (map[7][i] === 0) map[7][i] = 2;
  }
  for (let i = 0; i < GRID_H; i++) {
    if (map[i][4] === 0) map[i][4] = 2;
    if (map[i][7] === 0) map[i][7] = 2;
  }

  return map;
}

// Edge thickness in pixels (1 tile unit height)
const EDGE_DEPTH = TILE_H * 0.6;

/** Ô góc vỉa hè (col, row) → corner-ne, corner-nw, corner-sw, corner-se */
const SIDEWALK_CORNER_CELLS = [
  [4, 4, "nw"],
  [4, 7, "sw"],
  [7, 4, "ne"],
  [7, 7, "se"],
];

export function buildGroundLayer(mode = "day", roadTileTextures = null, sidewalkCornerTextures = null) {
  const container = new Container();
  container.label = "ground";

  const overrides = getDebugGroundTileOverrides();
  const offsetX = overrides.offsetX ?? 0;
  const offsetY = overrides.offsetY ?? 1;
  const width = overrides.width ?? 64;
  const height = overrides.height ?? 32;

  const tileMap = createTileMap();
  const edgeGfx = new Graphics(); // edges drawn first (behind)
  const tileGfx = new Graphics(); // flat tiles on top
  const roadSpritesContainer = new Container();
  roadSpritesContainer.label = "roadTiles";
  const sidewalkCornerContainer = new Container();
  sidewalkCornerContainer.label = "sidewalkCorners";

  // --- Pass 1: Draw 3D edges (only for tiles on the south/east visible border) ---
  // We iterate in draw order (back to front) and draw edges for tiles
  // whose south-east edges are visible to camera
  for (let row = 0; row < GRID_H; row++) {
    for (let col = 0; col < GRID_W; col++) {
      const type = tileMap[row][col];
      const baseColor = getTileColor(type, mode);
      const edgeColor = darken(baseColor, 0.35);

      const center = gridToScreen(col, row);
      const hw = TILE_W / 2;
      const hh = TILE_H / 2;

      // Right edge (visible on the east/right side of diamond)
      // Show if this is the last col OR next col tile is different type or doesn't exist
      const showRight =
        col === GRID_W - 1 ||
        row === GRID_H - 1 ||
        shouldShowEdge(tileMap, col, row, col + 1, row) ||
        shouldShowEdge(tileMap, col, row, col, row + 1);
      // Bottom-right edge: from right vertex to bottom vertex
      {
        const rx = center.x + hw;
        const ry = center.y;
        const bx = center.x;
        const by = center.y + hh;

        edgeGfx.poly([
          rx,
          ry,
          bx,
          by,
          bx,
          by + EDGE_DEPTH,
          rx,
          ry + EDGE_DEPTH,
        ]);
        edgeGfx.fill({ color: edgeColor });
      }

      // Bottom-left edge: from bottom vertex to left vertex
      {
        const bx = center.x;
        const by = center.y + hh;
        const lx = center.x - hw;
        const ly = center.y;

        edgeGfx.poly([
          lx,
          ly,
          bx,
          by,
          bx,
          by + EDGE_DEPTH,
          lx,
          ly + EDGE_DEPTH,
        ]);
        edgeGfx.fill({ color: darken(baseColor, 0.5) });
      }
    }
  }

  // --- Pass 2: Draw flat tile surfaces (color) and road texture sprites (nếu có) ---
  for (let row = 0; row < GRID_H; row++) {
    for (let col = 0; col < GRID_W; col++) {
      const type = tileMap[row][col];
      const color = getTileColor(type, mode);
      const variant = type === 1 ? getRoadTileVariant(col, row) : null;
      const texture =
        roadTileTextures &&
        variant &&
        (roadTileTextures[variant] ||
          (variant === "se-cross" && roadTileTextures["se"]) ||
          (variant === "se-cross-2" && roadTileTextures["se"]) ||
          (variant === "ne-cross" && roadTileTextures["ne"]) ||
          (variant === "ne-cross-2" && roadTileTextures["ne"]) ||
          (variant === "nw-cross" && roadTileTextures["nw"]) ||
          (variant === "nw-cross-2" && roadTileTextures["nw"]) ||
          (variant === "sw-cross" && roadTileTextures["sw"]) ||
          (variant === "sw-cross-2" && roadTileTextures["sw"]));
      const useRoadTexture =
        type === 1 && texture && !isRoadTileExcluded(col, row);

      if (useRoadTexture) {
        const center = gridToScreen(col, row);
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5, 0.5);
        sprite.x = center.x + offsetX;
        sprite.y = center.y + offsetY;
        sprite.width = width;
        sprite.height = height;
        roadSpritesContainer.addChild(sprite);
      } else {
        const points = getTileDiamondPoints(col, row);
        tileGfx.poly(points);
        tileGfx.fill({ color });
        tileGfx.stroke({ color: darken(color, 0.12), width: 0.5 });
      }
    }
  }

  // --- Pass 3: Góc vỉa hè (corner-ne, nw, sw, se) từ road-tile/corner-*.png ---
  if (sidewalkCornerTextures && typeof sidewalkCornerTextures === "object") {
    for (const [col, row, key] of SIDEWALK_CORNER_CELLS) {
      const texture = sidewalkCornerTextures[key];
      if (!texture) continue;
      if (tileMap[row][col] !== 2) continue; // chỉ vẽ trên ô vỉa hè
      const center = gridToScreen(col, row);
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 0.5);
      sprite.x = center.x + offsetX;
      sprite.y = center.y + offsetY;
      sprite.width = width;
      sprite.height = height;
      sidewalkCornerContainer.addChild(sprite);
    }
  }

  container.addChild(edgeGfx);
  container.addChild(tileGfx);
  container.addChild(roadSpritesContainer);
  container.addChild(sidewalkCornerContainer);
  return { container, tileMap };
}

function getTileColor(type, _mode) {
  // Không đổi màu nền tile theo sáng/tối — luôn dùng màu ban ngày
  const mode = 'day'
  switch (type) {
    case 1:
      return getColor(COLORS.road, mode);
    case 2:
      return getColor(COLORS.sidewalk, mode);
    default:
      return getColor(COLORS.grass, mode);
  }
}

function shouldShowEdge(map, col1, row1, col2, row2) {
  if (col2 < 0 || col2 >= GRID_W || row2 < 0 || row2 >= GRID_H) return true;
  return map[row1][col1] !== map[row2][col2];
}

export { createTileMap };
