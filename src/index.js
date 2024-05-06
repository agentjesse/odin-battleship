/* Next task:

-make random ship placement btn for players to use...

-cleanup logs

-move initProject vars into the fns that need them
-find fns to refactor out of callbacks, if any

-update linkedlist in its own repo and your other projects to match the one from this project where at() has been optimized. there is another optimization to do also, if there is time...

-turn this repo into new boilerplate, OR: update logger file, index.js imports examples, eslint config, package.json, refactor boilerplate to use main.js/main.test.js
*/

// JS/CSS imports
import './styles.css';
// import './assets/book-remove.svg'; //asset files example
//include file extension For Node.js when importing local modules:
import { logToConsole as lg, log2DStringArray as lg2sa } from './logger.js';
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
  let player1ShipsPlaced = false; //to track player ship placement completion

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
      //log opponent playGrid arr after sending attack
      // lg2sa( opponent.getGameboard().getPlayGrid() ); //comment for prod
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

  //fn to move to next player when continueBtn clicked. handles hiding between
  //ship placements too.
  const continueToNextPlayer = (e)=> {
    e.stopPropagation();
    [opponent, currentPlayer] = [currentPlayer, opponent]; //swap players
    passDeviceDiv.style.display = 'none'; //hide
    if (player1ShipsPlaced) { //for player2's ship placement
      placeShipsAndSetup();
      //show boards after renderBoards call within placeShipsAndSetup
      boardsAndLabelsDiv.style.display = 'flex';
    } else { //for between attacks
      renderBoards(); //remake cells
      boardsAndLabelsDiv.style.display = 'flex'; //show boards
      msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2' }'s attack turn..`;
    }
  };

  //fn to setup buttons, attach listeners, start listening for attacks
  //need to make sure works for 2P...
  const setupButtonsAndListeners = ()=> {
    restartBtn.removeAttribute('disabled'); //allow restarting, same gameType

    msgDiv.textContent = 'Player 1\'s attack turn..';

    //set listener to handle attack cell clicks; re-adds it if removed by a game over
    //browser tracks named fns added, avoids duplicate attachments.
    attackingBoardDiv.addEventListener('click', sendAttack);
  };

  //fn to click-to-place 5 ships (simpler than drag and drop) for player 1, then
  //player 2 if needed, then continue to game setup.
  const placeShipsAndSetup = ()=> {
    let lastHoveredCell; //store last cell hovered over
    const shipNamesToPlace = ['Patrol Boat', 'Destroyer', 'Submarine', 'Battleship', 'Carrier'];
    const shipLengths = [2, 3, 3, 4, 5];
    let shipIndex = 0;
    let shipDirection = 'right'; //for ship placement
    const shipOverlayDiv = document.querySelector('.shipOverlayDiv');
    const clearableBtnsDiv = document.querySelector('.clearable'); //for ship direction button

    //cb fn to change ship placement direction
    const changeDirection = ()=> shipDirection = shipDirection === 'right' ? 'down' : 'right';

    //listener cb fn to show shipOverlayDiv for current ship being placed. saves hovered cell
    const showShipOverlay = (e)=> {
      e.stopPropagation();
      lastHoveredCell = e.target.classList.contains('cellDiv') ? e.target : null;
      if (lastHoveredCell) { // .cellDivs only
        //align ship overlay to lastHoveredCell
        shipOverlayDiv.style.top = `${lastHoveredCell.getBoundingClientRect().top + window.scrollY}px`;
        shipOverlayDiv.style.left = `${lastHoveredCell.getBoundingClientRect().left + window.scrollX}px`;
        //set overlay dimensions from ship length
        if (shipDirection === 'right') { //place horizontal ship
          shipOverlayDiv.style.width = `${ lastHoveredCell
            .getBoundingClientRect().width * shipLengths[shipIndex] }px`;
          shipOverlayDiv.style.height = `${lastHoveredCell.getBoundingClientRect().height}px`;
        } else if (shipDirection === 'down') { //place vertical ship
          shipOverlayDiv.style.width = `${lastHoveredCell.getBoundingClientRect().width}px`;
          shipOverlayDiv.style.height = `${ lastHoveredCell
            .getBoundingClientRect().height * shipLengths[shipIndex] }px`;
        }
      }
    };

    //fn to clean up after ship placements. removes listeners
    const shipPlacementCleanup = ()=> {
      receivingBoardDiv.removeEventListener('click', placeShipFromCell);
      receivingBoardDiv.removeEventListener('mouseover', showShipOverlay);
      shipDirectionBtn.removeEventListener('click', changeDirection);
      shipOverlayDiv.style.display = 'none'; // hide shipOverlayDiv
      shipDirectionBtn.setAttribute('disabled', ''); //disable direction btn
    };

    //cb fn to place 5 ships in current player's gameboard
    const placeShipFromCell = (e)=> {
      e.stopPropagation();
      //when a ship must be placed and cursor is still over cell
      if (shipIndex < shipNamesToPlace.length && lastHoveredCell) {
        //try placing a ship; placeShip throws errors to catch
        try {
          currentPlayer.getGameboard().placeShip(
            [+lastHoveredCell.dataset.row, +lastHoveredCell.dataset.col],
            shipDirection,
            shipNamesToPlace[shipIndex]
          );
          renderBoards(); //show the placed ship
          shipIndex++; //increment index
          //set msg for next ship placement if ship index valid
          if (shipIndex < 5) {
            msgDiv.textContent = `Place your ${shipNamesToPlace[shipIndex]}`;
          //continue to setup/start game when all ships placed (shipIndex === 5)
          } else if (gameType === '1P') {
            shipPlacementCleanup(); //remove listeners
            player2.getGameboard().placeShipsRandomly();//populate computer's board randomly
            setupButtonsAndListeners(); //setup / start game
          } else if (gameType === '2P') {
            //hide shipOverlayDiv...
            shipOverlayDiv.style.display = 'none';
            //P2 needs to place their ships when P1 finishes
            if (!player1ShipsPlaced) {
              //assign player1ShipsPlaced to true now that player 1 ships are placed.
              //when this condition in the control flow statement is met, the next
              //else if condition block will not execute.
              player1ShipsPlaced = true;
            //when player1ShipsPlaced is true, then player2 ships placement has finished
            } else if (player1ShipsPlaced) {
              //set player1ShipsPlaced control var to false for attacks to begin
              //after continueToNextPlayer fn checks it
              player1ShipsPlaced = false;
              shipPlacementCleanup(); //remove listeners
              setupButtonsAndListeners(); //setup / start game
            }
            boardsAndLabelsDiv.style.display = 'none';
            passDeviceDiv.style.display = 'block';
            msgDiv.textContent = ''; //clear prev player msg
          }
          //log ship placement errors, user can try again
        } catch (err) {
          msgDiv.textContent = 'invalid ship placement, try again';
          // lg(err.message);
        }
      }
    };

    shipOverlayDiv.style.display = 'block'; //show shipOverlayDiv if it was hidden
    renderBoards(); //show current player's boards
    //make and add ship direction change btn in cleared .clearable div
    clearableBtnsDiv.textContent = ''; //clear old btns
    const shipDirectionBtn = document.createElement('button');
    shipDirectionBtn.textContent = 'change ship direction';
    clearableBtnsDiv.append( shipDirectionBtn );
    shipDirectionBtn.addEventListener('click', changeDirection);
    //show preview overlay of ship to place on hovered .cellDiv element
    receivingBoardDiv.addEventListener('mouseover', showShipOverlay);
    //show ship placement message
    msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2'}, click
    to place your Patrol Boat`;
    //start listeners for current player ship placement
    receivingBoardDiv.addEventListener('click', placeShipFromCell);
    continueBtn.addEventListener('click', continueToNextPlayer );
  };

  //listener for buttons in setupControlsWrap
  //begin game from btn of chosen game type
  document.querySelector('.setupControlsWrap').addEventListener('click', (e)=> {
    e.stopPropagation();

    switch (e.target.id) {
      //when 2P (battle other player) game type chosen...
      case 'playOtherPlayerBtn':
        gameType = '2P';
        //make and assign 2 players (both are default type human)
        player1 = makePlayer();
        player2 = makePlayer();
        [currentPlayer, opponent] = [player1, player2];
        //inform starting player, enable startBtn
        msgDiv.textContent = 'Player 1, please take device and click start';
        startBtn.removeAttribute('disabled'); //
        break;
      //when 1P (battle computer) game type chosen
      case 'playComputerBtn':
        gameType = '1P'; //gameType for computer choice logic
        //make one human, one computer player
        player1 = makePlayer(); //type 'human' is default
        player2 = makePlayer('computer');
        [currentPlayer, opponent] = [player1, player2];
        //start ship placement listener, it will take over control flow and
        //setup/start game when all ships placed
        placeShipsAndSetup();
        break;
      //For 2P games: start btn step gets players used to passing the play device
      case 'startBtn':
        startBtn.setAttribute('disabled', ''); //not needed anymore
        placeShipsAndSetup();
        break;
      //handle boards/state reset, game restart
      case 'restartBtn':
        //path for restarting computer battle
        if (gameType === '1P') {
          //remake boards, reset player order
          player1 = makePlayer();
          player2 = makePlayer('computer');
          [currentPlayer, opponent] = [player1, player2];
          attackingBoardDiv.removeEventListener('click', sendAttack); //disable until ships placed
          restartBtn.setAttribute('disabled', ''); //disable until game starts
          //start ship placement listener, it will take over control flow and
          //setup/start game when all ships placed
          placeShipsAndSetup();
        //path for restarting 2 player battle...
        } else {
          // lg('restarting 2p game..');//debug
          //restore boards if restart button pressed when passDeviceDiv active
          boardsAndLabelsDiv.style.display = 'flex';
          passDeviceDiv.style.display = 'none';
          //reset boards by reassigning player1/2 to new player objects with null playGrid arrays
          player1 = makePlayer();
          player2 = makePlayer();
          [currentPlayer, opponent] = [player1, player2];
          attackingBoardDiv.removeEventListener('click', sendAttack); //disable until ships placed
          restartBtn.setAttribute('disabled', ''); //disable until game starts
          //start ship placement listener, it will take over control flow and
          //setup/start game when all ships placed
          placeShipsAndSetup();
        }
        break;
    }

  });

  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);
