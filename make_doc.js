// Sinh file Word bao cao bai 8: Muc tieu -> Cach lam -> Thanh phan chinh.
// Moi muc deu kem doan code rut ngan va chi ro nam o file nao.
// Chay:  node make_doc.js
const fs = require("fs");
const path = require("path");
const {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, LevelFormat,
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
const numbered = (text) => new Paragraph({
  numbering: { reference: "numbers", level: 0 },
  spacing: { after: 80 },
  children: [new TextRun(text)],
});
const code = (lines) => lines.map((line) => new Paragraph({
  shading: { fill: CODE_BG, type: ShadingType.CLEAR },
  spacing: { after: 0, line: 240 },
  indent: { left: 200 },
  children: [new TextRun({ text: line || " ", font: "Consolas", size: 18 })],
}));

// Nhan "file: dong" de danh dau noi dat dung
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
      children: [new TextRun({ text: line, bold: !!isHeader })],
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

const image = (file, width, height, alt) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 160, after: 40 },
  children: [new ImageRun({
    type: "png",
    data: fs.readFileSync(path.join(OUT, "img", file)),
    transformation: { width, height },
    altText: { title: alt, description: alt, name: alt },
  })],
});

// ------------------------------------------------------------------ nội dung
const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: "BÀI 8 - CỜ CARO 3×3 (TIC-TAC-TOE)", bold: true, size: 38, color: ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 },
    children: [new TextRun({ text: "Báo cáo cách làm và các thành phần chính của chương trình", italics: true, size: 24, color: "595959" })],
  }),

  h1("1. Mục tiêu"),
  p("Xây dựng một trò chơi cờ caro 3×3 cho hai người chơi trên cùng máy tính, viết bằng thư viện pygame, với các yêu cầu cụ thể sau:"),
  bullet("Hai người luân phiên click đặt quân X và O trên bàn cờ 3×3."),
  bullet("Chương trình tự phát hiện thắng hoặc hòa ngay sau mỗi nước đi."),
  bullet("Khi có người thắng, đường thắng được tô sáng để dễ nhận biết."),
  bullet("Có nút chơi lại (và phím R) để bắt đầu ván mới."),
  bullet("Thẻ của người đang đến lượt được làm nổi bật, giúp nhìn nhanh biết lượt đi thuộc về ai."),
  bullet("Đếm số trận thắng của cả hai người và số ván hòa, giữ điểm xuyên suốt các ván."),
  bullet("Giao diện theo mẫu tham khảo: nền vàng, khung màn hình trắng viền đen có thanh tiêu đề ba chấm, chữ in hoa đậm, nút màu chanh nhạt có đổ bóng."),
  bullet("Không dùng bất kỳ tệp hình ảnh hay tệp font (.ttf) nào; mọi hình khối đều vẽ bằng hàm hình học của pygame."),
  p("Toàn bộ mã nguồn nằm trong một tệp duy nhất: tictactoe.py. Các bước cài đặt, kiểm thử và đóng gói được mô tả trong README.md.", { italics: true }),

  h1("2. Cách làm"),
  h2("2.1. Bước 1 - Khởi tạo cửa sổ và các hằng số bố cục"),
  p("Khai báo trước kích thước các thành phần (cạnh ô, vị trí bàn cờ, vị trí nút) để khi vẽ chỉ cần truyền số vào, không phải tính lại mỗi khung hình. Cửa sổ dùng chế độ cửa sổ cố định, không dùng RESIZABLE để bố cục không bị xáo lệch."),
  ...code([
    "CELL = 150                        # canh mot o",
    "WINDOW_W, WINDOW_H = 640, 760     # kich thuoc cua so",
    "BOARD_X = (WINDOW_W - BOARD_PX) // 2   # can giua ban co",
    "btn_play  = pygame.Rect(BTN_X, BTN_Y, BTN_W, BTN_H)",
    "btn_clear = pygame.Rect(BTN_X + BTN_W + BTN_GAP, BTN_Y, BTN2_W, BTN_H)",
  ]),
  where("tictactoe.py:17-39 (khai bao hang so) va tictactoe.py:160-161 (tao hai nut)"),
  h2("2.2. Bước 2 - Lưu bàn cờ bằng mảng hai chiều"),
  p("Bàn cờ được lưu trong mảng 3×3. Mỗi ô chứa \"X\", \"O\" hoặc chuỗi rỗng nếu còn trống. Quy ước bất biến là board[row][col]: row là dòng tính từ trên xuống, col là cột tính từ trái sang phải, cả hai chạy từ 0 đến 2."),
  ...code([
    "def new_board() -> list[list[str]]:",
    "    return [[EMPTY for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]",
  ]),
  where("tictactoe.py:86 - new_board()"),
  p("Phải tạo bằng vòng lặp lồng như trên chứ không dùng [[]] * 3, vì cách nhân danh sách sẽ làm các hàng cùng trỏ về một danh sách: đặt X vào hàng 0 thì hàng 1 và hàng 2 cũng đổi theo."),
  h2("2.3. Bước 3 - Đổi toạ độ chuột thành toạ độ ô"),
  p("Bàn cờ chia đều thành các ô vuông cạnh CELL pixel, nên phép chia lấy nguyên ra số thứ tự của ô. Kết quả nằm ngoài khoảng 0 đến 2 nghĩa là chuột đang ở ngoài bàn cờ, hàm trả về None để bỏ qua."),
  ...code([
    "def cell_at(pos):",
    "    x, y = pos",
    "    col, row = (x - BOARD_X) // CELL, (y - BOARD_Y) // CELL",
    "    if 0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE:",
    "        return int(row), int(col)",
    "    return None",
  ]),
  where("tictactoe.py:114 - cell_at(); tictactoe.py:104 - cell_rect() dung de ve o"),
  h2("2.4. Bước 4 - Xử lý cú click: đủ điều kiện mới cho đặt quân"),
  p("Một cú click chỉ được chấp nhận khi đồng thời thỏa ba điều kiện: ván chưa kết thúc, chuột nằm trong bàn cờ, và ô đó còn trống. Thiếu một điều kiện là bỏ qua, không đổi lượt."),
  ...code([
    "def play(self, cell):",
    "    if self.over or cell is None:        # da ket thuc hoac click ngoai ban co",
    "        return",
    "    row, col = cell",
    "    if self.board[row][col] != EMPTY:     # o nay da co quan",
    "        return",
    "    self.board[row][col] = self.player",
    "    self.moves += 1",
  ]),
  where("tictactoe.py:220 - play()"),
  h2("2.5. Bước 5 - Kiểm tra thắng bằng tám đường có sẵn"),
  p("Bàn 3×3 có đúng tám đường thắng: ba hàng ngang, ba cột dọc và hai đường chéo. Khai báo trước tám bộ ba toạ độ này, rồi kiểm tra xem có bộ nào cả ba ô đều mang ký hiệu của người đang đi hay không. Hàm trả về chính bộ ba ô thắng đó để vẽ vạch tô sáng."),
  ...code([
    "WIN_LINES = (                                 # 3 hang + 3 cot + 2 duong cheo",
    "    ((0,0),(0,1),(0,2)), ((1,0),(1,1),(1,2)), ((2,0),(2,1),(2,2)),",
    "    ((0,0),(1,0),(2,0)), ((0,1),(1,1),(2,1)), ((0,2),(1,2),(2,2)),",
    "    ((0,0),(1,1),(2,2)), ((0,2),(1,1),(2,0)),",
    ")",
    "",
    "def check_win(board, player):",
    "    for line in WIN_LINES:",
    "        if all(board[r][c] == player for r, c in line):",
    "            return line        # tra ve duong thang de to sang",
    "    return None                # chua co ai thang",
  ]),
  where("tictactoe.py:70 - WIN_LINES; tictactoe.py:91 - check_win()"),
  h2("2.6. Bước 6 - Kiểm tra hòa và cộng điểm"),
  p("Hòa xảy ra khi không có đường thắng nào và bàn cờ đã đầy đủ 9 ô. Thứ tự kiểm tra bắt buộc là thắng trước, đầy bàn sau, vì bàn đầy mà vẫn có ba ô thẳng hàng thì là thắng chứ không phải hòa. Ngay khi phát sinh kết quả, điểm được cộng vào bảng điểm bên ngoài ván đang chơi."),
  ...code([
    "line = check_win(self.board, self.player)",
    "if line is not None:",
    "    self.over, self.winner, self.win_line = True, self.player, line",
    "    self.wins[self.player] += 1        # cong diem cho nguoi thang",
    "elif is_full(self.board):",
    "    self.over = True",
    "    self.draws += 1                    # cong 1 vong hoa",
    "else:",
    "    self.player = O if self.player == X else X",
  ]),
  where("tictactoe.py:227-237 - play(); tictactoe.py:99 - is_full()"),
  h2("2.7. Bước 7 - Nút bấm: chơi lại và xóa điểm"),
  p("Hai nút là hai hình chữ nhật cố định. Khi rê chuột vào nút thì không tô ô bàn cờ, và khi bấm vào thì gọi reset() (xoá ván, giữ điểm) hoặc reset_scores() (xoá cả bảng điểm). Phím R thực hiện cùng tác vụ với nút Chơi lại."),
  ...code([
    "def _button_at(self, pos):",
    "    for button in (self.btn_play, self.btn_clear):",
    "        if button.collidepoint(pos):",
    "            return button",
    "    return None",
    "",
    "# trong handle_event, khi bam chuot trai:",
    "button = self._button_at(event.pos)",
    "if button is not None:",
    "    self.reset_scores() if button == self.btn_clear else self.reset()",
    "    return True          # da xu ly nut, khong xu ly tiep click o ban co",
    "self.play(cell_at(event.pos))",
  ]),
  where("tictactoe.py:214 - _button_at(); tictactoe.py:192 - handle_event()"),
  p("Phân biệt rõ hai loại xóa là điểm quan trọng: reset() chỉ tạo lại bàn cờ, giữ nguyên wins và draws; reset_scores() mới đưa toàn bộ bảng điểm về 0. Nhờ vậy người chơi chơi nhiều ván vẫn cộng dồn được điểm.", { italics: true }),
  h2("2.8. Bước 8 - Vòng lặp sự kiện"),
  p("Hàm main() chỉ lo phần khung: lấy sự kiện, đưa cho đối tượng xử lý, vẽ lại toàn màn hình và giới hạn 60 khung hình mỗi giây. Nhờ tách vậy phần logic hoàn toàn độc lập với phần hiển thị, có thể kiểm thử bằng cách gọi trực tiếp mà không cần mở cửa sổ."),
  ...code([
    "def main() -> int:",
    "    game = TicTacToe()",
    "    clock = pygame.time.Clock()",
    "    running = True",
    "    while running:",
    "        for event in pygame.event.get():",
    "            running = game.handle_event(event)",
    "        game.draw()",
    "        clock.tick(60)",
    "    pygame.quit()",
  ]),
  where("tictactoe.py:318 - main()"),

  h1("3. Các thành phần chính đã render ra màn hình"),
  p("Mọi thành phần dưới đây đều được vẽ bằng các hàm hình học của pygame, không dùng tệp ảnh nào. Bảng dưới liệt kê phần tử tương ứng với mỗi thành phần."),
  table(
    ["Thành phần trên màn hình", "Hàm dùng để vẽ", "Nơi định nghĩa"],
    [
      ["Nền vàng toàn cửa sổ", "screen.fill(BG_COLOR)", "draw() - dòng 282"],
      ["Khung màn hình trắng viền đen", "pygame.draw.rect", "_screen_frame() - dòng 270"],
      ["Thanh tiêu đề ba chấm", "pygame.draw.circle + đường kẻ ngang", "_screen_frame() - dòng 274-279"],
      ["Lưới bàn cờ (4 vạch)", "pygame.draw.line", "draw() - dòng 293-298"],
      ["Quân X", "pygame.draw.line, hai nét chéo", "draw_mark() - dòng 124"],
      ["Quân O", "pygame.draw.circle, hình tròn rỗng", "draw_mark() - dòng 133"],
      ["Đường thắng tô sáng", "pygame.draw.line, nét đậm hơn", "draw_win_line() - dòng 137"],
      ["Vùng ô đang rê chuột", "pygame.draw.rect màu vàng nhạt", "draw() - dòng 290-291"],
      ["Thẻ người chơi", "pygame.draw.rect, đảo màu theo lượt", "_panel() - dòng 251"],
      ["Số trận thắng trong thẻ", "font.render rồi blit", "_panel() - dòng 259-260"],
      ["Dòng trạng thái và gợi ý", "font.render rồi blit", "_text() - dòng 241"],
      ["Nút có đổ bóng", "hai pygame.draw.rect lệch nhau 4px", "_button() - dòng 262"],
    ],
    [2900, 3100, 3026],
  ),

  h2("3.1. Quân X và quân O"),
  p("Cùng một hàm draw_mark nhận ký hiệu để quyết định vẽ hình gì: X là hai nét chéo cắt nhau, O là hình tròn rỗng. Cùng hàm cũng dùng lại cho biểu tượng nhỏ trên thẻ người chơi."),
  ...code([
    "def draw_mark(surface, center, mark, color, radius, width=LINE_W):",
    "    cx, cy = center",
    "    if mark == X:",
    "        pygame.draw.line(surface, color, (cx-radius, cy-radius), (cx+radius, cy+radius), width)",
    "        pygame.draw.line(surface, color, (cx-radius, cy+radius), (cx+radius, cy-radius), width)",
    "    else:",
    "        pygame.draw.circle(surface, color, (cx, cy), radius, width)",
  ]),
  where("tictactoe.py:112 - draw_mark()"),
  h2("3.2. Đường thắng được tô sáng"),
  p("Khi có người thắng, hàm check_win trả về bộ ba ô thắng. Hàm vẽ nối tâm ô đầu và ô cuối bằng một nét đậm hơn nét thường và đổi sang màu xanh lá để dễ nhận biết."),
  ...code([
    "def draw_win_line(surface, line):",
    "    (r0, c0), (r1, c1) = line[0], line[2]",
    "    pygame.draw.line(surface, WIN_COLOR,",
    "                     cell_center(r0, c0), cell_center(r1, c1), LINE_W + 6)",
  ]),
  where("tictactoe.py:125 - draw_win_line()"),
  h2("3.3. Thẻ người chơi và bảng điểm"),
  p("Mỗi người một thẻ vuông ở đầu màn hình. Điều kiện làm nổi bật thẻ là đang đến lượt bên đó và ván chưa kết thúc; khi ván xong thì cả hai thẻ cùng mờ đi vì không còn ai đi nữa. Trên thẻ có ký hiệu quân, tên người chơi và số trận thắng tích luỹ."),
  ...code([
    "self._panel(X, left,  self.player == X and not self.over)",
    "self._panel(O, right, self.player == O and not self.over)",
    "",
    "def _panel(self, mark, rect, is_active):",
    "    color = PLAYER_COLOR[mark]",
    "    pygame.draw.rect(self.screen, PANEL_ACTIVE if is_active else PANEL_COLOR, rect)",
    "    pygame.draw.rect(self.screen, color if is_active else EDGE_DIM, rect,",
    "                     width=3 if is_active else 2)",
    "    draw_mark(self.screen, (rect.x + 50, rect.centery), mark, color, 26, 5)",
    "    self._text_left(\"panel\", PLAYER_LABEL[mark], ...)",
    "    self._text_left(\"score\", f\"{self.wins[mark]} thắng\", ...)",
  ]),
  where("tictactoe.py:251 - _panel(); tictactoe.py:285-288 - draw() goi hai the"),
  h2("3.4. Nút bấm"),
  p("Nút là hình chữ nhật vuông góc, đổi màu nền và viền khi rê chuột vào để có phản hồi rõ ràng. Vùng bấm chính là hình chữ nhật đó, kiểm tra bằng collidepoint."),
  ...code([
    "def _button(self, rect, label):",
    "    is_hover = rect == self.hover_button",
    "    pygame.draw.rect(self.screen, (222,232,246) if is_hover else (236,241,247), rect)",
    "    pygame.draw.rect(self.screen, TEXT_COLOR if is_hover else EDGE_DIM, rect, width=2)",
    "    self._text(\"button\", label, TEXT_COLOR if is_hover else DIM_TEXT, rect.center)",
  ]),
  where("tictactoe.py:250 - _button()"),
  h2("3.5. Chữ hiển thị và vấn đề font tiếng Việt"),
  p("Chữ được lấy từ font có sẵn của hệ điều hành bằng pygame.font.SysFont, ưu tiên Segoe UI trên Windows. Lý do không dùng font mặc định đi kèm pygame: font đó thiếu các ký tự có dấu như ơ, ạ, ệ, ố nên chữ sẽ hiện thành ô vuông. Nếu máy không tìm được font nào, chương trình tự lùi về pygame.font.Font(None, size). Đây vẫn không phải tệp font tải kèm, nên đáp ứng yêu cầu không dùng asset."),
  ...code([
    "FONT_NAMES = \"segoeui, arial, verdana, dejavusans, tahoma, sans\"",
    "",
    "@staticmethod",
    "def _font(size):",
    "    font = pygame.font.SysFont(FONT_NAMES, size)",
    "    return font or pygame.font.Font(None, size)",
  ]),
  where("tictactoe.py:82 - FONT_BOLD; tictactoe.py:163 - _font()"),
  h2("3.6. Khung màn hình và thanh tiêu đề"),
  p("Toàn bộ phần bàn chơi nằm trong một khung trắng viền đen, bên ngoài là nền vàng. Đầu khung có một thanh tiêu đề với ba chấm tròn mô phỏng cửa sổ ứng dụng, đúng như mẫu tham khảo."),
  ...code([
    "def _screen_frame(self):",
    "    pygame.draw.rect(self.screen, SCREEN_COLOR, SCREEN)",
    "    pygame.draw.rect(self.screen, INK, SCREEN, width=3)",
    "    pygame.draw.line(self.screen, INK, (SCREEN.x, SCREEN.y + TITLE_H),",
    "                     (SCREEN.right, SCREEN.y + TITLE_H), 3)",
    "    cy = SCREEN.y + TITLE_H // 2",
    "    for index, color in enumerate(((241,233,76), (255,255,255), (176,188,0))):",
    "        pygame.draw.circle(self.screen, color, (SCREEN.x + 18 + index*20, cy), 6)",
    "        pygame.draw.circle(self.screen, INK, (SCREEN.x + 18 + index*20, cy), 6, 2)",
  ]),
  where("tictactoe.py:270 - _screen_frame()"),
  h2("3.7. Nút có đổ bóng"),
  p("Nút được vẽ bằng hai hình chữ nhật lệch nhau 4 pixel: hình phía sau màu đen tạo cảm giác đổ bông, hình phía trước là mặt nút màu chanh nhạt, rồi viền đen 3 pixel và chữ in hoa đậm."),
  ...code([
    "def _button(self, rect, label):",
    "    is_hover = rect == self.hover_button",
    "    shadow = rect.move(4, 4)                 # hinh phia sau tao bong",
    "    pygame.draw.rect(self.screen, SHADOW_COLOR, shadow)",
    "    pygame.draw.rect(self.screen, BTN_HOVER if is_hover else BTN_COLOR, rect)",
    "    pygame.draw.rect(self.screen, INK, rect, width=3)",
    "    self._text(\"button\", label, BTN_TEXT, rect.center)",
  ]),
  where("tictactoe.py:262 - _button()"),
  h2("3.8. Bảng màu của giao diện"),
  p("Nền trắng, các khung vuông góc, màu chủ đạo lấy từ màu của hai quân để người chơi nhận diện bên nào là bên nào."),
  ...code([
    "BG_COLOR      = (241, 233, 76)   # nen vang ben ngoai khung",
    "SCREEN_COLOR  = (255, 255, 255)   # khung man hinh trang",
    "INK           = (23, 23, 42)     # chu den dam, dung chung cho luoi va nhan",
    "CARD_COLOR    = (255, 255, 255)   # the nguoi choi chua den luot",
    "CARD_ACTIVE   = INK              # the nguoi choi dang den luot: nen den, chu vang",
    "HOVER_COLOR   = (250, 249, 205)   # o ban co dang re chuot",
    "BTN_COLOR     = (214, 226, 0)    # mat nut",
    "BTN_HOVER     = (176, 188, 0)    # mat nut khi re chuot vao",
    "X_COLOR       = INK              # quan X",
    "O_COLOR       = (198, 40, 62)    # quan O",
  ]),
  where("tictactoe.py:43-61 - khai bao bang mau"),

  h1("4. Hình ảnh kết quả"),
  p("Lúc bắt đầu: bàn cờ trống, thẻ Người 1 viền sáng vì X đi trước."),
  image("ttt_start.png", 250, 297, "Màn hình lúc bắt đầu"),
  p("Giữa ván: ô đang rê chuột được tô nền để người chơi định vị trí."),
  image("ttt_mid.png", 250, 297, "Bàn cờ giữa ván"),
  p("Khi X kín hàng trên cùng: dòng thông báo đổi màu xanh lá và đường thắng được tô sáng."),
  image("ttt_win.png", 250, 297, "X thắng hàng ngang trên cùng"),
  p("Chơi lại rồi thắng tiếp một ván nữa: cả hai thẻ đều có 1 trận thắng, nút Chơi lại sáng lên khi rê chuột vào."),
  image("ttt_score.png", 250, 297, "Bảng điểm hai bên và nút bấm"),
  p("Các ảnh trên được sinh tự động bởi tệp selftest.py ở chế độ chạy không hiển thị cửa sổ (biến môi trường SDL_VIDEODRIVER=dummy), nên không cần thao tác chuột thật. Nội dung file ảnh nằm trong docs/img/.", { italics: true }),

  h1("5. Kiểm thử"),
  p("Tệp selftest.py dựng game ở chế độ không hiển thị cửa sổ rồi gửi sự kiện giả lập, kiểm tra các trường hợp sau:"),
  bullet("Bàn cờ mới tạo có đủ 3 dòng 3 cột và toàn bộ ô rỗng."),
  bullet("Cả tám đường thắng đều được nhận diện đúng, không báo thắng nhầm cho người còn lại."),
  bullet("Bàn đầy mà không ai thắng được phân định đúng là hòa."),
  bullet("Click vào ô đã có quân hoặc ngoài bàn cờ không làm thay đổi lượt đi."),
  bullet("Sau khi có kết quả, bàn cờ bị khoá, mọi nước đi tiếp theo bị bỏ qua."),
  bullet("Mỗi lần thắng cộng đúng 1 điểm cho đúng người, ván hòa cộng vào bộ đếm hòa."),
  bullet("Bấm nút Chơi lại xóa ván nhưng giữ nguyên điểm; bấm nút Xóa điểm đưa cả bảng điểm về 0."),
  bullet("Hiệu ứng rê chuột đúng: trên nút thì không tô ô bàn cờ, trên ô thì tô ô đó."),
  bullet("Phím R cho lại ván, phím ESC trả về giá trị yêu cầu thoát chương trình."),
  ...code([
    "$ python selftest.py",
    "OK  logic: new_board / check_win / is_full / cell_at",
    "OK  flow: click hop le / thang / hoa / khoa van / nut bam / R / xoa diem / ESC",
    "OK  hover: con tro tren nut / tren o",
    "OK  anh minh hoa -> docs/img",
  ]),
  where("selftest.py:58 - check_logic(); selftest.py:76 - check_flow(); selftest.py:115 - check_highlight()"),

  h1("6. Đóng gói thành file chạy trực tiếp"),
  p("Dùng PyInstaller đóng gói toàn bộ pygame vào một file .exe để chạy trên máy khác không cần cài Python. Tệp build_exe.ps1 thực hiện việc này, kết quả là tictactoe.exe trong thư mục dist/."),
  ...code([
    "uv pip install --python .venv\\Scripts\\python.exe pyinstaller",
    ".\\build_exe.ps1",
  ]),
  where("build_exe.ps1 (goi PyInstaller voi tham so --onefile --console --noconfirm --clean)"),
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
      {
        reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
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
  fs.writeFileSync(path.join(OUT, "Bai-8-TicTacToe.docx"), buffer);
  console.log("Da tao: docs/Bai-8-TicTacToe.docx");
}).catch((err) => {
  console.error(err.message);
  process.exit(1);
});