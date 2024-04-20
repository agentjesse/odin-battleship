/* Next task:
-Create a Gameboard factory:
Gameboards should be able to place ships at specific coordinates by calling the ship factory or class.
-  use ship fn for boat creation: Carrier 5, Battleship 4, Destroyer 3, Submarine 3, Patrol Boat 2. patrol boat is default
-update logger file, index.js imports examples, eslint config in boilerplate
*/

// JS/CSS imports
import './styles.css';
// import './assets/book-remove.svg'; //asset files example
//include file extension For Node.js when importing local modules:
import { logToConsole as lg, tableToConsole as tb, objectToString as ots } from './logger.js';

//jest testing for this file is in index.test.js and done with ES Module exports

//fn to make ship objects
export const makeShip = ( shipName )=> {
  let length; let hits = 0; let isSunk = false;
  //assign ship length from name
  switch (shipName) {
    case 'Carrier':
      length = 5;
      break;
    case 'Battleship':
      length = 4;
      break;
    case 'Destroyer':
      length = 3;
      break;
    case 'Submarine':
      length = 3;
      break;
    case 'Patrol Boat':
      length = 2;
      break;
  }

  const hitShip = ()=> {
    if ( hits < length ) hits += 1; // increase hits
    if ( hits === length ) isSunk = true; // check to sink
  };

  return {
    getLength: ()=> length,
    getHits: ()=> hits,
    isSunk: ()=> isSunk, // bool of sink state
    hitShip // call when hit
  };
};

//private method of makeGameboard to place a ship on board
//todo: check what to return to gameboard...
const _placeShip = ( startCoords, direction, shipName, playGrid )=> {
  const ship = makeShip(shipName);
  const markEnd = ship.getLength();
  const possibleMarks = [];

  //fn to check if space is in bounds of 10 x 10 2D playGrid arr and free.
  const isValid = (row, col)=> {
    if ( row > -1 && row < 10 && col > -1 && col < 10 ) {
      //check if space is occupied
      if ( playGrid[row][col] === null ) return true;
      throw new Error('space occupied'); //when space out of bounds
      //*throw statement immediately ends fn execution. control then passed to first
      //catch block in the call stack. program terminates if no catch block exists
      //among caller functions.
    }
    throw new Error('space out of bounds'); //when space out of bounds
  };

  //place ship on board by checking if all spaces valid to mark with ship name.
  //consider direction and gather possible marks from start in an array
  let newRow;
  let newCol;
  for (let markCount = 0; markCount < markEnd; markCount++) {
    switch (direction) {
      case 'up': //upwards marking
        [newRow, newCol] = [startCoords[0] - markCount, startCoords[1]]; //reassign
        if ( isValid( newRow, newCol ) ) possibleMarks.push( [newRow, newCol] );
        break;
      case 'right': //rightwards marking
        [newRow, newCol] = [startCoords[0], startCoords[1] + markCount];
        if ( isValid( newRow, newCol ) ) possibleMarks.push( [newRow, newCol] );
        break;
      case 'down': //downwards marking
        [newRow, newCol] = [startCoords[0] + markCount, startCoords[1]];
        if ( isValid( newRow, newCol ) ) possibleMarks.push( [newRow, newCol] );
        break;
      case 'left': //leftwards marking
        [newRow, newCol] = [startCoords[0], startCoords[1] - markCount];
        if ( isValid( newRow, newCol ) ) possibleMarks.push( [newRow, newCol] );
    }
  }
  //mark board when total possible marks match ship length (only valid marks made)
  if ( possibleMarks.length === ship.getLength() ) {
    possibleMarks.forEach( (mark)=> {
      playGrid[mark[0]][mark[1]] = shipName;
    } );
  }

};

//fn to make gameboard objects.
export const makeGameboard = ()=> {
  //start with 10 x 10 2D grid array of nulls. Top left board coordinates are 0,0. Each
  //2nd dimension array represents a board row, top to bottom. Each element of 2nd
  //dimension arrays represents a board column, left to right.
  const playGrid = [...Array(10)].map( ()=> Array(10).fill(null) );

  //calls private _placeShip with playGrid reference
  const placeShip = (startCoords, direction, shipName,)=> {
    _placeShip(startCoords, direction, shipName, playGrid);
  };

  return {
    getPlayGrid: ()=> playGrid,
    placeShip,
  };
};

//Main Project wrapped in initializer function to not have it's top level code execute when jest
//imports this file.
const initProject = ()=> {


  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);
