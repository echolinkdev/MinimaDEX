

function createEmptyTxn(){
	
	var txn 	= {};
	txn.inputs 	= [];
	txn.outputs	= [];
	txn.scripts	= [];
	
	return txn;	
}

function startTrade(){

	console.log("BUYSELL:"+MKT_BUYSELL+" "+MKT_CURRENT_AMOUNT+" of "+CURRENT_MARKET.token1.name);
	console.log("TOTAL : "+MKT_TOTAL_AMOUNT+" "+CURRENT_MARKET.token2.name);
	
	//Are we buying..
	if(MKT_BUYSELL){
		
		//Check we have enough..
		var available = getAvailableBalance(CURRENT_MARKET.token2.tokenid);
		if(available < MKT_TOTAL_AMOUNT){
			alert("Insufficient funds..\n\nYou only have "+available+" "+CURRENT_MARKET.token2.name+" available..");
			return;
		}
		
		//Ok - we have enough.. find an order / user
		var tradeorder = findValidOrder(CURRENT_MARKET.mktuid, "sell", MKT_CURRENT_PRICE, MKT_CURRENT_AMOUNT);
		
		console.log("TRADE : "+JSON.stringify(tradeorder.book));
		
		//NOW - create transaction..
		var txn = createEmptyTxn();
		
		//Add MY Coins first..
		addCoins(txn, USER_BALANCE, CURRENT_MARKET.token2.tokenid, MKT_TOTAL_AMOUNT);
		
		//Now add THEIR coins!
		//..
		
		//Now Sign the Transaction..
		//..
		
		//And send it to them to finish!
		//..
		
	//Or Selling	
	}else{
		
		//Check we have enough..
		var available = getAvailableBalance(CURRENT_MARKET.token1.tokenid);
		if(available < MKT_TOTAL_AMOUNT){
			alert("Insufficient funds..\n\nYou only have "+available+" "+CURRENT_MARKET.token1.name+" available..");
			return;
		}
		
	}
}

/**
 * Add coins as input and outputs for change
 */
function addCoins(txn, balance, tokenid, amount){
	
	//First find the token..
	var len = balance.length;
	for(var i=0;i<len;i++){
		
		var balance = balance[i];
		if(balance.tokenid == tokenid){
			
			//Get coins!
			var coins 	= balance.coinlist;
			var coinlen = coins.length; 
			
			//Cycle through and add
			var totaladded = 0;
			
			//What is the address
			var address = "";
			
			for(var i=0;i<coinlen;i++){
				
				//Store
				address = coins[i].miniaddress;
				
				//Add the first coin..
				txn.inputs.push(coins[i].coinid);
				
				//Add to the total
				if(tokenid == "0x00"){
					totaladded += +coins[i].amount	
				}else{
					totaladded += +coins[i].tokenamount
				}
				
				//Have we added enough
				if(totaladded >= amount){
					break;
				}
			}
			
			//Did we add enough ? - if not throw error..
			//..
			 
			//Now add the change..
			var change = totaladded - amount;
			if(change > 0){
				//Create an output..
				var outputchange 			= {};
				outputchange.address		= address;
				outputchange.amount			= change;
				outputchange.storestate		= true;
				outputchange.tokenid		= tokenid;
				
				//Add output
				txn.outputs.push(outputchange);	
			}
			
			//Add the scripts..
			
			
			
			//Lets go..
			break;		
		}
	}
}