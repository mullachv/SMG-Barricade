var game;
(function (game) {
    // var $translate = translate;
    // var $scope = $rootScope;
    // var $log = log;
    var gameArea = document.getElementById("gameArea");
    var rowsNum = 16;
    var colsNum = 17;
    var draggingStartedRowCol = null;
    var draggingPiece = null;
    var nextZIndex = 61;
    var board;
    var dice;
    var typeExpected;
    var delta;
    var myPiece;
    var isYourTurn;
    var msg;
    var delta;
    var turnIndex;
    function init() {
        console.log("Translation of 'BARRICADE_GAME' is " + translate('BARRICADE_GAME'));
        resizeGameAreaService.setWidthToHeight(1.0625);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
        gameArea = document.getElementById("gameArea");
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
    }
    game.init = init;
    function setGlow(row, col, value) {
        var dest;
        if (row > 13) {
            row = 13;
            col = Math.floor(col / 4) * 4 + 2;
            dest = gameLogic.getPossibleDestination(board, dice - 1, row, col, -1, -1);
        }
        else {
            dest = gameLogic.getPossibleDestination(board, dice, row, col, -1, -1);
        }
        for (var i = 0; i < dest.length; i++) {
            document.getElementById("e2e_test_div_" + dest[i][0] + "x" + dest[i][1]).style.border = value ? '#0000cc 1px dashed' : 'none';
        }
    }
    function handleDragEvent(type, clientX, clientY) {
        // Center point in gameArea
        var x = clientX - gameArea.offsetLeft;
        var y = clientY - gameArea.offsetTop;
        // Is outside gameArea?
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
            if (!draggingPiece) {
                return;
            }
            // Drag the piece where the touch is (without snapping to a square).
            var size = getSquareWidthHeight();
            setDraggingPieceTopLeft({ top: y - size.height / 2, left: x - size.width / 2 }, typeExpected);
            if (type === "touchend") {
                if (typeExpected === 'normal') {
                    setGlow(draggingStartedRowCol.row, draggingStartedRowCol.col, false);
                }
                if (typeExpected === 'barricade') {
                    draggingPiece.style.display = 'none';
                }
            }
        }
        else {
            // Inside gameArea
            var col = Math.floor(colsNum * x / gameArea.clientWidth);
            var row = Math.floor(rowsNum * y / gameArea.clientHeight);
            if (type === "touchstart" && !draggingStartedRowCol) {
                if (board[row][col] === myPiece && isYourTurn && typeExpected === "normal") {
                    draggingStartedRowCol = { row: row, col: col };
                    draggingPiece = document.getElementById("e2e_test_piece" + myPiece + "_" + row + "x" + col);
                    console.log("dragging piece: " + draggingPiece);
                    console.log("my piece: " + myPiece);
                    draggingPiece.style['z-index'] = ++nextZIndex;
                    setGlow(row, col, true);
                }
                else if (isYourTurn && typeExpected === 'barricade') {
                    draggingStartedRowCol = { row: row, col: col };
                    draggingPiece = document.getElementById("spareBarricade");
                    setDraggingPieceTopLeft(getSquareTopLeft(row, col), 'barricade');
                    draggingPiece.style['z-index'] = 60;
                    draggingPiece.style.display = 'inline';
                }
                else if (row === 8 && (col === 15 || col === 16)) {
                    draggingStartedRowCol = { row: row, col: col };
                    draggingPiece = document.getElementById("e2e_test_btn");
                }
            }
            if (!draggingPiece) {
                return;
            }
            if (type === "touchend") {
                var frompos = draggingStartedRowCol;
                var topos = { row: row, col: col };
                if (row === 8 && (col === 15 || col === 16)) {
                    if (typeExpected === 'normal') {
                        setGlow(draggingStartedRowCol.row, draggingStartedRowCol.col, false);
                    }
                    passMove();
                }
                else {
                    dragDone(frompos, topos);
                }
            }
            else {
                // Drag continue
                setDraggingPieceTopLeft(getSquareTopLeft(row, col), typeExpected);
            }
        }
        if (type === "touchend" ||
            type === "touchcancel" || type === "touchleave") {
            // drag ended
            // return the piece to it's original style (then angular will take care to hide it).
            setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col), typeExpected);
            if (type !== "touchend" && typeExpected === 'normal') {
                setGlow(draggingStartedRowCol.row, draggingStartedRowCol.col, false);
            }
            if (type !== "touchend" && typeExpected === 'barricade') {
                draggingPiece.style.display = 'none';
            }
            draggingStartedRowCol = null;
            //draggingPiece.removeAttribute("style"); // trying out
            draggingPiece = null;
        }
    }
    function isInvalidPos(topLeft) {
        var size = getSquareWidthHeight();
        var row = Math.floor(topLeft.top / size.height);
        var col = Math.floor(topLeft.left / size.width);
        return row < 0 || row > 13 || col < 0 || col > 16 || board[row][col] === "";
    }
    function setDraggingPieceTopLeft(topLeft, moveType) {
        var originalSize;
        var row = draggingStartedRowCol.row;
        var col = draggingStartedRowCol.col;
        if (isInvalidPos(topLeft)) {
            return;
        }
        if (moveType === 'barricade') {
            originalSize = getSquareTopLeft(0, 0);
        }
        else {
            originalSize = getSquareTopLeft(row, col);
        }
        draggingPiece.style.left = topLeft.left - originalSize.left + "px";
        draggingPiece.style.top = topLeft.top - originalSize.top + "px";
    }
    function getSquareWidthHeight() {
        return {
            width: gameArea.clientWidth / colsNum,
            height: gameArea.clientHeight / rowsNum
        };
    }
    function getSquareTopLeft(row, col) {
        var size = getSquareWidthHeight();
        return { top: row * size.height, left: col * size.width };
    }
    function dragDone(frompos, topos) {
        // $rootScope.$apply(function () {
        var lmsg = "Dragged piece " + frompos.row + "x" + frompos.col + " to square " + topos.row + "x" + topos.col;
        console.log(lmsg);
        msg = lmsg;
        // Update piece in board
        if (!isYourTurn) {
            console.log("Not your turn, so not updating the board");
            return;
        }
        try {
            isYourTurn = false;
            if (typeExpected === 'normal') {
                setGlow(frompos.row, frompos.col, false);
                gameService.makeMove(gameLogic.createMove(board, "normal", dice, topos.row, topos.col, frompos.row, frompos.col, turnIndex));
                if (board[topos.row][topos.col] === '1') {
                    //$log.info(["get a barricade"]);
                    draggingStartedRowCol = { row: topos.row, col: topos.col };
                    draggingPiece = document.getElementById("spareBarricade");
                    setDraggingPieceTopLeft(getSquareTopLeft(topos.row, topos.col), 'barricade');
                    draggingPiece.style['z-index'] = 0;
                    draggingPiece.style.display = 'inline';
                }
            }
            else if (typeExpected === 'barricade') {
                draggingPiece.style.display = 'none';
                gameService.makeMove(gameLogic.createMove(board, "barricade", dice, topos.row, topos.col, -1, -1, turnIndex));
            }
        }
        catch (e) {
            console.log(["Illegal Move", typeExpected, dice, frompos.row, frompos.col, topos.row, topos.col]);
            isYourTurn = true;
            setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col), typeExpected);
        }
        // });
    }
    function getIntegersTill(number) {
        var res = [];
        for (var i = 0; i < number; i++) {
            res.push(i);
        }
        return res;
    }
    game.rows = getIntegersTill(rowsNum);
    game.cols = getIntegersTill(colsNum);
    rowsNum = rowsNum;
    colsNum = colsNum;
    function sendComputerNormalMove() {
        //gameService.makeMove(gameLogic.getRandomPossibleMove($scope.board, "normal", $scope.dice, $scope.turnIndex));
        gameService.makeMove(aiService.createComputerMove(board, "normal", dice, turnIndex));
    }
    function sendComputerBarricadeMove() {
        //gameService.makeMove(gameLogic.getRandomPossibleMove($scope.board, "barricade", -1, $scope.turnIndex));
        gameService.makeMove(aiService.createComputerMove(board, "barricade", -1, turnIndex));
    }
    function sendDiceMove() {
        gameService.makeMove(gameLogic.createDiceMove(dice, turnIndex));
    }
    function updateUI(params) {
        var lastType = params.stateAfterMove.type;
        board = params.stateAfterMove.board;
        delta = params.stateAfterMove.delta;
        dice = params.stateAfterMove.dice;
        var piece;
        switch (params.yourPlayerIndex) {
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
        myPiece = piece;
        console.log("my piece: " + myPiece);
        if (board === undefined) {
            board = gameLogic.getInitialBoard();
        }
        isYourTurn = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove &&
            params.endMatchScores === null; // it's my turn
        turnIndex = params.turnIndexAfterMove;
        if (params.turnIndexBeforeMove !== params.turnIndexAfterMove) {
            dice = null;
            typeExpected = "dice";
        }
        else {
            if (lastType === "normal") {
                typeExpected = "barricade";
            }
            else {
                typeExpected = "normal";
            }
        }
        // Is it the computer's turn?
        if (isYourTurn &&
            params.playersInfo[params.yourPlayerIndex].playerId === '') {
            isYourTurn = false; // to make sure the UI won't send another move.
            // Waiting 0.5 seconds to let the move animation finish; if we call aiService
            // then the animation is paused until the javascript finishes.
            if (!dice) {
                $timeout(sendDiceMove, 500);
            }
            else if (typeExpected === "normal") {
                $timeout(sendComputerNormalMove, 500);
            }
            else if (typeExpected === "barricade") {
                $timeout(sendComputerBarricadeMove, 500);
            }
        }
        else if (isYourTurn) {
            if (!dice) {
                $timeout(sendDiceMove, 500);
            }
        }
        // animation
        var diceImg = document.getElementById('e2e_test_dice');
        if (lastType === "dice") {
            diceImg.className = 'spinIn';
        }
        if (typeExpected === "dice") {
            diceImg.className = 'spinOut';
        }
        if (delta) {
            var from_row = delta.from_row;
            var from_col = delta.from_col;
            var to_row = delta.to_row;
            var to_col = delta.to_col;
            var topLeftOld = getSquareTopLeft(from_row, from_col);
            var topLeftNew = getSquareTopLeft(to_row, to_col);
            var pieceImg;
            if (lastType === 'normal') {
                pieceImg = document.getElementById('e2e_test_piece' + piece + '_' + from_row + 'x' + from_col);
                if (pieceImg !== null) {
                    //$log.info(['original place', from_row, from_col]);
                    pieceImg.className = 'fadeout';
                    pieceImg.style.top = topLeftOld.top - topLeftNew.top + 'px';
                    pieceImg.style.left = topLeftOld.left - topLeftNew.left + 'px';
                    pieceImg.className = 'slowlyAppear';
                }
                else {
                }
            }
            else if (lastType === 'barricade') {
                pieceImg = document.getElementById('e2e_test_piece1' + '_' + to_row + 'x' + to_col);
                if (pieceImg !== null) {
                    pieceImg.style.top = topLeftOld.top - topLeftNew.top + 'px';
                    pieceImg.style.left = topLeftOld.left - topLeftNew.left + 'px';
                    pieceImg.className = 'slowlyAppear';
                }
                else {
                    console.log(['fail to catch barricade', to_row, to_col]);
                }
            }
        }
    }
    //window.e2e_test_stateService = stateService; // to allow us to load any state in our e2e tests.
    var prev_row = null;
    var prev_col = null;
    game.cellClicked = function (row, col) {
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isYourTurn) {
            return;
        }
        if (!dice) {
            return;
        }
        // normal move, get a pawn and place it.
        if (typeExpected === "normal") {
            // choose the start point
            if (prev_row === null || prev_col === null) {
                if (game.shouldShowImage(row, col) &&
                    board[row][col] !== 'W' &&
                    board[row][col] !== '0') {
                    prev_row = row;
                    prev_col = col;
                    console.log(["Choose a pawn:", row, col]);
                }
                return;
            }
            else {
                try {
                    // to prevent making another move
                    isYourTurn = false;
                    console.log(["Choose a destination", row, col]);
                    gameService.makeMove(gameLogic.createMove(board, "normal", dice, row, col, prev_row, prev_col, turnIndex));
                    prev_row = null;
                    prev_col = null;
                }
                catch (e) {
                    console.log(["Illegal move to ", row, col, " from ", prev_row, prev_col]);
                    isYourTurn = true;
                    prev_row = null;
                    prev_col = null;
                    return;
                }
            }
        }
        else if (typeExpected === "barricade") {
            if (prev_row === null || prev_col === null) {
                console.log(["Place a barricade at:", row, col]);
                prev_row = null;
                prev_col = null;
            }
            try {
                isYourTurn = false;
                console.log(["Choose a position", row, col]);
                gameService.makeMove(gameLogic.createMove(board, "barricade", dice, row, col, -1, -1, turnIndex));
            }
            catch (e) {
                console.log(["Illegal to place a barricade at:", row, col]);
                isYourTurn = true;
                return;
            }
        }
    };
    function passMove() {
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isYourTurn) {
            return;
        }
        if (!dice) {
            return;
        }
        if (typeExpected === "normal") {
            try {
                isYourTurn = false;
                gameService.makeMove(gameLogic.createPassMove(board, dice, turnIndex));
            }
            catch (e) {
                console.log(["Illegal pass move"]);
                return;
            }
        }
    }
    game.shouldShowImage = function (row, col) {
        var cell = board[row][col];
        return cell !== "";
    };
    game.isWinSpot = function (row, col) {
        return board[row][col] === 'W';
    };
    game.isPieceR = function (row, col) {
        return board[row][col] === 'R';
    };
    game.isPieceG = function (row, col) {
        return board[row][col] === 'G';
    };
    game.isPieceB = function (row, col) {
        return board[row][col] === 'B';
    };
    game.isPieceY = function (row, col) {
        return board[row][col] === 'Y';
    };
    game.isBarricade = function (row, col) {
        return board[row][col] === '1';
    };
    game.isEmptySpot = function (row, col) {
        return board[row][col] === '0';
    };
    game.isRedStart = function (row, col) {
        return isStart(0, row, col);
    };
    game.isGreenStart = function (row, col) {
        return isStart(1, row, col);
    };
    game.isYellowStart = function (row, col) {
        return isStart(2, row, col);
    };
    game.isBlueStart = function (row, col) {
        return isStart(3, row, col);
    };
    game.isNormalSpot = function (row, col) {
        return !game.isWinSpot(row, col) && !game.isRedStart(row, col) &&
            !game.isGreenStart(row, col) && !game.isYellowStart(row, col) &&
            !game.isBlueStart(row, col);
    };
    function isStart(index, row, col) {
        var targetCol = index * 4 + 2;
        return row === 13 && col === targetCol ||
            row === 14 && (col === targetCol - 1 || col === targetCol || col === targetCol + 1) ||
            row === 15 && (col === targetCol - 1 || col === targetCol + 1);
    }
    game.getDiceSrc = function () {
        switch (dice) {
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
    game.shouldSlowlyAppear = function (row, col) {
        return delta !== undefined &&
            delta.to_row === row && delta.to_col === col;
    };
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        BARRICADE_GAME: "Barricade",
        PASS: "Pass",
        RULES_OF_BARRICADE: "Rules of Barricade",
        CLOSE: "Start Game",
        RULES_SLIDE0: "Each player's 5 pawns are placed in their houses at the bottom of the board. There are also 11 barricades.",
        RULES_SLIDE1: "All the players start from the first square in front of their house. Pawns must move according to the exact number thrown.",
        RULES_SLIDE2: "Pawns move forward, backward or sideways, but they have to maintain the same direction during a single move.",
        RULES_SLIDE3: "A pawn may pass other pawns, but only one pawn may occupy each square.",
        RULES_SLIDE4: "In case a square is occupied by another player's pawn, the latter is sent back to its house.",
        RULES_SLIDE5: "A player may only pass his turn if none of his pawns can be moved the exact number thrown.",
        RULES_SLIDE6: "Barricades are obstacles that may not be passed. A pawn must land on a barricade in order to remove it.",
        RULES_SLIDE7: "The player then places the barricade back on another unoccupied square, anywhere on the board except houses.",
        RULES_SLIDE8: "The winner is the first player to reach the goal square with one of his or her pawns."
    });
    game.init();
});
