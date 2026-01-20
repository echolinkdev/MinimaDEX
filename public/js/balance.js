/**
 * Fetch the balance for thisa User
 */
function fetchFullBalance(callback){
	
	//Are we splitting..
	var timenow = getTimeMilli();
	if(SPLIT_COIN_STOP_UPDATE + SPLIT_COIN_STOP_TIMEOUT > timenow){
		console.log("Fetch balance during split.. stopped..");
		
		//Don't update..! Splitting coins..
		if(callback){
			callback();
		}
		
		return;
	}
	
	//Check Balance..
	MINIMASK.meg.balancefull(USER_ACCOUNT.ADDRESS, 3, true, true, function(balresp){
		
		//The balance bit
		var balance = balresp.data;
		
		//The OLD balance..
		var oldbalance = JSON.stringify(USER_BALANCE);
		
		//Store for later
		USER_BALANCE = balance;
					
		//Check New vs Old
		if(JSON.stringify(balance) != oldbalance){
					
			if(oldbalance != "[]"){
				
				//Some thing has changed.. check for a few minutes..
				autoUpdateBalance();
				
				//Add a log..
				addHistoryLog("BALANCE_CHANGE","User balance changes..", "");
			}
			
			//Update the server
			postMyOrdersToServer();
			
			//Update the Panel
			updateBalancePanel();
		}
		
		if(callback){
			callback();
		}
	});
}

/**
 * Auto check balance for a certain amount of time.. 
 */
var AUTO_BALANCE_INTERVALID 		= 0;
var AUTO_BALANCE_INTERVAL_COUNTER 	= 0;
function autoUpdateBalance(){
	
	console.log("START Balance auto checker");
	
	//Disable the refresh button
	id_refreshbalance.disabled=true;
	
	//Clear the old
	clearInterval(AUTO_BALANCE_INTERVALID);
	
	//Reset counter
	AUTO_BALANCE_INTERVAL_COUNTER = 0;
	
	//Start a new one..
	AUTO_BALANCE_INTERVALID = setInterval(function(){
	
		console.log("Auto-Balance checker Called!! "+AUTO_BALANCE_INTERVAL_COUNTER);	
		
		fetchFullBalance();
		
		//Do we stop!!
		AUTO_BALANCE_INTERVAL_COUNTER++;
		if(AUTO_BALANCE_INTERVAL_COUNTER > 10){
			clearInterval(AUTO_BALANCE_INTERVALID);
			console.log("END Balance auto checker");
			
			id_refreshbalance.disabled=false;	
		}
		
	}, 10000);
}

/**
 * Get the balance for a specific token
 */
function getTokenBalance(tokenid, fullbalance){
	var len = fullbalance.length;
	for(var i=0;i<len;i++){
		var balance = fullbalance[i];
		if(balance.tokenid == tokenid){
			return balance;		
		}
	}
	
	return null;
}

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
			total += amt;
			
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
	
	//How much 
	var available = financial(confirmed - book);
	if(available<0){
		available = 0;
	}
	
	return available;
}

/**
 * When you split coins set amount to 0 until the confirmed balance changes..
 */
var SPLIT_COIN_STOP_UPDATE 	= 0;
var SPLIT_COIN_STOP_TIMEOUT = 60000;
function setSplitCoinsBalanceZero(tokenid){
	
	//Cycle through the tokens..
	var len = USER_BALANCE.length;
	for(var i=0;i<len;i++){
		
		var balance = USER_BALANCE[i];
		if(balance.tokenid == tokenid){
			balance.confirmed = 0;
			
			//Don;t update for 1 minute..
			SPLIT_COIN_STOP_UPDATE = getTimeMilli();
			
			//Update the server
			postMyOrdersToServer();
			
			//Update the Panel
			updateBalancePanel();
			
			return;		
		}
	}
}