var password = document.getElementsByTagName("input")[0],
	btn = document.getElementsByTagName("button")[0];

// 按钮事件
function validate(){
	if(password.value == "123456"){
		window.open("./home.html", "_self");
	}
	else{
		alert("请输入正确的邀请码！");
		// document.getElementsByClassName("alert")[0].style.display = "block";
	}
}


var question = document.getElementById("question");
var qom = document.getElementById("qom");
question.addEventListener("mouseover", function(){
	qom.style.display = "block";
}, false);
question.addEventListener("mouseout", function(){
	qom.style.display = "none";
}, false);


// enter 事件
(function(){
	password.addEventListener("keydown", function(){
		if(event.keyCode == 13 && password.value == "123456"){
			window.open("./home.html", "_self");
		}
	}, false)
})();
