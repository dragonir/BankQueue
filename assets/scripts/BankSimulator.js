// jQuery匿名函数.
(function($) {
  $(document).ready(function() {
    // 点击产生随机数据按钮，用于产生客户到达时的随机数队列
    $('#generaterandom').click(generateRandomTable);
    $('#startsimulate').click(function() {
      if (SIMULATION_STARTED) {
        if (confirm("该页面将进行刷新，当前页面所有数据都会丢失！\n" +
            "页面刷新成功后你需要重新点击该按钮产生数据. \n" +
            "继续?")) {
          location.reload();
        }
      }
      else {
        start_simulate();
        jQuery('#summary').html(collect_summary());
      }
    });
  });
})(jQuery);

 
 // 打印系统类型
LOGTYPES = {
    'disabled' : 0,
    'console' : 1,
    'alert' : 2
};


// 设置log类型用于debugge
logtype = LOGTYPES.console;


// 打印系统对象
LOG = {
  'warn' : function() {
    var msg = jQuery.makeArray(arguments).join("\n");
    switch (logtype) {
      case LOGTYPES.alert:
        msg = "Warning:\n\n" + msg;
        alert(msg);
        break;
      case LOGTYPES.console:
        console.warn(msg);
        break;
    }
  },
  'error' : function() {
    var msg = jQuery.makeArray(arguments).join("\n");
    switch (logtype) {
      case LOGTYPES.alert:
        msg = "Error:\n\n" + msg;
        alert(msg);
        break;
      case LOGTYPES.console:
        console.error(msg);
        break;
    }
  },
  'debug' : function() {
    var msg = jQuery.makeArray(arguments).join("\n");
    switch (logtype) {
      case LOGTYPES.alert:
        msg = "Debug:\n\n" + msg;
        alert(msg);
        break;
      case LOGTYPES.console:
        console.debug(msg);
        break;
    }
  },
  'log' : function() {
    var msg = jQuery.makeArray(arguments).join("\n");
    switch (logtype) {
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
    'Free' : 0,
    'Busy' : 1
};


// 使用CustomerState对象来枚举顾客的状态
// 1. 等待服务
// 2. 被服务
// 3. 服务完毕
CustomerState = {
    'WaitingForService' : 0,
    'InService' : 1,
    'FinishedJob' : 2
};


// 枚举系统的状态
SystemStateLog = [];
SystemStateLogTypes = {
    'Customer': {
        'Enter': 'customer_enter', //new customer enters.
        'GetService': 'customer_getservice', //customer gets service.
        'Exit': 'customer_exit' //customer's job is finished.
    },
  'TellerManager' : {
    'CreateTeller' : 'tellermanagaer_create_teller', 
    //new teller created by system.
    'Increase' : 'tellermanager_increase', 
    //叫号器呼叫新用户
    'ListFreeTellers' : 'tellermanager_listfree'
  },
  'Teller' : {
    'StateBusy' : 'teller_state_busy', //Teller becomes busy.
    'StateFree' : 'teller_state_free' //Teller becomes free.
  },
  'Queue' : {
    'Log' : 'queue_log' //just logging customer queue state.
  },
  'NumberingMachine' : {
    'Increase' : 'numberingmachine_increase' //customer gets new number from numbering machine.
  },
  'SimulationEngine' : {
    'Start' : 'simulation_start', //simulation started.
    'Finish' : 'simulation_finish', //simulation finished.
    'Log' : 'simulation_log' //a new log entry. this is related to previous log entry and provides additional data.
  }
};

/**
 * Log a new system state message.
 * this log will later be rendered for display.
 
function SystemState_log(type, msg) {
  if (typeof(SystemStateLog[CLOCK]) == 'undefined') {
    SystemStateLog[CLOCK] = [];
  }

  //if this is an object, its Queue object. we render it immediately
  var newmsg;
  if (typeof msg == 'object') {
    if (msg.hasOwnProperty('getAll')) {
      newmsg = RenderingEngine.renderQueue(msg);
    }
    else {
      newmsg = msg;
    }
  }
  else {
    newmsg = msg;
  }
  SystemStateLog[CLOCK][SystemStateLog[CLOCK].length] = {
    'message' : newmsg,
    'type' : type,
    'clock' : CLOCK
  };
}

/**
 * Get random integer number
 */
function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate and insert random table into the text area
 */
function generateRandomTable() {
  var table_str = '',
  prev_time = 0,
  samp_time = 0, //temp
  duration = $('#duration').val(),
  customer_count = getRandomInt(Math.floor(duration / 3), duration),
  max_time;
  
  for (var i = 1; i <= customer_count; i++) {
    //we want to generate a random time. it should be in the selected time span.
    //it should be near the previous number.
    max_time = prev_time + 5;
    if (max_time > duration - 5) {
      max_time = duration - 5;
    }
    
    samp_time = getRandomInt(prev_time, max_time);
    
    if (prev_time == samp_time) {
      continue;
    }
    
    table_str += "\n" + samp_time;
    
    if (samp_time == duration) {
      break;
    }
    
    prev_time = samp_time;
  }
  
  $('#arrivaltable').val(table_str.trim());
}

/**
 * Manages Tellers
 */
TellerManager = {
  //@internal
  'tellers' : [],
  'lastnumber' : 0,

  /**
   * Create a new Teller and assign a teller id
   * and push it into the this.tellers array
   */
  'createTeller' : function() {
    LOG.debug('called TellerManager.createTeller()');
    var teller = new Teller(this.tellers.length + 1);
    this.tellers.push(teller);

    //Log create teller
    SystemState_log(SystemStateLogTypes.TellerManager.CreateTeller, "服务人员就绪");
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "服务人员 id: " + teller.tellerid);
  },

  /**
   * Get a teller object by its id
   */
  'getTeller' : function(tellerid) {
    LOG.debug('called TellerManager.getTeller(' + tellerid + ')');
    if (typeof(this.tellers[tellerid - 1]) != 'undefined') {
      return this.tellers[tellerid - 1];
    }
    else {
      return false;
    }
  },

  /**
   * Get array of all free tellers.
   */
  'getFreeTellers' : function() {
    LOG.debug('called TellerManager.getFreeTellers()');
    var result = [];
    //for (var teller1 in this.tellers) {
    //  if (teller1.state == TellerState.Free) {
    //    result.push(teller1);
    //  }
    //}
    this.tellers.forEach(function(teller1) {
      if (teller1.state == TellerState.Free) {
        result.push(teller1);
      }
    });

    return result;
  },

  /**
   * get an array of customer numbers than gat get service.
   */
  'getWaitingNumbers' : function() {
    LOG.debug('called TellerManager.getWaitingNumbers()');
    var result = [];
    this.tellers.forEach(function(teller1) {
      if (teller1.state == TellerState.Free) {
        result.push(teller1.customerid);
      }
    });
    return result;
  },

  /**
   * Check if a given customer id can get service now
   */
  'searchForWaitingCustomer' : function(customerid) {
    LOG.debug('called TellerManager.searchForWaitingCustomer(' + customerid + ')');
    var waitingNumbers = this.getWaitingNumbers();
    return (waitingNumbers.indexOf(customerid) >= 0);
  },

  'increaseNumber' : function() {
    LOG.debug('called TellerManager.increaseNumber()');

    //Log increase number
    SystemState_log(SystemStateLogTypes.TellerManager.Increase, "叫号器呼叫新用户");
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "新号码: " + (this.lastnumber + 1));

    return ++this.lastnumber;
  }
};

