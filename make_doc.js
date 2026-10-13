// Sinh 2 file Word cho báo cáo: TFTP và bài 8 (Tic-Tac-Toe bằng pygame).
// Chạy:  node make_docs.js
const fs = require("fs");
const path = require("path");
const {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, LevelFormat,
  PageNumber, Packer, Paragraph, ShadingType, Table, TableCell, TableRow,
  TextRun, WidthType,
} = require("docx");

const OUT = path.join(__dirname, "docs");
const PAGE = { width: 11906, height: 16838 };           // A4
const CONTENT = PAGE.width - 1440 * 2;                  // 9026 DXA
const ACCENT = "1F4E79";
const CODE_BG = "F4F6F8";

const border = { style: BorderStyle.SINGLE, size: 1, color: "BFC7D1" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ------------------------------------------------------------------ helpers
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
const h3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })],
});
const bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: "bullets", level },
  spacing: { after: 60 },
  children: [new TextRun(text)],
});
const numbered = (text) => new Paragraph({
  numbering: { reference: "numbers", level: 0 },
  spacing: { after: 60 },
  children: [new TextRun(text)],
});
const code = (lines) => lines.map((line) => new Paragraph({
  shading: { fill: CODE_BG, type: ShadingType.CLEAR },
  spacing: { after: 0, line: 240 },
  indent: { left: 200 },
  children: [new TextRun({ text: line || " ", font: "Consolas", size: 18 })],
}));
const caption = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200, before: 60 },
  children: [new TextRun({ text, italics: true, size: 18, color: "595959" })],
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

const docBase = (children) => new Document({
  creator: "Bao cao TFTP + Bai 8",
  title: "Bao cao",
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
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, font: "Calibri", color: "404040" },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 },
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

// =============================================================== DOC 1: TFTP

