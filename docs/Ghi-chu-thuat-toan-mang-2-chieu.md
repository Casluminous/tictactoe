# Ghi chú thuật toán: mảng 2 chiều trong bài 8 (Tic-Tac-Toe)

Tài liệu này ghi lại cách mảng 2 chiều chạy trong `tictactoe.py`, các điều kiện phải
thỏa mãn và những lỗi thường gặp. Đọc file code song song để đối chiếu.

## 1. Mảng 2 chiều dùng để làm gì

Bàn cờ 3×3 được biểu diễn bằng một mảng 2 chiều: `board[row][col]`.

- `row` (dong) chạy từ trên xuống: 0, 1, 2
- `col` (cot) chạy từ trái sang phải: 0, 1, 2
- Giá trị mỗi ô: `""` (chuỗi rỗng = trống), `"X"` hoặc `"O"`

```
board[0][0] board[0][1] board[0][2]      (0,0)=X (0,1)=X (0,2)=X
board[1][0] board[1][1] board[1][2]  ->  (1,0)=O (1,1)=O (1,2)=""
board[2][0] board[2][1] board[2][2]      (2,0)=O (2,1)="" (2,2)=""
```

`row` luôn là chỉ số thứ nhất, `col` luôn là chỉ số thứ hai. Đảo hai chiều sẽ ra
vị trí sai — đây là lỗi phổ biến nhất khi làm bài này.

Mã tạo bàn cờ (`tictactoe.py:56`):

```python
def new_board() -> list[list[str]]:
    return [[EMPTY for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
```

Dùng `[[...]] for ...` chứ không dùng `[[]] * 3`, vì khi dùng cách nhân danh sách,
các hàng sẽ trỏ cùng một danh sách: đặt X vào hàng 0 thì hàng 1, 2 cũng đổi theo.

## 2. Quy trình xử lý một cú click

Mỗi lần người chơi click, code đi đúng 5 bước (`TicTacToe.play()` — `tictactoe.py:161`):

```
b1. Chuyển toạ độ chuột (x, y) → ô (row, col)         cell_at()
b2. Kiểm tra điều kiện hợp lệ                        3 điều kiện ở mục 3
b3. Gán board[row][col] = player và tăng moves += 1
b4. Kiểm tra thắng (check_win) → nếu thắng thì khoá ván, lưu đường thắng
b5. Kiểm tra đầy bàn (is_full) → nếu đầy mà chưa ai thắng thì kết luận hoà
b6. Không thắng, chưa đầy → đổi lượt: player = "O" nếu player == "X" ngược lại "X"
```

Công thức đổi toạ độ chuột sang tọa độ ô (`tictactoe.py:82`):

```python
col = (x - MARGIN) // CELL     # MARGIN = 60, CELL = 150
row = (y - MARGIN) // CELL
```

Vì bàn cờ chia đều thành các ô vuông nên phép chia lấy nguyên là ra số ô tương ứng.
Kết quả nằm ngoài khoảng 0..2 nghĩa là click ra ngoài bàn cờ, hàm trả về `None`.

## 3. Các điều kiện phải thỏa mãn

### 3.1. Điều kiện được đặt quân (thiếu 1 là bỏ qua cú click)

| # | Điều kiện | Cách kiểm tra trong code |
|---|---|---|
| 1 | Ván chưa kết thúc | `if self.over: return` |
| 2 | Click trúng ô bàn cờ | `cell is not None` (sau khi đổi toạ độ) |
| 3 | Ô đó còn trống | `board[row][col] == EMPTY` |

### 3.2. Điều kiện thắng

Tồn tại ít nhất một "đường thắng" mà cả 3 ô cùng mang ký hiệu của người đang đi.

Bàn 3×3 có **đúng 8 đường thắng** — khai báo trước trong `WIN_LINES` (`tictactoe.py:43`):

```
(0,0)(0,1)(0,2)   (1,0)(1,1)(1,2)   (2,0)(2,1)(2,2)     3 hàng ngang
(0,0)(1,0)(2,0)   (0,1)(1,1)(2,1)   (0,2)(1,2)(2,2)     3 cột dọc
(0,0)(1,1)(2,2)   (0,2)(1,1)(2,0)                     2 đường chéo
```

Cách kiểm tra (`tictactoe.py:61`):

```python
for line in WIN_LINES:                     # duyet 8 duong
    if all(board[r][c] == player for r, c in line):
        return line                        # tra ve duong thang de to sang
return None                                # chua co ai thang
```

`all(...)` là điều kiện "cả 3 ô đều đúng" — chỉ cần một ô sai là đường đó bị loại.

