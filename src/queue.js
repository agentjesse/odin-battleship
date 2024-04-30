//simple queue data structure (based off linked list)

import { logToConsole as lg, objectToString as ots } from './logger.js'; //shorthand loggers

//node object maker
const makeNode = (data, next = null)=> ( { data, next } );

//queue object maker
const makeQueue = ()=> {
  let head = null; let tail = null; let size = 0;
  //management fns

  //fn to add new node to queue as tail
  const enqueue = (data)=> {
    //handle empty queue
    if (!head) {
      head = makeNode(data);
      tail = head;
    //handle non-empty queue
    } else {
      tail.next = makeNode(data);
      tail = tail.next;
    }
    size++;
  };

  //fn to remove head of queue and return the node's data
  const dequeue = ()=> {
    //handle empty queue
    if (!head) return null;
    //dequeue head
    const dequeuedNode = head;
    head = head.next;
    size--;
    //clear tail if last node is removed
    if (!head) tail = null;
    return dequeuedNode.data;
  };

  return {
    enqueue,
    dequeue,
    getSize: ()=> size,
    getHead: ()=> head,
    getTail: ()=> tail
  };
};
export default makeQueue;

//queue data structure testing. comment out since this file is exported
// const q = makeQueue();
// q.enqueue(1);
// lg( q.dequeue() ); //error checking
// q.enqueue(2);
// q.enqueue(3);
// lg( `queue size: ${q.getSize()}` );
// lg( ots( q.getHead() ) ); //ots used since node truncates long strings
// lg( q.getTail() );
