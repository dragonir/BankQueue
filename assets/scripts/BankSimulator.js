// jQuery匿名函数
(function($){
	$(document).ready(function(){
		// 点击产生随机数据按钮，用于产生客户到达时的随机数队列
		$("#generaterandom").click(generateRandomTable);
		// 开始模拟
		$("#startsimulate").click(function(){
			if(SIMULATION_STARTED){
				if(confirm("该页面将进行刷新，当前页面所有数据都会丢失！\n" +
            "页面刷新成功后你需要重新点击该按钮产生数据. \n" +
            "继续?")){
					location.reload();
				}
			}
			else{
				start_simulate();
				// 产生模拟结果
				jQuery("#summary").html(collect_summary());
			}
		});
	});
})(jQuery);


// 打印系统类型
LOGTYPES = {
	"disabled": 0,
	"console": 1,
	"alert": 2
};


// 设置log类型用于debugge
logtype = LOGTYPES.console;


// 打印系统对象
LOG = {
	"warn": function(){
		var msg = jQuery.makeArray(arguments).join("\n");
		switch(logtype){
			case LOGTYPES.alert:
				msg = "Warning:\n\n" + msg;
				alert(msg);
				break;
			case LOGTYPES.console:
				console.warn(msg);
				break;
		}
	},

	"error": function(){
		var msg = jQuery.makeArray(arguments).join("\n");
		switch(logtype){
			case LOGTYPES.alert:
				msg = "Error:\n\n" + msg;
				alert(msg);
				break;
			case LOGTYPES.console:
				console.error(msg);
				break;
		}
	},

	"debug": function(){
		var msg = jQuery.makeArray(arguments).join("\n");
		switch(logtype){
			case LOGTYPES.alert:
				msg = "Debug:\n\n" + msg;
				alert(msg);
				break;
			case LOGTYPES.console:
				console.debug(msg);
				break;
		}
	},

	"log": function(){
		var msg = jQuery.makeArray(arguments).join("\n");
		switch(logtype){
			case LOGTYPES.alert:
				msg = "Log:\n\n" + msg;
				alert(msg);
				break;
			case LOGTYPES.console:
				console.log(msg);
				break;
		}
	}
};


 // 全局时钟，用于时间追踪（用分钟存储模拟时间）
CLOCK = 0;


// 初始化模拟状态，开始为false
SIMULATION_STARTED = false;


// 用于存储被创建出的所有顾客（来到银行的顾客）
AllCustomers = [];


// 使用TellerState对象来枚举服务人员的状态：空闲/忙碌
TellerState = {
	"Free": 0,
	"Busy": 1
};


// 使用CustomerState对象来枚举顾客的状态
// 1. 等待服务
// 2. 被服务
// 3. 服务完毕
CustomerState = {
	"WaitingForService": 0,
	"InService": 1,
	"FinishedJob": 2
};


// 枚举系统的状态
SystemStateLog = [];
SystemStateLogTypes = {

	// 顾客
	"Customer": {
		//新顾客进入
		"Enter": "customer_enter",				
		// 顾客得到服务
		"GetService": "customer_getservice",
		// 顾客得到服务离开		
		"Exit": "customer_exit"					
	},

	// 
	"TellerManager": {
		// 系统产生服务人员
		"CreateTeller": "tellermanager_create_teller",
		// 叫号器呼叫新用户
		"Increase": "tellermanager_increase",
		// 列举空闲服务人员
		"ListFreeTellers": "tellermanager_listfree"
	},

	// 服务人员
	"Teller": {
		// 状态忙碌
		"StateBusy": "teller_state_busy",
		// 状态空闲
		"StateFree": "teller_state_free"
	},

	// 顾客队列
	"Queue": {
		// 打印顾客队列
		"Log": "queue_log"
	},

	// 发号器
	"NumberingMachine": {
		// 顾客从发号器获得号码
		"Increase": "numberingmachine_increase"
	},

	// 模拟器
	"SimulationEngine": {
		// 模拟开始
		"Start": "simulation_start",
		// 模拟结束
		"Finish": "simulation_finish",
		// 一个新的log entry，它和以前的log和前面新增的数据
		"Log": "simulation_log"
	}
};


