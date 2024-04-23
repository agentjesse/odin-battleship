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
  expect(testShip.shipName).toBe('Patrol Boat');
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
  //sink carrier from: 9,9 to 5,9
  board.receiveAttack([9, 9]);
  board.receiveAttack([8, 9]);
  board.receiveAttack([7, 9]);
  board.receiveAttack([6, 9]);
  board.receiveAttack([5, 9]);
  expect( board.getPlayGrid()[9][9] ).toBe('hit');//check playGrid arr mar
  expect( board.getPlayGrid()[8][9] ).toBe('hit');
  expect( board.getPlayGrid()[7][9] ).toBe('hit');
  expect( board.getPlayGrid()[6][9] ).toBe('hit');
  expect( board.getPlayGrid()[5][9] ).toBe('hit');
  expect( board.getShipsMap().get('Carrier').getHits() ).toBe(5); //check hits
  expect( board.getShipsMap().get('Carrier').isSunk() ).toBe(true);//check sunk

  //visualize board
  log2DStringArray( board.getPlayGrid() );
  //visualize ships
  // board.getShipsMap().forEach( (val)=> lg(val) ); //not needed anymore due to tests

});
