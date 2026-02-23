# IsoCity

Thành phố isometric với chu kỳ ngày/đêm, thời tiết (nắng, mưa, mưa lớn, tuyết, bão tuyết), giao thông và xe, cùng bảng quản lý task (Hôm nay, lịch sử, cài đặt). Ứng dụng được xây dựng với sự hỗ trợ của AI.

## Chạy local

```bash
cd isocity
npm install
npm run dev
```

Mở URL hiển thị (vd. `http://localhost:5173`).

## Build

```bash
npm run build
```

Kết quả nằm trong `dist/`. Ứng dụng tĩnh (HTML, JS, CSS, assets), không cần server.

## Deploy (static hosting)

1. Chạy `npm run build`.
2. Đẩy nội dung thư mục `dist/` lên static host:
   - **Vercel / Netlify:** Trỏ project vào thư mục này, build command `npm run build`, thư mục publish `dist`.
   - **GitHub Pages:** Dùng workflow chạy `npm run build` và publish thư mục `dist/`.
   - **Bất kỳ static server nào:** Serve thư mục `dist/` (vd. `npx serve dist`).

Ảnh (buildings, roads, cars, weather) load từ `/img/`. Thiếu ảnh thì app dùng vẽ procedural và ghi log cảnh báo. Đảm bảo `public/img/` được copy vào `dist/img/` (Vite làm mặc định khi assets nằm trong `public/`).

## Tech

- **PixiJS** cho world isometric, xe và hiệu ứng thời tiết.
- **Vite** cho dev server và build production.
- **localStorage** cho tên user, tasks và lịch sử task.

## Tính năng

- Lưới, mặt đất, nhà (PNG hoặc procedural), trang trí; camera (pan, zoom; mobile: pinch, double-tap reset).
- Ngày/đêm (tự động theo giờ hệ thống hoặc chọn tay), đèn cửa sổ nhà, đèn pha xe ban đêm.
- Thời tiết: Nắng, Mưa, Mưa Lớn (có chớp), Tuyết, Bão tuyết. Chọn trong Cài đặt.
- Panel Hôm nay: chào user theo tên, thứ/ngày/giờ cập nhật, danh sách task (checkbox, icon), thêm task.
- Lịch sử task (filter Tuần/Tháng/Năm/Tất cả), Cài đặt (thời gian, thời tiết, tài khoản), nút float (Lịch sử, Cài đặt; mobile thêm Hôm nay dạng bottom sheet).
- Modal chào mừng lần đầu (nhập tên), đồng hồ góc trái trên, footer góc trái dưới (v0.1, icon ℹ giới thiệu AI, #Nihato mailto).
- Font Montserrat; panel task nền trong (glass); FPS tắt mặc định.
