"""Bài 8 - Cờ caro 3x3 (Tic-Tac-Toe) chạy bằng pygame, KHÔNG dùng file asset nào.

Hình ảnh vẽ hoàn toàn bằng pygame.draw, chữ dùng font của hệ thống qua
pygame.font.SysFont (Windows luôn có sẵn, không phải tệp .ttf đi kèm).

Chạy:
    python tictactoe.py
"""

from __future__ import annotations

import sys

import pygame

# ---------------------------------------------------------------- hằng số
BOARD_SIZE = 3
CELL = 150
BOARD_PX = BOARD_SIZE * CELL

WINDOW_W = 640
WINDOW_H = 780
BOARD_X = (WINDOW_W - BOARD_PX) // 2
BOARD_Y = 156
LINE_W = 7

# Khung "màn hình" trắng, các nút nằm ngoài khung trên nền vàng
SCREEN = pygame.Rect(16, 14, WINDOW_W - 32, 692)
TITLE_H = 32
CARD_W, CARD_H = 284, 92
CARD_Y = 56
CARD_X_LEFT, CARD_X_RIGHT = 30, 326

STATUS_Y = 638
BTN_Y = 712
BTN_H = 58
BTN_W = 200
BTN2_W = 172
BTN_GAP = 16
BTN_X = (WINDOW_W - (BTN_W + BTN_GAP + BTN2_W)) // 2

# Bảng màu lấy theo mẫu: nền vàng, màn hình trắng, chữ đen đậm
BG_COLOR = (241, 233, 76)
SCREEN_COLOR = (255, 255, 255)
INK = (23, 23, 42)
CARD_COLOR = (255, 255, 255)
CARD_ACTIVE = INK
CARD_DIM = (104, 112, 130)
GRID_COLOR = INK
HOVER_COLOR = (250, 249, 205)
WIN_COLOR = INK
TEXT_COLOR = INK
DIM_TEXT = (104, 112, 130)

BTN_COLOR = (214, 226, 0)
BTN_HOVER = (176, 188, 0)
BTN_TEXT = INK
SHADOW_COLOR = (23, 23, 42)

X_COLOR = INK
O_COLOR = (198, 40, 62)

EMPTY = ""
X = "X"
O = "O"

PLAYER_LABEL = {X: "NGƯỜI 1", O: "NGƯỜI 2"}
PLAYER_COLOR = {X: X_COLOR, O: O_COLOR}

WIN_LINES = (
    ((0, 0), (0, 1), (0, 2)),
    ((1, 0), (1, 1), (1, 2)),
    ((2, 0), (2, 1), (2, 2)),
    ((0, 0), (1, 0), (2, 0)),
    ((0, 1), (1, 1), (2, 1)),
    ((0, 2), (1, 2), (2, 2)),
    ((0, 0), (1, 1), (2, 2)),
    ((0, 2), (1, 1), (2, 0)),
)

FONT_NAMES = "segoeui, arial, verdana, dejavusans, tahoma, sans"
FONT_BOLD = "seguiblack, segoe ui black, arial black, segoeui, arial, sans"


