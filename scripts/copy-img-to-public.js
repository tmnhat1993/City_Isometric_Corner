/**
 * Copy toàn bộ ảnh thật từ isocity/img → public/img.
 * Vite chỉ serve file trong public/, nên phải copy để /img/... load được.
 * Chạy trước ensure-public-img để ảnh thật có trong public/img, placeholder chỉ tạo file thiếu.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC_IMG = join(ROOT, 'img')
const PUBLIC_IMG = join(ROOT, 'public', 'img')

function copyDirRecursive(src, dest) {
  if (!existsSync(src)) return 0
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  let n = 0
  for (const name of readdirSync(src)) {
    if (name.startsWith('.')) continue
    const srcPath = join(src, name)
    const destPath = join(dest, name)
    if (statSync(srcPath).isDirectory()) {
      n += copyDirRecursive(srcPath, destPath)
    } else {
      mkdirSync(dirname(destPath), { recursive: true })
      copyFileSync(srcPath, destPath)
      n++
    }
  }
  return n
}

const count = copyDirRecursive(SRC_IMG, PUBLIC_IMG)
if (count > 0) {
  console.log(`[copy-img-to-public] Đã copy ${count} file từ img/ → public/img/`)
}
