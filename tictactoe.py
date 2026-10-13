"""Bài 8 - Cờ caro 3x3 (Tic-Tac-Toe) chạy bằng pygame, KHÔNG dùng file asset nào.

Mọi hình (lưới, chữ X, chữ O, vạch thắng, vùng hover) đều được vẽ bằng API
vector của pygame (pygame.draw.*), chữ dùng font mặc định đi kèn pygame
(pygame.font.Font(None, size)) nên không cần tải bất kỳ ảnh/ttf nào.

Chạy:
    python tictactoe.py
"""

from __future__ import annotations

import sys

import pygame

# ---------------------------------------------------------------- hằng số
BOARD_SIZE = 3
CELL = 150
MARGIN = 60
LINE_W = 6

BOARD_PX = BOARD_SIZE * CELL  # 450
WINDOW_W = BOARD_PX + MARGIN * 2
WINDOW_H = BOARD_PX + MARGIN * 2 + 90

BG_COLOR = (18, 24, 38)
GRID_COLOR = (86, 104, 138)
GRID_HILIGHT = (232, 240, 255)
HOVER_COLOR = (34, 44, 66)
HOVER_EDGE = (70, 96, 148)

X_COLOR = (94, 168, 255)
O_COLOR = (255, 158, 94)
WIN_COLOR = (126, 240, 168)
TEXT_COLOR = (226, 232, 240)
HINT_COLOR = (128, 140, 165)

EMPTY = ""
X = "X"
O = "O"

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


def cell_center(row: int, col: int) -> tuple[int, int]:
    """Tâm hình vuông ô (row, col) theo toạ độ cửa sổ."""
    return (
        MARGIN + col * CELL + CELL // 2,
        MARGIN + row * CELL + CELL // 2,
    )


def cell_at(pos: tuple[int, int]) -> tuple[int, int] | None:
    """Đổi toạ độ chuột -> (row, col), None nếu click ngoài bàn cờ."""
    x, y = pos
    col, row = (x - MARGIN) // CELL, (y - MARGIN) // CELL
    if 0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE:
        return int(row), int(col)
    return None


# ------------------------------------------------------------------ vẽ
def draw_mark(surface: pygame.Surface, row: int, col: int, mark: str,
              color: tuple[int, int, int], width: int = LINE_W) -> None:
    """Vẽ X (2 nét chéo) hoặc O (hình tròn rỗng) bằng primitive hình học."""
    cx, cy = cell_center(row, col)
    r = CELL // 2 - 26
    if mark == X:
        pygame.draw.line(surface, color, (cx - r, cy - r), (cx + r, cy + r), width)
        pygame.draw.line(surface, color, (cx - r, cy + r), (cx + r, cy - r), width)
    else:
        pygame.draw.circle(surface, color, (cx, cy), r, width)


def draw_win_line(surface: pygame.Surface, line: tuple[tuple[int, int], ...]) -> None:
    """Tô sáng vạch đi qua 3 ô thắng (nằm giữa, dày hơn)."""
    (r0, c0), (r1, c1) = line[0], line[2]
    pygame.draw.line(
        surface,
        WIN_COLOR,
        cell_center(r0, c0),
        cell_center(r1, c1),
        LINE_W + 6,
    )


# --------------------------------------------------------------- vòng lặp
class TicTacToe:
    """Toàn bộ trạng thái + logic + render của một ván cờ."""

    def __init__(self) -> None:
        pygame.init()
        pygame.display.set_caption("Bài 8 - Tic-Tac-Toe 3x3 (pygame)")
        self.screen = pygame.display.set_mode((WINDOW_W, WINDOW_H))
        self.font_big = pygame.font.Font(None, 46)
        self.font_small = pygame.font.Font(None, 26)
        self.reset()

    # ------------------------------------------------ trạng thái
    def reset(self) -> None:
        self.board = new_board()
        self.player = X
        self.over = False
        self.winner = EMPTY
        self.win_line: tuple[tuple[int, int], ...] | None = None
        self.hover: tuple[int, int] | None = None
        self.moves = 0

    def status(self) -> str:
        if self.winner:
            return f"{self.winner} thang!"
        if self.over:
            return "Hoa - ban vui!"
        return f"Luot: {self.player}"

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
            self.hover = cell_at(event.pos) if not self.over else None
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            self.play(cell_at(event.pos))
        return True

    def play(self, cell: tuple[int, int] | None) -> None:
        """Đặt quy cho ô đang chọn rồi kiểm tra thắng / hoà."""
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
        elif is_full(self.board):
            self.over = True
        else:
            self.player = O if self.player == X else X

    # ------------------------------------------------ render
    def draw(self) -> None:
        self.screen.fill(BG_COLOR)
        if self.hover and not self.over and self.board[self.hover[0]][self.hover[1]] == EMPTY:
            row, col = self.hover
            pygame.draw.rect(
                self.screen,
                HOVER_COLOR,
                pygame.Rect(MARGIN + col * CELL, MARGIN + row * CELL, CELL, CELL),
                border_radius=8,
            )

        for i in range(1, BOARD_SIZE):  # 4 vạch ngang + dọc của lưới
            offset = MARGIN + i * CELL
            pygame.draw.line(self.screen, GRID_COLOR, (MARGIN, offset),
                             (MARGIN + BOARD_PX, offset), LINE_W)
            pygame.draw.line(self.screen, GRID_COLOR, (offset, MARGIN),
                             (offset, MARGIN + BOARD_PX), LINE_W)

        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                mark = self.board[row][col]
                if mark != EMPTY:
                    draw_mark(self.screen, row, col, mark,
                              X_COLOR if mark == X else O_COLOR)

        if self.win_line:
            draw_win_line(self.screen, self.win_line)

        title = self.font_big.render(self.status(), True, WIN_COLOR if self.over else TEXT_COLOR)
        self.screen.blit(title, title.get_rect(
            centerx=WINDOW_W // 2, top=MARGIN + BOARD_PX + 14))
        hint = self.font_small.render("Click de dat X/O  -  R: choi lai  -  ESC: thoat", True, HINT_COLOR)
        self.screen.blit(hint, hint.get_rect(
            centerx=WINDOW_W // 2, top=MARGIN + BOARD_PX + 56))
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