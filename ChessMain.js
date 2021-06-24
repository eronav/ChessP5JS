// GUI things

let WIDTH;
let HEIGHT;
let DIMENSION; // board is DIMENSIONxDIMENSION
let SQ_SIZE;
let IMAGES = {};
let gs;

let sqSelected = []; // row, col
let playerClicks = []; // players clicks - up to 2 elements

var validMoves = [];

var gameOver = false;

var boardColors = [];
var highlightColors = [];

function preload() {
  // put all the imgs in images
  var pieces = ["K", "Q", "R", "N", "B", "p"];
  for (var i = 0; i < 2; i++) {
    var color = i == 0 ? "w" : "b";
    for (var j = 0; j < pieces.length; j++) {
      IMAGES[color + pieces[j]] = loadImage("PieceImgs/" + color + pieces[j] + ".png");
    }
  }
}

function setup() {
  createCanvas(800, 800);
  WIDTH = width;
  HEIGHT = height;
  gs = new GameState();
  DIMENSION = gs.board.length;
  SQ_SIZE = HEIGHT / DIMENSION;
  validMoves = gs.getValidMoves();
  boardColors = [color('#FFD3AC'), color('#C86439')];
  highlightColors = [color('#FFCC3396'), color('#006FFF96')];
}

function drawBoard() {
  // Draw Squares
  for (var i = 0; i < DIMENSION; i++) { // rows
    for (var j = 0; j < DIMENSION; j++) { // cols
      var c = boardColors[(i + j) % 2];
      noStroke();
      fill(c);
      rect(SQ_SIZE * j, SQ_SIZE * i, SQ_SIZE, SQ_SIZE);
    }
  }
}
function highlightSquares(gs, validMoves, sqSelected) {
  if (sqSelected.length != 0) {
    var r = sqSelected[0];
    var c = sqSelected[1];
    if (gs.board[r][c].slice(0, 1) == (gs.whiteToMove ? "w" : "b")) { // making sure that the square selected is the cur players piece
      // highlight selected square
      fill(highlightColors[0]);
      rect(SQ_SIZE * c, SQ_SIZE * r, SQ_SIZE, SQ_SIZE);

      // highlight that squares legal moves
      fill(highlightColors[1]);
      for (var move of validMoves) {
        if (move.startRow == r && move.startCol == c) {
          rect(SQ_SIZE * move.endCol, SQ_SIZE * move.endRow, SQ_SIZE, SQ_SIZE);
        }
      }
    }
  }
}
function drawPieces(board) {
  for (var i = 0; i < DIMENSION; i++) { // rows
    for (var j = 0; j < DIMENSION; j++) { // cols
      var spot = board[i][j];
      if (spot != "--") { // is spot has a piece
        // draw the image
        image(IMAGES[spot], SQ_SIZE * j, SQ_SIZE * i, SQ_SIZE, SQ_SIZE);
      }
    }
  }
}
function drawGameState(gs) {
  drawBoard();
  highlightSquares(gs, validMoves, sqSelected);
  drawPieces(gs.board);
}

function mouseClicked() {
  if (gameOver) {
    return;
  }
  var row = floor(mouseY / SQ_SIZE);
  var col = floor(mouseX / SQ_SIZE);
  if (row < 0 || row > DIMENSION - 1 || col < 0 || col > DIMENSION - 1) {
    return;
  }
  var moveMade = false;

  if (sqSelected[0] == row && sqSelected[1] == col) {
    sqSelected = [];
    playerClicks = [];
  } else {
    sqSelected = [row, col];
    playerClicks.push(sqSelected);
  }
  if (playerClicks.length == 2) {
    // after second click meaning we should make a move
    var move = new Move(playerClicks[0], playerClicks[1], gs.board);
    for (var m of validMoves) {
      if (m.isMoveEqual(move)) {
        // it is a valid move
        gs.makeMove(m);
        moveMade = true;
        sqSelected = [];
        playerClicks = [];
        console.log(move.getChessNotation());
      }
    }
    if (!moveMade) {
      playerClicks = [sqSelected];
    }
  }
  if (moveMade) {
    validMoves = gs.getValidMoves();
    if (validMoves.length == 0) {
      gameOver = true;
    }
  }
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    gs.undoMove();
    validMoves = gs.getValidMoves();
  }
  if (key == 'r') {
    restartGame();
  }
}

function restartGame() {
  sqSelected = [];
  playerClicks = [];
  gs.board = gs.control;
  gs.whiteToMove = true;
  validMoves = gs.getValidMoves();
  gameOver = false;
}

function draw() {
  background(0, 0, 255);
  if (gameOver) {
    console.log("CHECKMATE");
    noLoop();
  }
  drawGameState(gs);
}
