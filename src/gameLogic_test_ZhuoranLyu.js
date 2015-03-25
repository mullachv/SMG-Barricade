/**
 * Created by Zhuoran on 3/02/15.
 */

describe("In Barricade", function() {
  'use strict';
  var _gameLogic;

  beforeEach(module("myApp"));

  beforeEach(inject(function(gameLogic) {
    _gameLogic = gameLogic;
  }));

/*  function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
    expect (_gameLogic.isMoveOk({
      turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move
    })).toBe(true);
  }*/

  function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
    expect (_gameLogic.isMoveOk({
      turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move
    })).toBe(false);
  }


  it("1. step on empty spot (-) through an illegal path", function() {
    expectIllegalMove(0, {},
      [
        {setTurn: {turnIndex : 1}},
        {set: {key: 'type', value: 'normal'}},
        {set: {key: 'board', value:
          [
            ['', '', '', '', '', '', '', '', 'W', '', '', '', '', '', '', '', ''], // 0
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
            ['1', '0', 'R', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '0', '1'], // 11
            ['0', '', '', '', '0', '', '', '', '0', '', '', '', '0', '', '', '', '0'], // 12
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], // 13
            ['', '0', 'R', 'R', '', 'G', 'G', 'G', '', '', '', '', '', '', '', '', ''], // 14
            ['', 'R', '', 'R', '', 'G', '', 'G', '', '', '', '', '', '', '', '', '']
          ]}},
        {set: {key: 'delta', value: {to_row: 11, to_col: 2, from_row: 14, from_col: 1}}},
        {set: {key: 'dice', value: 3}}
      ]);
  });

});
