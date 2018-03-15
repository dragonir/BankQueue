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


// 滚动条自动滚动动画
function scrollAnimate(){
	var oDiv = document.getElementById("results");
	var oUl = oDiv.getElementsByTagName("ul")[0];
	var btnUp = document.getElementById("btnUp");
	var btnDown = document.getElementById("btnDown");
	var btnToggle = document.getElementById("btnToggle");
	var timer = null;
	var speed = -1;
	oUl.innerHTML +=oUl.innerHTML;
	setTimeout(move, 1500);
	btnUp.onclick = function(){
		clearInterval(timer);
		speed = -1;
		move();
	};
	btnDown.onclick = function(){
		clearInterval(timer);
		speed = 1;
		move();
	};
	oUl.onmouseover = function(){
		clearInterval(timer);
	};
	oUl.onmouseout = function(){
		move();
	};
	function move(){
		timer = setInterval(function(){
			oUl.style.top = oUl.offsetTop + speed + "px";
			if(oUl.offsetTop <= - oUl.offsetHeight / 2){
				oUl.style.top = "0";
			}
			else if(oUl.offsetTop >= 0){
				oUl.style.top = - oUl.offsetHeight / 2 + "px";
			};
		}, 30);
	};
}