/**
 * Numbering Machine (Queue manager)
 */
NumberingMachine = {
  //@internal
  'number' : 0,
  
  'getNumber' : function() {
    LOG.debug('called NumberingMachine.getNumber()');
    return this.number;
  },
  
  'increase' : function() {
    LOG.debug('called NumberingMachine.increase()');

    //Log increase
    SystemState_log(SystemStateLogTypes.NumberingMachine.Increase, "发号机产生新号码");
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "新号码: " + (this.number + 1));

    return ++this.number;
  }
};

/**
 * Constructor
 */
function Teller(id) {
  LOG.debug('called new Teller(' + id + ')');
  this.tellerid = id; //Should be set by caller

  //Set number to a new customer, and set state to Free
  //This simulates a new customer call.
  this.state = TellerState.Free;
  this.customerid = TellerManager.increaseNumber();
  
  //@internal
  this.lastChangeTime = CLOCK;
  this.totalFreeTime = 0;
  this.totalBusyTime = 0;
  
  /**
   * Set Teller state to busy. (new customer accepted)
   */
  this.setStateBusy = function(customerid) {
    if (this.state == TellerState.Busy) {
      LOG.error('Teller is already busy.');
      return false;
    }
    
    //calculate total free time
    this.totalFreeTime += (CLOCK - this.lastChangeTime);
    
    //update state and last change time
    this.lastChangeTime = CLOCK;
    this.state = TellerState.Busy;
    this.customerid = customerid;

    //Log Tellers becomes busy
    SystemState_log(SystemStateLogTypes.Teller.StateBusy, "服务人员开始服务");
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "服务人员 id: " + this.tellerid);
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "被服务顾客 id: " + customerid);
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "总闲暇时间: " +
        this.getTotalFreeTime() + ' minutes.');
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "总服务时间: " +
        this.getTotalBusyTime() + ' minutes.');

    //Log free tellers
    SystemState_log(SystemStateLogTypes.TellerManager.ListFreeTellers,
        RenderingEngine.renderTellerArray(TellerManager.getFreeTellers()));

    return true;
  };
  
  /**
   * Set teller state to free (waiting for next customer)
   */
  this.setStateFree = function() {
    if (this.state == TellerState.Free) {
      LOG.error('Teller is already free.');
      return false;
    }
    
    //calculate total busy time
    this.totalBusyTime += (CLOCK - this.lastChangeTime);
    
    //update state and last change time
    this.lastChangeTime = CLOCK;
    this.state = TellerState.Free;
    this.customerid = TellerManager.increaseNumber();

    //Log Tellers becomes free
    SystemState_log(SystemStateLogTypes.Teller.StateFree, "Teller becomes free.");
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "Teller id: " + this.tellerid);
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "Now can accept customer id: " +
        this.customerid);
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "Total free time is: " +
        this.getTotalFreeTime() + ' minutes.');
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "Total busy time is: " +
        this.getTotalBusyTime() + ' minutes.');

    //Log free tellers
    SystemState_log(SystemStateLogTypes.TellerManager.ListFreeTellers,
        RenderingEngine.renderTellerArray(TellerManager.getFreeTellers()));

    return true;
  };
  
  /**
   * Get total free time of the teller
   */
  this.getTotalFreeTime = function() {
    var curr = 0;
    if (this.state == TellerState.Free) {
      curr = CLOCK - this.lastChangeTime;
    }
    
    return curr + this.totalFreeTime;
  };
  
  /**
   * Get total busy time of the teller
   */
  this.getTotalBusyTime = function() {
    var curr = 0;
    if (this.state == TellerState.Busy) {
      curr = CLOCK - this.lastChangeTime;
    }
    
    return curr + this.totalBusyTime;
  };
}

