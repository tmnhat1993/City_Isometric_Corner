/**
 * Đảm bảo public/img có đủ file ảnh (placeholder nếu chưa có).
 * Build sẽ copy public/img → dist/img, nên deploy luôn có hình.
 * Bạn có thể thay thế bằng ảnh thật trong public/img, script không ghi đè.
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_IMG = join(ROOT, 'public', 'img')

// 1x1 transparent PNG (68 bytes) — hợp lệ, trình duyệt chấp nhận
const MIN_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

// Minimal valid 1x1 JPEG (119 bytes, progressive) — từ smallest valid JPEG
const MIN_JPG = Buffer.from(
  'ffd8ffdb00430001010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101ffc2000b08000100010101001100ffc40014000100000000000000000000000000000003ffda0008010100000000013fffffd9',
  'hex'
)

const FILES = [
  'building-north.png',
  'mart-east.png',
  'park-west.png',
  'park-south.png',
  'lightning-effect.jpg',
  'snowflake.png',
  'road-tile/road-ne.png',
  'road-tile/road-nw.png',
  'road-tile/road-se.png',
  'road-tile/road-sw.png',
  'road-tile/road-se-cross.png',
  'road-tile/road-se-cross-2.png',
  'road-tile/road-ne-cross.png',
  'road-tile/road-ne-cross-2.png',
  'road-tile/road-nw-cross.png',
  'road-tile/road-nw-cross-2.png',
  'road-tile/road-sw-cross.png',
  'road-tile/road-sw-cross-2.png',
  'road-tile/corner-ne.png',
  'road-tile/corner-nw.png',
  'road-tile/corner-sw.png',
  'road-tile/corner-se.png',
  ...['red', 'green', 'blue'].flatMap((color) =>
    ['northeast', 'northwest', 'southeast', 'southwest'].map(
      (f) => `sedan-assets/sedan-${color}-${f}.png`
    )
  ),
]

function ensure() {
  if (!existsSync(PUBLIC_IMG)) mkdirSync(PUBLIC_IMG, { recursive: true })
  let created = 0
  for (const rel of FILES) {
    const full = join(PUBLIC_IMG, rel)
    if (existsSync(full)) continue
    mkdirSync(dirname(full), { recursive: true })
    const buf = full.endsWith('.jpg') ? MIN_JPG : MIN_PNG
    writeFileSync(full, buf)
    created++
  }
  if (created > 0) {
    console.log(`[ensure-public-img] Đã tạo ${created} file placeholder trong public/img (thay bằng ảnh thật nếu cần).`)
  }
}

ensure()
