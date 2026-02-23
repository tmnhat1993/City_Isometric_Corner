import { defineConfig } from 'vite'

/**
 * base: './' — dùng đường dẫn tương đối để deploy đúng khi chạy từ subpath
 * (vd. https://tmnhat1993.github.io/City_Isometric_Corner/dist/)
 */
export default defineConfig({
  base: './',
})