/**
 * Constructor
 */
function Customer() {
  this.customerid = NumberingMachine.increase();

  //Save this customer to AllCustomers for later reference.
  AllCustomers[this.customerid] = this;

  this.tellerid = 0; //should be set by caller when customer gets service.
  this.state = CustomerState.WaitingForService;
  
  this.enterTime = CLOCK;
  this.inServiceTime = null;
  this.exitTime = null;
  
  /**
   * Set state to InService
   */
  this.setStateInService = function() {
    this.inServiceTime = CLOCK;
    this.state = CustomerState.InService;

    //Log customer gets service
    SystemState_log(SystemStateLogTypes.Customer.GetService, "顾客得到服务");
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客 id: " + this.customerid);
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客等待时间总长: " +
        this.getTotalWaitTime());
  };
  
  /**
   * Set state to FinishedJob
   */
  this.setStateFinishedJob = function() {
    this.exitTime = CLOCK;
    this.state = CustomerState.FinishedJob;

    // 打印顾客离开银行
    SystemState_log(SystemStateLogTypes.Customer.Exit, "顾客离开银行");
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客 id: " + this.customerid);
    SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客在银行总逗留时间：" +
        (this.exitTime - this.enterTime) + '分钟');
  };
  
  /**
   * Get total wait time
   */ 
  this.getTotalWaitTime = function() {
    return this.inServiceTime - this.enterTime;
  };

  //Log Customer enters the bank
  SystemState_log(SystemStateLogTypes.Customer.Enter, "顾客进入银行");
  SystemState_log(SystemStateLogTypes.SimulationEngine.Log, "顾客 id: " + this.customerid);
}

