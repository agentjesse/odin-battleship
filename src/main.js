/* Next task:

-handle attacks on played cells

*/

// JS imports
//include file extension For Node.js when importing local modules:
import { logToConsole as lg, tableToConsole as tb, objectToString as ots } from './logger.js';

//jest testing for this file is in main.test.js and done with ES Module exports

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
  }

  const hitShip = ()=> {
    if ( hits < length ) hits += 1; // increase hits
    if ( hits === length ) isSunk = true; // check to sink
  };

  return {
    getLength: ()=> length,
    getHits: ()=> hits,
    isSunk: ()=> isSunk, // bool of sink state
    hitShip, // call when hit
    shipName
  };
};

//private makeGameboard fn to place a ship on board and return a ship obj. The board
//marking part of placing a ship is done in this fn by editing the playGrid array.
const _placeAndGetShip = ( startCoords, direction, shipName, playGrid )=> {
  const ship = makeShip(shipName);
  const markEnd = ship.getLength();
  const possibleMarkCoords = [];

  //fn to check if cell is in bounds of 10 x 10 2D playGrid arr and free.
  const isValid = (row, col)=> {
    if ( row > -1 && row < 10 && col > -1 && col < 10 ) {
      //check if cell is occupied
      if ( playGrid[row][col] === null ) return true;
      throw new Error('cell occupied'); //when cell has a ship
      //*throw statement immediately ends fn execution. control then passed to first
      //catch block in the call stack. program terminates if no catch block exists
      //among caller functions.
    }
    throw new Error('cell out of bounds'); //when cell out of bounds
  };

  //place ship on board by checking if all cells valid to mark with ship name.
  //consider direction and gather possible marks from start in an array
  let newRow;
  let newCol;
  for (let markCount = 0; markCount < markEnd; markCount++) {
    switch (direction) {
      case 'up': //upwards marking
        [newRow, newCol] = [startCoords[0] - markCount, startCoords[1]]; //destructuring reassign
        if ( isValid( newRow, newCol ) ) possibleMarkCoords.push( [newRow, newCol] );
        break;
      case 'right': //rightwards marking
        [newRow, newCol] = [startCoords[0], startCoords[1] + markCount];
        if ( isValid( newRow, newCol ) ) possibleMarkCoords.push( [newRow, newCol] );
        break;
      case 'down': //downwards marking
        [newRow, newCol] = [startCoords[0] + markCount, startCoords[1]];
        if ( isValid( newRow, newCol ) ) possibleMarkCoords.push( [newRow, newCol] );
        break;
      case 'left': //leftwards marking
        [newRow, newCol] = [startCoords[0], startCoords[1] - markCount];
        if ( isValid( newRow, newCol ) ) possibleMarkCoords.push( [newRow, newCol] );
    }
  }
  //mark board when total possible marks match ship length (i.e. only valid marks made)
  if ( possibleMarkCoords.length === ship.getLength() ) {
    possibleMarkCoords.forEach( (markCoords)=> {
      playGrid[markCoords[0]][markCoords[1]] = shipName;
    } );
  }
  //return ship to caller for saving
  return ship;
};

//fn to make gameboard objects.
export const makeGameboard = ()=> {
  //start with 10 x 10 2D playGrid array of null elements, representing board cells.
  //Cells can change to hold data strings of the cell state: hit/miss/shipName.
  //Top left board cell coordinates are 0,0. Each 2nd dimension array maps to a board
  //row, top to bottom. Each element of 2nd dimension arrays maps to a board column,
  //from left to right.
  const playGrid = [...Array(10)].map( ()=> Array(10).fill(null) );
  //store made ships in this js Map for quick access:
  const shipsMap = new Map();

  //this fn calls private _placeAndGetShip with playGrid reference and expects ship obj back
  const placeShip = (startCoords, direction, shipName,)=> {
    //place ship by marking board in _placeAndGetShip, then set returned ship in shipsMap
    shipsMap.set( shipName, _placeAndGetShip(startCoords, direction, shipName, playGrid) );
  };

  //fn to handle attack from coordinates. must call hit on ships, or record missed shot.
  //returns new mark for UI updates and error handling from previously marked cells
  const receiveAttack = ( attackCoords )=> {
    const row = attackCoords[0];
    const col = attackCoords[1];
    //check in bounds cells
    //* _placeAndGetShip isValid fn has Error throwing based logic, extracting it can wait.
    if ( row > -1 && row < 10 && col > -1 && col < 10 ) {
      switch (playGrid[row][col]) {
        //if attacked cell data is null, mark with miss
        case null:
          playGrid[row][col] = 'miss';
          return 'miss';
        //call ship's hitShip(), then update mark
        case 'Patrol Boat':
        case 'Destroyer':
        case 'Submarine':
        case 'Battleship':
        case 'Carrier':
          shipsMap.get(playGrid[row][col]).hitShip();
          playGrid[row][col] = 'hit';
          return 'hit';
      }
    } else throw new Error('attack out of bounds');
  };

  //fn to return boolean based on all ships' sunk states.
  //The some() CB checks if any ship is floating, answering: 'are all ships sunk?'.
  //If floating ship found, some() immediately returns true. The result is then
  //inversed before returning from allShipsSunk()
  const allShipsSunk = ()=> ![...shipsMap.values()].some( (ship)=> !ship.isSunk() );
  /* old checking code, clear and fine but long.
  let res = true; let done;
  shipsMap.forEach( (val)=> {
    if ( done ) return;
    //if any ship is not sunk, return false
    if ( !val.isSunk() ) { res = false; done = true; } } );
  return res;
  */

  return {
    getPlayGrid: ()=> playGrid,
    placeShip,
    receiveAttack,
    getShipsMap: ()=> shipsMap,
    allShipsSunk
  };
};

//fn to make player objects. player types (strings) are 'human' or 'computer' and have their own gameboard
export const makePlayer = (type = 'human')=> {
  const gameboard = makeGameboard();

  return {
    getGameboard: ()=> gameboard,
    getType: ()=> type
  };
};
