describe('Barricade', function() {
  'use strict';

  beforeEach(function() {
    browser.get('http://localhost:32232/game.min.html');
  });

  function getDiv(row, col) {
    return element(by.id('e2e_test_div_' + row + 'x' + col));
  }

  function getPiece(row, col, pieceKind) {
    return element(by.id('e2e_test_piece' + pieceKind + '_' + row + 'x' + col));
  }

  function expectPiece(row, col, pieceKind) {
    expect(getPiece(row, col, '1').isDisplayed()).toEqual(pieceKind === '1' ? true : false);
    expect(getPiece(row, col, 'R').isDisplayed()).toEqual(pieceKind === 'R' ? true : false);
    expect(getPiece(row, col, 'G').isDisplayed()).toEqual(pieceKind === 'G' ? true : false);
    expect(getPiece(row, col, 'Y').isDisplayed()).toEqual(pieceKind === 'Y' ? true : false);
    expect(getPiece(row, col, 'B').isDisplayed()).toEqual(pieceKind === 'B' ? true : false);
  }

  function expectBoard(board) {
    for (var row = 0; row < 16; row++) {
      for (var col = 0; col < 17; col++) {
        if (board[row][col] !== ''){
          expectPiece(row, col, board[row][col]);
        }
      }
    }
  }

  function clickDivAndExpectBarricade(row, col) {
    getDiv(row, col).click();
    expectPiece(row, col, '1');
  }

  function click2DivsAndExpectPiece(fst_row, fst_col, sec_row, sec_col, pieceKind) {
    getDiv(fst_row, fst_col).click();
    getDiv(sec_row, sec_col).click();
    expectPiece(fst_row, fst_col, '0');
    expectPiece(sec_row, sec_col, pieceKind);
  }

  function setMatchState(matchState, playMode) {
    browser.executeScript(function(matchStateInJson, playMode) {
      var stateService = window.e2e_test_stateService;
      stateService.setMatchState(angular.fromJson(matchStateInJson));
      stateService.setPlayMode(angular.fromJson(playMode));
      angular.element(document).scope().$apply();
    }, JSON.stringify(matchState), JSON.stringify(playMode));
  }

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

  it('should have a title', function() {
    expect(browser.getTitle()).toEqual('Barricade');
  });

  it('should have an initial board', function() {
    expectBoard(getBoard());
  });

  var matchState0 = {
    // after first dice roll
    turnIndexBeforeMove: 0,
    turnIndex: 0,
    endMatchScores: null,
    lastMove: [{setTurn: {turnIndex: 0}},
      {set: {key: "type", value: "dice"}},
      {setRandomInteger: {key: "dice", from: 1, to : 7}}],
    lastState: {board: null, delta: null, dice: null, type: null},
    currentState: {board: null, delta: {to_row:null, to_col:null, from_row:null, from_col:null}, dice: 2, type: 'dice'},
    lastVisibleTo: {},
    currentVisibleTo: {}
  };

  it('should move R from 14x1 to 13x3 with dice 2', function() {
    matchState0.lastState.board = getBoard();
    matchState0.currentState.board = getBoard();
    setMatchState(matchState0, 'passAndPlay');

    click2DivsAndExpectPiece(14, 1, 13, 3, 'R');
    expectBoard(getBoard([
      {pos: [13, 3], piece: 'R'},
      {pos: [14, 1], piece: '0'}
      ]));
  });

  it('should move R from 14x1 to 11x4 with dice 5 and place barricade at 13x5', function() {
    matchState0.currentState.dice = 5;
    setMatchState(matchState0, 'passAndPlay');

    click2DivsAndExpectPiece(14, 1, 11, 4, 'R');
    expectBoard(getBoard([
      {pos:[11, 4], piece:'R'},
      {pos:[14, 1], piece:'0'}
      ]));

    clickDivAndExpectBarricade(13, 5);
    expectBoard(getBoard([
      {pos:[11, 4], piece:'R'},
      {pos:[14, 1], piece:'0'},
      {pos:[13, 5], piece:'1'}
      ]));
  });

  var matchState1 = {
    // after first dice roll
    turnIndexBeforeMove: 1,
    turnIndex: 1,
    endMatchScores: null,
    lastMove: [{setTurn: {turnIndex: 1}},
      {set: {key: "type", value: "dice"}},
      {setRandomInteger: {key: "dice", from: 1, to : 7}}],
    lastState: {board: null, delta: {to_row:13, to_col:3, from_row:14, from_col:1}, dice: 2, type: "normal"},
    currentState: {board: null, delta: {to_row:null, to_col:null, from_row:null, from_col:null}, dice: 4, type: 'dice'},
    lastVisibleTo: {},
    currentVisibleTo: {}
  };

  it('Should move G from 15x5 to 13x3 with dice 4 and see R at 14x1', function() {
    var board1 = getBoard([
      {pos: [13, 3], piece: 'R'},
      {pos: [14, 1], piece: '0'}
    ]);
    matchState1.lastState.board = board1;
    matchState1.currentState.board = board1;
    setMatchState(matchState1, 'passAndPlay');

    click2DivsAndExpectPiece(15, 5, 13, 3, 'G');
    expectBoard(getBoard([
      {pos: [14, 1], piece: 'R'},
      {pos: [15, 5], piece: '0'},
      {pos: [13, 3], piece: 'G'}
    ]));
  });

  it('Should ignore clicking on empty cell', function() {
    setMatchState(matchState1, 'passAndPlay');
    click2DivsAndExpectPiece(13, 4, 13, 8, '');
    expectBoard(getBoard([
      {pos: [13, 3], piece: 'R'},
      {pos: [14, 1], piece: '0'}
    ]));
  });

  it('Should ignore clicking on opponent pawn', function() {
    setMatchState(matchState1, 'passAndPlay');
    getDiv(13, 3).click();
    getDiv(13, 7).click();
    expectBoard(getBoard([
      {pos: [13, 3], piece: 'R'},
      {pos: [14, 1], piece: '0'}
    ]));
  });

  it('Should ignore clicking on barricade', function() {
    setMatchState(matchState1, 'passAndPlay');
    getDiv(11, 4).click();
    getDiv(13, 2).click();
    expectBoard(getBoard([
      {pos: [13, 3], piece: 'R'},
      {pos: [14, 1], piece: '0'}
    ]));
  });

  var matchState2 = {
    // after first dice roll
    turnIndexBeforeMove: 0,
    turnIndex: 0,
    endMatchScores: null,
    lastMove: [{setTurn: {turnIndex: 0}},
      {set: {key: "type", value: "dice"}},
      {setRandomInteger: {key: "dice", from: 1, to : 7}}],
    lastState: {board: null, delta: {to_row:1, to_col:9, from_row:1, from_col:11}, dice: 2, type: "normal"},
    currentState: {board: null, delta: {to_row:null, to_col:null, from_row:null, from_col:null}, dice: 1, type: 'dice'},
    lastVisibleTo: {},
    currentVisibleTo: {}
  };

  it('Can start from a game about to end and win', function() {
    var board1 = getBoard([
      {pos: [1, 8], piece: 'R'},
      {pos: [1, 7], piece: '1'},
      {pos: [1, 11], piece: 'G'},
      {pos: [14, 1], piece: '0'},
      {pos: [14, 5], piece: '0'}
    ]);
    var board2 = getBoard([
      {pos: [1, 8], piece: 'R'},
      {pos: [1, 7], piece: '1'},
      {pos: [1, 9], piece: 'G'},
      {pos: [14, 1], piece: '0'},
      {pos: [14, 5], piece: '0'}
    ]);
    matchState2.lastState.board = board1;
    matchState2.currentState.board = board2;
    setMatchState(matchState2, 'passAndPlay');
    expectBoard(getBoard([
      {pos: [1, 8], piece: 'R'},
      {pos: [1, 7], piece: '1'},
      {pos: [1, 9], piece: 'G'},
      {pos: [14, 1], piece: '0'},
      {pos: [14, 5], piece: '0'}
    ]));
    click2DivsAndExpectPiece(1, 8, 0, 8, 'R');
    expectBoard(getBoard([
      {pos: [0, 8], piece: 'R'},
      {pos: [1, 8], piece: '0'},
      {pos: [1, 7], piece: '1'},
      {pos: [1, 9], piece: 'G'},
      {pos: [14, 1], piece: '0'},
      {pos: [14, 5], piece: '0'}
    ]));
  });

  var matchState3 = {
    // after first dice roll
    turnIndexBeforeMove: 1,
    turnIndex: 1,
    endMatchScores: [1, 0],
    lastMove: [{setTurn: {turnIndex: 1}},
      {set: {key: "type", value: "dice"}},
      {setRandomInteger: {key: "dice", from: 1, to : 7}}],
    lastState: {board: null, delta: {to_row:0, to_col:8, from_row:1, from_col:8}, dice: 1, type: "normal"},
    currentState: {board: null, delta: {to_row:null, to_col:null, from_row:null, from_col:null}, dice: 1, type: 'dice'},
    lastVisibleTo: {},
    currentVisibleTo: {}
  };

  it('Cannot click after game ends', function() {
    var board3 = getBoard([
      {pos: [0, 8], piece: 'R'},
      {pos: [1, 7], piece: '1'},
      {pos: [1, 9], piece: 'G'},
      {pos: [14, 1], piece: '0'},
      {pos: [14, 5], piece: '0'}
    ]);
    matchState3.lastState.board = getBoard([
      {pos: [1, 8], piece: 'R'},
      {pos: [1, 7], piece: '1'},
      {pos: [1, 9], piece: 'G'},
      {pos: [14, 1], piece: '0'},
      {pos: [14, 5], piece: '0'}
    ]);
    matchState3.currentState.board = board3;
    setMatchState(matchState3, 'passAndPlay');
    getDiv(1, 9).click();
    getDiv(1, 8).click();
    expectBoard(board3);
  });

});