### 3.3. Điều kiện hòa

Hòa xảy ra khi **cả hai** điều kiện sau đúng cùng lúc:

1. `check_win(...)` trả về `None` — không có đường thắng nào của X lẫn của O
2. `is_full(board)` trả về `True` — 9 ô đã đầy

```python
def is_full(board):                          # tictactoe.py:69
    return all(cell != EMPTY for row in board for cell in row)
```

`is_full` trả về `True` nhưng vẫn phải kiểm tra thắng trước, vì bàn đầy mà có
3 ô thẳng hàng thì là thắng chứ không phải hòa.

### 3.4. Điều kiện khóa ván

Sau khi có kết quả (thắng hoặc hòa) phải gán `self.over = True`. Nếu quên,
người chơi vẫn đặt được quân lên ván đã xong và trạng thái hiển thị bị sai.

### 3.5. Điều kiện cộng điểm

Điểm chỉ được cộng đúng một lần, ngay tại thời điểm phát sinh kết quả:

| Kết quả ván | Cập nhật |
|---|---|
| Có người thắng | `self.wins[self.player] += 1` |
| Bàn đầy mà không ai thắng | `self.draws += 1` |

Bảng điểm nằm ngoài ván đang chơi, nên `reset()` (nút **Chơi lại** và phím `R`)
chỉ tạo lại bàn cờ mà **không** đụng tới `wins` và `draws`. Muốn xóa hẳn thì gọi
`reset_scores()`, nút **Xóa điểm** gọi hàm này.

Điều kiện sáng khung người đang đi là đang tới lượt bên đó **và** ván chưa kết
thúc; khi ván xong thì cả hai thẻ cùng mờ đi vì không còn ai đi nữa.

### 3.6. Điều kiện bắt đầu lại

Nhấn phím `R` hoặc bấm nút **Chơi lại** đều gọi `reset()`: tạo lại bàn cờ rỗng,
`player` về `"X"`, xoá `over`, `winner`, `win_line`, `moves` về giá trị ban đầu,
**giữ nguyên** `wins` và `draws`.

## 4. Bảng điều kiện tổng hợp

| Tình huống | `over` | `winner` | `win_line` | Điểm | Hành động tiếp |
|---|---|---|---|---|---|
| Vừa khởi tạo | False | `""` | None | 0 | Chờ click |
| Đã đi vài nước, chưa ai thắng | False | `""` | None | 0 | Chờ click |
| X vừa kín 1 đường | True | `"X"` | Bộ 3 ô thắng | `wins[X] += 1` | Tô sáng, khoá bàn |
| 9 ô đầy, không ai thắng | True | `""` | None | `draws += 1` | Báo hoà |
| Click ô đã có quân | không đổi | không đổi | không đổi | không đổi | Bỏ qua, không đổi lượt |
| Click ngoài bàn cờ | không đổi | không đổi | không đổi | không đổi | Bỏ qua |
| Bấm **Chơi lại** hoặc `R` | False | `""` | None | **giữ nguyên** | `moves = 0`, X đi trước |
| Bấm **Xóa điểm** | False | `""` | None | về 0 | Xoá cả bảng điểm |

## 5. Độ phức tạp

- Kiểm tra một đường thắng: 3 phép so sánh → O(1)
- Kiểm tra toàn bộ: 8 đường × 3 ô = 24 phép so sánh → O(1)
- Kiểm tra bàn đầy: 9 ô → O(1)

Với bàn cờ cố định 3×3 thì tất cả đều là hằng số, không phụ thuộc số nước đã đi.
Nếu mở rộng lên bàn N×N thì `check_win` chuyển thành O(N) và `is_full` thành O(N²).

## 6. Những lỗi hay gặp

| Lỗi | Biểu hiện | Nguyên nhân |
|---|---|---|
| Nhân danh sách `[[EMPTY]*3]*3` | Mọi hàng cùng đổi | Các hàng trỏ chung một danh sách |
| Đảo `board[col][row]` | Vẽ quân sai ô | Quy ước luôn là `[row][col]` |
| Quên khoá `over` | Đặt quân được sau khi ván xong | Thiếu điều kiện ở mục 3.4 |
| Chỉ kiểm tra hàng ngang | Không nhận ra cột và chéo thắng | Dùng `if` riêng lẻ thay vì `WIN_LINES` |
| Kiểm tra đầy bàn trước kiểm tra thắng | Báo hoà sai khi bàn đầy | Thứ tự phải là thắng → rồi mới hòa |
| Chia phép toán làm tròn | Click lệch ô | Python `//` đã làm tròn xuống, kiểm tra lại hằng số `CELL` |