/**
 * Global customer queue
 */
CustomerQueue = new Queue();

/**
 * Start the simulation process
 */
function start_simulate() {
  SIMULATION_STARTED = true;
  SystemState_log(SystemStateLogTypes.SimulationEngine.Start, '模拟演示开始');

  //Initialize variables
  var duration = Number($('#duration').val())
  , arrivaltable = $('#arrivaltable').val()
  , responsetimeave = Number($('#responsetimeave').val())
  , tellerscount = Number($('#tellerscount').val())
  ;
  
  arrivaltable = str_replace("\r", "\n", arrivaltable);
  arrivaltable = str_replace("\n\n", "\n", arrivaltable);
  arrivaltable = explode("\n", arrivaltable);
  
  //convert arrival table into a queue
  var arrivalTableQueue = new Queue();
  for (var i = 0; i < arrivaltable.length; i++) {
    arrivalTableQueue.enqueue(arrivaltable[i]);
  }
  
  //Initialize tellers.
  for (var tellerid = 1; tellerid <= tellerscount; tellerid++) {
    TellerManager.createTeller();
  }
  
  //start the simulation CLOCK (it stores the time in minutes and increases one minute per step)
  var customer;
  for (CLOCK = 0; CLOCK <= duration; CLOCK++) {
    
    //Check if customer enters
    var new_arrival = arrivalTableQueue.peek();
    if (new_arrival == CLOCK) {
      //new customer enters.
      customer = new Customer();
      CustomerQueue.enqueue(customer);

      //Log Queue
      SystemState_log(SystemStateLogTypes.Queue.Log, CustomerQueue);

      //customer has entered. remove it from arrival table queue.
      arrivalTableQueue.dequeue();
    }

    //Check for finished jobs
    TellerManager.tellers.forEach(function(teller1) {
      if (teller1.state == TellerState.Busy) {
        //check for critical error
        if (typeof(AllCustomers[teller1.customerid]) == 'undefined') {
          LOG.error('Critical: customer is not defined in AllCustomers. customerid=' +
              teller1.customerid + ', tellerid=' + teller1.tellerid);
          return;
        }

        var customer1 = AllCustomers[teller1.customerid];
        var customer1_inservice_time = CLOCK - customer1.inServiceTime;
        if (customer1_inservice_time == responsetimeave) {
          //customer's job has been finished. clear resources.
          customer1.setStateFinishedJob();
          teller1.setStateFree();
        }
        else if (customer1_inservice_time > responsetimeave) {
          //Normally This should not happen.
          LOG.error("customer inservice wait time is greater than average response time" +
              'customer1_inservice_time=' + customer1_inservice_time);
        }
      }
    });

    //check for customers that can get service
    while (true) {
      var last_customer = CustomerQueue.peek();
      if (typeof(last_customer) == 'undefined') {
        break;
      }
      var last_customer_can_get_service = TellerManager.searchForWaitingCustomer(last_customer.customerid);
      if (last_customer_can_get_service) {
        //customer can get service
        customer = CustomerQueue.dequeue();
        var freeTellers = TellerManager.getFreeTellers();
        var SelectedfreeTeller;
        for (var freeTellerC = 0; freeTellerC < freeTellers.length; freeTellerC++) {
          if (freeTellers[freeTellerC].customerid == customer.customerid) {
            SelectedfreeTeller = freeTellers[freeTellerC];
            break;
          }
        }
        customer.tellerid = SelectedfreeTeller.tellerid;
        customer.setStateInService();

        //Log Queue
        SystemState_log(SystemStateLogTypes.Queue.Log, CustomerQueue);

        var theTeller = TellerManager.getTeller(customer.tellerid);
        theTeller.setStateBusy(customer.customerid);
      }
      else {
        break;
      }
    }
  }

  // 模拟演示结束
  SystemState_log(SystemStateLogTypes.SimulationEngine.Finish, '模拟演示结束');
  RenderingEngine.render(SystemStateLog);

  jQuery('#results').html(RenderingEngine.getRenderedOutput());
}



