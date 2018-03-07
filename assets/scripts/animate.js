// animateClock
function animateClock(){
	var span = document.getElementById("animateSpan");			// 显示区
	var num = 0;												// 时钟初始值
	setTimeout(increaseNum, 500);

	// 时钟增加
	function increaseNum(){
		var max = document.getElementById("duration").value;
		span.innerHTML = num;
		num++;
		if(num <= max){
			setTimeout(increaseNum, 500);
		}
	}
}
	
// animateTeller
function animateTeller(){
	var teller = document.getElementById("animateTeller");
	var tel = "<span class='tel'></span>";
	var tellerNum = document.getElementById("tellerscount").value;
	for(var i = 0; i < tellerNum; i++){
		var tel = document.createElement("span");
		tel.setAttribute("class", "tel");
		var txt = document.createTextNode("服务台: " + i);
		tel.appendChild(txt);
		teller.appendChild(tel);
	}
}


// // animateCustomerQueue
// function animateCustomerQueue(){
// 	var queue = document.getElementById("animateCustomerQueue");
// 	queue.innerHTML = RenderingEngine.renderQueue();
// }

// 开始模拟进程
function animateCustomerQueue(){
	// // var container = document.getElementById("animateCustomerQueue");
	// var li = $("#animateCustomerQueue ul .queue_log");
	// li.style.display = "none";
}