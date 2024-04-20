// eslint-disable-next-line object-curly-newline
import { makeShip, makeGameboard } from './index.js';
/* this test works, just hiding it.
test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});
*/

test('ship objects creation with: length, hitsReceived, isSunk', () => {
  //make a default 2 length ship, sink it
  const testShip = makeShip();
  testShip.hitShip();
  testShip.hitShip();

  expect(testShip.getLength()).toBe(2);
  expect(testShip.getHits()).toBe(2);
  expect(testShip.isSunk()).toBe(true);
  // expect(testShip).toEqual({ length: 2, hits: 0, isSunk: false });
});

test('gameboard creation', ()=> {
  //make 10x10 board instance
  const board = makeGameboard();
  //check board methods
  //board should be 2D array of 100 null elements
  expect(board.getPlayGrid()).toEqual( [...Array(10)].map( ()=> Array(10).fill(null) ) );
});
