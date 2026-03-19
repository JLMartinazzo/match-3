const board = document.getElementById("board");
const scoreDisplay = document.getElementById("score");
const canvas = document.getElementById("scoreChart");
const ctx = canvas.getContext("2d");

const width = 8;
const colors = ["red", "blue", "green", "yellow", "purple"];

let tiles = [];
let score = 0;
let scoreHistory = [];

// swipe
let startX, startY;
let selectedIndex = null;

// criar tabuleiro
function createBoard() {
  for (let i = 0; i < width * width; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");

    const color = colors[Math.floor(Math.random() * colors.length)];
    tile.classList.add(color);

    tile.setAttribute("data-id", i);

    // TOUCH EVENTS
    tile.addEventListener("touchstart", touchStart);
    tile.addEventListener("touchend", touchEnd);

    // fallback desktop
    tile.addEventListener("mousedown", touchStart);
    tile.addEventListener("mouseup", touchEnd);

    board.appendChild(tile);
    tiles.push(tile);
  }
}

createBoard();

// 📱 swipe start
function touchStart(e) {
  selectedIndex = parseInt(this.dataset.id);

  startX = e.touches ? e.touches[0].clientX : e.clientX;
  startY = e.touches ? e.touches[0].clientY : e.clientY;
}

// 📱 swipe end
function touchEnd(e) {
  let endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
  let endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

  let dx = endX - startX;
  let dy = endY - startY;

  let targetIndex = null;

  if (Math.abs(dx) > Math.abs(dy)) {
    targetIndex = dx > 0 ? selectedIndex + 1 : selectedIndex - 1;
  } else {
    targetIndex = dy > 0 ? selectedIndex + width : selectedIndex - width;
  }

  if (isValidMove(selectedIndex, targetIndex)) {
    swapTiles(selectedIndex, targetIndex);

    if (!checkAnyMatch()) {
      setTimeout(() => swapTiles(selectedIndex, targetIndex), 200);
    }
  }
}

// validar movimento
function isValidMove(a, b) {
  return (
    b >= 0 &&
    b < width * width &&
    (b === a - 1 || b === a + 1 || b === a - width || b === a + width)
  );
}

// troca
function swapTiles(i1, i2) {
  let t1 = tiles[i1];
  let t2 = tiles[i2];

  let c1 = t1.classList[1];
  let c2 = t2.classList[1];

  t1.classList.replace(c1, c2);
  t2.classList.replace(c2, c1);
}

// 🔥 MATCH DINÂMICO (3 OU MAIS)
function findMatches() {
  let matches = [];

  // horizontal correto
for (let row = 0; row < width; row++) {
  let match = [];
  let lastColor = null;

  for (let col = 0; col < width; col++) {
    let index = row * width + col;
    let color = tiles[index].classList[1];

    if (color === lastColor) {
      match.push(index);
    } else {
      if (match.length >= 3) matches.push([...match]);
      match = [index];
      lastColor = color;
    }
  }

  if (match.length >= 3) matches.push(match);
}

  // vertical
  for (let i = 0; i < width * width; i++) {
    let match = [i];
    let color = tiles[i].classList[1];

    for (let j = i + width; j < width * width; j += width) {
      if (tiles[j].classList[1] === color) {
        match.push(j);
      } else break;
    }

    if (match.length >= 3) matches.push(match);
  }

  return matches;
}

// aplicar matches
function handleMatches() {
  let matches = findMatches();

  if (matches.length === 0) return false;

  let uniqueTiles = new Set();

  matches.forEach(match => {
    match.forEach(i => uniqueTiles.add(i));
  });

  // efeito visual
  uniqueTiles.forEach(i => {
    let tile = tiles[i];
    tile.classList.add("match");
  });

  // remover depois
  setTimeout(() => {
    uniqueTiles.forEach(i => {
      let tile = tiles[i];
      let color = tile.classList[1];
      tile.classList.remove(color);
      tile.classList.remove("match");
    });
  }, 150);

  // score apenas uma vez por ciclo
  score += uniqueTiles.size * 10;
  updateScore();

  return true;
}

// ⬇️ queda com animação
function moveDown() {
  for (let col = 0; col < width; col++) {

    let column = [];

    // pega todas cores existentes na coluna
    for (let row = 0; row < width; row++) {
      let index = row * width + col;
      let color = tiles[index].classList[1];

      if (color) column.push(color);
    }

    // preenche de baixo pra cima
    for (let row = width - 1; row >= 0; row--) {
      let index = row * width + col;

      let tile = tiles[index];
      let oldColor = tile.classList[1];

      tile.className = "tile";

      if (column.length > 0) {
        let newColor = column.pop();
        tile.classList.add(newColor);
        tile.classList.add("falling");
      } else {
        let newColor = colors[Math.floor(Math.random() * colors.length)];
        tile.classList.add(newColor);
      }
    }
  }

  // remove animação depois
  setTimeout(() => {
    tiles.forEach(t => t.classList.remove("falling"));
  }, 150);
}

// score
function updateScore() {
  scoreDisplay.innerText = "Score: " + score;

  scoreHistory.push(score);
  drawChart();
}

// 📊 gráfico simples
function drawChart() {
  canvas.width = 300;
  canvas.height = 100;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();

  scoreHistory.forEach((s, i) => {
    let x = (i / scoreHistory.length) * canvas.width;
    let y = canvas.height - s * 0.05;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

// loop
function gameLoop() {
  let matched = handleMatches();

  if (matched) {
    setTimeout(() => {
      moveDown();
    }, 150);
  }
}

setInterval(gameLoop, 250);

setInterval(gameLoop, 200);