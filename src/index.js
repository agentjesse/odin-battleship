/* Next task:
-  write next tasks for project here, commit messages get buried
- example task
*/

// JS/CSS imports
//For Node.js, when importing local modules, include the file extension in the import statement.
import './styles.css';
import './assets/book-remove.svg'; //not used, just example
import { logToConsole as lg, tableToConsole as tb, objectToString as ots } from './logger.js';
// import { functionOne } from './myModule'; //modules import testing
// functionOne();

//Project wrapped in initializer function to not have it's top level code execute when jest
//imports this file.
const initProject = ()=> {



  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);

//jest testing for this file is in index.test.js and done with ES Module exports
export const sum = (a, b)=> a + b; //extra example fn for testing
