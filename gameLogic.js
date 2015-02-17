'use strict';

angular.module('myApp', []).factory('gameLogic', function{} {
	
	function getInitialBoard() { // 15 * 16
		return [['','','','','','','','','W','','','','','','','',''], // 0
		['0','0','0','0','0','0','0','0','1','0','0','0','0','0','0','0','0'], // 1
		['0','','','','','','','','','','','','','','','','0'], // 2
		['0','0','0','0','0','0','0','0','1','0','0','0','0','0','0','0','0'], // 3
		['','','','','','','','','1','','','','','','','',''], // 4
		['','','','','','','0','0','1','0','0','','','','','',''], // 5
		['','','','','','','0','','','','0','','','','','',''], // 6
		['','','','','0','0','1','0','0','0','1','0','0','','','',''], // 7
		['','','','','0','','','','','','','','0','','','',''], // 8
		['','','0','0','0','0','0','0','0','0','0','0','0','0','0','',''], // 9
		['','','0','','','','0','','','','0','','','','0','',''], // 10
		['1','0','0','0','1','0','0','0','1','0','0','0','1','0','0','0','1'], // 11
		['0','','','','0','','','','0','','','','0','','','','0'], // 12
		['0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0'], // 13
		['','R','R','R','','G','G','G','','','','','','','','',''], // 14
		['','R','','R','','G','','G','','','','','','','','','']]; // 15
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
		var left = [];
		var right = [];
		var up = [];
		var down = [];
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
			left = getPossibleDestination(board, dice - 1, curr_row, curr_col - 1, curr_row, curr_col);
		}
		var res = left.concat(right, up, down);
		return res;
	}

	function checkPath(board, dice, to_row, to_col, from_row, from_col) {
		var destinations = getPossibleDestination(board, dice, from_row, from_col, -1, -1);
		var i = 0;
		for (; i < destinations.length; i++) {
			if (to_row === destinations[i][0] && to_col === destinations[i][1]) {
				return true;
			}
		}

		return false;
	}

	function send2Base(board, pawn) {
		// find the available base place
		int base = pawn === 'R' ? 0 : ( pawn === 'G' ? 1 : ( pawn === 'Y' ? 2 : 3));
		if (pawn === 'R')
		var start_row = 15;
		var start_col = base * 4 + 1;
		if (board[start_row][start_col] === '0') {
			return [start_row][start_col];
		}
		if (board[start_row][start_col + 2] === '0') {
			return [start_row][start_col];
		}
		start_row = start_row - 1;
		var end_col = start_col + 3;
		for (; start_col < end_col; start_col += 1) {
			if (board[start_row][start_col] === '0') {
				return [start_row][start_col];
			}
		}
		throw new Error("Possible cheating on the number of the pawns");
	}

	function createNormalMove(board, dice, to_row, to_col, from_row, from_col, turnIndexBeforeMove) {
		if (board === undefined) {
			board = getInitialBoard();
		}
		if (getWinner(board) !== 'W') {
			throw new Error("Can only make a move if the game is not over!");
		}
		var whoseTurn = turnIndexBeforeMove === 0 ? 'G' : 'Y';
		if (board[from_row][from_col] !== whoseTurn) {
			throw new Error("One can only move his own pawn!");
		}
		if (board[to_row][to_col] === whoseTurn) {
			throw new Error("One cannot arrive on a place with his own pawn!");
		}
		if (!checkPath(board, dice, to_row, to_col, from_row, from_col)) {
			throw new Error("One cannot go through a barricade or move steps different from the dice value!")
		}

		var boardAfterMove = angular.copy(board);
		var firstOperation;
		var nextMoveType;
			
		boardAfterMove[from_row][from_col] = '0';
		boardAfterMove[to_row][to_col] = whoseTurn;

		if (board[to_row][to_col] === '0') {
			// arrive on an empty place
			var winner = getWinner(boardAfterMove);
			if (winner !== 'W') {
				// Game over
				firstOperation = {endMatch: {endMatchScores: 
					(winner === 'G' ? [1, 0] : [0, 1])}};
			} else {
				firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
			}
			nextMoveType = 'normal';
		} else if (board[to_row][to_col] === '1') {
			// arrive on a barricade

			firstOperation = {setTurn: {turnIndex: turnIndexBeforeMove}};
			nextMoveType = 'barricade';
		} else {
			// arrive on an opponent's pawn
			var pawn = board[to_row][to_col]
			base = send2Base(board, pawn);
			boardAfterMove[base[0]][base[1]] = pawn;

			firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
			nextMoveType = 'normal';
		}
		return [firstOperation,
		{set: {key: 'board', value: boardAfterMove}},
		{set: {key: 'delta', value: {dice: dice, to_row: to_row, to_col: to_col, from_row: from_row, from_col: from_col}}},
		{set: {key: 'type', value: nextMoveType}}];

	}

	function placeBarricade(board, to_row, to_col, turnIndexBeforeMove) {
		if (board === undefined) {
			throw new Error("Cannot place barricade");
		}
		if (board[to_row][to_col] !== '0') {
			throw new Erro("One can only place barricade at an empty place!");
		}
		var boardAfterMove = angular.copy(board);
		boardAfterMove[to_row][to_col] = '1';
		return [{setTurn: {turnIndex: 1 - turnIndexBeforeMove}},
		{set: {key: 'board', value: boardAfterMove}},
		{set: {key: 'delta', value: {to_row: to_row, to_col: to_col}}},
		{set: {key: 'type', value: 'normal'}}
		]
	}
	
	function createMove(board, type, dice, to_row, to_col, from_row, from_col, turnIndexBeforeMove) {
		if (type === 'normal') {
			return createNormalMove(board, dice, to_row, to_col, from_row, from_col, turnIndexBeforeMove);
		} else {
			return placeBarricade(board, to_row, to_col, turnIndexBeforeMove);
		}
	}

	function isMoveOk(params) {
		var move = params.move;
		var turnIndexBeforeMove = params.turnIndexBeforeMove;
		var stateBeforeMove = params.stateBeforeMove;

		try {
			// Example move:
			// [{setTurn: {turnIndex : 1}},
			//	{set: {key: 'board', value: [...]}},
			//	{set: {key: 'delta', value: {dice: 1, to_row: 13, to_col: 2, from_row: 14, from_col: 1}}},
			//	{set: {key: 'type', value: 'normal'}}]
			var type = move[3].set.value;

			var deltaValue = move[2].set.value;
			var dice = deltaValue.dice
			var to_row = deltaValue.to_row;
			var to_col = deltaValue.to_col;
			var from_row = deltaValue.from_row;
			var from_col = deltaValue.from_col;

			var board = stateBeforeMove.board;

			var expectedMove = createMove(board, type, dice, to_row, to_col, from_row, from_col, turnIndexBeforeMove)

			if (!angular.equals(move, expectedMove)) {
				return false;
			}
		} catch (e) {
			return false;
		}
		return true;
	}

	return {
		getInitialBoard: getInitialBoard,
		createMove: createMove,
		isMoveOk: isMoveOk
	}
});