/**
 * Create an Order
 */
function createMyOrder(buysell, amount, price){
	var order 		= {};
	order.market 	= CURRENT_MARKET;
	order.type		= buysell;
	order.amount	= ""+amount;
	order.price		= ""+price;
	order.uuid		= getRandomHexString();
	return order;
}

/**
 * Add an order to your List
 */
function addMyOrderAndPost(order){
	
	//Now add this order to our list of prders
	USER_ORDERS.push(order);
	
	//Order!
	USER_ORDERS.sort(sortUserOrdersAlphabetically);
	
	//Update all relevant
	updateMyOrders();
}

/**
 * Remove an order from Your OrderBook
 */
function removeMyOrderAndPost(uuid){
	var neworders = [];
	var len = USER_ORDERS.length;
	for(var i=0;i<len;i++) {
		if(USER_ORDERS[i].uuid != uuid){
			neworders.push(USER_ORDERS[i]);
		}
	}
	
	//Reset User Orders
	USER_ORDERS = neworders;
	
	//Update all relevant
	updateMyOrders();
}

function getMyOrder(uuid){
	var len = USER_ORDERS.length;
	for(var i=0;i<len;i++) {
		if(USER_ORDERS[i].uuid == uuid){
			return USER_ORDERS[i];
		}
	}
	
	return null;
}

function updateMyOrders(){
	
	//Store this locally..
	storeMyOrders();
		
	//Send updated book to server
	postMyOrdersToServer();
	
	//And set my orders table
	setMyOrdersTable();
	
	//Set ALL my orders table
	setAllMyOrders();
}

/**
 * Post your orders to the server
 */
function postMyOrdersToServer(){
	//Now send updated book to server
	var msg  = {};
	msg.type = "update_orderbook";
	
	//Create the OrderBook Details - includes your Balance!
	var myorderbook 	= {};
	myorderbook.address	= USER_ACCOUNT.ADDRESS;
	myorderbook.script 	= USER_ACCOUNT.SCRIPT;
	myorderbook.balance = USER_BALANCE;
	myorderbook.orders 	= USER_ORDERS;
	
	//Send this
	msg.data = myorderbook;
	
	wsPostToServer(msg);
}

/**
 * Store your Orders Locally
 */
function storeMyOrders(){
	//Store!
	STORAGE.setData("**USER_ORDERS_STORAGE**",USER_ORDERS);
}

function loadMyOrders(){
	
	//Load
	USER_ORDERS = STORAGE.getData("**USER_ORDERS_STORAGE**");
	
	//Check if exists
	if(USER_ORDERS == null){
		USER_ORDERS = [];
	}
}

/**
 * Search Orders
 */
function findValidOrder(mktuid, tokenid, buyorsell, price, amount){
	
	//console.log("findValidOrder : "+mktuid+" "+buyorsell+" "+price+" "+amount);
	
	var list = [];
		
	//Cycle throuigh ALL_ORDERS users
	for(const key in ALL_ORDERS) {
		
		//Get this users complete book
		var compbook = ALL_ORDERS[key];
		
		//The script
		var script  = compbook.script;
		
		//The address
		var address  = compbook.address;
				
		//The balance - just for the token..
		var balance = getTokenBalance(tokenid,compbook.balance);
		
		//Get the order book
		var book = compbook.orders;
		for(var i=0;i<book.length;i++) {
			
			//Is it the right Market and right type..
			if(	book[i].market.mktuid == mktuid && 
				book[i].type == buyorsell &&
				+book[i].price == +price &&
				+book[i].amount >= +amount){
					
					//Found a possible..
					var possible 		= {};
					possible.userid		= key;
					possible.address 	= address;
					possible.script 	= script;
					possible.balance 	= balance;
					possible.book 		= book[i];
					
					//Add to our checking list
					list.push(possible);
			}
		}
	}
	
	console.log("TOTAL POSSIBLE FOUND : "+list.length);
	
	//Get a random one 
	return list[getRandom(list.length)];
}
	