// 打印信息函数，用于在页面上输出系统状态信息
function SystemState_log(type, msg){
	if(typeof(SystemStateLog[CLOCK]) == "undefined"){
		SystemStateLog[CLOCK] = [];
	}

	 //if this is an object, its Queue object. we render it immediately
	 var newmsg;
	 if(typeof msg == "object"){
	 	if(msg.hasOwnProperty("getAll")){
	 		newmsg = RenderingEngine.renderQueue(msg);
	 	}
	 	else{
	 		newmsg = msg;
	 	}
	 }
	 else{
	 	newmsg = msg;
	 }
	 SystemStateLog[CLOCK][SystemStateLog[CLOCK].length] = {
	 	"message": newmsg,
	 	"type": type,
	 	"clock": CLOCK
	 };
}


// 产生随机整数
function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


// 在textarea中产生并插入一个随机表格
function generateRandomTable(){
	var table_str = "",
	prev_time = 0,
	samp_time = 0,		// temp
	duration = $("#duration").val(),	// 从输入获得
	customer_count = getRandomInt(Math.floor(duration / 3), duration),
	max_time;

	// 产生相邻的随机时间点
	for(var i=1; i<=customer_count; i++){
		max_time = prev_time + 5;
		if(max_time > duration - 5){
			max_time = duration - 5;
		}
		samp_time = getRandomInt(prev_time, max_time);
		if(prev_time == samp_time){
			continue;
		}
		table_str += "\n" + samp_time;
		if(samp_time == duration){
			break;
		}
		prev_time = samp_time;
	}
	$("#arrivaltable").val(table_str.trim());
}


// 管理服务人员
TellerManager = {
	// @internal
	"tellers": [],
	"lastnumber": 0,

	// 产生一个新的服务人员，分配一个ID，push到tellers数组中
	"createTeller": function(){
		LOG.debug("called TellerManager.createTeller()");
		var teller = new Teller(this.tellers.length + 1);
		this.tellers.push(teller);

		// 打印服务人员
		SystemState_log(SystemStateLogTypes.TellerManager.CreateTeller, "服务人员就绪");
		SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "服务人员ID: " + teller.tellerid);
	},

	// 通过ID获取服务人员对象
	"getTeller": function(tellerid){
		LOG.debug("called TellerManager.getTeller(" + tellerid + ")");
		if(typeof(this.tellers[tellerid - 1]) != "undefined"){
			return this.tellers[tellerid -1];
		}
		else {
			return false;
		}
	},

	// 获取所有空闲服务人员数组
	"getFreeTellers": function(){
		LOG.debug("called TellerManager.getFreeTellers()");
		var result = [];
		this.tellers.forEach(function(teller1){
			if(teller1.state == TellerState.Free){
				result.push(teller1);
			}
		});
		return result;
	},

	// 获取等待的到服务的顾客数组
	"getWaitingNumbers": function(){
		LOG.debug("called TellerManager.getWaitingNumbers()");
		var result = [];
		this.tellers.forEach(function(teller1){
			if(teller1.state == TellerState.Free){
				result.push(teller1.customerid);
			}
		});
		return result;
	},

	// 检验一个顾客ID是否能立刻得到服务
	"searchForWaitingCustomer": function(customerid){
		LOG.debug("called TellerManager.searchForWaitingCustomer(" + customerid + ")");
		var waitingNumbers = this.getWaitingNumbers();
		return (waitingNumbers.indexOf(customerid) >= 0);
	},

	"increaseNumber": function(){
		LOG.debug("called TellerManager.increaseNumber()");
		// 打印新增的号码
		SystemState_log(SystemStateLogTypes.TellerManager.Increase, "叫号器呼叫新用户");
		SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "新号码: " + (this.lastnumber + 1));
		return ++this.lastnumber;
	}
};


// 发号器（Queue manager）
NumberingMachine = {
	// @inernal
	"number": 0,

	// 获取号码
	"getNumber": function(){
		LOG.debug("called NumberingMachine.getNumber()");
		return this.number;
	},

	// 新号码
	"increase": function(){
		LOG.debug("called NumberingMachine.increase()");
		// 打印新号
		SystemState_log(SystemStateLogTypes.NumberingMachine.Increase, "发号器产生新号码");
		SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "新号码: " + (this.number + 1));
		return ++this.number;
	}
};


