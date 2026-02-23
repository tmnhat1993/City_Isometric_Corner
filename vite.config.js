import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Copy thư mục public/img vào dist/img (đảm bảo có folder hình ảnh khi deploy).
 * Vite mặc định copy public → dist, nhưng bước này copy rõ ràng và tạo subdir nếu thiếu.
 */
function copyDirRecursive(src, dest) {
  if (!existsSync(src)) return
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  for (const name of readdirSync(src)) {
    const srcPath = join(src, name)
    const destPath = join(dest, name)
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      mkdirSync(dirname(destPath), { recursive: true })
      copyFileSync(srcPath, destPath)
    }
  }
}

/** Tạo các thư mục con trong dist/img nếu chưa có (road-tile, sedan-assets) */
function ensureImgSubdirs(distImg) {
  const subdirs = ['road-tile', 'sedan-assets']
  for (const d of subdirs) {
    const p = join(distImg, d)
    if (!existsSync(p)) mkdirSync(p, { recursive: true })
  }
}

export default defineConfig({
  // base tương đối để deploy đúng tại subpath (vd. .../City_Isometric_Corner/dist/)
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {},
  },
  plugins: [
    {
      name: 'ensure-dist-img',
      closeBundle() {
        const publicImg = join(__dirname, 'public', 'img')
        const distImg = join(__dirname, 'dist', 'img')
        copyDirRecursive(publicImg, distImg)
        ensureImgSubdirs(distImg)
      },
    },
  ],
})
