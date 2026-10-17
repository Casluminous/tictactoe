// Sinh file Word bao cao bai 8: "Cach lam" (luong code) + "Cac thanh phan chinh".
// Moi muc kem doan code rut ngan va chi ro nam o file nao, dong bao nhieu.
// Chay:  node make_report.js
const fs = require("fs");
const path = require("path");
const {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, LevelFormat,
  PageNumber, Packer, Paragraph, ShadingType, Table, TableCell, TableRow,
  TextRun, WidthType,
} = require("docx");

const OUT = path.join(__dirname, "docs");
const PAGE = { width: 11906, height: 16838 };
const CONTENT = PAGE.width - 1440 * 2;
const ACCENT = "1F4E79";
const CODE_BG = "F4F6F8";

const border = { style: BorderStyle.SINGLE, size: 1, color: "BFC7D1" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ------------------------------------------------------------------ helpers
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color })],
});
const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 60 },
  children: [new TextRun(text)],
});
const code = (lines) => lines.map((line) => new Paragraph({
  shading: { fill: CODE_BG, type: ShadingType.CLEAR },
  spacing: { after: 0, line: 240 },
  indent: { left: 200 },
  children: [new TextRun({ text: line || " ", font: "Consolas", size: 18 })],
}));

// Nhan "file: dong" de danh mau noi dat dung
const where = (text) => new Paragraph({
  spacing: { before: 40, after: 200 },
  children: [new TextRun({ text: "Nguồn: ", bold: true, size: 18, color: "7F7F7F" }),
    new TextRun({ text, font: "Consolas", size: 18, color: "7F7F7F" })],
});

function table(headers, rows, widths) {
  const w = widths || headers.map(() => Math.floor(CONTENT / headers.length));
  const total = w.reduce((a, b) => a + b, 0);
  const cell = (text, i, isHeader) => new TableCell({
    borders,
    width: { size: w[i], type: WidthType.DXA },
    margins: cellMargins,
    shading: isHeader ? { fill: "DCE6F1", type: ShadingType.CLEAR } : undefined,
    children: String(text).split("\n").map((line) => new Paragraph({
      spacing: { after: 0 },
      children: [new TextRun({ text: line, bold: !!isHeader, font: /:\d/.test(line) ? "Consolas" : "Calibri" })],
    })),
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: w,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((t, i) => cell(t, i, true)) }),
      ...rows.map((r) => new TableRow({ children: r.map((t, i) => cell(t, i, false)) })),
    ],
  });
}

