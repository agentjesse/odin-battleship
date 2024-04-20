/* Next task:
-Create a Gameboard factory:
Gameboards should be able to place ships at specific coordinates by calling the ship factory or class.
-  use ship fn for boat creation: Carrier 5, Battleship 4, Destroyer 3, Submarine 3, Patrol Boat 2. patrol boat is default
*/

// JS/CSS imports
//For Node.js, when importing local modules, include the file extension in the import statement.
import './styles.css';
import './assets/book-remove.svg'; //not used, just example
import { logToConsole as lg, tableToConsole as tb, objectToString as ots } from './logger.js';
// import { functionOne } from './myModule'; //modules import testing
// functionOne();

//jest testing for this file is in index.test.js and done with ES Module exports

//fn to make ship objects, default is Patrol Boat
export const makeShip = (
  length = 2,
  hits = 0,
  isSunk = false,
  shipName = 'Patrol Boat'
)=> {

  //fn to hit ship
  const hitShip = ()=> {
    if ( hits < length ) hits += 1; // increase hits
    if ( hits === length ) isSunk = true; // check to sink
  };

  return {
    getLength: ()=> length,
    getHits: ()=> hits,
    isSunk: ()=> isSunk,
    hitShip
  };
};

//fn to make gameboard objects.
export const makeGameboard = ()=> {
  //start with 10 x 10 grid array of nulls. top left origin space is 0,0
  // const playGrid = Array(10).fill( Array(10).fill(null) ); //js pitfall example
  //below, spread operator fills array with undefined, to use with map()
  const playGrid = [...Array(10)].map( ()=> Array(10).fill(null) );
  // lg(playGrid);
  return {
    getPlayGrid: ()=> playGrid,
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
