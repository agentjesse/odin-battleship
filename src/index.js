/* Next task:
-add drag and drop ship placement (convert logCell fn)

-optional: make random ship placement fn and btn

-cleanup logs

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
  let computerAttacking = false; //boolean to hold off premature attacks against computer
  let debounceTimerIdentifier; //store timeout identifier from the setTimeout in sendAttack

  //fn to render a player's 2 boards; call after data changes in players' playGrid arrays
  const renderBoards = ()=> {
    // lg('rendering boards. current player has playGrid arr:'); //debug
    // lg( currentPlayer.getGameboard().getPlayGrid() ); //debug
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

  //fn to get and handle computer's attacks. called by setTimeout after attacking computer
  const getAndHandleComputerAttack = ()=> {
    //get computer's attack coordinates, need to pass in player's board for computer decision
    const compAtkRes = currentPlayer.getGameboard().receiveAttack(
      opponent.getNextAttackCoords( currentPlayer.getGameboard().getPlayGrid() )
    );
    renderBoards();//show computer's attack
    msgDiv.textContent = compAtkRes === 'hit'
      ? 'Computer\'s attack hit! Make your turn..'
      : 'Computer\'s Attack missed! Make your turn..';
    //check if computer won
    if ( currentPlayer.getGameboard().allShipsSunk() ) {
      //disable attackingBoardDiv, inform player
      attackingBoardDiv.removeEventListener('click', sendAttack);
      msgDiv.textContent = 'Computer wins!';
    }
    computerAttacking = false; //disable to allow player's next attack
  };

  //listener cb fn to handle sending an attack to opponent board and get computer's attacks
  const sendAttack = (e)=> {
    e.stopPropagation();
    //return early if debounceTimerIdentifier holds a timer identifier from setTimeout
    if (debounceTimerIdentifier) return;
    //return early if computer attack not done ...maybe not needed after debouncing?...
    if (computerAttacking) return;
    //set computerAttacking to true
    if (gameType === '1P') computerAttacking = true;
    //using conditional since div border clicks trigger listener cb
    if (e.target.className === 'cellDiv') {
      //call receiveAttack fn on opponent's gameboard, save result for display logic
      const attackRes = opponent.getGameboard()
        .receiveAttack( [e.target.dataset.row, e.target.dataset.col] );
      //only re-render when attackRes is a useful string like hit or miss
      if (attackRes) {
        renderBoards();//show attack result to current player
        //handle game over when all opponent's ships sunk
        if (opponent.getGameboard().allShipsSunk()) {
          //disable attackingBoardDiv, inform player
          attackingBoardDiv.removeEventListener('click', sendAttack);
          msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2' } wins!`;
          computerAttacking = false; //disable to allow player's next attack
        //handle next player's turn: show attack result message, wait a little to hide
        //boards and show passDeviceDiv. After that, we wait for the device pass, and for
        //next player to press the continue button with the continueToNextPlayer cb fn.
        } else {
          msgDiv.textContent = attackRes === 'hit' ? 'Attack hit!' : 'Attack missed!';
          //show current player's attack / info message for a delayed period, then either hide
          //boards and show passDeviceDiv, or proceed with computer's attack
          debounceTimerIdentifier = setTimeout( () => {
            if (gameType === '2P') {
              boardsAndLabelsDiv.style.display = 'none';
              passDeviceDiv.style.display = 'block';
            } else { // gameType === '1P'
              getAndHandleComputerAttack();
            }
            debounceTimerIdentifier = null; //clear it after either path
          }, 150); //extend this delay to 1500 for prod...
        }
      //handle click on cellDiv that did not result in hit / miss (previously attacked cell)
      } else {
        computerAttacking = false; //disable to allow player's next attack
      }
    //handle click not on a cellDiv, like border
    } else {
      computerAttacking = false; //disable to allow player's next attack
    }

  };
  /*sendAttack path debug checks:
    checking hit path:o  go:o
    miss:o    go:o
    faulty off cell:o
    faulty in cell:o */

  //fn to move to next player when continueBtn clicked
  const continueToNextPlayer = (e)=> {
    e.stopPropagation();
    [opponent, currentPlayer] = [currentPlayer, opponent]; //swap players
    boardsAndLabelsDiv.style.display = 'flex'; //restore boards div
    passDeviceDiv.style.display = 'none';
    msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2' }'s attack turn..`;
    renderBoards();
  };

  //listener for buttons in setupControlsWrap
  //begin game from btn of chosen game type
  document.querySelector('.setupControlsWrap').addEventListener('click', (e)=> {
    e.stopPropagation();

    //fn for default population of both player boards, for dev
    //base a new fn off this one for random all ship placement in prod...
    //refactor this out, being made on every listener call?...
    const defaultBoardsPopulation = ()=> {
      [player1, player2].forEach( (player) => {
        //populate player's board with default ships for now...
        // player.getGameboard().placeShip([0, 0], 'right', 'Patrol Boat');
        player.getGameboard().placeShip([4, 5], 'up', 'Destroyer');
        player.getGameboard().placeShip([5, 4], 'right', 'Submarine');
        player.getGameboard().placeShip([7, 2], 'up', 'Battleship');
        player.getGameboard().placeShip([8, 1], 'right', 'Carrier');

        return player; //return player obj to .map() for array destructuring assignment
      });
      //add extra ships for board 2 for now...
      // player2.getGameboard().placeShip([1, 0], 'right', 'Destroyer');
      // player2.getGameboard().placeShip([2, 0], 'right', 'Submarine');
      // player2.getGameboard().placeShip([3, 0], 'right', 'Battleship');
      // player2.getGameboard().placeShip([4, 0], 'right', 'Carrier');
    };

    //fn to log .cellDiv elem hovered over
    const logCell = (e)=> {
      const cell = e.target.className === 'cellDiv' ? e.target : null;
      if (cell) console.log(cell);

    }

    //fn to setup players, show/hids boards/buttons, attach listeners
    const setupPlayersAndListeners = ()=> {
      //assign current player, opponent, and show their boards
      [currentPlayer, opponent] = [player1, player2];
      renderBoards();
      //set btns
      [playOtherPlayerBtn, playComputerBtn, startBtn]
        .forEach((c) => c.setAttribute('disabled', ''));
      restartBtn.removeAttribute('disabled');
      msgDiv.textContent = 'Player 1\'s attack turn..';
      //listener to log .cellDiv element to console...
      attackingBoardDiv.addEventListener('mouseover', logCell);

      //set listener to handle attack cell clicks; re-adds it if removed by a game over
      //browser tracks named fns added, avoids duplicate attachments.
      attackingBoardDiv.addEventListener('click', sendAttack);
      //listener for 2 player game continue button
      continueBtn.addEventListener('click', continueToNextPlayer );
    };

    switch (e.target.id) {
      //when 2P (battle other player) game type chosen
      case 'playOtherPlayerBtn':
        gameType = '2P';
        //make and assign 2 players (default type human), populate their boards
        player1 = makePlayer();
        player2 = makePlayer();
        defaultBoardsPopulation();//for dev...
        //inform starting player, enable startBtn
        msgDiv.textContent = 'Player 1 goes first! click start to begin';
        startBtn.removeAttribute('disabled');
        break;
      //when 1P (battle computer) game type chosen
      case 'playComputerBtn':
        gameType = '1P'; //gameType for computer choice logic
        //make one human, one computer player
        player1 = makePlayer(); //type 'human' is default
        player2 = makePlayer('computer');
        defaultBoardsPopulation();//for dev...
        setupPlayersAndListeners();
        break;
      //start listening for clicks when start btn clicked
      case 'startBtn':
        setupPlayersAndListeners();
        break;
      //handle boards/state reset, game restart
      case 'restartBtn':
        lg('restarting game..');//debug
        //restore boards if reset button pressed when passDeviceDiv active
        boardsAndLabelsDiv.style.display = 'flex';
        passDeviceDiv.style.display = 'none';
        //path for restarting computer battle...
        if (gameType === '1P') {
          //reset boards
          player1 = makePlayer();//player obj with default 'human' type
          player2 = makePlayer('computer');
          defaultBoardsPopulation();//for dev...
          setupPlayersAndListeners();
        //path for restarting 2 player battle
        } else {
          //reset boards by reassigning player1/2 to new player objects with null playGrid arrays
          player1 = makePlayer();//player obj with default 'human' type
          player2 = makePlayer();
          defaultBoardsPopulation();//for dev...
          setupPlayersAndListeners();
        }
        break;
    }

  });

  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);
