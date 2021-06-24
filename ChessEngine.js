// data things

class GameState {
  constructor() {
    // board is an 8x8 2D array
    // each element has 2 characters: 1st - color("b", "w"), 2nd - type("K", "Q", "B", "N", "R", "p")
    // string for an empty space is "--"
    this.board = [
      ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
      ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
      ["--", "--", "--", "--", "--", "--", "--", "--"],
      ["--", "--", "--", "--", "--", "--", "--", "--"],
      ["--", "--", "--", "--", "--", "--", "--", "--"],
      ["--", "--", "--", "--", "--", "--", "--", "--"],
      ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
      ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
    ];
    this.whiteToMove = true;
    this.moveLog = [];

    this.wKingPos = [7, 4];
    this.bKingPos = [0, 4];
  }
  makeMove(move) {
    this.board[move.startRow][move.startCol] = "--";
    this.board[move.endRow][move.endCol] = move.pieceMoved;
    this.moveLog.push(move);
    // update King pos
    if (move.pieceMoved == "wK") {
      this.wKingPos = [move.endRow, move.endCol];
    } else if (move.pieceMoved == 'bK') {
      this.bKingPos = [move.endRow, move.endCol];
    }
    this.whiteToMove = !this.whiteToMove;
  }
  undoMove() {
    if (this.moveLog.length > 0) {
      var move = this.moveLog.pop();
      this.board[move.endRow][move.endCol] = move.pieceCaptured;
      this.board[move.startRow][move.startCol] = move.pieceMoved;
      // update King pos
      if (move.pieceMoved == "wK") {
        this.wKingPos = [move.startRow, move.startCol];
      } else if (move.pieceMoved == 'bK') {
        this.bKingPos = [move.startRow, move.startCol];
      }
      this.whiteToMove = !this.whiteToMove;
    }
  }

  //#region calculate piece legalMoves
  calculateRookLegalMoves(r, c) { // starting row and col
    var legalMoves = [];
    var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (var dirIdx = 0; dirIdx < directions.length; dirIdx++) {
      var curDir = directions[dirIdx];
      for (var mult = 0; mult < DIMENSION; mult++) {
        var row = r + (curDir[0] * mult); // destination row
        var col = c + (curDir[1] * mult); // destination col
        if (row == r && col == c) {
          continue;
        }
        if (row < 0 || row > DIMENSION - 1 || col < 0 || col > DIMENSION - 1) {
          break;
        }
        if (this.board[row][col] != "--") { // not an empty spot
          if (this.board[row][col].slice(0, 1) != (this.whiteToMove ? "w" : "b")) {
            // can kill piece
            legalMoves.push(new Move([r, c], [row, col], this.board));
          }
          break; // can't move past it
        } else {
          legalMoves.push(new Move([r, c], [row, col], this.board))
        }
      }
    }
    return legalMoves;
  }
  calculateKnightLegalMoves(r, c) { // starting row and col
    var legalMoves = [];
    var directions = [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [1, -2], [-1, 2], [1, 2]];
    for (var dirIdx = 0; dirIdx < directions.length; dirIdx++) {
      var curDir = directions[dirIdx];
      var row = r + curDir[0]; // destination row
      var col = c + curDir[1]; // destination col
      if (row < 0 || row > DIMENSION - 1 || col < 0 || col > DIMENSION - 1) {
        continue;
      }
      if (this.board[row][col] != "--") { // not an empty spot
        if (this.board[row][col].slice(0, 1) != (this.whiteToMove ? "w" : "b")) {
          // can kill piece
          legalMoves.push(new Move([r, c], [row, col], this.board));
        }
      } else {
        legalMoves.push(new Move([r, c], [row, col], this.board))
      }
    }
    return legalMoves;
  }
  calculateBishopLegalMoves(r, c) { // starting row and col
    var legalMoves = [];
    var directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (var dirIdx = 0; dirIdx < directions.length; dirIdx++) {
      var curDir = directions[dirIdx];
      for (var mult = 0; mult < DIMENSION; mult++) {
        var row = r + (curDir[0] * mult); // destination row
        var col = c + (curDir[1] * mult); // destination col
        if (row == r && col == c) {
          continue;
        }
        if (row < 0 || row > DIMENSION - 1 || col < 0 || col > DIMENSION - 1) {
          break;
        }
        if (this.board[row][col] != "--") { // not an empty spot
          if (this.board[row][col].slice(0, 1) != (this.whiteToMove ? "w" : "b")) {
            // can kill piece
            legalMoves.push(new Move([r, c], [row, col], this.board));
          }
          break; // can't move past it
        } else {
          legalMoves.push(new Move([r, c], [row, col], this.board))
        }
      }
    }
    return legalMoves;
  }
  calculateQueenLegalMoves(r, c) { // starting row and col
    var legalBishopMoves = this.calculateBishopLegalMoves(r, c);
    var legalRookMoves = this.calculateRookLegalMoves(r, c);
    var legalMoves = legalBishopMoves.concat(legalRookMoves);
    return legalMoves;
  }
  calculateKingLegalMoves(r, c) { // starting row and col
    var legalMoves = [];
    var directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (var dirIdx = 0; dirIdx < directions.length; dirIdx++) {
      var curDir = directions[dirIdx];
      var row = r + curDir[0]; // destination row
      var col = c + curDir[1]; // destination col
      if (row == r && col == c) {
        continue;
      }
      if (row < 0 || row > DIMENSION - 1 || col < 0 || col > DIMENSION - 1) {
        continue;
      }
      if (this.board[row][col] != "--") { // not an empty spot
        if (this.board[row][col].slice(0, 1) != (this.whiteToMove ? "w" : "b")) {
          // can kill piece
          legalMoves.push(new Move([r, c], [row, col], this.board));
        }
      } else {
        legalMoves.push(new Move([r, c], [row, col], this.board))
      }
    }
    return legalMoves;
  }
  calculatePawnLegalMoves(r, c) { // starting row and col
    var legalMoves = [];
    var nextRow = this.board[r][c].slice(0, 1) == "w" ? -1 : 1;
    var firstRow = (this.board[r][c].slice(0, 1) == "w" ? DIMENSION : -1) + (nextRow * 2)

    if (r + nextRow < 0 || r + nextRow > DIMENSION - 1) {
      return legalMoves;
    }

    if (this.board[r+nextRow][c] == "--") { // is spot in front empty
      legalMoves.push(new Move([r, c], [r + nextRow, c], this.board));
      if (r == firstRow) { // if has not moved yet
        if (this.board[r + (nextRow * 2)][c] == "--") { // is spot 2 spots in front empty
          legalMoves.push(new Move([r, c], [r + (nextRow * 2), c], this.board));
        }
      }
    }
    for (var i = 0; i < 2; i++) {
      var colDiff = i == 0 ? -1 : 1;
      if (c + colDiff < 0 || c + colDiff > DIMENSION - 1) {
        break; // lead to the return
      }
      if (this.board[r + nextRow][ c + colDiff] != "--") { // not null and not undefined
        // check that pieces color
        if (this.board[r + nextRow][c + colDiff].slice(0, 1) != this.board[r][c].slice(0, 1)) {
          // can kill piece
          legalMoves.push(new Move([r, c], [r + nextRow, c + colDiff], this.board));
        }
      }
    }
    return legalMoves;
  }
  //#endregion
  