// 构造器
function Teller(id){
	LOG.debug("called new Teller(" + id + ")");
	this.tellerid = id;		// 由服务人员设置

	//Set number to a new customer, and set state to Free
	//This simulates a new customer call.
	this.state = TellerState.Free;
	this.customerid = TellerManager.increaseNumber();

	// @internal
	this.lastChangeTime = CLOCK;
	this.totalFreeTime = 0;
	this.totalBusyTime = 0;

	// 将服务人员状态设置为忙碌（新顾客被接受）
	this.setStateBusy = function(customerid){
	 	if(this.state == TellerState.Busy){
	 		LOG.error("Teller is already busy.");
	 		return false;
	 	}

	 	// 计算总空闲时间
	 	this.totalFreeTime += (CLOCK - this.lastChangeTime);

	 	// 更新状态和最后变化时间
	 	this.lastChangeTime = CLOCK;
	 	this.state = TellerState.Busy;
	 	this.customerid = customerid;

	 	// 打印服务人员开始忙碌信息
	 	SystemState_log(SystemStateLogTypes.Teller.StateBusy, "服务人员开始服务");
	 	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "服务人员ID: " + this.tellerid);
	 	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "被服务顾客ID: " + customerid);
	 	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "总闲暇时间: " + this.getTotalFreeTime() + " 分钟.");
	 	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "总服务时间: " + this.getTotalBusyTime() + " 分钟.");

	 	// 打印空闲服务人员
	 	SystemState_log(SystemStateLogTypes.TellerManager.ListFreeTellers, RenderingEngine.renderTellerArray(TellerManager.getFreeTellers()));

	 	return true;
	};

	// 将服务人员状态设置为空闲（等待下一个顾客）
	this.setStateFree = function(){
	 	if(this.state == TellerState.Free){
	 		LOG.error("Teller is already free.");
	 		return false;
	 	}

	 	// 计算总忙碌时间
	 	this.totalBusyTime += (CLOCK - this.lastChangeTime);

	 	// 更新状态和最后变化时间
	 	this.lastChangeTime = CLOCK;
	 	this.state = TellerState.Free;
	 	this.customerid = TellerManager.increaseNumber();

	 	// 打印服务人员开始空闲信息
	 	SystemState_log(SystemStateLogTypes.Teller.StateFree, "服务人员开始空闲。");
	 	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "服务人员ID: " + this.tellerid);
	 	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "现在能接收的顾客ID: " + this.customerid);
	 	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "总空闲时间: " + this.getTotalFreeTime() + " 分钟");
	 	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "总忙碌时间: " + this.getTotalBusyTime() + " 分钟");

	 	// 打印空闲服务人员
	 	SystemState_log(SystemStateLogTypes.TellerManager.ListFreeTellers, RenderingEngine.renderTellerArray(TellerManager.getFreeTellers()));

	 	return true;
	};

	// 获取服务人员的总空闲时间
	this.getTotalFreeTime = function(){
	 	var curr = 0;
	 	if(this.state == TellerState.Free){
	 		curr = CLOCK - this.lastChangeTime;
	 	}
	 	return curr + this.totalFreeTime;
	};

	// 获取服务人员的总忙碌时间
	this.getTotalBusyTime = function(){
	 	var curr = 0;
	 	if(this.state == TellerState.Busy){
	 		curr = CLOCK - this.lastChangeTime;
	 	}
	 	return curr + this.totalBusyTime;
	};
}


