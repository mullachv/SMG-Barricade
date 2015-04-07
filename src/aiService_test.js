describe("aiService", function() {

  'use strict';

  var _aiService;

  beforeEach(module("myApp"));

  beforeEach(inject(function (aiService) {
    _aiService = aiService;
  }));

  function getBoard(pieces) {
    var board =
      [['', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', ''],
      ['0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
      ['', '', '', '', '', '', '', '', '1', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '0', '0', '1', '0', '0', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '0', '', '', '', '0', '', '', '', '', '', ''],
      ['', '', '', '', '0', '0', '1', '0', '0', '0', '1', '0', '0', '', '', '', ''],
      ['', '', '', '', '0', '', '', '', '', '', '', '', '0', '', '', '', ''],
      ['', '', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '', ''],
      ['', '', '0', '', '', '', '0', '', '', '', '0', '', '', '', '0', '', ''],
      ['1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1'],
      ['0', '', '', '', '0', '', '', '', '0', '', '', '', '0', '', '', '', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
      ['', 'R', 'R', 'R', '', 'G', 'G', 'G', '', '', '', '', '', '', '', '', ''],
      ['', 'R', '', 'R', '', 'G', '', 'G', '', '', '', '', '', '', '', '', '']];

    var i, pos, piece;
    if (pieces) {
      for (i = 0; i < pieces.length; i++) {
        pos = pieces[i].pos;
        piece = pieces[i].piece;
        board[pos[0]][pos[1]] = piece;
      }
    }
    return board;
  }

  it("R move up left", function() {
    var move = _aiService.createComputerMove(
        getBoard(), "normal", 4, 0);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [12, 0], piece: 'R'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex : 1}},
      {set: {key: 'type', value: 'normal'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 12, to_col: 0, from_row: 14, from_col: 1}}},
      {set: {key: 'dice', value: 4}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("R move up left to barricade", function() {
    var move = _aiService.createComputerMove(
        getBoard(), "normal", 5, 0);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [11, 0], piece: 'R'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex : 0}},
      {set: {key: 'type', value: 'normal'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 11, to_col: 0, from_row: 14, from_col: 1}}},
      {set: {key: 'dice', value: 5}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("R place barricade", function() {
    var boardBeforeMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [11, 0], piece: 'R'}]);
    var move = _aiService.createComputerMove(
        boardBeforeMove, "barricade", -1, 0);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [11, 0], piece: 'R'}, {pos: [13, 5], piece: '1'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex : 1}},
      {set: {key: 'type', value: 'barricade'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 13, to_col: 5}}},
      {set: {key: 'dice', value: -1}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("G move to R", function() {
    var boardBeforeMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [12, 4], piece: 'R'}]);
    var move = _aiService.createComputerMove(
        boardBeforeMove, "normal", 4, 1);
    var boardAfterMove = getBoard([{pos: [14, 5], piece: '0'}, {pos: [12, 4], piece: 'G'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex : 0}},
      {set: {key: 'type', value: 'normal'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 12, to_col: 4, from_row: 14, from_col: 5}}},
      {set: {key: 'dice', value: 4}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("G move to win", function() {
    var boardBeforeMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [1, 8], piece: 'R'}, {pos: [1, 10], piece: 'G'}, {pos: [1, 7], piece: '1'}]);
    var move = _aiService.createComputerMove(
        boardBeforeMove, "normal", 3, 1);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [1, 8], piece: 'R'}, {pos: [0, 8], piece: 'G'}, {pos: [1, 7], piece: '1'}]);
    var expectedMove =
    [
      {endMatch: {endMatchScores: [0, 1]}},
      {set: {key: 'type', value: 'normal'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 0, to_col: 8, from_row: 1, from_col: 10}}},
      {set: {key: 'dice', value: 3}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("G place barricade", function() {
    var boardBeforeMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [1, 8], piece: 'G'}, {pos: [1,10], piece: 'R'}]);
    var move = _aiService.createComputerMove(
        boardBeforeMove, "barricade", -1, 1);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [1, 8], piece: 'G'}, {pos: [1, 10], piece: 'R'}, {pos: [1, 9], piece: '1'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex: 0}},
      {set: {key: 'type', value: 'barricade'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 1, to_col: 9}}},
      {set: {key: 'dice', value: -1}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("G pass", function() {
    var boardBeforeMove = getBoard([{pos: [14, 1], piece: '0'},
      {pos: [13, 6], piece: '1'}, {pos: [11, 0], piece: 'R'}]);
    var move = _aiService.createComputerMove(
        boardBeforeMove, "normal", 2, 1);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'},
      {pos: [13, 6], piece: '1'}, {pos: [11, 0], piece: 'R'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex: 0}},
      {set: {key: 'type', value: 'normal'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {}}},
      {set: {key: 'dice', value: 2}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("G block R ahead", function() {
    var boardBeforeMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [11, 8], piece: 'G'}, {pos: [8, 4], piece: 'R'}]);
    var move = _aiService.createComputerMove(
        boardBeforeMove, "barricade", -1, 1);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [11, 8], piece: 'G'}, {pos: [8, 4], piece: 'R'}, {pos: [7, 4], piece: '1'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex: 0}},
      {set: {key: 'type', value: 'barricade'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 7, to_col: 4}}},
      {set: {key: 'dice', value: -1}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("G block R behind", function() {
    var boardBeforeMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [11, 8], piece: 'R'}, {pos: [8, 4], piece: 'G'}]);
    var move = _aiService.createComputerMove(
        boardBeforeMove, "barricade", -1, 1);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [11, 8], piece: 'R'}, {pos: [8, 4], piece: 'G'}, {pos: [9, 2], piece: '1'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex: 0}},
      {set: {key: 'type', value: 'barricade'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 9, to_col: 2}}},
      {set: {key: 'dice', value: -1}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("G block R neck by neck", function() {
    var boardBeforeMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [9, 8], piece: 'G'}, {pos: [9, 3], piece: 'R'}, {pos: [11, 8], piece: '0'}]);
    var move = _aiService.createComputerMove(
        boardBeforeMove, "barricade", -1, 1);
    var boardAfterMove = getBoard([{pos: [14, 1], piece: '0'}, {pos: [14, 5], piece: '0'},
      {pos: [9, 8], piece: 'G'}, {pos: [9, 3], piece: 'R'}, {pos: [11, 8], piece: '0'},
      {pos: [9, 4], piece: '1'}]);
    var expectedMove =
    [
      {setTurn: {turnIndex: 0}},
      {set: {key: 'type', value: 'barricade'}},
      {set: {key: 'board', value: boardAfterMove}},
      {set: {key: 'delta', value: {to_row: 9, to_col: 4}}},
      {set: {key: 'dice', value: -1}}
    ];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

});