// ============================================================ DOC 2: Bài 8
const gameChildren = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: "BÀI 8: CỜ CARO 3×3 (TIC-TAC-TOE)", bold: true, size: 38, color: ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 },
    children: [new TextRun({ text: "Lập trình bằng pygame - không cần bất kỳ tài nguyên (asset) nào", italics: true, size: 24, color: "595959" })],
  }),

  h1("1. Đề bài và yêu cầu"),
  bullet("Hai người luân phiên click đặt quân X và O trên bàn cờ 3×3."),
  bullet("Kiểm tra thắng hoặc hòa sau mỗi nước đi."),
  bullet("Tô sáng đường thắng khi có người thắng."),
  bullet("Nhấn phím R để chơi lại ván mới."),
  bullet("Kỹ năng cần sử dụng: mảng hai chiều, kiểm tra điều kiện thắng, vòng lặp sự kiện trong pygame."),
  bullet("Yêu cầu bổ sung: dựng game bằng pygame nhưng không được dùng file hình ảnh hay font tải ngoài."),

  h1("2. Ý tưởng và cách làm"),
  h2("2.1. Vì sao không cần asset?"),
  p("Mọi thành phần trên màn hình đều được vẽ bằng các hàm hình học của pygame, không đọc bất kỳ tệp ảnh hay tệp font nào:"),
  table(
    ["Thành phần", "Cách vẽ không cần asset"],
    [
      ["Đường kẻ bàn cờ", "pygame.draw.line() vẽ 4 vạch (2 ngang, 2 dọc)"],
      ["Quân X", "pygame.draw.line() vẽ hai nét chéo, đối xứng qua tâm ô"],
      ["Quân O", "pygame.draw.circle() vẽ hình tròn rỗng"],
      ["Đường thắng", "pygame.draw.line() nối tâm ô đầu và ô cuối, nét đậm hơn, màu khác"],
      ["Chữ thông báo", "pygame.font.Font(None, size) - font mặc định đi kèn pygame"],
      ["Vùng đang rê chuột", "pygame.draw.rect() bo góc bo tròn màu nhạt"],
    ],
    [2300, 6726],
  ),
  h2("2.2. Mô hình dữ liệu: mảng hai chiều"),
  p("Bàn cờ được biểu diễn bằng mảng 3×3, mỗi phần tử lưu ký hiệu \"X\", \"O\" hoặc chuỗi rỗng nếu ô còn trống:"),
  ...code([
    "board = [",
    "    ['', '', ''],      # dong 0",
    "    ['', '', ''],      # dong 1",
    "    ['', '', ''],      # dong 2",
    "]",
    "",
    "# Truy cap oi [dong][cot]; goi y board[1][2] la o giua dong, ben phai.",
  ]),
  p("Cách quy đổi giữa toạ độ chuột và toạ độ ô là công thức chia lấy nguyên, vì bàn cờ chia đều thành các ô vuông cạnh CELL pixel:"),
  ...code([
    "col = (x - MARGIN) // CELL",
    "row = (y - MARGIN) // CELL",
    "# neu row hoac col ngoai 0..2 thi click khong trung o nao -> tra ve None",
  ]),
  h2("2.3. Thuật toán kiểm tra thắng"),
  p("Trên bàn 3×3 có đúng 8 đường thắng: 3 hàng ngang, 3 cột dọc và 2 đường chéo. Ta khai báo trước danh sách các đường này, rồi kiểm tra xem có đường nào mà cả ba ô đều thuộc về cùng một người chơi hay không. Hàm trả về chính đường thắng đó để vẽ vạch tô sáng, hoặc trả về None nếu chưa có ai thắng:"),
  ...code([
    "WIN_LINES = (",
    "    ((0,0),(0,1),(0,2)), ((1,0),(1,1),(1,2)), ((2,0),(2,1),(2,2)),   # hang",
    "    ((0,0),(1,0),(2,0)), ((0,1),(1,1),(2,1)), ((0,2),(1,2),(2,2)),   # cot",
    "    ((0,0),(1,1),(2,2)), ((0,2),(1,1),(2,0)),                        # duong cheo",
    ")",
    "",
    "def check_win(board, player):",
    "    for line in WIN_LINES:",
    "        if all(board[r][c] == player for r, c in line):",
    "            return line          # thu duoc duong thang de to sang",
    "    return None                  # chua co ai thang",
  ]),
  p("Điều kiện hòa chỉ xảy ra khi không có đường thắng nào và bàn cờ đã đầy. Với mảng cố định 3×3, phép kiểm tra chạy trong thời gian hằng số (8 đường × 3 ô), không phụ thuộc số lượng quân đã đặt."),
  h2("2.4. Luồng xử lý sự kiện"),
  numbered("Khởi tạo cửa sổ, font và bàn cờ rỗng qua hàm reset()."),
  numbered("Vòng lặp chính liên tục lấy sự kiện từ pygame.event.get(), mỗi khung hình vẽ lại toàn bộ màn hình và giới hạn 60 khung hình/giây bằng clock.tick(60)."),
  numbered("Khi người chơi click: đổi toạ độ chuột thành tọa độ ô, nếu ô trống và ván chưa kết thúc thì đặt quân của người đang đi."),
  numbered("Ngay sau khi đặt quân, kiểm tra thắng; nếu thắng thì khóa bàn cờ, lưu đường thắng để tô sáng. Nếu không thắng mà bàn cờ đầy thì kết luận hòa."),
  numbered("Đổi lượt cho người chơi kia bằng cách hoán đổi ký hiệu X và O."),
  numbered("Nhấn phím R gọi lại reset() để xoá sạch trạng thái; nhấn ESC hoặc đóng cửa sổ để thoát."),

  h1("3. Thành phần chính của chương trình"),
  h2("3.1. Các hằng số thiết kế"),
  table(
    ["Hằng số", "Giá trị", "Ý nghĩa"],
    [
      ["BOARD_SIZE", "3", "Kích thước bàn cờ"],
      ["CELL", "150", "Cạnh một ô (pixel)"],
      ["MARGIN", "60", "Lề giữa khung cửa sổ và bàn cờ"],
      ["LINE_W", "6", "Độ dày nét vẽ"],
      ["X / O / EMPTY", "\"X\" / \"O\" / \"\"", "Ký hiệu quân và ô trống"],
      ["WIN_LINES", "8 bộ ba", "Tất cả các đường thắng"],
    ],
    [2300, 1900, 4826],
  ),
  h2("3.2. Các hàm xử lý logic"),
  table(
    ["Hàm", "Trách nhiệm"],
    [
      ["new_board()", "Tạo mảng 3×3 với toàn bộ ô trống"],
      ["check_win(board, player)", "Kiểm tra 8 đường thắng, trả về đường thắng hoặc None"],
      ["is_full(board)", "Kiểm tra bàn cờ đã đầy chưa - dùng để kết luận hòa"],
      ["cell_center(row, col)", "Tính tọa độ tâm của ô trên cửa sổ"],
      ["cell_at(pos)", "Chuyển tọa độ chuột thành (row, col), trả None nếu nằm ngoài bàn cờ"],
    ],
    [3100, 5926],
  ),
  h2("3.3. Các hàm vẽ"),
  table(
    ["Hàm", "Trách nhiệm"],
    [
      ["draw_mark(surface, row, col, mark)", "Vẽ quân X (hai nét chéo) hoặc O (hình tròn) bằng pygame.draw"],
      ["draw_win_line(surface, line)", "Nối tâm hai ô đầu cuối của đường thắng bằng nét đậm màu xanh lá"],
      ["TicTacToe.draw()", "Xoá nền, vẽ vùng rê chuột, lưới, quân, vạch thắng, dòng trạng thái và gợi ý phím tắt"],
    ],
    [3800, 5226],
  ),
  h2("3.4. Lớp TicTacToe"),
  p("Toàn bộ trạng thái của ván cờ được gom vào một lớp để mã dễ đọc và dễ mở rộng:"),
  table(
    ["Thuộc tính", "Kiểu", "Ý nghĩa"],
    [
      ["board", "list[list[str]]", "Mảng 2 chiều chứa ký hiệu tại mỗi ô"],
      ["player", "str", "Lượt đi hiện tại: X hoặc O"],
      ["over", "bool", "Ván đã kết thúc chưa (thắng hoặc hòa)"],
      ["winner", "str", "Người thắng, rỗng nếu hòa hoặc chưa xong"],
      ["win_line", "tuple | None", "Bộ ba ô thắng để tô sáng"],
      ["hover", "tuple | None", "Ô đang rê chuột, dùng để đánh dấu"],
      ["moves", "int", "Số nước đã đi"],
    ],
    [2000, 2500, 4526],
  ),
  p("Ba phương thức chính: reset() khởi tạo lại toàn bộ trạng thái, handle_event() xử lý sự kiện chuột và bàn phím, play() đặt quân và kiểm tra kết quả. Hàm main() chỉ lo phần tạo cửa sổ và vòng lặp sự kiện, nhờ vậy phần logic hoàn toàn tách biệt khỏi phần hiển thị."),
  h2("3.5. Phím tắt"),
  table(
    ["Phím", "Tác dụng"],
    [
      ["Chuột trái", "Đặt quân X hoặc O vào ô được chọn"],
      ["R", "Chơi lại từ đầu"],
      ["ESC hoặc Q", "Thoát chương trình"],
    ],
    [3000, 6026],
  ),

  h1("4. Kết quả chạy thử"),
  p("Giao diện khi bắt đầu ván: bàn cờ trống, lượt đi của X."),
  image("ttt_start.png", 260, 301, "Bàn cờ 3x3 lúc bắt đầu"),
  p("Giữa ván: hai người đã đi vài nước, ô đang rê chuột được tô nền để người chơi định vị trí."),
  image("ttt_mid.png", 260, 301, "Bàn cờ giữa ván"),
  p("Khi X kín hàng trên cùng: dòng thông báo đổi màu xanh lá và đường thắng được tô sáng để dễ nhận biết."),
  image("ttt_win.png", 260, 301, "X thắng hàng ngang trên cùng"),
  p("Các ảnh trên được sinh tự động bằng chế độ chạy không hiển thị cửa sổ (SDL_VIDEODRIVER=dummy) trong tệp selftest.py, nên việc kiểm thử không cần thao tác chuột thật."),

  h1("5. Kiểm thử"),
  p("Tệp selftest.py kiểm tra tự động các trường hợp sau:"),
  bullet("Bàn cờ mới tạo đều rỗng, đủ 3 dòng và 3 cột."),
  bullet("Cả 8 đường thắng đều được nhận diện đúng, không báo thắng nhầm cho người còn lại."),
  bullet("Bàn cờ đầy mà không ai thắng được phân định đúng là hòa."),
  bullet("Click vào ô đã có quân hoặc ngoài bàn cờ không làm thay đổi lượt đi."),
  bullet("Khi ván đã kết thúc, mọi nước đi tiếp theo đều bị bỏ qua."),
  bullet("Nhấn R xoá sạch bàn cờ; nhấn ESC trả về giá trị yêu cầu thoát chương trình."),
  ...code([
    "$ python selftest.py",
    "OK  logic: new_board / check_win / is_full / cell_at",
    "OK  flow: click hop le / thang / hoa / khoa van / R / ESC",
    "OK  anh minh hoa -> docs/img",
    "",
    "Tat ca kiem tra deu PASS.",
  ]),

  h1("6. Kinh nghiệm rút ra"),
  bullet("Tách bạch phần logic khỏi phần hiển thị (lớp TicTacToe) giúp kiểm thử được bằng cách gọi hàm trực tiếp, không cần mở cửa sổ."),
  bullet("Khai báo trước danh sách đường thắng rõ ràng hơn nhiều so với viết hàng loạt điều kiện if lồng nhau."),
  bullet("Với pygame, hàm draw.line, draw.circle, draw.rect đủ để dựng giao diện hoàn chỉnh mà không cần một tệp asset nào."),
  bullet("Font mặc định pygame.font.Font(None, size) giải quyết được nhu cầu hiển thị chữ mà không phải tải file .ttf."),
  bullet("Cần khóa bàn cờ bằng một cờ trạng thái (over) sau khi có kết quả, nếu không người chơi có thể đặt quân đè lên ván đã kết thúc."),
];

// ------------------------------------------------------------------ xuất file
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
    const game = docBase(gameChildren);
  
  fs.writeFileSync(path.join(OUT, "Bai-8-TicTacToe.docx"), await Packer.toBuffer(game));
  console.log("Da tao: docs/Bai-8-TicTacToe.docx");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
