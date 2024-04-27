/* Next task:
-Create UI after logic in main.js

-implement restart btn logic

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
  //Game flow starts here. sets up player/board states , UI, listeners, etc.
  const passDeviceDiv = document.querySelector('#passDeviceDiv');
  const continueBtn = document.querySelector('#continueBtn');
  const boardsAndLabelsDiv = document.querySelector('#boardsAndLabelsDiv');
  const receivingBoardDiv = document.querySelector('.receivingBoardDiv');
  const attackingBoardDiv = document.querySelector('.attackingBoardDiv');
  const msgDiv = document.querySelector('#msgDiv'); //feedback message div
  const startBtn = document.querySelector('#startBtn');
  const restartBtn = document.querySelector('#restartBtn');
  const playOtherPlayerBtn = document.querySelector('#playOtherPlayerBtn');
  const playComputerBtn = document.querySelector('#playComputerBtn');
  let gameType; //assign '1P'/'2P' when button clicked
  let player1; //player objects with gameboards
  let player2;
  let currentPlayer; //turn references
  let opponent;

  //fn to render a player's 2 boards; call after data changes in players' playGrid arrays
  const renderBoards = ()=> {
    lg('rendering boards, current player has playGrid arr:'); //debug
    lg( currentPlayer.getGameboard().getPlayGrid() ); //debug
    // lg('rendering boards...');//debug
    //cleanup old cells
    receivingBoardDiv.textContent = '';
    attackingBoardDiv.textContent = '';
    //build current player's receiving and attacking boards
    currentPlayer.getGameboard().getPlayGrid().forEach( (rowArr, row)=> {
      // lg(rowArr.join()); //debug
      rowArr.forEach( (data, col)=> {
        //make and append cell divs from data
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cellDiv');
        cellDiv.dataset.cellData = data;
        cellDiv.dataset.row = row;
        cellDiv.dataset.col = col;
        receivingBoardDiv.append( cellDiv );
      } );
    } );
    opponent.getGameboard().getPlayGrid().forEach( (rowArr, row)=> {
      // lg(rowArr.join()); //debug
      rowArr.forEach( (data, col)=> {
        //make and append cell divs from data
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cellDiv');
        cellDiv.setAttribute( 'data-cell-data', data );
        cellDiv.dataset.row = row;
        cellDiv.dataset.col = col;
        attackingBoardDiv.append( cellDiv );
      } );
    } );

  };

  //listener cb fn to handle sending an attack to opponent board
  const sendAttack = (e)=> {
    e.stopPropagation();
    //using conditional since border clicks trigger listener cb
    if (e.target.className === 'cellDiv') {
      //call receiveAttack fn with coords on opponent's gameboard
      const opponentBoard = opponent.getGameboard();
      //save attack result to only handle a hit or miss
      const attackRes = opponentBoard.receiveAttack([e.target.dataset.row, e.target.dataset.col]);
      renderBoards();//show result to current player
      // lg(opponentBoard.getPlayGrid());//debug
      //handle game over when opponent's all ships sunk
      if (opponentBoard.allShipsSunk()) {
        //disable attackingBoardDiv, inform player
        attackingBoardDiv.removeEventListener('click', sendAttack);
        msgDiv.textContent = `Player${ currentPlayer === player1 ? '1' : '2' } wins!`;
        //implement way to restart game...

      //handle next player's turn: show result msg, wait a little to hide boards, show
      //passDeviceDiv, let current player pass play device to next player, wait for
      //next player to press continueBtn to begin their turn
      } else {
        //set message according to attack result
        msgDiv.textContent = ''; //clear old message
        switch (attackRes) { //only handle attack results we want
          case 'hit':
            msgDiv.textContent = 'Attack hit!';
            break;
          case 'miss':
            msgDiv.textContent = 'Attack missed!';
        }
        setTimeout(() => {
          boardsAndLabelsDiv.style.display = 'none';
          passDeviceDiv.style.display = 'block';
        }, 700); //change to 2000 for prod...
      }

    }
  };

  //fn to move to next player when continueBtn clicked
  const continueToNextPlayer = (e)=> {
    e.stopPropagation();
    //swap players
    currentPlayer = opponent;
    //restore boards div, hide passDeviceDiv
    boardsAndLabelsDiv.style.display = 'flex';
    passDeviceDiv.style.display = 'none';
    //render next player's boards
    renderBoards();

  };

  //listener for buttons in setupControlsWrap
  //begin game from btn of chosen game type
  document.querySelector('.setupControlsWrap').addEventListener('click', (e)=> {
    e.stopPropagation();
    switch (e.target.id) {
      //when 2P (battle other player) game type chosen...
      case 'playOtherPlayerBtn':
        gameType = '2P';
        //make players, populate their boards, assign their vars
        [player1, player2] = [player1, player2].map((player) => {
          player = makePlayer(); //makes player obj with default 'human' type
          //populate player's board with default ships for now...
          player.getGameboard().placeShip([0, 0], 'right', 'Patrol Boat');
          // player.getGameboard().placeShip([1, 0], 'right', 'Destroyer');
          return player; //return player obj to .map() for destructuring assignment
        });
        //extra ship for board 2
        player2.getGameboard().placeShip([1, 0], 'right', 'Submarine');
        //set btns
        startBtn.removeAttribute('disabled');
        //player1 starts
        [currentPlayer, opponent] = [player1, player2];
        msgDiv.textContent = 'Player 1 goes first! click start to begin';
        //before clicking start, add ship placement logic here...

        renderBoards();
        break;
      //when 1P (battle computer) game type chosen...
      case 'playComputerBtn':
        gameType = '1P';
        break;
      //start listening for clicks when start btn clicked
      case 'startBtn':
        //set btns
        [playOtherPlayerBtn, playComputerBtn, startBtn]
          .forEach((c) => c.setAttribute('disabled', ''));
        restartBtn.removeAttribute('disabled');
        msgDiv.textContent = 'Player 1\'s attack turn...';
        //set listeners to handle clicks on attack cells and continue btn
        attackingBoardDiv.addEventListener('click', sendAttack);
        continueBtn.addEventListener('click', continueToNextPlayer );
        break;
      case 'restartBtn':
        //implement...
        break;
    }

  });

  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);
