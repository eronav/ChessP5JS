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
    this.control = [
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

    this.enPassantPossible = [];

    this.curCastlingRight = new CastleRights(true, true, true, true);
    this.castleRightsLog = [CastleRights.copy(this.curCastlingRight)];
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
    // Pawn promotion
    if (move.isPawnPromotion) {
      this.board[move.endRow][move.endCol] = move.pieceMoved.slice(0, 1) + "Q";
    }
    if (move.isEnPassantMove) {
      this.board[move.startRow][move.endCol] = "--"; // kill the piece behind the end position
    }
    // update enPassant variable
    if (move.pieceMoved.slice(1, 2) == "p" && Math.abs(move.startRow - move.endRow) == 2) { // 2 sq pawn advances
      this.enPassantPossible = [floor((move.startRow + move.endRow)/2), move.endCol];
    } else {
      this.enPassantPossible = [];
    }

    // castle move
    if (move.isCastleMove) {
      if (move.endCol - move.startCol > 0) { // king side
        this.board[move.endRow][move.endCol - 1] = this.board[move.endRow][move.endCol + 1]; // put rook to square next to king
        this.board[move.endRow][move.endCol + 1] = "--" // remove old rook
      } else { // queen side
        this.board[move.endRow][move.endCol + 1] = this.board[move.endRow][move.endCol - 2]; // put rook to square next to king
        this.board[move.endRow][move.endCol - 2] = "--" // remove old rook
      }
    }

    // update castling rights
    this.curCastlingRight = CastleRights.copy(this.curCastlingRight);
    this.updateCastleRights(move);
    this.castleRightsLog.push(this.curCastlingRight);
    this.whiteToMove = !this.whiteToMove;
  }
  undoMove() {
    if (this.moveLog.length > 0) {
      var move = this.moveLog.pop();
      this.board[move.endRow][move.endCol] = move.pieceCaptured;
      this.board[move.startRow][move.startCol] = move.pieceMoved;
      this.whiteToMove = !this.whiteToMove;
      
      // update King pos
      if (move.pieceMoved == "wK") {
        this.wKingPos = [move.startRow, move.startCol];
      } else if (move.pieceMoved == 'bK') {
        this.bKingPos = [move.startRow, move.startCol];
      }

      // undo en passant
      if (move.isEnPassantMove) {
        this.board[move.endRow][move.endCol] = "--";
        this.board[move.startRow][move.endCol] = move.pieceCaptured;
        this.enPassantPossible = [move.endRow, move.endCol];
      }
      if (move.pieceMoved.slice(1, 2) == "p" && Math.abs(move.startRow - move.endRow) == 2) {
        this.enPassantPossible = [];
      }
      
      // undo castling rights
      this.castleRightsLog.pop();
      this.curCastlingRight = this.castleRightsLog[this.castleRightsLog.length - 1];
      // undo castle move
      if (move.isCastleMove) {
        if (move.endCol - move.startCol > 0) { // king side
          this.board[move.endRow][move.endCol + 1] = this.board[move.endRow][move.endCol - 1]; // put rook back at old pos
          this.board[move.endRow][move.endCol - 1] = "--"; // remove rook at square next to king
        } else { // queen side
          this.board[move.endRow][move.endCol - 2] = this.board[move.endRow][move.endCol + 1]; // put rook back at old pos 
          this.board[move.endRow][move.endCol + 1] = "--"; // remove rook at square next to king
        }
      }
    }
  }
  
  updateCastleRights(move) {
    if (move.pieceMoved == 'wK') {
      this.curCastlingRight.wks = false;
      this.curCastlingRight.wqs = false;
    } else if (move.pieceMoved == 'bK') {
      this.curCastlingRight.bks = false;
      this.curCastlingRight.bqs = false;
    } else if (move.pieceMoved == 'wR') {
      if (move.startRow == 7) {
        if (move.startCol == 0) { // left rook
          this.curCastlingRight.wqs = false;
        } else if (move.startCol == 7) { // right rook
          this.curCastlingRight.wks = false;
        }
      }
    } else if (move.pieceMoved == 'bR') {
      if (move.startRow == 0) {
        if (move.startCol == 0) { // left rook
          this.curCastlingRight.bqs = false;
        } else if (move.startCol == 7) { // right rook
          this.curCastlingRight.bks = false;
        }
      }
    }
  }
  
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
      if (this.board[row][col].slice(0, 1) != (this.whiteToMove ? "w" : "b")) {
        // can move there because it is either empty or enemy
        legalMoves.push(new Move([r, c], [row, col], this.board));
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
      if (this.board[row][col].slice(0, 1) != (this.whiteToMove ? "w" : "b")) { // either empty or enemy
        // can move there because it is either empty or enemy
        legalMoves.push(new Move([r, c], [row, col], this.board));
      }
    }
    return legalMoves;
  }
  
  calculatePawnLegalMoves(r, c) { // starting row and col
    var legalMoves = [];
    var nextRow = (this.board[r][c].slice(0, 1) == "w" ? -1 : 1) + r;
    var firstRow = (this.board[r][c].slice(0, 1) == "w" ? DIMENSION : -1) + ((nextRow-r) * 2);

    if (nextRow < 0 || nextRow > DIMENSION - 1) {
      return legalMoves;
    }

    if (this.board[nextRow][c] == "--") { // is spot in front empty
      legalMoves.push(new Move([r, c], [nextRow, c], this.board));
      if (r == firstRow) { // if has not moved yet
        if (this.board[nextRow * 2 - r][c] == "--") { // is spot 2 spots in front empty
          legalMoves.push(new Move([r, c], [nextRow + (nextRow - r), c], this.board));
        }
      }
    }
    for (var i = 0; i < 2; i++) {
      var colDiff = (i == 0 ? -1 : 1) + c;
      if (colDiff < 0 || colDiff > DIMENSION - 1) {
        break; // lead to the return
      }
      if (this.board[nextRow][colDiff] != "--") { // not empty
        // check that pieces color
        if (this.board[nextRow][colDiff].slice(0, 1) != this.board[r][c].slice(0, 1)) {
          // can kill piece
          legalMoves.push(new Move([r, c], [nextRow, colDiff], this.board));
        }
      } else { // is empty
        if (nextRow == this.enPassantPossible[0] && colDiff == this.enPassantPossible[1]) {
          legalMoves.push(new Move([r, c], [nextRow, colDiff], this.board, true));
        }
      }
    }
    return legalMoves;
  }

  calculateCastlingMoves(r, c) {
    var moves = [];
    if (this.inCheck()) {
      return moves;
    }
    if ((this.whiteToMove && this.curCastlingRight.wks) || (!this.whiteToMove && this.curCastlingRight.bks)) {
      moves = moves.concat(this.getKingSideCastleMoves(r, c));
    }
    if ((this.whiteToMove && this.curCastlingRight.wqs) || (!this.whiteToMove && this.curCastlingRight.bqs)) {
      moves = moves.concat(this.getQueenSideCastleMoves(r, c));
    }
    return moves;
  }
  getKingSideCastleMoves(r, c) {
    var moves = [];
    if (this.board[r][c+1] == "--" && this.board[r][c+2] == "--") {
      if (!this.squareUnderAttack(r, c + 1) && !this.squareUnderAttack(r, c + 2)) {
        moves.push(new Move([r, c], [r, c + 2], this.board, false, true));
      }
    }
    return moves;
  }
  getQueenSideCastleMoves(r, c) {
    var moves = [];
    if (this.board[r][c - 1] == "--" && this.board[r][c - 2] == "--" && this.board[r][c - 3] == "--") {
      if (!this.squareUnderAttack(r, c - 1) && !this.squareUnderAttack(r, c - 2)) {
        moves.push(new Move([r, c], [r, c - 2], this.board, false, true));
      }
    }
    return moves;
  }

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
    var tempEnPassantPossible = [this.enPassantPossible[0], this.enPassantPossible[1]];
    var tempCastlingRights = CastleRights.copy(this.curCastlingRight);  
    // 1. Generate all possible moves
    var moves = this.getAllPossibleMoves();
    if (this.whiteToMove) {
      moves = moves.concat(this.calculateCastlingMoves(this.wKingPos[0], this.wKingPos[1]));
    } else {
      moves = moves.concat(this.calculateCastlingMoves(this.bKingPos[0], this.bKingPos[1]));
    }
    // 2. for each move, make the move
    for (var i = moves.length - 1; i >= 0; i--) {
      this.makeMove(moves[i]);
      // 3. generate all opponents move
      // 4. for each of opponents moves, see if they attack YOUR king
      this.whiteToMove = !this.whiteToMove;
      if (this.inCheck()) {
        // 5. if they do, then remove it
        moves.splice(i, 1);
      }
      this.whiteToMove = !this.whiteToMove;
      this.undoMove();
    }
    this.enPassantPossible = tempEnPassantPossible;
    this.curCastlingRight = tempCastlingRights;
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

