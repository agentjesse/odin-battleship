// eslint-disable-next-line object-curly-newline
import { makeShip, makeGameboard } from './index.js';
import { logToConsole as lg, objectToString as ots, log2DStringArray } from './logger.js';

test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

test('ship objects creation with: length, hitsReceived, isSunk', () => {
  //make a default 2 length ship, sink it
  const testShip = makeShip('Patrol Boat');
  testShip.hitShip();
  testShip.hitShip();
  //check it's state
  expect(testShip.getLength()).toBe(2);
  expect(testShip.getHits()).toBe(2);
  expect(testShip.isSunk()).toBe(true);
});

test('gameboard creation', ()=> {
  //make 10x10 board instance
  const board = makeGameboard();
  //check board methods
  //board should be 2D array of 100 null elements
  expect(board.getPlayGrid()).toEqual( [...Array(10)].map( ()=> Array(10).fill(null) ) );
  //place ships with 3 args: startCoords, direction, ship name
  board.placeShip( [0, 0], 'right', 'Patrol Boat' ); //length 2
  board.placeShip( [1, 2], 'left', 'Destroyer' ); //length 3
  board.placeShip( [2, 0], 'right', 'Submarine' ); //length 3
  board.placeShip( [6, 8], 'down', 'Battleship' ); //length 4
  board.placeShip( [9, 9], 'up', 'Carrier' ); //length 5
  //out of bounds / occupied placement tests
  expect( ()=> board.placeShip( [0, 0], 'right', 'Carrier' ) ).toThrow('space occupied');
  expect( ()=> board.placeShip( [0, 9], 'right', 'Carrier' ) ).toThrow('space out of bounds');
  //received attack tests
  expect( ()=> board.receiveAttack([10, 0]) ).toThrow('attack out of bounds');
  board.receiveAttack([5, 0]);
  expect( board.getPlayGrid()[5][0] ).toBe('miss');
  board.receiveAttack([0, 0]);
  expect( board.getPlayGrid()[0][0] ).toBe('hit');
  //visualize
  log2DStringArray( board.getPlayGrid() );

});
