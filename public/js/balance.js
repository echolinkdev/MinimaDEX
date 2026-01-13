/**
 * Check available balance for a tokenid
 */

function getConfirmedBalance(tokenid){
	
	//Cycle through the tokens..
	var len = USER_BALANCE.length;
	for(var i=0;i<len;i++){
		
		var balance = USER_BALANCE[i];
		if(balance.tokenid == tokenid){
		
			//Get the confirmed balane..
			return financial(balance.confirmed);		
		}
	}
	
	return 0;
}

function getOrderBookBalance(tokenid){
	
	//Cycle through the orders..
	var total 	= 0;
	var len 	= USER_ORDERS.length;
	for(var i=0;i<len;i++){
		
		var order = USER_ORDERS[i];
		
		var amt 	= financial(order.amount);
		var price 	= financial(order.price);
		var tot 	= financial(amt * price);
		
		//Is it a BUY order
		if(order.type=="buy" && order.market.token2.tokenid == tokenid){
			
			//Add to the total..
			total += tot;		
		
			//console.log("BUY Order found : "+tokenid+" "+tot+" total:"+total);
			
		}else if(order.type=="sell" && order.market.token1.tokenid == tokenid){
			
			//Add to the total..
			total += tot;
			
			//console.log("SELL Order found : "+tokenid+" "+tot+" total:"+total);
		}
	}
	
	return financial(total);
}

function getAvailableBalance(tokenid){
	
	//First get the confirmed balance..
	var confirmed = getConfirmedBalance(tokenid);
	
	//How much is in the orderbook
	var book = getOrderBookBalance(tokenid);
	
	return financial(confirmed - book);
}