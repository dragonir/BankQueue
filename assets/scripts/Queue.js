/*  Queue.js
  用于表示队列的函数
*/

 /*
    创建一个队列结构，一个队列是一个先进先出（FIFO）的数据结构，数据项被添加到队列的尾部，从队列头部移除数据
 */ 
function Queue(){
    // 初始化
    var queue  = [];
    var offset = 0;

    // 获取队列长度
    this.getLength = function(){
        return (queue.length - offset);
    };

    // 判断队列是否为空，若队列为空，返回true，否则返回false
    this.isEmpty = function(){
      return (queue.length == 0);
    };

  /* Enqueues the specified item. The parameter is:
   *
   * item - the item to enqueue
   */
  this.enqueue = function(item){

    // enqueue the item
    queue.push(item);

  };

  /* Dequeues an item and returns it. If the queue is empty then undefined is
   * returned.
   */
  this.dequeue = function(){

    // if the queue is empty, return undefined
    if (queue.length == 0) return undefined;

    // store the item at the front of the queue
    var item = queue[offset];

    // increment the offset and remove the free space if necessary
    if (++ offset * 2 >= queue.length){
      queue  = queue.slice(offset);
      offset = 0;
    }

    // return the dequeued item
    return item;

  };

  /* Returns the item at the front of the queue (without dequeuing it). If the
   * queue is empty then undefined is returned.
   */
  this.peek = function(){

    // return the item at the front of the queue
    return (queue.length > 0 ? queue[offset] : undefined);

  };

  this.getAll = function() {
    return queue;
  };
}
