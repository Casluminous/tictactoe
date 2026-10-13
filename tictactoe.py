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
WINDOW_H = 760
BOARD_X = (WINDOW_W - BOARD_PX) // 2
BOARD_Y = 132
LINE_W = 6

PANEL_H = 104
PANEL_Y = 14
PANEL_W = 280

STATUS_Y = BOARD_Y + BOARD_PX + 26
BTN_Y = STATUS_Y + 84
BTN_H = 48
BTN_W = 200
BTN2_W = 150
BTN_GAP = 16
BTN_X = (WINDOW_W - (BTN_W + BTN_GAP + BTN2_W)) // 2

BG_COLOR = (247, 249, 252)
PANEL_COLOR = (233, 238, 245)
PANEL_ACTIVE = (214, 227, 244)
GRID_COLOR = (150, 163, 182)
HOVER_COLOR = (223, 232, 245)
WIN_COLOR = (22, 150, 92)
TEXT_COLOR = (28, 38, 54)
DIM_TEXT = (118, 130, 148)
EDGE_DIM = (186, 195, 209)

X_COLOR = (37, 99, 235)
O_COLOR = (217, 96, 16)

EMPTY = ""
X = "X"
O = "O"

PLAYER_LABEL = {X: "Người 1", O: "Người 2"}
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
            "status": self._font(44),
            "panel": self._font(26),
            "score": self._font(32),
            "button": self._font(30),
            "hint": self._font(22),
        }
        self.btn_play = pygame.Rect(BTN_X, BTN_Y, BTN_W, BTN_H)
        self.btn_clear = pygame.Rect(BTN_X + BTN_W + BTN_GAP, BTN_Y, BTN2_W, BTN_H)
        self.reset_scores()

    @staticmethod
    def _font(size: int) -> pygame.font.Font:
        """Font hệ thống (hỗ trợ tiếng Việt); thiếu thì lùi về font mặc định."""
        font = pygame.font.SysFont(FONT_NAMES, size)
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
            return f"{self.winner} thắng!"
        if self.over:
            return "Hòa rồi!"
        return f"Lượt: {self.player}"

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
        color = PLAYER_COLOR[mark]
        pygame.draw.rect(self.screen, PANEL_ACTIVE if is_active else PANEL_COLOR, rect)
        pygame.draw.rect(self.screen, color if is_active else EDGE_DIM, rect,
                         width=3 if is_active else 2)
        draw_mark(self.screen, (rect.x + 50, rect.centery), mark, color, 26, 5)
        self._text_left("panel", PLAYER_LABEL[mark], TEXT_COLOR if is_active else DIM_TEXT,
                     (rect.x + 96, rect.y + 30))
        self._text_left("score", f"{self.wins[mark]} thắng", color if is_active else DIM_TEXT,
                     (rect.x + 96, rect.y + 72))

    def _button(self, rect: pygame.Rect, label: str) -> None:
        is_hover = rect == self.hover_button
        pygame.draw.rect(self.screen, (222, 232, 246) if is_hover else (236, 241, 247), rect)
        pygame.draw.rect(self.screen, TEXT_COLOR if is_hover else EDGE_DIM, rect, width=2)
        self._text("button", label, TEXT_COLOR if is_hover else DIM_TEXT, rect.center)

    def draw(self) -> None:
        self.screen.fill(BG_COLOR)

        left = pygame.Rect(16, PANEL_Y, PANEL_W, PANEL_H)
        right = pygame.Rect(WINDOW_W - 16 - PANEL_W, PANEL_Y, PANEL_W, PANEL_H)
        self._panel(X, left, self.player == X and not self.over)
        self._panel(O, right, self.player == O and not self.over)

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

        self._text("status", self.status(),
                   WIN_COLOR if self.over else TEXT_COLOR, (WINDOW_W // 2, STATUS_Y))
        self._text("hint", f"Hòa: {self.draws}    •    R: chơi lại    •    ESC: thoát",
                   DIM_TEXT, (WINDOW_W // 2, STATUS_Y + 48))
        self._button(self.btn_play, "Chơi lại")
        self._button(self.btn_clear, "Xóa điểm")
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