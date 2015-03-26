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
