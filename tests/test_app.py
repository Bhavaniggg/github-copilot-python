import pytest

from starter import app as sudoku_app
from starter import sudoku_logic


def test_home_route_returns_200():
    response = sudoku_app.app.test_client().get("/")

    assert response.status_code == 200


def test_sudoku_board_is_9x9():
    board = sudoku_logic.create_empty_board()

    assert len(board) == 9
    assert all(len(row) == 9 for row in board)


def test_unique_solution_count():
    puzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ]

    assert sudoku_logic.count_solutions(puzzle) == 1


def test_solution_count_stops_at_limit():
    assert sudoku_logic.count_solutions(sudoku_logic.create_empty_board(), limit=2) == 2


@pytest.mark.parametrize(
    ("difficulty", "expected_clues"),
    [("Easy", 40), ("Medium", 30), ("Hard", 22)],
)
def test_generated_puzzle_has_unique_solution_and_expected_clues(
    difficulty, expected_clues
):
    puzzle, solution = sudoku_logic.generate_puzzle(difficulty)

    assert sum(value != 0 for row in puzzle for value in row) == expected_clues
    assert sudoku_logic.count_solutions(puzzle) == 1
    assert all(
        puzzle[row][col] in (0, solution[row][col])
        for row in range(9)
        for col in range(9)
    )


def test_board_validation(monkeypatch):
    solution = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]
    board = [row.copy() for row in solution]
    board[0][0] = 0
    monkeypatch.setitem(sudoku_app.CURRENT, "solution", solution)

    response = sudoku_app.app.test_client().post("/check", json={"board": board})

    assert response.status_code == 200
    assert response.get_json() == {"incorrect": [[0, 0]]}


def test_hint_returns_solution_for_an_editable_cell(monkeypatch):
    solution = [[1 for _ in range(9)] for _ in range(9)]
    puzzle = [[0 for _ in range(9)] for _ in range(9)]
    monkeypatch.setitem(sudoku_app.CURRENT, "puzzle", puzzle)
    monkeypatch.setitem(sudoku_app.CURRENT, "solution", solution)

    response = sudoku_app.app.test_client().post(
        "/hint", json={"board": sudoku_logic.create_empty_board()}
    )

    assert response.status_code == 200
    assert response.get_json() == {"row": 0, "col": 0, "value": 1}