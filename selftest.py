"""Kiểm thử logic + render khung hình headless (SDL_VIDEODRIVER=dummy).

Chạy:  python selftest.py
Sinh ảnh minh họa trong docs/img/ để nhúng vào báo cáo Word.
"""

from __future__ import annotations

import os
import pathlib

os.environ["SDL_VIDEODRIVER"] = "dummy"  # không mở cửa sổ thật

import pygame  # noqa: E402  (phải set env trước khi import)

import tictactoe as ttt  # noqa: E402

IMG_DIR = pathlib.Path(__file__).parent / "docs" / "img"


def click(game: ttt.TicTacToe, pos: tuple[int, int]) -> None:
    game.handle_event(pygame.event.Event(pygame.MOUSEBUTTONDOWN, button=1, pos=pos))


def move(game: ttt.TicTacToe, pos: tuple[int, int]) -> None:
    game.handle_event(pygame.event.Event(pygame.MOUSEMOTION, pos=pos, rel=(0, 0), buttons=(0, 0, 0)))


def play_moves(game: ttt.TicTacToe, cells: list[tuple[int, int]]) -> None:
    for row, col in cells:
        click(game, ttt.cell_center(row, col))


def check_logic() -> None:
    board = ttt.new_board()
    assert len(board) == ttt.BOARD_SIZE and all(c == ttt.EMPTY for row in board for c in row)
    assert ttt.check_win(board, ttt.X) is None and not ttt.is_full(board)
    assert ttt.cell_at((-10, -10)) is None
    assert ttt.cell_at((ttt.WINDOW_W, ttt.WINDOW_H)) is None
    assert ttt.cell_at(ttt.cell_center(2, 2)) == (2, 2)

    for line in ttt.WIN_LINES:  # mỗi đường thắng phải được nhận diện
        board = ttt.new_board()
        for row, col in line:
            board[row][col] = ttt.X
        assert ttt.check_win(board, ttt.X) == line
        assert ttt.check_win(board, ttt.O) is None

    draw = ttt.new_board()  # X O X / X O O / O X X -> đầy mà không ai thắng
    for row, col, mark in ((0, 0, ttt.X), (0, 1, ttt.O), (0, 2, ttt.X),
                           (1, 0, ttt.X), (1, 1, ttt.O), (1, 2, ttt.O),
                           (2, 0, ttt.O), (2, 1, ttt.X), (2, 2, ttt.X)):
        draw[row][col] = mark
    assert ttt.is_full(draw) and ttt.check_win(draw, ttt.X) is None
    assert ttt.check_win(draw, ttt.O) is None
    print("OK  logic: new_board / check_win / is_full / cell_at")


def check_flow() -> None:
    game = ttt.TicTacToe()
    game.draw()
    assert game.wins == {ttt.X: 0, ttt.O: 0} and game.draws == 0

    click(game, ttt.cell_center(0, 0))
    assert game.board[0][0] == ttt.X and game.player == ttt.O and game.moves == 1

    click(game, ttt.cell_center(0, 0))  # ô đã có quân -> bỏ qua, không đổi lượt
    assert game.moves == 1 and game.player == ttt.O
    click(game, (-30, -30))  # click ngoài bàn cờ
    assert game.moves == 1

    # Vòng 1: X thắng hàng ngang trên cùng
    play_moves(game, [(1, 1), (0, 1), (2, 1), (0, 2)])
    assert game.over and game.winner == ttt.X
    assert game.win_line == ((0, 0), (0, 1), (0, 2)) and game.status() == "X THẮNG!"
    assert game.wins[ttt.X] == 1 and game.wins[ttt.O] == 0 and game.draws == 0

    play_moves(game, [(2, 2)])  # ván đã xong -> khoá bàn
    assert game.moves == 5

    # Nút "Chơi lại": xoá bàn cờ nhưng giữ điểm
    click(game, game.btn_play.center)
    assert game.board == ttt.new_board() and not game.over and game.moves == 0
    assert game.wins[ttt.X] == 1, "bấm nút chơi lại không được xoá điểm"

    # Phím R cũng cho lại mà vẫn giữ điểm
    play_moves(game, [(0, 0), (1, 1), (0, 1), (2, 1), (0, 2)])
    assert game.wins[ttt.X] == 2
    game.handle_event(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_r, mod=0, unicode="r"))
    assert not game.over and game.wins[ttt.X] == 2

    # Click trúng nút thì không được coi là click vào ô bàn cờ
    click(game, game.btn_play.center)
    assert game.moves == 0 and game.board == ttt.new_board()

    # Vòng hòa: X O X / X O O / O X X
    play_moves(game, [(0, 0), (0, 1), (0, 2), (1, 1), (1, 0), (1, 2), (2, 1), (2, 0), (2, 2)])
    assert game.over and game.winner == ttt.EMPTY and game.status() == "HÒA RỒI!"
    assert game.draws == 1 and game.wins[ttt.X] == 2

    # Nút "Xóa điểm" xoá cả điểm lẫn ván đang chơi
    click(game, game.btn_clear.center)
    assert game.wins == {ttt.X: 0, ttt.O: 0} and game.draws == 0 and not game.over

    # ESC -> thoát
    assert not game.handle_event(
        pygame.event.Event(pygame.KEYDOWN, key=pygame.K_ESCAPE, mod=0, unicode="\x1b"))
    pygame.quit()
    print("OK  flow: click hợp lệ / thắng / hòa / khoá ván / nút bấm / R / xoá điểm / ESC")


def check_highlight() -> None:
    game = ttt.TicTacToe()
    game.draw()
    assert game.player == ttt.X
    move(game, game.btn_play.center)  # con trỏ trên nút -> không tô ô bàn cờ
    assert game.hover_button == game.btn_play and game.hover is None
    move(game, ttt.cell_center(1, 1))
    assert game.hover == (1, 1) and game.hover_button is None
    game.draw()
    pygame.quit()
    print("OK  hover: con trỏ trên nút / trên ô")


def render_shots() -> None:
    """Các khoảnh khắc đáng chú ý để chèn vào báo cáo."""
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    pygame.init()
    pygame.display.set_caption("preview")

    game = ttt.TicTacToe()
    game.draw()
    pygame.image.save(game.screen, IMG_DIR / "ttt_start.png")

    for row, col in ((0, 0), (1, 1), (2, 2), (2, 0)):  # giữa ván, chưa ai thắng
        click(game, ttt.cell_center(row, col))
    move(game, ttt.cell_center(0, 1))
    game.draw()
    pygame.image.save(game.screen, IMG_DIR / "ttt_mid.png")

    for row, col in ((0, 1), (1, 0), (0, 2)):  # X khoá hàng trên cùng
        click(game, ttt.cell_center(row, col))
    assert game.over and game.winner == ttt.X
    game.draw()
    pygame.image.save(game.screen, IMG_DIR / "ttt_win.png")

    click(game, game.btn_play.center)  # vòng 2: O thắng cột bên trái
    play_moves(game, [(0, 1), (0, 0), (0, 2), (1, 0), (1, 1), (2, 0)])
    assert game.winner == ttt.O, "O phải thắng ở vòng này"
    assert game.wins == {ttt.X: 1, ttt.O: 1}
    move(game, game.btn_play.center)  # con trỏ trên nút để thấy hiệu ứng hover
    game.draw()
    pygame.image.save(game.screen, IMG_DIR / "ttt_score.png")

    pygame.quit()
    print(f"OK  ảnh minh họa -> {IMG_DIR}")


if __name__ == "__main__":
    check_logic()
    check_flow()
    check_highlight()
    render_shots()
    print("\nTất cả kiểm tra đều PASS.")
