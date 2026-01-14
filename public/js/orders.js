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
	
	//Now Store this locally..
	storeMyOrders();
	
	//Now send updated book to server
	postMyOrdersToServer();
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
	
	//Now Store this locally..
	storeMyOrders();
		
	//Now send updated book to server
	postMyOrdersToServer();
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
	
	myorderbook.balance = [];//USER_BALANCE;
	
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
