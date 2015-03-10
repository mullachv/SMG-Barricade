angular.module('myApp')
  .controller('Ctrl',
      ['$scope', '$log', '$timeout', 'gameService', 'gameLogic', 'resizeGameAreaService',
      function ($scope, $log, $timeout, gameService, gameLogic, resizeGameAreaService) {

    'use strict';

    resizeGameAreaService.setWidthToHeight(1.0625);

    function sendComputerMove() {
      gameService.makeMove(gameLogic.createRandomPossibleMove($scope.board, $scope.turnIndex,
          // at most 1 second for the AI to choose a move (but might be much quicker)
          {millisecondsLimit: 1000}));
    }

    function updateUI(params) {
      $scope.board = params.stateAfterMove.board;
      $scope.delta = params.stateAfterMove.delta;
      if ($scope.board === undefined) {
        $scope.board = gameLogic.getInitialBoard();
      }
      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;

      // Is it the computer's turn?
      if ($scope.isYourTurn &&
          params.playersInfo[params.yourPlayerIndex].playerId === '') {
        $scope.isYourTurn = false; // to make sure the UI won't send another move.
        // Waiting 0.5 seconds to let the move animation finish; if we call aiService
        // then the animation is paused until the javascript finishes.
        $timeout(sendComputerMove, 500);
      }
    }
    //window.e2e_test_stateService = stateService; // to allow us to load any state in our e2e tests.

    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);
      if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (!$scope.isYourTurn) {
        return;
      }
      try {
        var move = gameLogic.createMove($scope.board, row, col, $scope.turnIndex);
        $scope.isYourTurn = false; // to prevent making another move
        gameService.makeMove(move);
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col]);
        return;
      }
    };
    $scope.shouldShowImage = function (row, col) {
      var cell = $scope.board[row][col];
      return cell !== "";
    };
    $scope.getImageSrc = function (row, col) {
      var cell = $scope.board[row][col];
      if (row === 0 && col === 8 && cell === "0") {
        return "WinningSpot.png";
      }
      return cell === "0" ? "EmptySpot.png"
          : cell === "1" ? "Barricade.png"
          : cell === "R" ? "RedPawn.png"
          : cell === "G" ? "GreenPawn.png"
          : cell === "Y" ? "YellowPawn.png"
          : cell === "B" ? "BluePawn.png";
    };
    $scope.shouldSlowlyAppear = function (row, col) {
      return $scope.delta !== undefined &&
          $scope.delta.row === row && $scope.delta.col === col;
    };

    gameService.setGame({
      gameDeveloperEmail: "hy821@nyu.edu",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 4,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }]);