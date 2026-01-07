
const createamount 	= document.getElementById('id_createorder_amount');
const createprice 	= document.getElementById('id_createorder_price');
const createbuy 	= document.getElementById('id_createorder_buy');
const createsell 	= document.getElementById('id_createorder_sell');

function createOrder(buysell, amount, price){
	var order 		= {};
	order.market 	= CURRENT_MARKET;
	order.type		= buysell;
	order.amount	= ""+amount;
	order.price		= ""+price;
	order.uuid		= getRandomHexString();
	return order;
}

function sendOrder(buysell){
	//Check values positive..
	var amount 	= +financial(+createamount.value);
	var price 	= +financial(+createprice.value);
	//..

	//Create the order
	var order = createOrder(buysell, amount, price);
		
	//Now add this order to our list of prders
	USER_ORDERS.push(order);
	
	var msg  = {};
	msg.type = "update_orderbook";
	msg.data = USER_ORDERS;
	
	wsPostToServer(msg);
}

//Set up the chat room buttons..
createbuy.addEventListener('click', () => {
	sendOrder("buy");
});

createsell.addEventListener('click', () => {
	sendOrder("sell");
});