// 构造器
function Customer(){
	this.customerid = NumberingMachine.increase();
	// 将该客户存储在AllCustomers中用于以后调用
	AllCustomers[this.customerid] = this;
	// 应该在顾客被服务时被服务人员设定
	this.tellerid = 0;
	this.state = CustomerState.WaitingForService;
	this.enterTime = CLOCK;
	this.inServiceTime = null;
	this.exitTime = null;

	// 设置服务中Inservice的状态
	this.setStateInService = function(){
		this.inServiceTime = CLOCK;
		this.state = CustomerState.InService;
		// 打印顾客得到服务的信息
		SystemState_log(SystemStateLogTypes.Customer.GetService, "顾客得到服务");
		SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客ID: " + this.customerid);
		SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客等待时间总长: " + this.getTotalWaitTime());
	};

	// 设置完成工作的状态
	this.setStateFinishedJob = function(){
		this.exitTime = CLOCK;
		this.state = CustomerState.FinishedJob;
		// 打印顾客离开银行的信息
		SystemState_log(SystemStateLogTypes.Customer.Exit, "顾客离开银行");
		SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客ID: " + this.customerid);
		SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客银行总停留时间: " + (this.exitTime - this.enterTime) + "分钟");
	};

	// 获取总等待时间
	this.getTotalWaitTime = function(){
		// 开始服务时间 - 进入银行时间
		return this.inServiceTime - this.enterTime;
	};

	// 打印顾客进入银行信息
	SystemState_log(SystemStateLogTypes.Customer.Enter, "顾客进入银行");
	SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客ID: " + this.customerid);
}


// 全局顾客队列
CustomerQueue = new Queue();


// 开始模拟进程
function start_simulate(){
	SIMULATION_STARTED = true;
	SystemState_log(SystemStateLogTypes.SimulationEngine.Start, "开始模拟演示");

	// 初始化变量
	var duration = Number($("#duration").val()),
		arrivaltable = $("#arrivaltable").val(),
		responsetimeave = Number($("#responsetimeave").val()),
		tellerscount = Number($("#tellerscount").val());
	arrivaltable = str_replace("\r", "\n", arrivaltable);
	arrivaltable = str_replace("\n\n", "\n", arrivaltable);
	arrivaltable = explode("\n", arrivaltable);

	// 将顾客到达列表转换为一个队列
	var arrivalTableQueue = new Queue();
	for(var i=0; i<arrivaltable.length; i++){
		arrivalTableQueue.enqueue(arrivaltable[i]);
	}

	// 初始化服务人员
	for(var tellerid = 1; tellerid <= tellerscount; tellerid++){
		TellerManager.createTeller();
	}

	// 开始模拟时钟CLOCK（其中以分钟进行存储，每一步增加一分钟）
	var customer;
	for(CLOCK=0; CLOCK<=duration; CLOCK++){
		// 检测顾客是否进入
		var new_arrival = arrivalTableQueue.peek();
		if(new_arrival == CLOCK){
			// 新顾客进入
			customer = new Customer();
			CustomerQueue.enqueue(customer);

			// 打印队列
			SystemState_log(SystemStateLogTypes.Queue.Log, CustomerQueue);

			// 如果顾客已经进入，将其从等待队列中移除
			arrivalTableQueue.dequeue();
		}

		// 检查是否完成工作
		TellerManager.tellers.forEach(function(teller1){
			if(teller1.state == TellerState.Busy){
				// 检验错误
				if(typeof(AllCustomers[teller1.customerid]) == "undefined"){
					LOG.error("Critical: customer is not defined in AllCustomers. customerid=" + teller1.customerid + ", tellerid=" + teller1.tellerid);
					return;
				}

				var customer1 = AllCustomers[teller1.customerid];
				var customer1_inservice_time = CLOCK - customer1.inServiceTime;
				if(customer1_inservice_time == responsetimeave){
					// 顾客业务已经完成，清除资源
					customer1.setStateFinishedJob();
					teller1.setStateFree();
				}
				else if(customer1_inservice_time > responsetimeave){
					// 通常这将不会发生
					LOG.error("customer insevice wait time is greater than average response time" + customer1_inservice_time);
				}
			}
		});

		// 检查顾客可以得到服务
		while(true){
			var last_customer = CustomerQueue.peek();
			if(typeof (last_customer) == "undefined"){
				break;
			}
			var last_customer_can_get_service = TellerManager.searchForWaitingCustomer(last_customer.customerid);
			// 顾客可以得到服务
			if(last_customer_can_get_service){
				customer = CustomerQueue.dequeue();
				var freeTellers = TellerManager.getFreeTellers();
				var SelectedfreeTeller;
				for(var freeTellerC = 0; freeTellerC < freeTellers.length; freeTellerC++){
					if(freeTellers[freeTellerC].customerid == customer.customerid){
						SelectedfreeTeller = freeTellers[freeTellerC];
						break;
					}
				}
				customer.tellerid = SelectedfreeTeller.tellerid;
				customer.setStateInService();

				// 打印队列
				SystemState_log(SystemStateLogTypes.Queue.Log, CustomerQueue);
				var theTeller = TellerManager.getTeller(customer.tellerid);
				theTeller.setStateBusy(customer.customerid);
			}
			else{
				break;
			}
		}
	}

	// 模拟结束
	SystemState_log(SystemStateLogTypes.SimulationEngine.Finish, "模拟演示结束");
	RenderingEngine.render(SystemStateLog);

	jQuery("#results").html(RenderingEngine.getRenderedOutput());
}


