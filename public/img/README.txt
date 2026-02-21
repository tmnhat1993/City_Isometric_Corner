Place image assets here:

- road-tile/ — Texture ô đường. Đặt trong public/img/ để path /img/road-tile/ đúng.
  road-ne.png, road-nw.png, road-se.png, road-sw.png — bắt buộc.
  road-se-cross.png — ô (col 6, row 7); thiếu thì fallback road-se.
  Ánh xạ: row 5 = ne, row 6 = sw, col 5 = nw, col 6 = se; (6,7) = se-cross. Trừ 4 ô trung tâm và 8 ô vạch đi bộ (không texture). Debug "Mặt đường & vỉa hè": offset/size (mặc định 64×32, offsetY 1) cho hình khảm.

- building-north.png — North building (office tower). Anchor: bottom-center. Fallback: procedural.
- mart-east.png — East building (mart/restaurant). Anchor: bottom-center. Fallback: procedural.
- park-west.png — West park. Anchor: bottom-center. Fallback: procedural (grass + trees + fountain).
- park-south.png — South park. Anchor: bottom-center.

- sedan-assets/ — Sedan sprites (4 directions) for vehicles on the road:
  sedan-blue-northeast.png, sedan-blue-northwest.png, sedan-blue-southeast.png, sedan-blue-southwest.png
  (If missing, vehicles are disabled.)
