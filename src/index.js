/* Next task:
-Create UI after logic in main.js

-turn this repo into new boilerplate, OR: update logger file, index.js imports examples, eslint config, package.json, refactor boilerplate to use main.js/main.test.js
*/

// JS/CSS imports
import './styles.css';
// import './assets/book-remove.svg'; //asset files example
//include file extension For Node.js when importing local modules:
import { logToConsole as lg, tableToConsole as tb, objectToString as ots } from './logger.js';
import { makePlayer } from './main.js';

//jest testing for this file is in index.test.js and done with ES Module exports

//Main Project wrapped in initializer function to not have it's top level code execute when jest
//imports this file.
const initProject = ()=> {
  //Game flow starts here. sets up player/board states , UI, listeners, etc. maybe not neede
  const receivingBoardDiv = document.querySelector('.receivingBoardDiv');
  const attackingBoardDiv = document.querySelector('.attackingBoardDiv');
  const startBtn = document.querySelector('#startBtn');
  const restartBtn = document.querySelector('#restartBtn');
  let gameType; //assign '1P'/'2P' when button clicked
  let player1; //player object
  let player2;
  let currentPlayer; //player object

  //fn to re-render a player's 2 boards; call after data changes in either player's playGrid arrays
  const reRenderBoards = ()=> {
    lg('re-rendering boards...');//debug
    //cleanup old cells
    receivingBoardDiv.textContent = '';
    attackingBoardDiv.textContent = '';
    //build current player's receiving and attacking boards
    player1.getGameboard().getPlayGrid().forEach( (rowArr, row)=> {
      // lg(rowArr.join()); //debug
      rowArr.forEach( (data, col)=> {
        //make and append cell divs from data
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cellDiv');
        cellDiv.setAttribute( 'data-cell-data', data );
        cellDiv.setAttribute( 'data-coords', `${row},${col}` );
        receivingBoardDiv.append( cellDiv );
      } );
    } );
    player2.getGameboard().getPlayGrid().forEach( (rowArr, row)=> {
      // lg(rowArr.join()); //debug
      rowArr.forEach( (data, col)=> {
        //make and append cell divs from data
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cellDiv');
        // cellDiv.setAttribute( 'data-cell-data', data ); //show enemy ships
        cellDiv.setAttribute( 'data-coords', `${row},${col}` );
        cellDiv.textContent = '?'; //temp enemy visuals...
        attackingBoardDiv.append( cellDiv );
      } );
    } );

  };

  const sendAttack = (evt)=> {
    const cellDiv = evt.target;
    lg(cellDiv);
  };

  //listener for buttons in setupControlsWrap
  //begin game from btn of chosen game type
  document.querySelector('.setupControlsWrap').addEventListener('click', (e)=> {
    e.stopPropagation;
    switch (e.target.id) {
      //when 2P (battle other player) game type chosen...
      case 'playOtherPlayerBtn':
        gameType = '2P';
        //make players, populate their boards, assign their vars
        [player1, player2] = [player1, player2].map((player) => {
          player = makePlayer(); //makes player obj with default 'human' type
          //populate player's board with default ships for now...
          player.getGameboard().placeShip([0, 0], 'right', 'Patrol Boat');
          player.getGameboard().placeShip([1, 2], 'left', 'Destroyer');
          return player; //return player obj to .map() for destructuring assignment
        });
        //enable next btns
        [startBtn, restartBtn].forEach((c) => c.removeAttribute('disabled'));
        reRenderBoards();//render from boards
        break;
      //when 1P (battle computer) game type chosen...
      case 'playComputerBtn':
        gameType = '1P';
        break;
      //start listening for clicks when start btn clicked
      case 'startBtn':
        //handle attacking board cell clicks
        attackingBoardDiv.addEventListener('click', sendAttack );
        break;
      case 'restartBtn':
        break;
    }

  });

  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);
