module aiService {

  function getHighestPosition(board:any, piece:any) {
    for (var i = 0; i < 16; i+= 1) {
      for (var j = 0; j < 17; j += 1) {
        if (board[i][j] === piece) {
          return [i, j];
        }
      }
    }
  }

 export function createComputerMove(board:any, moveType:any, dice:any, playerIndex:any) {
      if (moveType === 'normal') {
          return createNormalMove(board, dice, playerIndex);
      } else {
          return createBarricadeMove(board, playerIndex);
      }
  }

  function createNormalMove(board:any, dice:any, playerIndex:any) {
      var piece = playerIndex === 0 ? 'R' : 'G';
      var currentPos = getCurrentPositions(board, piece); //[[row1, col1], [row2, col2], [row3, col3], [row4, col4], [row5, col5]]

      // get all possible moves
      var onBarricadeMoves:any = [];
      var onOpponentMoves:any = [];
      var onEmptyMoves:any = [];
      for (var i = 0; i < currentPos.length; i++) {
        var row = currentPos[i][0];
        var col = currentPos[i][1];
        var destinations:any;

        if (row > 13) { // new from base
          var startRow = 13;
          var startCol = Math.floor(col / 4) * 4 + 2;
          destinations = gameLogic.getPossibleDestination(board, dice - 1,
              startRow, startCol, -1, -1);
        } else {
          destinations = gameLogic.getPossibleDestination(board, dice,
              row, col, -1, -1);
        }

        for (var j = 0; j < destinations.length; j++) {
          var pos = destinations[j];
          var option = {from: currentPos[i], to: pos};

          // classify all the moves
          /*if (pos === [0, 8]) {
            return gameLogic.createMove(board, 'normal', dice, 0, 8, row, col, playerIndex);
          }*/
          // classify all the moves
          switch (board[pos[0]][pos[1]]) {
            case '1':
              onBarricadeMoves.push(option);
              break;
            case 'W':
              return gameLogic.createMove(board, 'normal', dice, 0, 8, row, col, playerIndex);
            case piece:
              break;
            case '0':
              onEmptyMoves.push(option);
              break;
            default:
              onOpponentMoves.push(option);
              break;
          }
        }
        if (row > 13) {
          break;
        }
      }

      var bestOption:any;
      if (onBarricadeMoves.length !== 0) {
        // final circle inward > high move higher > new pawn > move parallel > move lower
        bestOption = getBestMove(onBarricadeMoves, dice);
      } else if (onOpponentMoves.length !== 0) {
        // final circle > high move higher > move parallel > new pawn > move lower
        bestOption = getBestMove(onOpponentMoves, dice);
      } else if (onEmptyMoves.length !== 0) {
        // final circle > high move higher > new pawn > move parallel > pass > move lower
        bestOption = getBestMove(onEmptyMoves, dice);
      } else {
        // pass
        return gameLogic.createPassMove(board, dice, playerIndex);
      }
      return gameLogic.createMove(board, 'normal', dice, bestOption.to[0], bestOption.to[1], bestOption.from[0], bestOption.from[1], playerIndex);
  }
  function createBarricadeMove(board:any, playerIndex:any) {
      var piece = playerIndex === 0 ? 'R' : 'G';
      var opponent = playerIndex === 0 ? 'G' : 'R';

      var piecePos = getHighestPosition(board, piece);
      var oppoPos = getHighestPosition(board, opponent);
      var i:any, j:any;

      if (oppoPos[0] > 13) { // the oppnents are all in the base
        if (opponent === 'G') {
          for (i = 13; i > 0; i -= 1) {
            for (j = oppoPos[1]; j < oppoPos[1] + 2; j += 1) {
              if (board[i][j] === '0') {
                return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                    playerIndex);
              }
            }
          }
        }else if (opponent === 'R') {
          for (i = 13; i > 0; i -= 1) {
            for (j = 0; j < 4; j += 1) {
              if (board[i][j] === '0') {
                return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                    playerIndex);
              }
            }
          }
        }
      } else if (piecePos[0] < oppoPos[0]) { // the opponnet falls behind
        for (i = piecePos[0] + 1; i < 14; i += 1) {
          for (j = 0; j < 17; j += 1) {
            if (board[i][j] === '0') {
              return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                  playerIndex);
            }
          }
        }
      } else if (piecePos[0] > oppoPos[0]) { // the opponent leads
        for (i = oppoPos[0] - 1; i > 0; i -= 1) {
          for (j = 0; j < 17; j += 1) {
            if (board[i][j] === '0') {
              return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                  playerIndex);
            }
          }
        }
        i = oppoPos[0];
        for (j = 0; j < 17; j += 1) {
          if (board[i][j] === '0') {
            return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                playerIndex);
          }
        }
      } else { // neck by neck

        if (piecePos[1] < oppoPos[1]) {

          // block right part
          if (piecePos[0] === 1 && oppoPos[1] < 8) {
            // right of opponent
            for (i = 1; i < 14; i += 1) {
              for (j = oppoPos[1] + 1; j < 17; j += 1) {
                if (board[i][j] === '0') {
                  return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                      playerIndex);
                }
              }
            }
          } else {
            // right of self
            for (i = 1; i < 14; i += 1) {
              for (j = oppoPos[1] - 1; j > piecePos[1]; j -= 1) {
                if (board[i][j] === '0') {
                  return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                      playerIndex);
                }
              }
              for (j = oppoPos[1] + 1; j < 17; j += 1) {
                if (board[i][j] === '0') {
                  return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                      playerIndex);
                }
              }
            }
          }

        } else {

          // block left part
          if (piecePos[0] === 1 && oppoPos[1] > 8) {
            // left of opponent
            for (i = 1; i < 14; i += 1) {
              for (j = oppoPos[1] - 1; j >= 0; j -= 1) {
                if (board[i][j] === '0') {
                  return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                      playerIndex);
                }
              }
            }
          } else {
            // left of self
            for (i = oppoPos[0]; i > 0; i -= 1) {
              for (j = oppoPos[1] + 1; j < piecePos[1]; j += 1) {
                if (board[i][j] === '0') {
                  return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                      playerIndex);
                }
              }
              for (j = oppoPos[1] - 1; j >= 0; j -= 1) {
                if (board[i][j] === '0') {
                  return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                      playerIndex);
                }
              }
            }
          }
        }
      }
      for (i = 1; i < 14; i += 1) {
        for (j = 0; j < 17; j += 1) {
          if (board[i][j] === '0') {
            return gameLogic.createMove(board, "barricade", -1, i, j, -1, -1,
                playerIndex);
          }
        }
      }
  }
  function getCurrentPositions(board:any, piece:any) {
    var currentPos:any = [];
    for (var i = 0; i < 16; i+= 1) {
      for (var j = 0; j < 17; j += 1) {
        if (board[i][j] === piece) {
          currentPos.push([i, j]);
        }
      }
    }
    if (currentPos.length !== 5) {
      throw new Error('Cheating on pieces');
    }
    return currentPos;
  }
  function getBestMove(moves:any, dice:any){
    var bestScore:any;
    var bestOption:any;

    for (var j = 0; j < moves.length; j++) {
      var curOption = moves[j];

      var frompos = curOption.from;
      var topos = curOption.to;

      var curScore = 1 - topos[0] / 16 + (frompos[0] - topos[0])/dice +
          (frompos[0] > 13 ? 0.5 : 0);

      if (!bestScore || bestScore < curScore) {
        bestScore = curScore;
        bestOption = curOption;
      }
    }
    return bestOption;
  }

}
