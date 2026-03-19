//pega o elemento do "quadro"
const board = document.getElementById("board");

//tamanho do quadro e cores dos elementos
const width = 8;
const colors = ["red", "blue", "green", "yellow", "purple"];

let tiles = [];

//cria o tabuleiro do jogo
function createBoard() {
  for (let i = 0; i < width * width; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");

    const color = colors[Math.floor(Math.random() * colors.length)];
    tile.classList.add(color);

    tile.setAttribute("draggable", true);
    tile.setAttribute("id", i);

    board.appendChild(tile);
    tiles.push(tile);
  }
}

createBoard();

let colorDragged;
let colorReplaced;
let tileIdDragged;
let tileIdReplaced;

tiles.forEach(tile => {
  tile.addEventListener("dragstart", dragStart);
  tile.addEventListener("dragover", e => e.preventDefault());
  tile.addEventListener("drop", dragDrop);
  tile.addEventListener("dragend", dragEnd);
});

function dragStart() {
  colorDragged = this.classList[1];
  tileIdDragged = parseInt(this.id);
}

function dragDrop() {
  colorReplaced = this.classList[1];
  tileIdReplaced = parseInt(this.id);

  this.classList.replace(colorReplaced, colorDragged);
  tiles[tileIdDragged].classList.replace(colorDragged, colorReplaced);
}

//verifica se o possui 3 elementos alinhados
function checkRowMatch() {
  for (let i = 0; i < 61; i++) {
    const row = [i, i+1, i+2];
    const color = tiles[i].classList[1];

    if (row.every(index => tiles[index].classList[1] === color)) {
      row.forEach(index => tiles[index].classList.remove(color));
    }
  }
}

//adiciona "gravidade" às peças
function moveDown() {
  for (let i = 0; i < 56; i++) {
    if (!tiles[i + width].classList[1]) {
      tiles[i + width].classList.add(tiles[i].classList[1]);
      tiles[i].classList.remove(tiles[i].classList[1]);
    }
  }
}

setInterval(() => {
  checkRowMatch();
  moveDown();
}, 200);