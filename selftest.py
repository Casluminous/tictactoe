"""Tự kiểm tra logic + render khung hình headless (SDL_VIDEODRIVER=dummy).

Chạy:  python selftest.py
Sinh ảnh minh hoạ trong docs/img/ để nhúng vào báo cáo Word.
"""

from __future__ import annotations

import os
import pathlib

os.environ["SDL_VIDEODRIVER"] = "dummy"  # không mở cửa sổ thật

import pygame  # noqa: E402  (phải set env trước khi import)

import tictactoe as ttt  # noqa: E402

IMG_DIR = pathlib.Path(__file__).parent / "docs" / "img"


def make_event(pos: tuple[int, int]) -> pygame.event.Event:
    return pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=pos)


def click_cell(game: ttt.TicTacToe, row: int, col: int) -> None:
    game.play(ttt.cell_at(ttt.cell_center(row, col)))


def check_logic() -> None:
    b = ttt.new_board()
    assert all(c == ttt.EMPTY for row in b for c in row) and len(b) == 3

    assert ttt.check_win(b, ttt.X) is None and not ttt.is_full(b)
    assert ttt.cell_at((0, 0)) is None and ttt.cell_at((10, 10)) is None
    assert ttt.cell_at(ttt.cell_center(2, 2)) == (2, 2)
    assert ttt.cell_center(0, 0) == (ttt.MARGIN + 75, ttt.MARGIN + 75)

    for line in ttt.WIN_LINES:  # mỗi đường thắng phải được nhận diện
        b = ttt.new_board()
        for r, c in line:
            b[r][c] = ttt.X
        assert ttt.check_win(b, ttt.X) == line
        assert ttt.check_win(b, ttt.O) is None

    b = ttt.new_board()
    for r, c in ((0, 0), (0, 1), (0, 2)):
        b[r][c] = ttt.X
    for r, c in ((1, 0), (2, 0), (1, 2), (2, 2)):
        b[r][c] = ttt.O
    assert ttt.check_win(b, ttt.X) == ((0, 0), (0, 1), (0, 2))
    assert ttt.check_win(b, ttt.O) is None

    draw = ttt.new_board()  # X O X / X O O / O X X -> đủ 9 ô mà không ai thắng
    for r, c, mark in ((0, 0, ttt.X), (0, 1, ttt.O), (0, 2, ttt.X),
                       (1, 0, ttt.X), (1, 1, ttt.O), (1, 2, ttt.O),
                       (2, 0, ttt.O), (2, 1, ttt.X), (2, 2, ttt.X)):
        draw[r][c] = mark
    assert ttt.is_full(draw) and ttt.check_win(draw, ttt.X) is None
    assert ttt.check_win(draw, ttt.O) is None
    assert not ttt.is_full([[ttt.X, ttt.EMPTY, ttt.O],
                            [ttt.EMPTY, ttt.X, ttt.EMPTY],
                            [ttt.O, ttt.EMPTY, ttt.EMPTY]])
    print("OK  logic: new_board / check_win / is_full / cell_at")


def check_flow() -> ttt.TicTacToe:
    game = ttt.TicTacToe()
    game.draw()

    click_cell(game, 0, 0)
    assert game.board[0][0] == ttt.X and game.player == ttt.O and game.moves == 1
    click_cell(game, 0, 0)  # ô đã có quân -> bỏ qua, không đổi lượt
    assert game.moves == 1 and game.player == ttt.O

    assert game.handle_event(pygame.event.Event(
        pygame.MOUSEBUTTONDOWN, button=1, pos=(-50, -50)))  # click ngoài bàn cờ
    assert game.moves == 1
    assert game.handle_event(make_event(ttt.cell_center(1, 1)))  # O đi giữa
    assert game.board[1][1] == ttt.O and game.player == ttt.X

    # X thắng hàng ngang trên cùng: X(0,0) O(1,1) X(0,1) O(2,1) X(0,2)
    click_cell(game, 0, 1)
    click_cell(game, 2, 1)
    click_cell(game, 0, 2)
    assert game.over and game.winner == ttt.X
    assert game.win_line == ((0, 0), (0, 1), (0, 2))
    assert game.status() == "X thang!"

    click_cell(game, 2, 2)  # đã xong ván, lượt đi bị chặn
    assert game.moves == 5

    game.draw()
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    pygame.image.save(game.screen, IMG_DIR / "ttt_win.png")

    # Nhấn R -> chơi lại từ đầu
    assert game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_r, mod=0, unicode="r"))
    assert game.board == ttt.new_board() and not game.over and game.moves == 0

    # Kịch bản hoà: X O X / X O O / O X X  -> đủ 9 nước, không ai thắng
    for r, c in ((0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0), (2, 2)):
        click_cell(game, r, c)
    assert game.over and game.winner == ttt.EMPTY and game.status() == "Hoa - ban vui!"

    # ESC -> thoát
    assert not game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_ESCAPE, mod=0, unicode="\x1b"))
    pygame.quit()
    print("OK  flow: click hop le / thang / hoa / khoa van / R / ESC")
    return game


def render_shots() -> None:
    """Khoảnh khắc đáng chú ý để chèn ảnh vào báo cáo."""
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    pygame.init()
    pygame.display.set_caption("preview")

    game = ttt.TicTacToe()
    game.draw()
    pygame.image.save(game.screen, IMG_DIR / "ttt_start.png")

    for r, c in ((0, 0), (1, 1), (2, 2), (2, 0)):  # 4 nước: đang đi giữa ván
        click_cell(game, r, c)
    game.hover = (0, 1)
    game.draw()
    pygame.image.save(game.screen, IMG_DIR / "ttt_mid.png")

    for r, c in ((0, 1), (1, 0), (0, 2)):  # X khoá ngang hàng trên cùng
        click_cell(game, r, c)
    assert game.over and game.winner == ttt.X
    game.draw()
    pygame.image.save(game.screen, IMG_DIR / "ttt_win.png")

    pygame.quit()
    print(f"OK  anh minh hoa -> {IMG_DIR}")


if __name__ == "__main__":
    check_logic()
    check_flow()
    render_shots()
    print("\nTat ca kiem tra deu PASS.")