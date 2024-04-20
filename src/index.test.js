// eslint-disable-next-line object-curly-newline
import { makeShip } from './index.js';
/* this test works, just hiding it.
test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});
*/

test('ship objects creation with: length, hitsReceived, isSunk', () => {
  //matcher for exact equality (Object.is)
  expect(makeShip()).toEqual({ length: 2, hits: 0, isSunk: false });
});