/**
 * 总结演示结果
 */
Statistics = {
  'customers' : [],
  'tellers' : []
};

function collect_summary() {
  var result = '';
  result += collect_summary_customers();
  result += collect_summary_tellers();
  result += collect_summary_overall();
  return result;
}

/**
 * Collect summary of customers
 */
function collect_summary_customers() {
  var result = '<table>';
  result += '<tr>' +
      '<th>顾客 ID</th>' +
      '<th>进入时间</th>' +
      '<th>离开时间</th>' +
      '<th>等待时长</th>' +
      '</tr>';
  for (var i = 0; i < AllCustomers.length; i++) {
    var customer = AllCustomers[i];
    if (typeof customer != 'object') {
      continue;
    }
    result += '<tr>';
    result += '<td>' + customer.customerid + '</td>';
    Statistics.customers[customer.customerid] = {};
    result += '<td>' + customer.enterTime + '</td>';
    Statistics.customers[customer.customerid].enterTime = customer.enterTime;
    result += '<td>' + customer.exitTime + '</td>';
    Statistics.customers[customer.customerid].exitTime = customer.exitTime;
    result += '<td>' + customer.getTotalWaitTime() + '</td>';
    Statistics.customers[customer.customerid].TotalWaitTime = customer.getTotalWaitTime();
    result += '</tr>';
  }
  result += '</table>';

  return result;
}

/**
 * Collect summary of actions
 */
function collect_summary_tellers() {
  var result = '<table>';
  result += '<tr>' +
      '<th>出纳 ID</th>' +
      '<th>闲暇时长</th>' +
      '<th>服务时长</th>' +
      '</tr>';
  for (var i = 0; i < TellerManager.tellers.length; i++) {
    var teller = TellerManager.tellers[i];
    if (typeof teller != 'object') {
      continue;
    }
    result += '<tr>';
    result += '<td>' + teller.tellerid + '</td>';
    Statistics.tellers[teller.tellerid] = {};
    result += '<td>' + teller.getTotalFreeTime() + '</td>';
    Statistics.tellers[teller.tellerid].TotalFreeTime = teller.getTotalFreeTime();
    result += '<td>' + teller.getTotalBusyTime() + '</td>';
    Statistics.tellers[teller.tellerid].TotalBusyTime = teller.getTotalBusyTime();
    result += '</tr>';
  }
  result += '</table>';

  return result;
}

/**
 * Collect overall summary
 */
function collect_summary_overall() {
  var sum_customer_wait = 0,
      sum_teller_free = 0,
      sum_teller_busy = 0;
  var average_customer_wait = 0,
      average_teller_free = 0,
      average_teller_busy = 0;

  for (var count_customer = 1; count_customer < Statistics.customers.length; count_customer++) {
    sum_customer_wait += Statistics.customers[count_customer].TotalWaitTime;
  }
  count_customer--;
  //console.warn(sum_customer_wait);
  //console.warn(count_customer);
  average_customer_wait = sum_customer_wait / count_customer;

  for (var count_teller = 1; count_teller < Statistics.tellers.length; count_teller++) {
    sum_teller_free += Statistics.tellers[count_teller].TotalFreeTime;
    sum_teller_busy += Statistics.tellers[count_teller].TotalBusyTime;
  }
  count_teller--;
  //console.warn(sum_teller_free);
  //console.warn(sum_teller_busy);
  average_teller_busy = sum_teller_busy / count_teller;
  average_teller_free = sum_teller_free / count_teller;

  var result = '<ul>';
  result += '<li>顾客平均等待时间: ' + average_customer_wait + '</li>' +
      '<li>出纳平均闲暇时间: ' + average_teller_free + '</li>' +
      '<li>出纳平均服务时间: ' + average_teller_busy + '</li>';
  result += '</ul>';

  return result;
}