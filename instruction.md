# GitHub Copilot Instructions

## Project Overview
This project is a Sudoku game developed using
Python Flask, HTML, CSS, and JavaScript.

## Project Structure
- starter/app.py: Flask application and routes.
- starter/sudoku_logic.py: Sudoku generation,
  validation, and solving.
- starter/templates/index.html: Game interface.
- starter/static/styles.css: Application styling.
- starter/static/main.js: Frontend game functionality.
- tests/: Automated tests.

## Coding Guidelines
- Write clean, readable, modular Python code.
- Use meaningful variable and function names.
- Follow PEP 8 standards.
- Keep Sudoku logic separate from Flask routes.
- Use reusable JavaScript functions.
- Add comments for complex logic.
- Handle errors properly.

## Sudoku Requirements
- Generate valid Sudoku puzzles.
- Ensure each puzzle has exactly one solution.
- Support Easy, Medium, and Hard difficulty levels.
- Lock prefilled cells.
- Provide Hint and Check functionality.
- Display feedback for invalid entries.
- Display a congratulatory message when solved.

## Additional Features
- Include a timer.
- Maintain a Top 10 leaderboard using localStorage.
- Store player name, time, difficulty, and hints used.
- Support dark mode.
- Make the interface responsive.
- Use alternating colors for 3x3 sections.

## Testing Guidelines
- Use pytest for Python tests.
- Run tests after major modifications.
- Preserve existing functionality.
- Add tests for new functionality.

## Responsible AI Usage
- Review generated code before accepting suggestions.
- Reject suggestions that introduce unnecessary complexity.
- Explain important design decisions.
- Prioritize correctness and maintainability.