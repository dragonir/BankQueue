// 页面加载调整页面高度
window.onload = function(){
// 	var wrapper = document.getElementById("wrapper");
// 	var H = document.body.offsetHeight - 110;
// 	wrapper.style.height = H + "px";
	// tips高度
	// var tips = document.getElementById("tips");
	// var H2 = document.body.offsetHeight - 45;
	// tips.style.height = H2 + "px";
	// tips.style.marginTop = -H2 + "px";
	// about高度
	// var about = document.getElementById("about");
	// about.style.height = H2 + "px";
	// about.style.marginTop =  -H2 + "px";
}

// 显示提示标签,隐藏关于标签
var a_tips = document.getElementById("a_tips");
var a_about = document.getElementById("a_about");
EventUtil.addHandler(a_tips, "click", function(){
	tips.style.display = "block";
	about.style.display = "none";
});
// 显示关于标签，隐藏提示标签
EventUtil.addHandler(a_about, "click", function(){
	about.style.display = "block";
	tips.style.display = "none";
});

// 全屏提示
// (function(){
// 	var t = setTimeout(function(){
// 		alert("为了最佳显示效果，请在全屏环境下使用系统！");
// 	}, 150);
// })();