function Queue(){
	this.queue = [];

	// length: 获取队列的长度
	this.getLength = function(){
		return (this.queue.length);
	};

	// isEmpty: 判断队列是否为空
	this.isEmpty = function(){
		return (this.queue.length == 0);
	};

	// enqueue: 添加队列项
	this.enqueue = function(item){
		this.queue.push(item);
	};

	// dequeue: 减少队列项
	this.dequeue = function(){
		// 队列为空的情况
		if(this.queue.length == 0) return undefined;

		var item = this.queue[0];
		var new_arr = [];
		for(var i = 1; i < this.queue.length; i++){
			new_arr.push(this.queue[i]);
		}
		this.queue = new_arr;
		return item;
	};

	// peek: 返回队列的头部，若为空，返回undefined
	this.peek = function(){
		return (this.queue.length > 0 ? this.queue[0] : undefined);
	};

	// getAll: 获取队列所有项
	this.getAll = function(){
		return this.queue;
	};
}

