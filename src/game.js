angular.module('myApp')
    .controller('Ctrl',
            ['$scope', '$log', '$timeout', '$rootScope', 'gameService', 'stateService', 'gameLogic', 'resizeGameAreaService',
            function ($scope, $log, $timeout, $rootScope, gameService, stateService, gameLogic, resizeGameAreaService) {

                'use strict';

                var gameArea = document.getElementById("gameArea");
                var rowsNum = 16;
                var colsNum = 17;
                var draggingStartedRowCol = null;
                var draggingPiece = null;
                var nextZIndex = 61;

                function handleDragEvent(type, clientX, clientY) {
                    // Center point in gameArea
                    var x = clientX - gameArea.offsetLeft;
                    var y = clientY - gameArea.offsetTop;
                    // Is outside gameArea?
                    if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
                      if (draggingPiece) {
                        // Drag the piece where the touch is (without snapping to a square).
                        var size = getSquareWidthHeight();
                        setDraggingPieceTopLeft({top: y - size.height / 2, left: x - size.width / 2}, $scope.typeExpected);
                      } else {
                        return;
                      }
                    } else {
                      // Inside gameArea
                      var col = Math.floor(colsNum * x / gameArea.clientWidth);
                      var row = Math.floor(rowsNum * y / gameArea.clientHeight);

                      if (type === "touchstart" && !draggingStartedRowCol) {
                        if ($scope.board[row][col] === $scope.myPiece && $scope.isYourTurn && $scope.typeExpected==="normal") {
                          draggingStartedRowCol = {row: row, col: col};
                          draggingPiece = document.getElementById("e2e_test_piece"+$scope.myPiece+"_"+row+"x"+col);
                          draggingPiece.style['z-index'] = ++nextZIndex;
                        }
                      }
                      if (!draggingPiece) {
                        return;
                      }

                      if (type === "touchend") {
                        var frompos = draggingStartedRowCol;
                        var topos = {row: row, col: col};
                        dragDone(frompos, topos);
                      } else {
                          // Drag continue
                          setDraggingPieceTopLeft(getSquareTopLeft(row, col), $scope.typeExpected);
                          $log.info(["set pos "+ row+" "+col]);
                      }
                    }

                    if (type === "touchend" && $scope.typeExpected !== "barricade" ||
                        type === "touchcancel" || type === "touchleave") {
                      // drag ended
                      // return the piece to it's original style (then angular will take care to hide it).
                      setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col));
                      draggingStartedRowCol = null;
                      //draggingPiece.removeAttribute("style"); // trying out
                      draggingPiece = null;
                    }
                }
                window.handleDragEvent = handleDragEvent;

                function isInvalidPos(topLeft) {
                  var size = getSquareWidthHeight();
                  var row = topLeft.top / size.height;
                  var col = topLeft.left / size.width;
                  return $scope.board[row][col] === "";
                }
                function setDraggingPieceTopLeft(topLeft, movetype) {
                  var originalSize;
                  var row = draggingStartedRowCol.row;
                  var col = draggingStartedRowCol.col;
                  if (isInvalidPos(topLeft)) {
                    return;
                  }
                  if (movetype === 'barricade'){
                    originalSize = getSquareTopLeft(0, 0);
                  } else {
                    originalSize = getSquareTopLeft(row, col);
                  }
                  draggingPiece.style.left = topLeft.left - originalSize.left + "px";
                  draggingPiece.style.top = topLeft.top - originalSize.top + "px";
                  $log.info(['piece '+draggingPiece.style.left+' '+draggingPiece.style.top]);
                }

                function getSquareWidthHeight() {
                  return {
                    width: gameArea.clientWidth / colsNum,
                    height: gameArea.clientHeight / rowsNum
                  };
                }

                function getSquareTopLeft(row, col) {
                  var size = getSquareWidthHeight();
                  return {top: row * size.height, left: col * size.width};
                }

                resizeGameAreaService.setWidthToHeight(1.0625);

                function dragDone(frompos, topos) {
                  $rootScope.$apply(function () {
                    var msg = "Dragged piece " + frompos.row + "x" + frompos.col + " to square " + topos.row + "x" + topos.col;
                    $log.info(msg);
                    $scope.msg = msg;
                    // Update piece in board
                    if (!$scope.isYourTurn) {
                        return;
                    }
                    try {
                        $scope.isYourTurn = false;
                        if ($scope.typeExpected === 'normal') {
                            if ($scope.board[topos.row][topos.col] === '1') {
                                draggingStartedRowCol = {row: topos.row, col: topos.col};
                                draggingPiece = document.getElementById("spareBarricade");
                                draggingPiece.style['z-index'] = 0;
                                draggingPiece.style.display = 'inline';
                                setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col), 'barricade');
                            }
                            gameService.makeMove(gameLogic.createMove(
                                $scope.board, "normal", $scope.dice, topos.row, topos.col,
                                    frompos.row, frompos.col, $scope.turnIndex));
                        } else {
                            gameService.makeMove(gameLogic.createMove(
                                $scope.board, "barricade", $scope.dice, topos.row, topos.col,
                                    -1, -1, $scope.turnIndex));
                            draggingPiece.style.display = 'none';
                        }
                    } catch (e) {
                        $log.info(["Illegal Move"]);
                        $scope.isYourTurn = true;
                        setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col), $scope.typeExpected);
                    }
                  });
                }

                function getIntegersTill(number) {
                  var res = [];
                  for (var i = 0; i < number; i++) {
                    res.push(i);
                  }
                  return res;
                }
                $scope.rows = getIntegersTill(rowsNum);
                $scope.cols = getIntegersTill(colsNum);
                $scope.rowsNum = rowsNum;
                $scope.colsNum = colsNum;

                function sendComputerNormalMove() {
                    gameService.makeMove(gameLogic.getRandomPossibleMove($scope.board,
                        "normal", $scope.dice, $scope.turnIndex));
                }

                function sendComputerBarricadeMove() {
                    gameService.makeMove(gameLogic.getRandomPossibleMove($scope.board,
                        "barricade", -1, $scope.turnIndex));
                }

                function sendDiceMove() {
                    gameService.makeMove(gameLogic.createDiceMove($scope.dice, $scope.turnIndex));
                }

                function updateUI(params) {
                    var lastType = params.stateAfterMove.type;
                    $scope.board = params.stateAfterMove.board;
                    $scope.delta = params.stateAfterMove.delta;
                    $scope.dice = params.stateAfterMove.dice;

                    var piece;
                    switch(params.yourPlayerIndex) {
                        case 0:
                            piece = 'R';
                            break;
                        case 1:
                            piece = 'G';
                            break;
                        case 2:
                            piece = 'Y';
                            break;
                        case 3:
                            piece = 'B';
                    }
                    $scope.myPiece = piece;

                    if ($scope.board === undefined) {
                        $scope.board = gameLogic.getInitialBoard();
                    }
                    $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
                        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
                    $scope.turnIndex = params.turnIndexAfterMove;
                    if (params.turnIndexBeforeMove !== params.turnIndexAfterMove) {
                        $scope.dice = null;
                        $scope.typeExpected = "dice";
                    } else {
                        if (lastType === "normal") {
                            $scope.typeExpected = "barricade";
                        } else {
                            $scope.typeExpected = "normal";
                        }
                    }

                    // Is it the computer's turn?
                    if ($scope.isYourTurn &&
                            params.playersInfo[params.yourPlayerIndex].playerId === '') {
                        $scope.isYourTurn = false; // to make sure the UI won't send another move.
                        // Waiting 0.5 seconds to let the move animation finish; if we call aiService
                        // then the animation is paused until the javascript finishes.
                        if (!$scope.dice) {
                            $timeout(sendDiceMove, 500);
                        } else if ($scope.typeExpected === "normal") {
                            $timeout(sendComputerNormalMove, 500);
                        } else if ($scope.typeExpected === "barricade") {
                            $timeout(sendComputerBarricadeMove, 500);
                        }
                    } else if ($scope.isYourTurn){
                        if (!$scope.dice) {
                            $timeout(sendDiceMove, 500);
                        }
                    }

                    // animation
                    var diceImg = document.getElementById('e2e_test_dice');
                    if (lastType === "dice") {
                        diceImg.className = 'spinIn';
                    }
                    if ($scope.typeExpected === "dice") {
                        diceImg.className = 'spinOut';
                    }
                    if (lastType === 'normal') {
                        var from_row = $scope.delta.from_row;
                        var from_col = $scope.delta.from_col;

                        var to_row = $scope.delta.to_row;
                        var to_col = $scope.delta.to_col;
                        var top = (to_row - from_row) * 6.25/100;
                        var left = (to_col - from_col) * 5.88/100;

                        var pieceImg = document.getElementById('e2e_test_piece'+piece+'_'+from_row+'x'+from_col);
                        pieceImg.style = '{top:"'+top+'", left:"'+left+'", position: "relative", "-webkit-animation": "moveAnimation 2s", "animation": "moveAnimation 2s"}';
                    }
                }
                window.e2e_test_stateService = stateService; // to allow us to load any state in our e2e tests.

                var prev_row = null;
                var prev_col = null;
                $scope.cellClicked = function (row, col) {
                    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
                        throw new Error("Throwing the error because URL has '?throwException'");
                    }
                    if (!$scope.isYourTurn) {
                        return;
                    }
                    if (!$scope.dice) { // wait until dice rolls
                        return;
                    }

                    // normal move, get a pawn and place it.
                    if ($scope.typeExpected === "normal") {
                        // choose the start point
                        if (prev_row === null || prev_col === null) {
                            if ($scope.shouldShowImage(row, col) &&
                                $scope.board[row][col] !== 'W' &&
                                $scope.board[row][col] !== '0') {
                                prev_row = row;
                                prev_col = col;
                                $log.info(["Choose a pawn:", row, col]);
                            }
                            return;
                        } else {
                            try { // choose the end point
                              // to prevent making another move
                                $scope.isYourTurn = false;
                                $log.info(["Choose a destination", row, col]);
                                gameService.makeMove(gameLogic.createMove(
                                    $scope.board, "normal", $scope.dice, row, col,
                                        prev_row, prev_col, $scope.turnIndex));
                                prev_row = null;
                                prev_col = null;
                            } catch (e) {
                                $log.info(["Illegal move to ", row, col, " from ", prev_row, prev_col]);
                                $scope.isYourTurn = true;
                                prev_row = null;
                                prev_col = null;
                                return;
                            }
                        }
                    } else if ($scope.typeExpected === "barricade"){
                        if (prev_row === null || prev_col === null) {
                            $log.info(["Place a barricade at:", row, col]);
                            prev_row = null;
                            prev_col = null;
                        }
                        try {
                            $scope.isYourTurn = false;
                            $log.info(["Choose a position", row, col]);
                            gameService.makeMove(gameLogic.createMove(
                                $scope.board, "barricade", $scope.dice, row, col,
                                    -1, -1, $scope.turnIndex));
                        } catch (e) {
                            $log.info(["Illegal to place a barricade at:", row, col]);
                            $scope.isYourTurn = true;
                            return;
                        }
                    }
                };
                $scope.passMove = function() {
                      if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
                          throw new Error("Throwing the error because URL has '?throwException'");
                      }
                      if (!$scope.isYourTurn) {
                          return;
                      }
                      if (!$scope.dice) { // wait until dice rolls
                          return;
                      }
                      if ($scope.typeExpected === "normal") {
                          try {
                              $scope.isYourTurn = false;
                              gameService.makeMove(gameLogic.createPassMove(
                                  $scope.board, $scope.dice, $scope.turnIndex));
                          } catch(e) {
                              $log.info(["Illegal pass move"]);
                              return;
                          }
                      }
                };
                $scope.shouldShowImage = function (row, col) {
                    var cell = $scope.board[row][col];
                    return cell !== "";
                };
                $scope.isWinSpot = function (row, col) {
                    return $scope.board[row][col] === 'W';
                };
                $scope.isPieceR = function (row, col) {
                    return $scope.board[row][col] === 'R';
                };
                $scope.isPieceG = function (row, col) {
                    return $scope.board[row][col] === 'G';
                };
                $scope.isPieceB = function (row, col) {
                    return $scope.board[row][col] === 'B';
                };
                $scope.isPieceY = function (row, col) {
                    return $scope.board[row][col] === 'Y';
                };
                $scope.isBarricade = function (row, col) {
                    return $scope.board[row][col] === '1';
                };
                $scope.isEmptySpot = function (row, col) {
                    return $scope.board[row][col] === '0';
                };
                $scope.isRedStart = function (row, col) {
                    return isStart(0, row, col);
                };
                $scope.isGreenStart = function (row, col) {
                    return isStart(1, row, col);
                };
                $scope.isYellowStart = function (row, col) {
                    return isStart(2, row, col);
                };
                $scope.isBlueStart = function (row, col) {
                    return isStart(3, row, col);
                };
                $scope.isNormalSpot = function(row, col) {
                    return !$scope.isWinSpot(row, col) && !$scope.isRedStart(row, col) &&
                    !$scope.isGreenStart(row, col) && !$scope.isYellowStart(row, col) &&
                    !$scope.isBlueStart(row, col);
                };
                function isStart(index, row, col) {
                    var targetCol = index * 4 + 2;
                    return row === 13 && col === targetCol ||
                    row === 14 && (col === targetCol - 1 || col === targetCol || col === targetCol + 1) ||
                    row === 15 && (col === targetCol - 1 || col === targetCol + 1);
                }

                $scope.getDiceSrc = function() {
                    switch($scope.dice) {
                        case 1:
                            return 'imgs/1.png';
                        case 2:
                            return 'imgs/2.png';
                        case 3:
                            return 'imgs/3.png';
                        case 4:
                            return 'imgs/4.png';
                        case 5:
                            return 'imgs/5.png';
                        case 6:
                            return 'imgs/6.png';
                        default:
                            return '';
                    }
                };
                $scope.shouldSlowlyAppear = function (row, col) {
                    return $scope.delta !== undefined &&
                            $scope.delta.row === row && $scope.delta.col === col;
                };

                gameService.setGame({
                    gameDeveloperEmail: "hy821@nyu.edu",
                    minNumberOfPlayers: 2,
                    maxNumberOfPlayers: 2,
                    isMoveOk: gameLogic.isMoveOk,
                    updateUI: updateUI
                });
            }]);
