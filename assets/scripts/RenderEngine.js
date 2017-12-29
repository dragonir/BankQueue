RenderingEngine = {
	// 执行租赁动作的作用
	"render": function(log){
		var c1, c2;
		for(c1 in log){
			for(c2 in log[c1]){
				var item = log[c1][c2];
				var message = item["message"];
				var type = item["type"];
				var clock = item["clock"];
				var prevClock, clockChanged;

				// 检查时钟是否变化
				if(prevClock != clock){
					clockChanged = true;
					prevClock = clock;
				}
				else{
					clockChanged = false;
				}

				// 如果时钟变化，插入一行
				if(clockChanged){
					RenderingEngine.appendItem("时钟: " + clock, "clock_changed");
				}

				switch(type){
					case SystemStateLogTypes.Customer.Enter:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.Customer.GetService:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.Customer.Exit:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.TellerManager.CreateTeller:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.TellerManager.Increase:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.TellerManager.ListFreeTellers:
						RenderingEngine.appendItem("<p>空闲服务员列表</p>" + message, type);
						break;
						break;
					case SystemStateLogTypes.Teller.StateBusy:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.Teller.StateFree:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.Queue.Log:
						RenderingEngine.appendItem("<p>顾客队列</p>" + message, type);
						break;
					case SystemStateLogTypes.NumberingMachine.Increase:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.SimulationEngine.Start:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.SimulationEngine.Finish:
						RenderingEngine.appendItem(message, type);
						break;
					case SystemStateLogTypes.SimulationEngine.Log:
						RenderingEngine.appendItem(message, type);
						break;
					default:
						LOG.error("Invalid SystemStateLogTypes passed to rendering engines: " + type);
						break;
				}
			}
		}
	},

	// 保存临时输出
	"renderedItems": "",

	// 将新项目添加到临时输出中
	"appendItem": function(item, htmlclass){
		this.renderedItems += "\n" + "<li class= '" + htmlclass + "'>" + item + "</li>" + "\n";
	},

	// 将零时输出包含其中并产生最后结果  
	"getRenderedOutput": function(){
		return "<ul>" + this.renderedItems + "</ul>";
	},

	// 调用一个队列结构
	"renderQueue": function(queue){
		var res = "";
		// 检查队列是否为空
		if(!queue.isEmpty()){
			result = "<ol>";
			var queue_all = queue.getAll();
			for(var i = 0; i < queue_all.length - 1; i++){
				var customer = queue_all[i];
				var customerid = customer.customerid;
				var enterTime = customer.enterTime;
				result += "<li>";
					result += "<ul class='inline-ul'>";
						result += "<li>";
							result += "<span class='label'>ID</span>";
							result += "<span class='value'>" + customerid + "</span>";
						result += "</li>";
						result += "<li>";
							result += "<span class='label'>到达时间<span>";
							result += "<span class='value'>" + enterTime + "</span>";
						result += "</li>";
					result += "</ul>";
				result += "</li>";
			}
			result += "</ol>";
		}
		else{
			result += "<p>顾客队列为空</p>";
		}
		return result;
	},

	"renderTellerArray": function(tellerArr){
		var result = "";
		// 检验服务员队列是否为空
		if(tellerArr.length > 0){
			result = "<ul>";
			for(var i = 0; i <=tellerArr.length - 1; i++){
				var teller = tellerArr[i];
				var tellerid = teller.tellerid;
				var customerid = teller.customerid;
				result += "<li>";
					result += "<ul class='inline-ul'>";
						result += "<li>";
							result += "<span class='label'>ID</span>";
							result += "<span class='value'>" + tellerid + "</span>";
						result += "</li>";
						result += "<li>";
							result += "<span class='label'>顾客ID</span>";
							result += "<span class='value'>" + customerid + "</span>";
						result += "</li>";
					result += "</ul>";
				result += "</li>";
			}
			result += "</ul>";
		}
		else{
			result += "<p>服务员数组为空</p>";
		}
		return result;
	}
}