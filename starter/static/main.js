const SIZE = 9;
const LEADERBOARD_KEY = 'sudokuLeaderboard';
const THEME_KEY = 'sudokuTheme';
let currentPuzzle = [];
let activeDifficulty = 'Medium';
let timerStartedAt = null;
let timerInterval = null;
let elapsedSeconds = 0;
let gameFinished = false;

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    rowDiv.setAttribute('role', 'row');
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.setAttribute('role', 'gridcell');
      input.setAttribute('aria-label', `Row ${i + 1}, column ${j + 1}`);
      input.addEventListener('input', (e) => {
        const input = e.currentTarget;
        input.value = input.value.replace(/[^1-9]/g, '').slice(-1);
        input.classList.remove('incorrect');
        if (getBoard().every((row) => row.every((value) => value !== 0))) {
          checkSolution();
        }
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  currentPuzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = currentPuzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

function getBoard() {
  const inputs = document.querySelectorAll('.sudoku-cell');
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => {
      const value = inputs[row * SIZE + col].value;
      return value ? Number.parseInt(value, 10) : 0;
    })
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function renderTimer() {
  document.getElementById('timer').textContent = formatTime(elapsedSeconds);
}

function stopTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
  if (timerStartedAt !== null) {
    elapsedSeconds = Math.floor((Date.now() - timerStartedAt) / 1000);
    timerStartedAt = null;
  }
  renderTimer();
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  timerStartedAt = Date.now();
  renderTimer();
  timerInterval = window.setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - timerStartedAt) / 1000);
    renderTimer();
  }, 250);
}

async function newGame() {
  const button = document.getElementById('new-game');
  const message = document.getElementById('message');
  button.disabled = true;
  message.textContent = '';
  try {
    const requestedDifficulty = document.getElementById('difficulty').value;
    const res = await fetch(`/new?difficulty=${encodeURIComponent(requestedDifficulty)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not start a new puzzle.');
    currentPuzzle = data.puzzle;
    activeDifficulty = data.difficulty || requestedDifficulty;
    renderPuzzle(currentPuzzle);
    gameFinished = false;
    startTimer();
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function checkSolution() {
  if (!currentPuzzle.length || gameFinished) return;
  const message = document.getElementById('message');
  try {
    const res = await fetch('/check', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({board: getBoard()})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not check the puzzle.');

    const inputs = document.querySelectorAll('.sudoku-cell');
    inputs.forEach((input) => input.classList.remove('incorrect'));
    data.incorrect.forEach(([row, col]) => {
      inputs[row * SIZE + col].classList.add('incorrect');
    });
    if (data.incorrect.length === 0) {
      finishGame();
    } else {
      message.textContent = 'Incorrect entries are marked in red.';
    }
  } catch (error) {
    message.textContent = error.message;
  }
}

function finishGame() {
  if (gameFinished) return;
  gameFinished = true;
  stopTimer();
  document.getElementById('message').textContent = '';
  document.getElementById('completion-time').textContent = formatTime(elapsedSeconds);
  document.getElementById('score-save-status').textContent = '';
  document.getElementById('player-name').value = '';
  document.getElementById('completion-dialog').showModal();
  document.getElementById('player-name').focus();
}

async function requestHint() {
  if (!currentPuzzle.length || gameFinished) return;
  const hintButton = document.getElementById('hint');
  const message = document.getElementById('message');
  hintButton.disabled = true;
  try {
    const res = await fetch('/hint', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({board: getBoard()})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not get a hint.');
    if (data.complete) {
      await checkSolution();
      return;
    }

    const input = document.querySelectorAll('.sudoku-cell')[data.row * SIZE + data.col];
    input.value = data.value;
    input.disabled = true;
    input.classList.remove('incorrect');
    input.classList.add('hinted');
    message.textContent = 'One correct cell has been revealed.';
    if (getBoard().every((row) => row.every((value) => value !== 0))) {
      await checkSolution();
    }
  } catch (error) {
    message.textContent = error.message;
  } finally {
    hintButton.disabled = false;
  }
}

function readLeaderboard() {
  try {
    const scores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    if (!Array.isArray(scores)) return [];
    return scores
      .filter((score) => score && typeof score.name === 'string'
        && Number.isFinite(score.time) && score.time >= 0
        && typeof score.difficulty === 'string')
      .sort((left, right) => left.time - right.time)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function renderLeaderboard() {
  const scores = readLeaderboard();
  const body = document.getElementById('leaderboard-body');
  body.replaceChildren();
  document.getElementById('leaderboard-count').textContent = `${scores.length} / 10`;
  document.getElementById('leaderboard-empty').hidden = scores.length > 0;
  document.querySelector('.table-wrap').hidden = scores.length === 0;

  scores.forEach((score, index) => {
    const row = document.createElement('tr');
    [String(index + 1), score.name, formatTime(score.time), score.difficulty].forEach((value, cellIndex) => {
      const cell = document.createElement(cellIndex === 0 ? 'th' : 'td');
      if (cellIndex === 0) cell.scope = 'row';
      cell.textContent = value;
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
}

function saveScore(event) {
  event.preventDefault();
  const name = document.getElementById('player-name').value.trim();
  if (!name) return;
  const scores = readLeaderboard();
  scores.push({name, time: elapsedSeconds, difficulty: activeDifficulty});
  scores.sort((left, right) => left.time - right.time);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores.slice(0, 10)));
    renderLeaderboard();
    document.getElementById('completion-dialog').close();
  } catch {
    document.getElementById('score-save-status').textContent = 'Your time could not be saved in this browser.';
  }
}

function setTheme(isDark) {
  document.body.dataset.theme = isDark ? 'dark' : 'light';
  const button = document.getElementById('theme-toggle');
  button.setAttribute('aria-pressed', String(isDark));
  button.textContent = isDark ? 'Light mode' : 'Dark mode';
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint').addEventListener('click', requestHint);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('completion-form').addEventListener('submit', saveScore);
  document.getElementById('new-after-complete').addEventListener('click', () => {
    document.getElementById('completion-dialog').close();
    newGame();
  });
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.body.dataset.theme !== 'dark';
    setTheme(isDark);
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Theme still changes for this page session when storage is unavailable.
    }
  });
  try {
    setTheme(localStorage.getItem(THEME_KEY) === 'dark');
  } catch {
    setTheme(false);
  }
  renderLeaderboard();
  newGame();
});