// ------------------------------------------------------------------ noi dung
const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: "BÀI 8 - CỜ CARO 3×3 (TIC-TAC-TOE)", bold: true, size: 38, color: ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 },
    children: [new TextRun({ text: "Cách làm và các thành phần chính của chương trình", italics: true, size: 24, color: "595959" })],
  }),

  // ================================================================ 1
  h1("1. Cách làm"),
  p("Toàn bộ mã nguồn nằm trong một tệp duy nhất là tictactoe.py, chia thành ba phần: phần hằng số bố cục ở đầu tệp, các hàm xử lý bàn cờ ở giữa, và lớp TicTacToe giữ trạng thái ván cùng phần vẽ ở cuối tệp."),

  h2("1.1. Khai báo hằng số bố cục"),
  p("Kích thước cửa sổ, cạnh ô, vị trí bàn cờ và vị trí nút được khai báo sẵn thành hằng số ở đầu tệp. Khi vẽ chỉ truyền số vào, không tính lại từng khung hình. Vị trí bàn cờ canh giữa theo cửa sổ bằng công thức trừ nửa phần dư."),
  ...code([
    "BOARD_SIZE = 3",
    "CELL       = 150                            # canh mot o",
    "BOARD_PX   = BOARD_SIZE * CELL",
    "WINDOW_W   = 640",
    "WINDOW_H   = 780",
    "BOARD_X    = (WINDOW_W - BOARD_PX) // 2      # can giua ban co",
    "BOARD_Y    = 156",
  ]),
  where("tictactoe.py:17-25"),

  h2("1.2. Tạo bàn cờ bằng mảng hai chiều"),
  p("Bàn cờ được lưu trong mảng 3×3. Mỗi ô chứa \"X\", \"O\" hoặc chuỗi rỗng nếu còn trống. Quy ước bất biến là board[row][col]: row là dòng tính từ trên xuống, col là cột tính từ trái sang phải, cả hai chạy từ 0 đến 2."),
  ...code([
    "def new_board() -> list[list[str]]:",
    "    return [[EMPTY for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]",
  ]),
  where("tictactoe.py:86-88 - new_board()"),
  p("Mảng được tạo bằng vòng lặp lồng như trên, mỗi hàng là một danh sách riêng."),

  h2("1.3. Đổi toạ độ chuột thành toạ độ ô"),
  p("Bàn cờ chia đều thành các ô vuông cạnh CELL pixel nên phép chia lấy nguyên ra số thứ tự của ô. Kết quả nằm ngoài khoảng 0 đến 2 thì hàm trả về None và cú click đó bị bỏ qua."),
  ...code([
    "def cell_at(pos):",
    "    x, y = pos",
    "    col, row = (x - BOARD_X) // CELL, (y - BOARD_Y) // CELL",
    "    if 0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE:",
    "        return int(row), int(col)",
    "    return None",
    "",
    "def cell_rect(row, col):",
    "    return pygame.Rect(BOARD_X + col * CELL, BOARD_Y + row * CELL, CELL, CELL)",
    "",
    "def cell_center(row, col):",
    "    return cell_rect(row, col).center",
  ]),
  where("tictactoe.py:114-120 - cell_at(); tictactoe.py:104-111 - cell_rect(), cell_center()"),

  h2("1.4. Luồng xử lý một cú click"),
  p("Mỗi cú click đi qua sáu bước theo thứ tự sau. Bước 1 và bước 2 nằm trong handle_event, bước 3 đến bước 6 nằm trong play."),
  ...code([
    "b1. Chuyen toa do chuot (x, y) thanh o (row, col)          cell_at()",
    "b2. Neu click trung nut thi goi reset()/reset_scores() va dung lai",
    "b3. Kiem tra 3 dieu kien: van chua ket thuc, co thuoc o, o con trong",
    "b4. Gan board[row][col] = player va tang moves += 1",
    "b5. Kiem tra thang bang 8 duong                                  check_win()",
    "b6. Neu chua thang thi kiem tra day ban                          is_full()",
    "b7. Chua thang, chua day ban -> doi luot cho nguoi ke tiep",
  ]),
  p("Ba điều kiện ở bước 3 được viết bằng ba lệnh thoát sớm, thiếu một điều kiện là bỏ qua cú click và không đổi lượt."),
  ...code([
    "def play(self, cell):",
    "    if self.over or cell is None:      # van da xong hoac click ngoai ban co",
    "        return",
    "    row, col = cell",
    "    if self.board[row][col] != EMPTY: # o nay da co quan",
    "        return",
    "    self.board[row][col] = self.player",
    "    self.moves += 1",
  ]),
  where("tictactoe.py:218-226 - play()"),

  h2("1.5. Kiểm tra thắng bằng tám đường có sẵn"),
  p("Tám đường thắng được khai báo trước thành hằng số WIN_LINES: ba hàng ngang, ba cột dọc và hai đường chéo. Hàm check_win lần lượt duyệt từng đường, đường nào cả ba ô đều mang ký hiệu của người đang đi thì trả về chính bộ ba ô đó, không thì trả về None."),
  ...code([
    "WIN_LINES = (",
    "    ((0,0),(0,1),(0,2)), ((1,0),(1,1),(1,2)), ((2,0),(2,1),(2,2)),   # 3 hang",
    "    ((0,0),(1,0),(2,0)), ((0,1),(1,1),(2,1)), ((0,2),(1,2),(2,2)),   # 3 cot",
    "    ((0,0),(1,1),(2,2)), ((0,2),(1,1),(2,0)),                     # 2 duong cheo",
    ")",
    "",
    "def check_win(board, player):",
    "    for line in WIN_LINES:",
    "        if all(board[r][c] == player for r, c in line):",
    "            return line",
    "    return None",
  ]),
  where("tictactoe.py:70-79 - WIN_LINES; tictactoe.py:91-96 - check_win()"),
  p("Khi bàn cờ đã đầy đủ 9 ô, hàm is_full trả về True. Hàm này chỉ kiểm tra ô nào còn trống, việc có đường thắng hay không do check_win quyết định."),
  ...code([
    "def is_full(board):",
    "    return all(cell != EMPTY for row in board for cell in row)",
  ]),
  where("tictactoe.py:99-101 - is_full()"),

  h2("1.6. Phân kết quả, khoá ván và đổi lượt"),
  p("Sau khi đặt quân, phần cuối của play xử lý kết quả theo ba nhánh: thắng thì ghi người thắng, khoá ván và cộng điểm; không thắng mà bàn đã đầy thì kết luận hòa và cộng một lượt hòa; còn lại thì đổi lượt cho người kế tiếp."),
  ...code([
    "line = check_win(self.board, self.player)",
    "if line is not None:",
    "    self.over, self.winner, self.win_line = True, self.player, line",
    "    self.wins[self.player] += 1",
    "elif is_full(self.board):",
    "    self.over = True",
    "    self.draws += 1",
    "else:",
    "    self.player = O if self.player == X else X",
  ]),
  where("tictactoe.py:228-236 - play()"),
  p("Biến over được đặt thành True ở cả hai nhánh có kết quả. Từ đó lệnh thoát sớm đầu play chặn mọi nước đi tiếp theo trên ván đã xong. Biến win_line lưu bộ ba ô thắng để vẽ vạch tô sáng."),

  h2("1.7. Bảng điểm và hai kiểu khởi tạo lại"),
  p("Bảng điểm gồm hai ô đếm số trận thắng của mỗi bên và một bộ đếm số ván hòa, nằm ngoài ván đang chơi. Vì vậy có hai hàm khởi tạo lại khác nhau: reset tạo lại bàn cờ và giữ nguyên điểm, còn reset_scores đưa cả bảng điểm về 0."),
  ...code([
    "def reset_scores(self):",
    "    self.wins = {X: 0, O: 0}",
    "    self.draws = 0",
    "    self.reset()",
    "",
    "def reset(self):",
    "    self.board   = new_board()",
    "    self.player  = X",
    "    self.over    = False",
    "    self.winner  = EMPTY",
    "    self.win_line = None",
    "    self.hover   = None",
    "    self.hover_button = None",
    "    self.moves   = 0",
  ]),
  where("tictactoe.py:169-172 - reset_scores(); tictactoe.py:174-182 - reset()"),
  p("Hai hàm này được gọi từ hai nơi: nút Chơi lại gọi reset, nút Xóa điểm gọi reset_scores. Sau mỗi lần gọi, X luôn đi trước ván mới."),
  ...code([
    "elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:",
    "    button = self._button_at(event.pos)",
    "    if button is not None:",
    "        self.reset_scores() if button == self.btn_clear else self.reset()",
    "        return True",
    "    self.play(cell_at(event.pos))",
  ]),
  where("tictactoe.py:204-209 - handle_event()"),

  h2("1.8. Vòng lặp sự kiện và vẽ lại màn hình"),
  p("Hàm main chỉ giữ phần khung vòng lặp: lấy hết sự kiện trong khung hình, đưa từng sự kiện cho handle_event, vẽ lại toàn màn hình và giới hạn 60 khung hình mỗi giây. handle_event trả về False thì vòng lặp kết thúc và chương trình đóng cửa sổ."),
  ...code([
    "def main() -> int:",
    "    game   = TicTacToe()",
    "    clock  = pygame.time.Clock()",
    "    running = True",
    "    while running:",
    "        for event in pygame.event.get():",
    "            running = game.handle_event(event)",
    "        game.draw()",
    "        clock.tick(60)",
    "    pygame.quit()",
    "    return 0",
  ]),
  where("tictactoe.py:315-325 - main()"),
  p("Trong handle_event có bốn loại sự kiện được xử lý: QUIT để thoát, KEYDOWN cho phím ESC và phím Q, MOUSEMOTION để cập nhật ô đang rê chuột và nút đang rê chuột, MOUSEBUTTONDOWN để đặt quân hoặc bấm nút."),
  where("tictactoe.py:192-210 - handle_event()"),

  // ================================================================ 2
  h1("2. Các thành phần chính"),
  p("Bảng dưới liệt kê các thành phần trong tệp tictactoe.py theo nhóm, kèm vị trí khai báo. Phần giao diện được nêu ở nhóm cuối cùng."),

  h2("2.1. Nhóm hằng số và dữ liệu"),
  table(
    ["Thành phần", "Nội dung", "Nơi khai báo"],
    [
      ["Hằng số bố cục", "Kích thước cửa sổ, cạnh ô, vị trí bàn cờ, vị trí thẻ và hai nút", "tictactoe.py:17-40"],
      ["Bảng màu", "Nền, khung, chữ, màu quân, màu nút và màu khi rê chuột", "tictactoe.py:43-61"],
      ["Ký hiệu quân", "EMPTY = \"\", X = \"X\", O = \"O\"", "tictactoe.py:63-65"],
      ["Tên người chơi", "PLAYER_LABEL và PLAYER_COLOR tra theo ký hiệu X hoặc O", "tictactoe.py:67-68"],
      ["WIN_LINES", "Tám bộ ba toạ độ thắng: 3 hàng, 3 cột, 2 chéo", "tictactoe.py:70-79"],
      ["Tên font", "Danh sách font hệ thống ưu tiên, tách riêng bản thường và bản đậm", "tictactoe.py:81-82"],
    ],
    [2200, 5000, 1826],
  ),

  h2("2.2. Nhóm hàm xử lý bàn cờ"),
  table(
    ["Hàm", "Việc làm", "Nơi khai báo"],
    [
      ["new_board()", "Trả về bàn cờ 3×3 mới, toàn bộ ô rỗng", "tictactoe.py:86-88"],
      ["check_win(board, player)", "Duyệt 8 đường, trả về bộ 3 ô thắng hoặc None", "tictactoe.py:91-96"],
      ["is_full(board)", "True khi cả 9 ô đều không còn trống", "tictactoe.py:99-101"],
      ["cell_rect(row, col)", "Trả về hình chữ nhật của ô theo toạ độ cửa sổ", "tictactoe.py:104-106"],
      ["cell_center(row, col)", "Trả về tâm ô, dùng để vẽ quân và vạch thắng", "tictactoe.py:109-111"],
      ["cell_at(pos)", "Đổi toạ độ chuột thành (row, col), None nếu ngoài bàn cờ", "tictactoe.py:114-120"],
    ],
    [2600, 4600, 1826],
  ),

  h2("2.3. Nhóm lớp TicTacToe — trạng thái và sự kiện"),
  table(
    ["Thành phần", "Việc làm", "Nơi khai báo"],
    [
      ["Lớp TicTacToe", "Giữ toàn bộ trạng thái ván, xử lý sự kiện và vẽ màn hình", "tictactoe.py:144-145"],
      ["__init__()", "Khởi tạo pygame, mở cửa sổ, tạo bộ font và hai hình chữ nhật nút", "tictactoe.py:147-160"],
      ["_font()", "Lấy font hệ thống theo tên, lùi về font mặc định nếu không có", "tictactoe.py:162-166"],
      ["reset_scores()", "Đưa cả bảng điểm về 0 rồi gọi reset()", "tictactoe.py:169-172"],
      ["reset()", "Tạo lại bàn cờ, X đi trước, giữ nguyên bảng điểm", "tictactoe.py:174-182"],
      ["status()", "Trả về chuỗi trạng thái: thắng, hòa hoặc lượt đi", "tictactoe.py:184-189"],
      ["handle_event()", "Xử lý QUIT, KEYDOWN, MOUSEMOTION, MOUSEBUTTONDOWN", "tictactoe.py:192-210"],
      ["_button_at()", "Trả về nút đang được trỏ tới, None nếu không trúng nút", "tictactoe.py:212-216"],
      ["play()", "Nơi duy nhất thay đổi bàn cờ: đặt quân, kiểm tra thắng/hòa, cộng điểm", "tictactoe.py:218-236"],
      ["main()", "Vòng lặp sự kiện, vẽ lại mỗi khung hình, giới hạn 60 fps", "tictactoe.py:315-325"],
    ],
    [2600, 4600, 1826],
  ),

  h2("2.4. Nhóm hàm vẽ"),
  table(
    ["Thành phần", "Việc làm", "Nơi khai báo"],
    [
      ["draw()", "Vẽ lại toàn bộ màn hình: nền, khung, hai thẻ, lưới, quân, vạch thắng, chữ, hai nút", "tictactoe.py:278-312"],
      ["draw_mark()", "Vẽ X bằng hai nét chéo, vẽ O bằng hình tròn rỗng", "tictactoe.py:124-134"],
      ["draw_win_line()", "Nối tâm ô đầu và ô cuối bằng nét đậm hơn nét lưới", "tictactoe.py:137-140"],
      ["_text()", "Render chữ rồi blit, canh theo tâm", "tictactoe.py:239-242"],
      ["_text_left()", "Render chữ rồi blit, canh theo mép trái giữa", "tictactoe.py:244-247"],
    ],
    [2600, 4600, 1826],
  ),

  h2("2.5. Nhóm giao diện"),
  p("Toàn bộ hình khối được vẽ bằng các hàm hình học của pygame, không dùng tệp ảnh hay tệp font đi kèm. Chữ lấy từ font có sẵn của hệ điều hành qua pygame.font.SysFont."),
  table(
    ["Thành phần trên màn hình", "Hình khối", "Nơi khai báo"],
    [
      ["Nền vàng toàn cửa sổ", "screen.fill(BG_COLOR)", "tictactoe.py:279"],
      ["Khung trắng viền đen và thanh tiêu đề ba chấm", "draw.rect + draw.line + draw.circle", "tictactoe.py:267-276"],
      ["Hai thẻ người chơi, đảo màu theo lượt đi", "draw.rect, viền đậm hơn khi đang đến lượt", "tictactoe.py:249-257"],
      ["Số trận thắng in trên thẻ", "font.render rồi blit", "tictactoe.py:256-257"],
      ["Lưới bàn cờ", "4 draw.line ngang và dọc", "tictactoe.py:290-295"],
      ["Quân X và quân O", "draw.line và draw.circle", "tictactoe.py:124-134"],
      ["Ô đang rê chuột", "draw.rect màu vàng nhạt", "tictactoe.py:287-288"],
      ["Vạch thắng", "draw.line nét đậm qua tâm hai ô đầu cuối", "tictactoe.py:137-140"],
      ["Dòng trạng thái và dòng gợi ý phím", "font.render rồi blit", "tictactoe.py:307-309"],
      ["Hai nút có đổ bóng lệch 4 pixel", "hai draw.rect lệch nhau, đổi màu khi rê chuột", "tictactoe.py:259-265"],
    ],
    [3200, 3600, 2226],
  ),

  // ================================================================ 3
  h1("3. Bảng trạng thái ván"),
  p("Bảng dưới liệt kê trạng thái của các biến sau mỗi tình huống xảy ra trong một ván."),
  table(
    ["Tình huống", "over", "winner", "win_line", "Điểm", "Hành động tiếp theo"],
    [
      ["Khởi tạo xong", "False", "\"\"", "None", "0", "Chờ click"],
      ["Đã đi vài nước, chưa ai thắng", "False", "\"\"", "None", "0", "Chờ click"],
      ["Vừa kín một đường thắng", "True", "\"X\" hoặc \"O\"", "Bộ 3 ô thắng", "wins += 1", "Tô vạch thắng, khoá bàn"],
      ["9 ô đầy, không ai thắng", "True", "\"\"", "None", "draws += 1", "Báo hòa"],
      ["Click ô đã có quân", "không đổi", "không đổi", "không đổi", "không đổi", "Bỏ qua, không đổi lượt"],
      ["Click ngoài bàn cờ", "không đổi", "không đổi", "không đổi", "không đổi", "Bỏ qua"],
      ["Bấm Chơi lại", "False", "\"\"", "None", "giữ nguyên", "X đi trước ván mới"],
      ["Bấm Xóa điểm", "False", "\"\"", "None", "về 0", "Xoá cả bảng điểm"],
    ],
    [2300, 900, 1500, 1600, 1200, 1526],
  ),
  where("tictactoe.py:174-182 (reset); tictactoe.py:192-210 (handle_event); tictactoe.py:218-236 (play)"),

  h2("3.1. Phím và nút"),
  table(
    ["Thao tác", "Tác dụng", "Nơi xử lý"],
    [
      ["Chuột trái lên ô bàn cờ", "Đặt quân X hoặc O vào ô đang trống", "tictactoe.py:209"],
      ["Nút CHƠI LẠI", "Tạo ván mới, giữ nguyên bảng điểm", "tictactoe.py:158, 207"],
      ["Nút XÓA ĐIỂM", "Xoá ván và đưa bảng điểm về 0", "tictactoe.py:159, 207"],
      ["Phím ESC hoặc Q", "Thoát chương trình", "tictactoe.py:197-198"],
    ],
    [2700, 4200, 2126],
  ),

  // ================================================================ 4
  h1("4. Kiểm thử"),
  p("Tệp selftest.py chạy game ở chế độ không hiển thị cửa sổ bằng biến môi trường SDL_VIDEODRIVER=dummy, sau đó gửi sự kiện chuột và phím giả lập để kiểm tra từng bước."),
  where("selftest.py:12 - đặt SDL_VIDEODRIVER; selftest.py:14-16 - import pygame và tictactoe"),
  p("Các hàm kiểm tra gồm:"),
  ...code([
    "check_logic()      # new_board, cell_at, ca 8 duong thang, ban day khong ai thang",
    "check_flow()       # click hop le, thang, hoa, khoa van, nut bam, xoa diem, ESC",
    "check_highlight()  # con tro tren nut va tren o",
    "render_shots()     # luu 4 anh minh hoa vao docs/img/",
  ]),
  where("selftest.py:34-55 (check_logic); selftest.py:59-108 (check_flow); selftest.py:111-121 (check_highlight); selftest.py:124-155 (render_shots)"),
  p("Ba hàm kiểm tra dùng helper để giả lập thao tác chuột, nhờ vậy không cần mở cửa sổ thật."),
  ...code([
    "def click(game, pos):",
    "    game.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=pos))",
    "",
    "def move(game, pos):",
    "    game.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=pos, rel=(0,0), buttons=(0,0,0)))",
  ]),
  where("selftest.py:21-26 - click(), move(); selftest.py:29-31 - play_moves()"),
  ...code([
    "$ python selftest.py",
    "OK  logic: new_board / check_win / is_full / cell_at",
    "OK  flow: click hop le / thang / hoa / khoa van / nut bam / xoa diem / ESC",
    "OK  hover: con tro tren nut / tren o",
  ]),
  where("selftest.py:158-163 - điểm vào của tệp"),

  // ================================================================ 5
  h1("5. Đóng gói và chạy"),
  p("Tệp build_exe.ps1 gọi PyInstaller với các tham số --onefile, --console, --noconfirm và --clean để gom toàn bộ pygame vào một tệp tictactoe.exe trong thư mục dist, chạy được trên máy không cài Python."),
  where("build_exe.ps1:16-28 - vòng lặp gọi PyInstaller cho từng mục tiêu đóng gói"),
  p("Các bước cài đặt môi trường, chạy game và chạy kiểm thử được ghi trong README.md. Thư viện pygame không có bản dựng sẵn cho Python 3.14 nên môi trường dùng Python 3.13."),
  where("requirements.txt:3 - ràng buộc phiên bản pygame; README.md:30-37 - lệnh tạo môi trường; README.md:84-90 - lệnh kiểm thử"),
];

// ------------------------------------------------------------------ xuất file
const doc = new Document({
  creator: "Bai 8 - TicTacToe pygame",
  title: "Bai 8 - TicTacToe pygame",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Calibri", color: ACCENT },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Calibri", color: "2E74B5" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 240 } } } }],
      },
    ],
  },
  sections: [{
    properties: { page: { size: PAGE, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Trang ", size: 18, color: "808080" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
      })] }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const target = path.join(OUT, "Bai-8-TicTacToe-bao-cao.docx");
  fs.writeFileSync(target, buffer);
  console.log("Da tao: " + target);
}).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
