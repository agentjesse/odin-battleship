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

  //this IIFE starts game flow. sets up player/board states , UI, listeners, etc..
  ( ()=> {
    let gameType; //assign '1P'/'2P' from elem.dataset
    const startBtn = document.querySelector('#startBtn');
    const restartBtn = document.querySelector('#restartBtn');
    let player1;
    let player2;

    //begin game by listening for chosen game type, enabling start btns, and creating player objects with makePlayer()...remember they have their own gameboards within.
    document.querySelector('.setupControlsWrap').addEventListener('click', (e)=> {
      e.stopPropagation;
      //set game type for 2P (battle other player)
      if (e.target.id === 'playOtherPlayerBtn') {
        gameType = '2P';
        //enable start buttons
        startBtn.removeAttribute('disabled');
        restartBtn.removeAttribute('disabled');
        //make both players to access their gameboards
        player1 = makePlayer();
        player2 = makePlayer();


      }
      //set game type for 1P (battle computer)
      if (e.target.id === 'playComputerBtn') {
        gameType = '1P';
      }

    });

  } )();

  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);