  getAllPossibleMoves() { // ignoring chceks
    var moves = [];
    for (var i = 0; i < this.board.length; i++) {
      for (var j = 0; j < this.board[i].length; j++) {
        var turn = this.board[i][j].slice(0, 1);
        if ((turn == "w" && this.whiteToMove) || (turn == "b" && !this.whiteToMove)) {
          var piece = this.board[i][j].slice(1, 2);
          switch (piece) {
            case "R":
              moves = moves.concat(this.calculateRookLegalMoves(i, j));
              break;
            case "N":
              moves = moves.concat(this.calculateKnightLegalMoves(i, j));
              break;
            case "B":
              moves = moves.concat(this.calculateBishopLegalMoves(i, j));
              break;
            case "Q":
              moves = moves.concat(this.calculateQueenLegalMoves(i, j));
              break;
            case "K":
              moves = moves.concat(this.calculateKingLegalMoves(i, j));
              break;
            case "p":
              moves = moves.concat(this.calculatePawnLegalMoves(i, j));
              break;
            default:
              console.log("should not print");
          }
        }
      }
    }
    return moves;
  }

  getValidMoves() { // considering checks
    // 1. Generate all possible moves
    var moves = this.getAllPossibleMoves();
    // 2. for each move, make the move
    for (var i = moves.length - 1; i >= 0; i--) {
      this.makeMove(moves[i]);
      // 3. generate all opponents move
      // 4. for each of opponents moves, see if they attack YOUR king
      this.whiteToMove = !this.whiteToMove;
      if (this.inCheck()) {
        // 5. if they do, then remove it
        console.log(moves[i].endRow, moves[i].endCol);
        moves.splice(i, 1);
      }
      this.whiteToMove = !this.whiteToMove;
      this.undoMove();
    }
    return moves;
  }
  inCheck() {
    if (this.whiteToMove) {
      return this.squareUnderAttack(this.wKingPos);
    } else {
      return this.squareUnderAttack(this.bKingPos);
    }
  }
  squareUnderAttack(pos) {
    this.whiteToMove = !this.whiteToMove; // see opponents moves
    var oppMoves = this.getAllPossibleMoves();
    for (var move of oppMoves) {
      if (move.endRow == pos[0] && move.endCol == pos[1]) {
        this.whiteToMove = !this.whiteToMove;
        return true;
      }
    }
    this.whiteToMove = !this.whiteToMove;
    return false;
  }
}

class Move {
  constructor(sqStart, sqEnd, board) {
    //#region toString notation dictionaries
    this.ranksToRows = {};
    this.rowsToRanks = {};
    this.filesToCols = {};
    this.colsToFiles = {};
    for (var i = 0; i < DIMENSION; i++) {
      this.ranksToRows["" + DIMENSION - i] = i;
      this.rowsToRanks["" + i] = DIMENSION - i;
      this.filesToCols["" + String.fromCharCode(97 + i)] = i;
      this.colsToFiles["" + i] = String.fromCharCode(97 + i);
    }
    //#endregion
    
    this.startRow = sqStart[0];
    this.startCol = sqStart[1];
    this.endRow = sqEnd[0];
    this.endCol = sqEnd[1];
    this.moveID = this.startRow * 1000 + this.startCol * 100 + this.endRow * 10 + this.endCol;

    this.pieceMoved = board[this.startRow][this.startCol];
    this.pieceCaptured = board[this.endRow][this.endCol];
  }
  getChessNotation() {
    return this.getRankFile(this.startRow, this.startCol) + " --> " + this.getRankFile(this.endRow, this.endCol);
  }
  getRankFile(row, col) {
    return "" + this.colsToFiles[col] + this.rowsToRanks[row];
  }
  isMoveEqual(move) {
    if (!move instanceof Move) {
      return false;
    }
    return this.moveID == move.moveID;
  }
}