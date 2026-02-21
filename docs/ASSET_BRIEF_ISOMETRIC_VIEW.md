# Brief Tạo Assets Cho IsoCity — Góc Nhìn Isometric

Tài liệu này mô tả **góc nhìn**, **kích thước**, **anchor** và **vị trí** để tạo/cắt ảnh building/park/construction cho đúng với view hiện tại trong game.

---

## 1. GÓC NHÌN (VIEW & COORDINATE SYSTEM)

### 1.1 Hệ isometric

- **Tỷ lệ tile:** 2:1 (chiều ngang : chiều dọc).
  - `TILE_W = 64` px (chiều rộng hình thoi 1 tile).
  - `TILE_H = 32` px (chiều cao hình thoi 1 tile).
- **Góc:** Isometric chuẩn game 2D: nhìn từ trên xuống, nghiêng ~26.6° (cạnh diamond 32×16).
- **Hướng trên màn hình:**
  - **North (Bắc)** = lên trên màn hình (xa camera).
  - **South (Nam)** = xuống dưới màn hình (gần camera).
  - **East (Đông)** = sang phải.
  - **West (Tây)** = sang trái.

### 1.2 Công thức tọa độ (để tham chiếu)

- **Grid → màn hình (center của tile):**
  - `x = (col - row) * 32 + originX`
  - `y = (col + row) * 16 + originY`
- **Một block 4×4 tiles** có footprint hình thoi với 4 đỉnh: North (trên), East (phải), South (dưới), West (trái). Mỗi building chiếm **một block 4×4** như vậy.

### 1.3 Hướng vẽ asset (orientation)

- View chung: nhìn từ phía **trên–xuống–nghiêng** (isometric), giống nhìn từ hướng **Đông Nam** xuống ngã tư.
- **Hai mặt thường thấy rõ nhất:** mặt hướng **Nam** (về phía camera) và mặt hướng **Đông** (bên phải). Có thể ưu tiên chi tiết (cửa, cửa sổ, biển hiệu) ở hai mặt này.
- Vẽ asset sao cho **chân building** (chỗ đứng trên đất) nằm **ở cạnh dưới** của file ảnh (bottom edge). Không cần khoảng trống trong suốt phía dưới chân.

---

## 2. ANCHOR & CÁCH ĐẶT ẢNH TRONG GAME

- **Anchor point:** `(0.5, 1)` = **bottom–center** (giữa cạnh dưới của ảnh).
- **Ý nghĩa:** Điểm (x, y) trong game là vị trí **chính giữa chân building** trên màn hình. Toàn bộ ảnh được vẽ **phía trên** điểm đó.
- **Brief cho artist:** Vẽ building sao cho **đường chân (base)** nằm **ngang** ở **đáy file ảnh**, và **tâm ngang** của chân trùng với tâm ngang của canvas. Game sẽ đặt ảnh bằng cách đặt điểm anchor này lên đúng tọa độ trong scene.

---

## 3. THÔNG SỐ TỪNG ASSET (đã căn chỉnh trong game)

Các số dưới đây là **kích thước hiển thị (width × height, px)** và **vị trí anchor (x, y)** đang dùng trong code. Ảnh có thể vẽ **lớn hơn** (ví dụ 2x) rồi game scale xuống; quan trọng là **tỷ lệ width:height** gần đúng để khi scale không bị méo nhiều.

| Asset | Filename | Width (px) | Height (px) | Anchor (x, y) | Ghi chú |
|-------|----------|------------|-------------|---------------|--------|
| North — Tòa văn phòng | `building-north.png` | 270 | 480 | 366, 343 | Cao, mặt kính, 6 tầng; xa camera (trên màn hình). |
| East — Mart / Quán | `mart-east.png` | 271 | 292 | 626, 443 | 2–3 tầng, mái đỏ; bên phải ngã tư. |
| West — Công viên | `park-west.png` | 264 | 153 | 108, 442 | Thấp, flat; cây, ghế, đài phun nước; bên trái. |
| South — Công trường | `construction-south.png` | 245 | 150 | 364, 566 | Thấp (~40px logic), gần camera (dưới màn hình). |

- **Width / Height:** Kích thước hiển thị trên màn hình tại view hiện tại. Có thể dùng làm kích thước export (hoặc export 2x rồi game scale 0.5).
- **Anchor (x, y):** Vị trí điểm bottom–center của sprite trong không gian màn hình (origin có thể thay đổi khi resize, nên ưu tiên dùng **width × height** và **tỷ lệ** cho brief).

---

## 4. TỶ LỆ GỢI Ý (WIDTH : HEIGHT) CHO TỪNG ASSET

Để vẽ đúng “cảm giác” góc nhìn, có thể tham chiếu tỷ lệ sau (từ số width/height đang dùng):

| Asset | Tỷ lệ (W : H) | Ghi chú |
|-------|----------------|--------|
| building-north | ~9 : 16 (cao, hẹp) | Tòa cao tầng. |
| mart-east | ~271 : 292 (~1 : 1.08) | Gần vuông, hơi cao. |
| park-west | ~264 : 153 (~1.7 : 1) | Nằm ngang, flat. |
| construction-south | ~245 : 150 (~1.6 : 1) | Nằm ngang, thấp. |

---

## 5. ĐỊNH DẠNG FILE & KỸ THUẬT

- **Định dạng:** PNG, nền trong suốt (alpha).
- **Chân building:** Nên chạm **đáy ảnh** (bottom edge); không cần strip trong suốt dưới chân.
- **Căn ngang:** Nội dung nên **căn giữa** theo chiều ngang so với canvas (để anchor 0.5 trùng với tâm chân).
- **Style:** Đồng bộ với nhau (pixel art hoặc vector đều được; game có thể scale). Có thể có bản day/night sau (hiện tại game có thể dùng ColorMatrixFilter cho đêm).

---

## 6. TÓM TẮT NHANH CHO ARTIST

1. **Góc nhìn:** Isometric 2:1, North = lên, South = xuống, East = phải, West = trái. Vẽ như nhìn từ góc Đông Nam xuống.
2. **Anchor:** Bottom–center — chân building đặt ở **cạnh dưới** ảnh, **căn giữa** ngang.
3. **Bốn asset:** Dùng đúng **tên file** và **kích thước / tỷ lệ** trong bảng trên; vị trí (x, y) do game đặt, artist chỉ cần đảm bảo kích thước và anchor.
4. **PNG có alpha,** chân building chạm đáy ảnh, căn giữa ngang.

Nếu cần chỉnh vị trí hoặc kích thước sau khi có ảnh, game có **debug panel** (x, y, width, height) cho từng asset để căn lại mà không cần sửa file ảnh.