# ------------------------------------------------------------------ logic
def new_board() -> list[list[str]]:
    """Tạo bàn cờ 3x3 trống (mảng 2 chiều)."""
    return [[EMPTY for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]


def check_win(board: list[list[str]], player: str) -> tuple[tuple[int, int], ...] | None:
    """Trả về 3 ô thắng của `player`, hoặc None nếu chưa thắng."""
    for line in WIN_LINES:
        if all(board[r][c] == player for r, c in line):
            return line
    return None


def is_full(board: list[list[str]]) -> bool:
    """Bàn cờ đã đầy chưa."""
    return all(cell != EMPTY for row in board for cell in row)


def cell_rect(row: int, col: int) -> pygame.Rect:
    """Hình chữ nhật của ô (row, col) trên cửa sổ."""
    return pygame.Rect(BOARD_X + col * CELL, BOARD_Y + row * CELL, CELL, CELL)


def cell_center(row: int, col: int) -> tuple[int, int]:
    """Tâm hình vuông ô (row, col) theo toạ độ cửa sổ."""
    return cell_rect(row, col).center


def cell_at(pos: tuple[int, int]) -> tuple[int, int] | None:
    """Đổi toạ độ chuột -> (row, col), None nếu click ngoài bàn cờ."""
    x, y = pos
    col, row = (x - BOARD_X) // CELL, (y - BOARD_Y) // CELL
    if 0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE:
        return int(row), int(col)
    return None


# ------------------------------------------------------------------ vẽ
def draw_mark(surface: pygame.Surface, center: tuple[int, int], mark: str,
              color: tuple[int, int, int], radius: int, width: int = LINE_W) -> None:
    """Vẽ X (2 nét chéo) hoặc O (hình tròn rỗng) bằng primitive hình học."""
    cx, cy = center
    if mark == X:
        pygame.draw.line(surface, color, (cx - radius, cy - radius),
                         (cx + radius, cy + radius), width)
        pygame.draw.line(surface, color, (cx - radius, cy + radius),
                         (cx + radius, cy - radius), width)
    else:
        pygame.draw.circle(surface, color, (cx, cy), radius, width)


def draw_win_line(surface: pygame.Surface, line: tuple[tuple[int, int], ...]) -> None:
    """Tô sáng vạch đi qua 3 ô thắng (nằm giữa, dày hơn)."""
    (r0, c0), (r1, c1) = line[0], line[2]
    pygame.draw.line(surface, WIN_COLOR, cell_center(r0, c0), cell_center(r1, c1), LINE_W + 6)


# --------------------------------------------------------------- vòng lặp
class TicTacToe:
    """Toàn bộ trạng thái + logic + render của một ván cờ."""

    def __init__(self) -> None:
        pygame.init()
        pygame.display.set_caption("Bài 8 - Tic-Tac-Toe 3x3 (pygame)")
        self.screen = pygame.display.set_mode((WINDOW_W, WINDOW_H))
        self.fonts = {
            "status": self._font(36, FONT_BOLD),
            "panel": self._font(24, FONT_BOLD),
            "score": self._font(28, FONT_BOLD),
            "button": self._font(20, FONT_BOLD),
            "hint": self._font(18),
        }
        self.btn_play = pygame.Rect(BTN_X, BTN_Y, BTN_W, BTN_H)
        self.btn_clear = pygame.Rect(BTN_X + BTN_W + BTN_GAP, BTN_Y, BTN2_W, BTN_H)
        self.reset_scores()

    @staticmethod
    def _font(size: int, names: str = FONT_NAMES) -> pygame.font.Font:
        """Font hệ thống (hỗ trợ tiếng Việt); thiếu thì lùi về font mặc định."""
        font = pygame.font.SysFont(names, size, bold=True)
        return font or pygame.font.Font(None, size)

    # ------------------------------------------------ trạng thái
    def reset_scores(self) -> None:
        self.wins = {X: 0, O: 0}
        self.draws = 0
        self.reset()

    def reset(self) -> None:
        self.board = new_board()
        self.player = X
        self.over = False
        self.winner = EMPTY
        self.win_line: tuple[tuple[int, int], ...] | None = None
        self.hover: tuple[int, int] | None = None
        self.hover_button: pygame.Rect | None = None
        self.moves = 0

    def status(self) -> str:
        if self.winner:
            return f"{self.winner} THẮNG!"
        if self.over:
            return "HÒA RỒI!"
        return f"LƯỢT: {self.player}"

    # ------------------------------------------------ sự kiện
    def handle_event(self, event: pygame.event.Event) -> bool:
        """Xử lý 1 sự kiện. Trả về False nếu nên thoát cửa sổ."""
        if event.type == pygame.QUIT:
            return False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_r:  # K_r nhận cả khi bấm R viết hoa
                self.reset()
            elif event.key in (pygame.K_ESCAPE, pygame.K_q):
                return False
        elif event.type == pygame.MOUSEMOTION:
            self.hover_button = self._button_at(event.pos)
            self.hover = None
            if self.hover_button is None and not self.over:
                self.hover = cell_at(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            button = self._button_at(event.pos)
            if button is not None:
                self.reset_scores() if button == self.btn_clear else self.reset()
                return True
            self.play(cell_at(event.pos))
        return True

    def _button_at(self, pos: tuple[int, int]) -> pygame.Rect | None:
        for button in (self.btn_play, self.btn_clear):
            if button.collidepoint(pos):
                return button
        return None

    def play(self, cell: tuple[int, int] | None) -> None:
        """Đặt quy cho ô đang chọn rồi kiểm tra thắng / hoà, cộng điểm."""
        if self.over or cell is None:
            return
        row, col = cell
        if self.board[row][col] != EMPTY:
            return
        self.board[row][col] = self.player
        self.moves += 1

        line = check_win(self.board, self.player)
        if line is not None:
            self.over, self.winner, self.win_line = True, self.player, line
            self.wins[self.player] += 1
        elif is_full(self.board):
            self.over = True
            self.draws += 1
        else:
            self.player = O if self.player == X else X

    # ------------------------------------------------ render
    def _text(self, key: str, content: str, color: tuple[int, int, int],
              center: tuple[int, int]) -> None:
        surface = self.fonts[key].render(content, True, color)
        self.screen.blit(surface, surface.get_rect(center=center))

    def _text_left(self, key: str, content: str, color: tuple[int, int, int],
                   pos: tuple[int, int]) -> None:
        surface = self.fonts[key].render(content, True, color)
        self.screen.blit(surface, surface.get_rect(midleft=pos))

    def _panel(self, mark: str, rect: pygame.Rect, is_active: bool) -> None:
        pygame.draw.rect(self.screen, CARD_ACTIVE if is_active else CARD_COLOR, rect)
        pygame.draw.rect(self.screen, INK, rect, width=3 if is_active else 2)
        mark_color = BG_COLOR if is_active else PLAYER_COLOR[mark]
        draw_mark(self.screen, (rect.x + 48, rect.centery), mark, mark_color, 26, 6)
        self._text_left("panel", PLAYER_LABEL[mark], BG_COLOR if is_active else INK,
                     (rect.x + 92, rect.y + 30))
        self._text_left("score", f"{self.wins[mark]} THẮNG", mark_color if is_active else DIM_TEXT,
                     (rect.x + 92, rect.y + 68))

    def _button(self, rect: pygame.Rect, label: str) -> None:
        is_hover = rect == self.hover_button
        shadow = rect.move(4, 4)  # đổ bông như trong mau
        pygame.draw.rect(self.screen, SHADOW_COLOR, shadow)
        pygame.draw.rect(self.screen, BTN_HOVER if is_hover else BTN_COLOR, rect)
        pygame.draw.rect(self.screen, INK, rect, width=3)
        self._text("button", label, BTN_TEXT, rect.center)

    def _screen_frame(self) -> None:
        """Khung trắng giống khung cửa sổ trong mẫu: viền đen + thanh 3 chấm."""
        pygame.draw.rect(self.screen, SCREEN_COLOR, SCREEN)
        pygame.draw.rect(self.screen, INK, SCREEN, width=3)
        pygame.draw.line(self.screen, INK, (SCREEN.x, SCREEN.y + TITLE_H),
                         (SCREEN.right, SCREEN.y + TITLE_H), 3)
        cy = SCREEN.y + TITLE_H // 2
        for index, color in enumerate(((241, 233, 76), (255, 255, 255), (176, 188, 0))):
            pygame.draw.circle(self.screen, color, (SCREEN.x + 18 + index * 20, cy), 6)
            pygame.draw.circle(self.screen, INK, (SCREEN.x + 18 + index * 20, cy), 6, 2)

    def draw(self) -> None:
        self.screen.fill(BG_COLOR)
        self._screen_frame()

        self._panel(X, pygame.Rect(CARD_X_LEFT, CARD_Y, CARD_W, CARD_H),
                    self.player == X and not self.over)
        self._panel(O, pygame.Rect(CARD_X_RIGHT, CARD_Y, CARD_W, CARD_H),
                    self.player == O and not self.over)

        if self.hover and not self.over and self.board[self.hover[0]][self.hover[1]] == EMPTY:
            pygame.draw.rect(self.screen, HOVER_COLOR, cell_rect(*self.hover))

        for i in range(1, BOARD_SIZE):  # 4 vạch ngang + dọc của lưới
            offset = BOARD_X + i * CELL
            pygame.draw.line(self.screen, GRID_COLOR, (BOARD_X, BOARD_Y + i * CELL),
                             (BOARD_X + BOARD_PX, BOARD_Y + i * CELL), LINE_W)
            pygame.draw.line(self.screen, GRID_COLOR, (offset, BOARD_Y),
                             (offset, BOARD_Y + BOARD_PX), LINE_W)

        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                mark = self.board[row][col]
                if mark != EMPTY:
                    draw_mark(self.screen, cell_center(row, col), mark, PLAYER_COLOR[mark],
                              CELL // 2 - 26)

        if self.win_line:
            draw_win_line(self.screen, self.win_line)

        self._text("status", self.status(), INK, (WINDOW_W // 2, STATUS_Y))
        self._text("hint", f"HÒA {self.draws}   •   R: CHƠI LẠI   •   ESC: THOÁT",
                   DIM_TEXT, (WINDOW_W // 2, STATUS_Y + 48))
        self._button(self.btn_play, "CHƠI LẠI")
        self._button(self.btn_clear, "XÓA ĐIỂM")
        pygame.display.flip()


def main() -> int:
    game = TicTacToe()
    clock = pygame.time.Clock()
    running = True
    while running:
        for event in pygame.event.get():
            running = game.handle_event(event)
        game.draw()
        clock.tick(60)
    pygame.quit()
    return 0


if __name__ == "__main__":
    sys.exit(main())