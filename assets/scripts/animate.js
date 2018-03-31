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
		}, 20);
	};
}