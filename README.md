# Bài 8 - Cờ caro 3×3 (Tic-Tac-Toe) bằng pygame

Game cờ caro 3×3 cho hai người chơi trên cùng máy, viết bằng pygame, **không dùng bất kỳ file asset nào** (không ảnh, không font tải ngoài).

## Thư mục

```
tictactoe/
├─ tictactoe.py                  # Mã nguồn game
├─ tictactoe.exe                 # Bản đóng gói, chạy trực tiếp, không cần cài Python
├─ selftest.py                   # Kiểm thử logic (headless) + sinh ảnh minh hoạ
├─ build_exe.ps1                 # Đóng gói lại thành .exe bằng PyInstaller
├─ make_doc.js                   # Sinh lại file Word docs/Bai-8-TicTacToe.docx
├─ requirements.txt
├─ README.md
├─ docs/
│  ├─ Bai-8-TicTacToe.docx       # Báo cáo: cách làm + các thành phần chính
│  ├─ Ghi-chu-thuat-toan-mang-2-chieu.md  # Ghi chú thuật toán mảng 2 chiều
│  └─ img/                       # Ảnh chụp màn hình (sinh tự động)
```

## Cách chạy

Cách nhanh nhất — chạy file exe có sẵn:

```
tictactoe.exe
```

Cách dành cho người muốn xem/sửa mã nguồn:

```powershell
# pygame chưa có bản dựng sẵn cho Python 3.14, nên dùng Python 3.13
uv venv --python 3.13 .venv
uv pip install --python .venv\Scripts\python.exe -r requirements.txt
.venv\Scripts\python.exe tictactoe.py
```

## Phím tắt và nút bấm

| Thao tác | Tác dụng |
|---|---|
| Chuột trái trên ô bàn cờ | Đặt quân X hoặc O vào ô đang trống |
| Nút **Chơi lại** | Ván mới, giữ nguyên bảng điểm |
| Nút **Xóa điểm** | Xoá ván và đưa bảng điểm về 0 |
| Phím `ESC` hoặc `Q` | Thoát |

## Giao diện

Bố cục lấy theo mẫu tham khảo: nền vàng, khung màn hình trắng viền đen có thanh tiêu đề ba chấm, chữ in hoa đậm (Segoe UI Black), nút chanh nhạt có đổ bóng.

- Hai thẻ người chơi ở đầu màn hình: người đang đến lượt có nền đen chữ vàng, người kia nền trắng chữ xám.
- Mỗi bên đếm số trận thắng, số ván hòa hiển thị dưới tiêu đề. Bấm **Chơi lại** không mất điểm, muốn xóa hẳn thì bấm **Xóa điểm**.
- Khi có người thắng, đường thắng được vẽ đậm và nét liền qua ba ô.
- Chữ dùng `pygame.font.SysFont` lấy font có sẵn của hệ điều hành, vì font mặc định của pygame không có dấu tiếng Việt. Không phải tệp asset nào được tải kèm.

## Cách làm (rút gọn)

1. **Bàn cờ** là mảng 2 chiều `board[row][col]`, giá trị `""` / `"X"` / `"O"`.
2. **Click chuột** → đổi toạ độ sang ô bằng `(x - MARGIN) // CELL`, kiểm tra ô trống và ván chưa xong rồi mới đặt quân.
3. **Kiểm tra thắng** bằng 8 đường khai báo sẵn (3 hàng, 3 cột, 2 chéo), đường nào có cả 3 ô cùng ký hiệu thì thắng.
4. **Kiểm tra hòa** khi bàn đầy 9 ô mà không có đường thắng nào.
5. **Tô sáng đường thắng** bằng `pygame.draw.line` nối tâm hai ô đầu cuối.
6. **Cộng điểm** ngay khi phát sinh kết quả: người thắng `wins[player] += 1`, ván hòa thì `draws += 1`.
7. **Nút bấm** là hai `pygame.Rect` cố định; khi rê chuột vào nút thì bàn cờ không tô ô, khi bấm vào thì gọi `reset()` hoặc `reset_scores()` tương ứng.

Chi tiết điều kiện, độ phức tạp và các lỗi hay gặp nằm trong `docs/Ghi-chu-thuat-toan-mang-2-chieu.md`.

## Vì sao không cần asset

| Thành phần | Cách vẽ |
|---|---|
| Lưới bàn cờ | `pygame.draw.line` |
| Quân X | `pygame.draw.line` (hai nét chéo) |
| Quân O | `pygame.draw.circle` |
| Vạch thắng | `pygame.draw.line` nét đậm |
| Thẻ người chơi | `pygame.draw.rect` khung vuông góc, đổi viền theo lượt đi |
| Nút bấm | `pygame.draw.rect` vuông góc + đổi màu khi rê chuột |
| Vùng rê chuột trên ô | `pygame.draw.rect` vuông góc |
| Chữ | `pygame.font.SysFont` — lấy font sẵn có của hệ điều hành |

## Kiểm thử

```powershell
.venv\Scripts\python.exe selftest.py
```

Chạy ở chế độ không hiển thị cửa sổ (`SDL_VIDEODRIVER=dummy`), kiểm tra: bàn cờ mới rỗng, cả 8 đường thắng, bàn đầy thì hòa, click ô đã có quân hoặc ngoài bàn, khoá ván sau khi có kết quả, cộng điểm đúng cho mỗi lần thắng/hòa, nút Chơi lại giữ điểm, nút Xóa điểm trả bảng điểm về 0, hiệu ứng rê chuột trên ô và trên nút, phím `ESC`. Đồng thời sinh lại 4 ảnh trong `docs/img/`.

## Đóng gói lại thành exe

```powershell
uv pip install --python .venv\Scripts\python.exe pyinstaller
.\build_exe.ps1
```

Lưu ý: đóng game trước khi build lại, nếu không Windows sẽ báo `PermissionError` vì file exe cũ còn bị khoá.
