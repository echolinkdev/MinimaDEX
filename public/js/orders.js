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
	myorderbook.script 	= USER_ACCOUNT.SCRIPT;
	myorderbook.balance = USER_BALANCE;
	myorderbook.orders 	= USER_ORDERS;
	msg.data = myorderbook;
	
	//Will update table when I receive the server message
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
function findValidOrder(mktuid, buyorsell, price, amount){
	
	//console.log("findValidOrder : "+mktuid+" "+buyorsell+" "+price+" "+amount);
	
	var list = [];
		
	//Cycle throuigh ALL_ORDERS users
	for(const key in ALL_ORDERS) {
		
		//Get the order book
		var balance = ALL_ORDERS[key].balance;
		var book 	= ALL_ORDERS[key].orders;
		
		//Cycle through the book
		var len = book.length;
		for(var i=0;i<len;i++) {
			
			//console.log("possible : "+JSON.stringify(book[i]));
			//console.log("mktuid : "+(book[i].market.mktuid == mktuid));
			//console.log("type : "+(book[i].type == buyorsell));
			//console.log("price : "+(+book[i].price == +price));
			//console.log("amount : "+(+book[i].amount >= +amount));
			
			//Is it the right Market and right type..
			if(	book[i].market.mktuid == mktuid && 
				book[i].type == buyorsell &&
				+book[i].price == +price &&
				+book[i].amount >= +amount){
					
					//console.log("FOUND POSSIBLE : "+JSON.stringify(book[i]));
					
					//Found a possible..
					var possible 		= {};
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
	
