import copy
import random

SIZE = 9
EMPTY = 0
FULL_MASK = (1 << (SIZE + 1)) - 2
DIFFICULTY_CLUES = {
    'easy': 40,
    'medium': 30,
    'hard': 22,
}

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def _has_valid_values(values):
    filled_values = [value for value in values if value != EMPTY]
    return (
        len(filled_values) == len(set(filled_values))
        and all(1 <= value <= SIZE for value in filled_values)
    )

def is_valid_board(board):
    for index in range(SIZE):
        if not _has_valid_values(board[index]):
            return False
        if not _has_valid_values([board[row][index] for row in range(SIZE)]):
            return False

    for start_row in range(0, SIZE, 3):
        for start_col in range(0, SIZE, 3):
            box = [
                board[row][col]
                for row in range(start_row, start_row + 3)
                for col in range(start_col, start_col + 3)
            ]
            if not _has_valid_values(box):
                return False
    return True

def _count_solutions(board, empty_cells, limit, row_masks, col_masks, box_masks):
    if not empty_cells:
        return 1

    best_index = -1
    best_candidates = 0
    for index, (row, col) in enumerate(empty_cells):
        box_index = (row // 3) * 3 + col // 3
        candidates = FULL_MASK & ~(
            row_masks[row] | col_masks[col] | box_masks[box_index]
        )
        if not candidates:
            return 0
        if best_index == -1 or candidates.bit_count() < best_candidates.bit_count():
            best_index = index
            best_candidates = candidates
            if candidates.bit_count() == 1:
                break

    row, col = empty_cells.pop(best_index)
    box_index = (row // 3) * 3 + col // 3
    solutions = 0
    while best_candidates:
        bit = best_candidates & -best_candidates
        candidate = bit.bit_length() - 1
        board[row][col] = candidate
        row_masks[row] |= bit
        col_masks[col] |= bit
        box_masks[box_index] |= bit
        solutions += _count_solutions(
            board, empty_cells, limit - solutions,
            row_masks, col_masks, box_masks,
        )
        row_masks[row] ^= bit
        col_masks[col] ^= bit
        box_masks[box_index] ^= bit
        board[row][col] = EMPTY
        best_candidates &= best_candidates - 1
        if solutions >= limit:
            break
    empty_cells.insert(best_index, (row, col))
    return solutions

def count_solutions(board, limit=2):
    if limit <= 0 or not is_valid_board(board):
        return 0

    row_masks = [0] * SIZE
    col_masks = [0] * SIZE
    box_masks = [0] * SIZE
    empty_cells = []
    for row in range(SIZE):
        for col in range(SIZE):
            value = board[row][col]
            if value == EMPTY:
                empty_cells.append((row, col))
                continue
            bit = 1 << value
            box_index = (row // 3) * 3 + col // 3
            row_masks[row] |= bit
            col_masks[col] |= bit
            box_masks[box_index] |= bit

    return _count_solutions(
        board, empty_cells, limit, row_masks, col_masks, box_masks
    )

def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def remove_cells(board, clues):
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)
    remaining = SIZE * SIZE

    for row, col in positions:
        if remaining == clues:
            return True
        value = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(board) == 1:
            remaining -= 1
        else:
            board[row][col] = value

    return remaining == clues

def generate_puzzle(difficulty='Medium'):
    difficulty_key = str(difficulty).strip().lower()
    if difficulty_key not in DIFFICULTY_CLUES:
        raise ValueError(f'Unknown difficulty: {difficulty}')
    clues = DIFFICULTY_CLUES[difficulty_key]

    while True:
        solution = create_empty_board()
        fill_board(solution)
        puzzle = deep_copy(solution)
        if remove_cells(puzzle, clues):
            return puzzle, solution