class CastleRights {
  constructor(wks, bks, wqs, bqs) {
    this.wks = wks;
    this.bks = bks;
    this.wqs = wqs;
    this.bqs = bqs;
  }
  static copy(castleRights) {
    if (!castleRights instanceof CastleRights) {
      return null;
    }
    return new CastleRights(castleRights.wks, castleRights.wqs, castleRights.bks, castleRights.bqs);
  }
}

class Move {
  constructor(sqStart, sqEnd, board, isEnPassantMove = false, isCastleMove = false) {
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
    
    this.startRow = sqStart[0];
    this.startCol = sqStart[1];
    this.endRow = sqEnd[0];
    this.endCol = sqEnd[1];
    this.pieceMoved = board[this.startRow][this.startCol];
    this.pieceCaptured = board[this.endRow][this.endCol];
    this.isPawnPromotion = false;
    this.isPawnPromotion = ((this.pieceMoved == "wp" && this.endRow == 0) || (this.pieceMoved == "bp" && this.endRow == 7));
    this.isEnPassantMove = isEnPassantMove;
    if (this.isEnPassantMove) {
      this.pieceCaptured = this.pieceMoved == "wp" ? "bp" : "wp";
    }
    this.isCastleMove = isCastleMove;

    this.moveID = this.startRow * 1000 + this.startCol * 100 + this.endRow * 10 + this.endCol;
  }
  getChessNotation() {
    return this.pieceMoved + ": " + this.getRankFile(this.startRow, this.startCol) + " --> " + this.getRankFile(this.endRow, this.endCol);
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