// 总结演示结果
Statistics = {
	"customers": [],
	"tellers": []
};

// 收集总结结果
function collect_summary(){
	var result = "";
	result += collect_summary_customers();
	result += collect_summary_tellers();
	result += collect_summary_overall();
	return result;
}

// 顾客结果总结
function collect_summary_customers(){
	var result = "<table>";
	result += "<tr>" + 
	"<th>顾客ID</th>" + 
	"<th>到达时间</th>" + 
	"<th>离开时间</th>" + 
	"<th>等待时长</th>" + 
	"</tr>";
	for(var i=0; i<AllCustomers.length; i++){
		var customer = AllCustomers[i];
		if(typeof customer != "object"){
			continue;
		}
		result += "<tr>";
		result += "<td>" + customer.customerid + "</td>";
		Statistics.customers[customer.customerid] = {};
		result += "<td>" + customer.enterTime + "</td>";
		Statistics.customers[customer.customerid].enterTime = customer.enterTime;
		result += "<td>" + customer.exitTime + "</td>";
		Statistics.customers[customer.customerid].exitTime = customer.exitTime;
		result += "<td>" + customer.getTotalWaitTime() + "</td>";
		Statistics.customers[customer.customerid].TotalWaitTime = customer.getTotalWaitTime();
		result += "</tr>";
	}
	result += "</table>";
	return result;
}


// 收集服务人员信息
function collect_summary_tellers(){
	var result = "<table>";
	result += "<tr>" + 
	"<th>员工ID</th>" +
	"<th>空闲时间</th>" +
	"<th>忙碌时间</th>" +
	"</tr>";
	for(var i=0; i<TellerManager.tellers.length; i++){
		var teller = TellerManager.tellers[i];
		if(typeof teller != "object"){
			continue;
		}
		result += "<tr>";
		result += "<td>" + teller.tellerid + "</td>";
		Statistics.tellers[teller.tellerid] = {};
		result += "<td>" + teller.getTotalFreeTime() + "</td>";
		Statistics.tellers[teller.tellerid].TotalFreeTime = teller.getTotalFreeTime();
		result += "<td>" + teller.getTotalBusyTime() + "</td>";
		Statistics.tellers[teller.tellerid].TotalBusyTime = teller.getTotalBusyTime();
		result += "</tr>";
	}
	result += "</table>";
	return result;
}


// 收集综合结果
function collect_summary_overall(){
	var sum_customer_wait = 0,
		sum_teller_free = 0,
		sum_teller_busy = 0;
	var average_customer_wait = 0,
		average_teller_free = 0,
		average_teller_busy = 0;

	// 顾客等待时间
	for(var count_customer = 1; count_customer < Statistics.customers.length; count_customer++){
		sum_customer_wait += Statistics.customers[count_customer].TotalWaitTime;
	}
	count_customer--;
	average_customer_wait = sum_customer_wait / count_customer;

	for(var count_teller = 1; count_teller < Statistics.tellers.length; count_teller++){
		sum_teller_free += Statistics.tellers[count_teller].TotalFreeTime;
		sum_teller_busy += Statistics.tellers[count_teller].TotalBusyTime;
	}
	count_teller--;

	average_teller_busy = sum_teller_busy / count_teller;
	average_teller_free = sum_teller_free / count_teller;

	var result = "<ul>";
	result += 
		"<li>顾客平均等待时间: " + average_customer_wait + "</li>" +
		"<li>员工平觉空闲时间: " + average_teller_free + "</li>" +
		"<li>员工平均忙碌时间: " + average_teller_busy + "</li>" ;
	result += "</ul>";
	return result;
}

