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

  function getDice() {
    //var srcimg = element(by.id('e2e_test_dice')).getAttribute("ng-src");
    var srcimg = element(document).getElementById('e2e_test_dice').getAttribute('src');
    console.log(srcimg);
    if (srcimg === 'http://localhost:32232/imgs/1.png') {
      return 1;
    } else if (srcimg === 'http://localhost:32232/imgs/2.png') {
      return 2;
    } else if (srcimg === 'http://localhost:32232/imgs/3.png') {
      return 3;
    } else if (srcimg === 'http://localhost:32232/imgs/4.png') {
      return 4;
    } else if (srcimg === 'http://localhost:32232/imgs/5.png') {
      return 5;
    } else if (srcimg === 'http://localhost:32232/imgs/6.png') {
      return 6;
    }
  }

  function expectPiece(row, col, pieceKind) {
    expect(
      getPiece(row, col, 'W')
        .isDisplayed())
      .toEqual(pieceKind === 'W' ? true : false);
    expect(getPiece(row, col, '0').isDisplayed()).toEqual(pieceKind === '0' ? true : false);
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
    console.log("matchState: "+matchState);
    console.log("playmode: "+playMode);
    browser.executeScript(function(matchStateInJson, playMode) {
      var stateService = window.e2e_test_stateService;
      stateService.setMatchState(angular.fromJson(matchStateInJson));
      stateService.setPlayMode(angular.fromJson(playMode));
      angular.element(document).scope().$apply();
    }, JSON.stringify(matchState), JSON.stringify(playMode));
  }

  it('should have a title', function() {
    expect(browser.getTitle()).toEqual('Barricade');
  });

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
    currentState: {board: null, delta: null, dice: null, type: 'dice'},
    lastVisibleTo: {},
    currentVisibleTo: {}
  };
/*
  it('should move R from 14x1 to 13x2 with dice 1', function() {
    matchState0.currentState.dice = 1;
    matchState0.lastState.board = getBoard();
    matchState0.currentState.board = getBoard();
    setMatchState(matchState0, 'passAndPlay');

    click2DivsAndExpectPiece(14, 1, 13, 2, 'R');
    expectBoard(getBoard([
      {pos: [13, 2], piece: 'R'},
      {pos: [14, 1], piece: '0'}
      ]));
  });
*/
  it('should move R first onto an empty cell (or take place of a barricade)', function() {
    var to_row, to_col, from_row = 14, from_col = 1,
      dice = getDice();
    console.log("dice"+dice);
    matchState0.currentState.dice = dice;
    matchState0.lastState.board = getBoard();
    matchState0.currentState.board = getBoard();
    setMatchState(matchState0, 'passAndPlay');

    if (dice === 5) {
      to_row = 11;
      to_col = 4;
      click2DivsAndExpectPiece(from_row, from_col, to_row, to_col, 'R');
      expectBoard(getBoard([
        {pos:[to_row, to_col], piece:'R'},
        {pos:[from_row, from_col], piece:'0'}
        ]));

      clickDivAndExpectBarricade(13, 5);
      expectBoard(getBoard([
        {pos:[to_row, to_col], piece:'R'},
        {pos:[from_row, from_col], piece:'0'},
        {pos:[13, 5], piece:'1'}
        ]));
    } else {
      switch(dice) {
        case 1:
          to_row = 13;
          to_col = 2;
          break;
        case 2:
          to_row = 13;
          to_col = 3;
          break;
        case 3:
          to_row = 13;
          to_col = 4;
          break;
        case 4:
          to_row = 12;
          to_col = 4;
          break;
        case 6:
          to_row = 13;
          to_col = 7;
          break;
      }
      click2DivsAndExpectPiece(from_row, from_col, to_row, to_col, 'R');
      expectBoard(getBoard([
        {pos: [to_row, to_col], piece: 'R'},
        {pos: [from_row, from_col], piece: '0'}
        ]));
    }
  });

});
