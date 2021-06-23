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
}

//#region board GUI
function drawBoard() {
  // Draw Squares
  for (var i = 0; i < DIMENSION; i++) { // rows
    for (var j = 0; j < DIMENSION; j++) { // cols
      var c = (i + j) % 2 == 0 ? color('#FFD3AC') : color('#C86439');
      noStroke();
      fill(c);
      rect(SQ_SIZE * j, SQ_SIZE * i, SQ_SIZE, SQ_SIZE);
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
function drawGameState(board) {
  drawBoard();
  drawPieces(board);
}
//#endregion

function mouseClicked() {
  var row = floor(mouseY / SQ_SIZE);
  var col = floor(mouseX / SQ_SIZE);
  if (row < 0 || row > DIMENSION - 1 || col < 0 || col > DIMENSION - 1) {
    return;
  }
  validMoves = gs.getValidMoves();
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
        gs.makeMove(move);
        moveMade = true;
        console.log(move.getChessNotation());
      }
    }
    sqSelected = [];
    playerClicks = [];
  }
  if (moveMade) {
    validMoves = gs.getValidMoves();
  }
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    gs.undoMove();
    validMoves = gs.getValidMoves();
  }
}

function draw() {
  background(0, 0, 255);
  drawGameState(gs.board);
}
