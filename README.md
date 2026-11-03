# Refactor a Sudoku Game written in Python Flask

Use this simple Sudoku game as a starting point to practice your skills with GitHub Copilot. The goal is to refactor the code to use modern technologies, while also adding new features and improving the overall user experience.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Dependencies

```
- Modern web browser (Chrome, Firefox, Edge, etc.)
- Python 3
```

### Installation

1. Fork this repository to your GitHub account. (You can use the "Fork" button on the top right corner of the repository page.)

2. Clone your forked repository to your local machine.

3. Open a terminal window and navigate to the "github-copilot-python/starter" directory.

4. Create a Python virtual environment and activate it (optional but highly recommended).

```bash
python3 -m venv .venv
source .venv/bin/activate
```

5. Install required Python packages.

```bash
pip install -r requirements.txt
```

6. Run the Flask app.

```bash
python app.py
```

7. Open http://127.0.0.1:5000 in your browser.

## Project Instructions

Use GitHub Copilot to refactor the code for this game to add more advanced features. The goal is to create a more modern and maintainable codebase and add additional functionality to the final product. You can use any combination of code completion and chat features, like Ask, Edit, or Agent modes.

- Errors should be handled gracefully with appropriate messages to the user.
- Implement a Sudoku board generator that creates a valid Sudoku puzzle with a unique solution.
- Add a timer to track how long it takes to solve the puzzle.
- Implement a solution checker that verifies if the user's solution is correct using event delegation.
- Add a difficulty selector to allow users to choose between easy, medium, and hard puzzles.
- Add a hint feature that provides clues for the user that are noted with unique colors.
- Add a check puzzle button that checks the current state of the board against the solution.
- User should get immediate feedback on their input, such as highlighting invalid entries.
- Top 10 scores should be saved in local storage and displayed on the page with the user's name, time taken, hints used, and difficulty level.
- The game should be responsive and work well on both desktop and mobile devices.
- UI colors should be visually appealing and accessible.
- Completed and correct puzzles should display a congratulatory message with the time taken and hints used and ask for the user's name for Top 10 times.


---
## My Implementation (Added for Submission)

### How to Run App
cd starter
python app.py
Open http://127.0.0.1:5000

### How to Run Tests (Required)
.\.venv\Scripts\python.exe -m pytest tests/test_app.py -v
OR
.\.venv\Scripts\python.exe -m pytest test_app.py -v

Result: 8 passed in 0.29s
Screenshot: Screenshots/initial_tests.png

### Copilot Prompts Used (3 Prompts)

**Prompt 1 - Test Setup**
Set up pytest testing framework and write comprehensive tests for Sudoku game including API endpoints, puzzle generation, validation logic
- Screenshot: Screenshots/copilot_test_setup.png

**Prompt 2 - Unique Solution**
Refactor Sudoku to ensure puzzle has only one unique solution. Create function count_solutions(board, limit=2) using backtracking
- Screenshot: Screenshots/copilot_unique_solution.png - 30 steps completed

**Prompt 3 - Game Features & Styling**
Add game features: Timer, Hint, Check, Top 10 Fastest Times leaderboard using localStorage, dark mode toggle, style grid with alternating 3x3 colors, responsive layout
- Screenshots: Screenshots/copilot_top10_localstorage.png and Screenshots/copilot_styling_grid.png

### Features Completed from Project Instructions
- ✅ Unique solution generator
- ✅ Timer
- ✅ Solution checker with event delegation
- ✅ Difficulty selector (Easy/Medium/Hard)
- ✅ Hint with unique colors + Check Puzzle
- ✅ Immediate feedback for invalid entries
- ✅ Top 10 scores in localStorage with name/time/hints/difficulty
- ✅ Responsive + accessible colors + congratulatory message

### Screenshots Folder
All 5 required screenshots saved in Screenshots/

## Running Tests

Install dependencies:

pip install -r starter/requirements.txt

Run automated tests:

python -m pytest -v

## Testing

The project uses pytest for automated testing.

Run tests using:

python -m pytest -v

Latest test result: 9 tests passed.