
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
	
	//Get the available balance..
	var available1 = getAvailableBalance(CURRENT_MARKET.token1.tokenid);
	console.log("Available "+CURRENT_MARKET.token1.name+":"+available1);
	
	var available2 = getAvailableBalance(CURRENT_MARKET.token2.tokenid);
	console.log("Available "+CURRENT_MARKET.token2.name+":"+available2);
	
	//Check values positive..
	var amount 	= financial(createamount.value);
	var price 	= financial(createprice.value);
	var tot 	= financial(amount * price) 
	
	//Check you have enough!
	var confmsg = "";
	if(buysell == "buy"){
		
		if(tot > available2){
			var msg = "Insufficient funds.."
					  +"\n\nYou are trying to BUY "+amount+" "+CURRENT_MARKET.token1.name+" @ "+price
					  +"\n\nThat is a total of "+tot+" "+CURRENT_MARKET.token2.name
					  +"\n\nYou currently only have "+available2+" available";
			
			alert(msg);
			return;	
		}
		
		confmsg = "Create order to BUY "+amount+" "+CURRENT_MARKET.token1.name+" @ "+price
				+"\n\nThat will be a total of "+tot+" "+CURRENT_MARKET.token2.name
				+"\n\nConfirm ? ";
		
	}else if(buysell == "sell"){
		
		if(tot > available1){
			var msg = "Insufficient funds.."
					  +"\n\nYou are trying to SELL "+amount+" "+CURRENT_MARKET.token1.name
					  +"\n\nYou currently only have "+available1+" available";
			
			alert(msg);
			return;	
		}
		
		confmsg = "Create order to SELL "+amount+" "+CURRENT_MARKET.token1.name+" @ "+price
				+"\n\nThat will be a total of "+tot+" "+CURRENT_MARKET.token2.name
				+"\n\nConfirm ? ";
	} 
	
	//Check cnfirm
	if(!confirm(confmsg)){
		return;
	}
		
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