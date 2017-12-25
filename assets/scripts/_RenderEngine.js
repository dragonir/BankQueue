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
					RenderingEngine.appendItem("CLOCK: " + clock, "clock_changed");
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
						RenderingEngine.appendItem("<p>空闲服务人员列表</p>" + message, type);
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
					case
				}
			}
		}
	}
}