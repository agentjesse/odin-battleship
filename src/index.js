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
  let currentPlayer; //turn reference vars
  let opponent;

  //fn to render a player's 2 boards; call after data changes in players' playGrid arrays
  const renderBoards = ()=> {
    lg('rendering boards. current player has playGrid arr:'); //debug
    lg( currentPlayer.getGameboard().getPlayGrid() ); //debug
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
      //call receiveAttack fn on opponent's gameboard, save result for display logic
      const opponentBoard = opponent.getGameboard();
      const attackRes = opponentBoard.receiveAttack([e.target.dataset.row, e.target.dataset.col]);
      // lg(attackRes) //debug
      //only re-render when attackRes holds a useful string like hit or miss
      if (attackRes) {
        renderBoards();//show result to current player
        //handle game over when all opponent's ships sunk
        if (opponentBoard.allShipsSunk()) {
          //disable attackingBoardDiv, inform player
          attackingBoardDiv.removeEventListener('click', sendAttack);
          msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2' } wins!`;
          //implement logic to restart game with the restartBtn...


        //handle next player's turn: show attack result message, wait a little to hide
        //boards and show passDeviceDiv. After that, we wait for the device pass, and for
        //next player to press the continue button with the continueToNextPlayer cb fn.
        } else {
          msgDiv.textContent = attackRes === 'hit' ? 'Attack hit!' : 'Attack missed!';
          setTimeout(() => {
            boardsAndLabelsDiv.style.display = 'none';
            passDeviceDiv.style.display = 'block';
          }, 500); //change this little wait to 2s for prod...
        }
      }

    }
  };

  //fn to move to next player when continueBtn clicked
  const continueToNextPlayer = (e)=> {
    e.stopPropagation();
    [opponent, currentPlayer] = [currentPlayer, opponent]; //swap players
    boardsAndLabelsDiv.style.display = 'flex'; //restore boards div
    passDeviceDiv.style.display = 'none';
    msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2' }'s attack turn...`;
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
        [player1, player2] = [undefined, undefined].map((playerObj) => {
          playerObj = makePlayer(); //makes player obj with default 'human' type
           //add ship placement logic here...

          //populate player's board with default ships for now...
          playerObj.getGameboard().placeShip([0, 0], 'right', 'Patrol Boat');
          return playerObj; //return player obj to .map() for array destructuring assignment
        });
        //add extra ship for board 2 as a default for now...
        player2.getGameboard().placeShip([1, 0], 'right', 'Submarine');
        //inform starting player, enable startBtn
        msgDiv.textContent = 'Player 1 goes first! click start to begin...';
        startBtn.removeAttribute('disabled');
        break;
      //when 1P (battle computer) game type chosen...
      case 'playComputerBtn':
        gameType = '1P';
        break;
      //start listening for clicks when start btn clicked
      case 'startBtn':
        //assign current player and show their boards
        [currentPlayer, opponent] = [player1, player2];
        renderBoards();
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
        lg('restarting game...');//debug
        //when clicked, game boards/state should be reset, and player 1 asked to go first...
        //reset boards..


        //player1 starts again
        [currentPlayer, opponent] = [player1, player2];
        msgDiv.textContent = 'Game restarted. Player 1\'s attack turn...';
        //re-add the attackingBoardDiv listener and it's cb removed by a game over.
        //The browser keeps track of named fns added, avoiding duplicate attachments.
        attackingBoardDiv.addEventListener('click', sendAttack);
        break;
    }

  });

  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);
