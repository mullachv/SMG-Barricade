angular.module('myApp', []).factory('gameLogic', function () {
    'use strict';
    function getInitialBoard() { // 0..15 * 0..16
        return [['', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', ''], // 0
            ['0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'], // 1
            ['0', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '0'], // 2
            ['0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'], // 3
            ['', '', '', '', '', '', '', '', '1', '', '', '', '', '', '', '', ''], // 4
            ['', '', '', '', '', '', '0', '0', '1', '0', '0', '', '', '', '', '', ''], // 5
            ['', '', '', '', '', '', '0', '', '', '', '0', '', '', '', '', '', ''], // 6
            ['', '', '', '', '0', '0', '1', '0', '0', '0', '1', '0', '0', '', '', '', ''], // 7
            ['', '', '', '', '0', '', '', '', '', '', '', '', '0', '', '', '', ''], // 8
            ['', '', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', ''], // 9
            ['', '', '0', '', '', '', '0', '', '', '', '0', '', '', '', '0', '', ''], // 10
            ['1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1'], // 11
            ['0', '', '', '', '0', '', '', '', '0', '', '', '', '0', '', '', '', '0'], // 12
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], // 13
            ['', 'R', 'R', 'R', '', 'G', 'G', 'G', '', '', '', '', '', '', '', '', ''], // 14
            ['', 'R', '', 'R', '', 'G', '', 'G', '', '', '', '', '', '', '', '', '']]; // 15
    }

    function getWinner(board) {
        return board[0][8];
    }

    function getPossibleDestination(board, dice, curr_row, curr_col, last_row, last_col) {
        if (dice === 0) {
            return [[curr_row, curr_col]];
        }
        if (board[curr_row][curr_col] === '1') {
            return [];
        }
        var left = [], right = [], up = [], down = [], res = [];
        if (curr_row - 1 >= 0 && curr_row - 1 !== last_row && board[curr_row - 1][curr_col] !== '') {
            up = getPossibleDestination(board, dice - 1, curr_row - 1, curr_col, curr_row, curr_col);
        }
        if (curr_row + 1 <= 13 && curr_row + 1 !== last_row && board[curr_row + 1][curr_col] !== '') {
            down = getPossibleDestination(board, dice - 1, curr_row + 1, curr_col, curr_row, curr_col);
        }
        if (curr_col - 1 >= 0 && curr_col - 1 !== last_col && board[curr_row][curr_col - 1] !== '') {
            left = getPossibleDestination(board, dice - 1, curr_row, curr_col - 1, curr_row, curr_col);
        }
        if (curr_col + 1 <= 16 && curr_col + 1 !== last_col && board[curr_row][curr_col + 1] !== '') {
            right = getPossibleDestination(board, dice - 1, curr_row, curr_col + 1, curr_row, curr_col);
        }
        res = left.concat(right, up, down);
        return res;
    }

    function checkPath(board, dice, to_row, to_col, from_row, from_col) {
        if (from_row >= 14) {
            from_row = 13;
            from_col = Math.floor(from_col / 4) * 4 + 2;
            dice -= 1;
        }
        var destinations = getPossibleDestination(board, dice, from_row, from_col, -1, -1), i;
        for (i = 0; i < destinations.length; i += 1) {
            if (to_row === destinations[i][0] && to_col === destinations[i][1]) {
                return true;
            }
        }

        return false;
    }

    // find the available base place
    function send2Base(board, pawn) {
        var base = pawn === 'R' ? 0 : pawn === 'G' ? 1 : pawn === 'Y' ? 2 : 3,
            start_row = 15,
            start_col = base * 4 + 1,
            end_col;
        if (board[start_row][start_col] === '0') {
            return [start_row, start_col];
        }
        if (board[start_row][start_col + 2] === '0') {
            return [start_row, start_col + 2];
        }
        start_row = start_row - 1;
        end_col = start_col + 3;
        for (start_row; start_col < end_col; start_col += 1) {
            if (board[start_row][start_col] === '0') {
                return [start_row, start_col];
            }
        }
        throw new Error("Possible cheating on the number of the pawns");
    }

    function createNormalMove(board, dice, to_row, to_col, from_row, from_col, turnIndexBeforeMove) {
        if (board === undefined) {
            board = getInitialBoard();
        }
        var whoseTurn = turnIndexBeforeMove === 0 ? 'R' : 'G',
            boardAfterMove,
            firstOperation,
            //nextMoveType,
            //type,
            winner,
            pawn,
            base;
        winner = getWinner(board);
        if (winner !== 'W' && winner !== '1') {
            throw new Error("Can only make a move if the game is not over!");
        }

        if (board[from_row][from_col] !== whoseTurn) {
            throw new Error("One can only move his own pawn!");
        }
        if (board[to_row][to_col] === whoseTurn) {
            throw new Error("One cannot arrive on a place with his own pawn!");
        }
        if (!checkPath(board, dice, to_row, to_col, from_row, from_col)) {
            throw new Error("One cannot go through a barricade or move steps different from the dice value!",
            dice, to_row, to_col, from_row, from_col);
        }

        boardAfterMove = angular.copy(board);

        boardAfterMove[from_row][from_col] = '0';
        boardAfterMove[to_row][to_col] = whoseTurn;

        if (board[to_row][to_col] === '0' || board[to_row][to_col] === 'W') {
            // arrive on an empty place or the winning spot
            winner = getWinner(boardAfterMove);
            if (winner !== 'W' && winner !== '1') {
                // Game over
                firstOperation = {endMatch: {endMatchScores:
                    winner === 'R' ? [1, 0] : [0, 1]}};
            } else {
                firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
            }
            //nextMoveType = 'dice';
        } else if (board[to_row][to_col] === '1') {
            // arrive on a barricade
            winner = getWinner(boardAfterMove);
            if (winner !== 'W' && winner !== '1') {
                firstOperation = {endMatch: {endMatchScores:
                    winner === 'R' ? [1, 0] : [0, 1]}};
            } else {
                firstOperation = {setTurn: {turnIndex: turnIndexBeforeMove}};
            }
            //nextMoveType = 'barricade';
        } else {
            // arrive on an opponent's pawn
            pawn = board[to_row][to_col];
            base = send2Base(board, pawn);
            boardAfterMove[base[0]][base[1]] = pawn;

            firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
            //nextMoveType = 'dice';
        }
        return [firstOperation,
            {set: {key: 'type', value: "normal"}},
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: {to_row: to_row, to_col: to_col, from_row: from_row, from_col: from_col}}},
            {set: {key: 'dice', value: dice}}];
    }

    function placeBarricade(board, to_row, to_col, turnIndexBeforeMove) {
        if (board === undefined) {
            throw new Error("Cannot place barricade");
        }
        if (board[to_row][to_col] !== '0') {
            throw new Error("One can only place barricade at an empty place!");
        }
        var boardAfterMove = angular.copy(board);
        boardAfterMove[to_row][to_col] = '1';
        return [{setTurn: {turnIndex: 1 - turnIndexBeforeMove}},
            //{set: {key: 'type', value: 'dice'}}
            {set: {key: 'type', value: 'barricade'}},
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: {to_row: to_row, to_col: to_col}}},
            {set: {key: 'dice', value: -1}}
            ];
    }

    function createMove(board, type, dice, to_row, to_col, from_row, from_col, turnIndexBeforeMove) {
        if (type === 'normal') {
            return createNormalMove(board, dice, to_row, to_col, from_row, from_col, turnIndexBeforeMove);
        }
        return placeBarricade(board, to_row, to_col, turnIndexBeforeMove);
    }

    function createDiceMove(dice, turnIndex) {
        var move = [{setTurn: {turnIndex: turnIndex}}, {set: {key: "type", value: "dice"}}];
        if (dice === undefined) {
            dice = null;
        }
        move.push({setRandomInteger: {key: "dice", from: 1, to : 7}});
        return move;
    }

    function createPassMove(board, dice, turnIndexBeforeMove) {
        if (board === undefined) {
            board = getInitialBoard();
        }
        return [
            {setTurn: {turnIndex: 1 - turnIndexBeforeMove}},
            {set: {key: 'type', value: 'normal'}},
            {set: {key: 'board', value: board}},
            {set: {key: 'delta', value: {}}},
            {set: {key: 'dice', value: dice}}
        ];
    }

    function isMoveOk(params) {
        var move = params.move,
            turnIndexBeforeMove = params.turnIndexBeforeMove,
            stateBeforeMove = params.stateBeforeMove,
            type,
            dice,
            expectedMove,
            deltaValue,
            board,
            to_row,
            to_col,
            from_row,
            from_col;

        try {
            type = move[1].set.value;//stateBeforeMove[3].set.value;//

            if (type === "dice") {
                // Example dice move:
                // [{setTurn: {turnIndex : 1}},
                // {set: {key: 'type', value: 'dice'}},
                // {setRandomInteger: {key: "dice", from: 1, to: 7}}]
                dice = stateBeforeMove.dice;
                expectedMove = createDiceMove(dice, turnIndexBeforeMove);
                if (!angular.equals(move, expectedMove)) {
                    return false;
                }
            } else {
                // Example move:
                // [{setTurn: {turnIndex : 1}},
                // {set: {key: 'type', value: 'normal'}}],
                // {set: {key: 'board', value: [...]}},
                // {set: {key: 'delta', value: {to_row: 13, to_col: 2, from_row: 14, from_col: 1}}},
                // {set: {key: 'dice', value: 1}}
                deltaValue = move[3].set.value;
                dice = move[4].set.value;

                board = stateBeforeMove.board;

                if (type === "normal" && Object.keys(deltaValue).length === 0) {
                    expectedMove = createPassMove(board, dice, turnIndexBeforeMove);
                } else {
                    to_row = deltaValue.to_row;
                    to_col = deltaValue.to_col;
                    from_row = deltaValue.from_row;
                    from_col = deltaValue.from_col;

                    expectedMove = createMove(board, type, dice, to_row, to_col, from_row, from_col, turnIndexBeforeMove);
                }

                if (!angular.equals(move, expectedMove)) {
                    return false;
                }
            }
        } catch (e) {
            return false;
        }
        return true;
    }

    function getRandomPossibleMove(board, type, dice, turnIndexBeforeMove) {
        var whoseTurn = turnIndexBeforeMove === 0 ? 'R' : 'G',
            i,
            j,
            targetRow,
            targetCol,
            destinations;
        if (type === "normal") {
            for (i = 0; i < 16; i += 1) {
                for (j = 0; j < 17; j += 1) {
                    if (board[i][j] === whoseTurn) {
                        if (i >= 14) {
                            targetRow = 13;
                            targetCol = Math.floor(j / 4) * 4 + 2;
                            destinations = getPossibleDestination(board, dice - 1,
                                targetRow, targetCol, -1, -1);
                        } else {
                            destinations = getPossibleDestination(board, dice,
                                i, j, -1, -1);
                        }
                        if (destinations.length !== 0) {
                            return createMove(board, "normal", dice,
                                destinations[0][0], destinations[0][1],
                                i, j, turnIndexBeforeMove);
                        }
                        if (i >= 14) {
                            break;
                        }
                    }
                }
            }
            return createPassMove(board, dice, turnIndexBeforeMove);
        } else if (type === "barricade") {
            for (i = 13; i > 0; i -= 1) {
                for (j = 0; j < 17; j += 1) {
                    if (board[i][j] === "0") {
                        return createMove(board, "barricade", dice, i, j, -1, -1,
                            turnIndexBeforeMove);
                    }
                }
            }
        } else {
            return createDiceMove(dice, turnIndexBeforeMove);
        }
    }

    return {
        getInitialBoard: getInitialBoard,
        createMove: createMove,
        createDiceMove: createDiceMove,
        createPassMove: createPassMove,
        isMoveOk: isMoveOk,
        getRandomPossibleMove: getRandomPossibleMove
    };
});
;angular.module('myApp')
    .controller('Ctrl',
            ['$scope', '$log', '$timeout', 'gameService', 'stateService', 'gameLogic', 'resizeGameAreaService',
            function ($scope, $log, $timeout, gameService, stateService, gameLogic, resizeGameAreaService) {

                'use strict';

                resizeGameAreaService.setWidthToHeight(1.0625);

                function sendComputerNormalMove() {
                    gameService.makeMove(gameLogic.getRandomPossibleMove($scope.board,
                        "normal", $scope.dice, $scope.turnIndex));
                }

                function sendComputerBarricadeMove() {
                    gameService.makeMove(gameLogic.getRandomPossibleMove($scope.board,
                        "barricade", -1, $scope.turnIndex));
                }

                function sendDiceMove() {
                    $log.info(["Dice roll for", $scope.turnIndex]);
                    gameService.makeMove(gameLogic.createDiceMove($scope.dice, $scope.turnIndex));
                }

                function updateUI(params) {
                    var lastType = params.stateAfterMove.type;
                    $scope.board = params.stateAfterMove.board;
                    $scope.delta = params.stateAfterMove.delta;
                    $scope.dice = params.stateAfterMove.dice;
                    if ($scope.dice !== null) {
                        $log.info(["Dice value ", $scope.dice]);
                    }
                    if ($scope.board === undefined) {
                        $log.info(["Initializing"]);
                        $scope.board = gameLogic.getInitialBoard();
                    }
                    $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
                        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
                    $scope.turnIndex = params.turnIndexAfterMove;
                    if (params.turnIndexBeforeMove !== params.turnIndexAfterMove) {
                        $log.info(["Change player..."]);
                        $scope.dice = null;
                        $scope.typeExpected = "dice";
                    } else {
                        $log.info(["Player continues..."]);
                        if (lastType === "normal") {
                            $scope.typeExpected = "barricade";
                        } else {
                            $scope.typeExpected = "normal";
                        }
                        $log.info(["Player continues...", $scope.typeExpected]);
                    }

                    // Is it the computer's turn?
                    if ($scope.isYourTurn &&
                            params.playersInfo[params.yourPlayerIndex].playerId === '') {
                        $log.info(["Computer turn"]);
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
                        $log.info(["Player turn with dice", $scope.dice]);
                        if (!$scope.dice) {
                            $timeout(sendDiceMove, 500);
                        }
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
                        $log.info(["Wait until your turn"]);
                        return;
                    }
                    if (!$scope.dice) { // wait until dice rolls
                        $log.info(["Wait until dice rolls"]);
                        return;
                    }

                    // normal move, get a pawn and place it.
                    if ($scope.typeExpected === "normal") {
                        $log.info(["Make a normal move:"]);
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
                        $log.info(["Place a barricade"]);
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
                          $log.info(["Wait until your turn"]);
                          return;
                      }
                      if (!$scope.dice) { // wait until dice rolls
                          $log.info(["Wait until dice rolls"]);
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

                /*$scope.getImageSrc = function (row, col) {
                    var cell = $scope.board[row][col];
                    if (row === 0 && col === 8 && cell === "W") {
                        return "imgs/WinningSpot.png";
                    }

                    return cell === "0" ? "imgs/EmptySpot.png"
                            : cell === "1" ? "imgs/Barricade.png"
                                : cell === "R" ? "imgs/Red.png"
                                    : cell === "G" ? "imgs/Green.png"
                                        : cell === "Y" ? "imgs/Yellow.png"
                                            : cell === "B" ? "imgs/Blue.png" : "";
                };*/
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
                            //console.log('Error: dice out of range ' + $scope.dice);
                            return 'imgs/6.png';
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
