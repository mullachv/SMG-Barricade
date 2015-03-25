angular.module('myApp')
    .controller('Ctrl',
            ['$scope', '$log', '$timeout', 'gameService', 'gameLogic', 'resizeGameAreaService',
            function ($scope, $log, $timeout, gameService, gameLogic, resizeGameAreaService) {

                'use strict';

                resizeGameAreaService.setWidthToHeight(1.0625);

                function sendComputerMove() {
                    var turnIndex = $scope.turnIndex;
                    sendDiceMove();

                    gameService.makeMove(gameLogic.createRandomPossibleMove($scope.board,
                        "normal", $scope.dice, $scope.turnIndex));

                    if ($scope.turnIndex === turnIndex) {
                        gameService.makeMove(gameLogic.createRandomPossibleMove($scope.board,
                            "barricade", -1, $scope.turnIndex));
                    }
                }

                function sendDiceMove() {
                  gameService.makeMove(gameLogic.createDiceMove($scope.dice, $scope.turnIndex));
                }

                function updateUI(params) {
                    var lastType = params.stateAfterMove.type;
                    $scope.board = params.stateAfterMove.board;
                    $scope.delta = params.stateAfterMove.delta;
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
                        $timeout(sendComputerMove, 500);
                    } else {
                        if ($scope.dice = null) {
                            $timeout(sendDiceMove, 500);
                        }
                    }
                }
                //window.e2e_test_stateService = stateService; // to allow us to load any state in our e2e tests.

                var prev_row = null;
                var prev_col = null;
                $scope.cellClicked = function (row, col) {
                    $log.info(["Clicked on cell:", row, col]);
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
                            }
                            return;
                        } else {
                            try { // choose the end point
                              // to prevent making another move
                                $scope.isYourTurn = false;
                                gameService.makeMove(gameLogic.createMove(
                                    $scope.board, "normal", $scope.dice, row, col,
                                        prev_row, prev_col, $scope.turnIndex));
                                prev_row = null;
                                prev_col = null;
                            } catch (e) {
                                $log.info(["Illegal move from ", row, col, " to ", prev_row, prev_col]);
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
                            gameService.makeMove(gameLogic.createMove(
                                $scope.board, "barricade", $scope.dice, row, col,
                                    -1, -1, $scope.turnIndex));
                        } catch (e) {
                            $log.info(["Illegal to place a barricade at:", row, col]);
                            return;
                        }
                    }
                };
                $scope.shouldShowImage = function (row, col) {
                    if (row === 15 && col === 8) {
                      return true;
                    }
                    var cell = $scope.board[row][col];
                    return cell !== "";
                };
                $scope.getImageSrc = function (row, col) {
                    var cell = $scope.board[row][col];
                    var dice = $scope.dice;
                    if (row === 0 && col === 8 && cell === "W") {
                        return "imgs/WinningSpot.png";
                    }

                    if (row === 15 && col === 8) {
                        switch(dice) {
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
                    }
                    return cell === "0" ? "imgs/EmptySpot.png"
                            : cell === "1" ? "imgs/Barricade.png"
                                : cell === "R" ? "imgs/Red.png"
                                    : cell === "G" ? "imgs/Green.png"
                                        : cell === "Y" ? "imgs/Yellow.png"
                                            : cell === "B" ? "imgs/Blue.png" : "";
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
