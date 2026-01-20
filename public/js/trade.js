

function createEmptyTxn(){
	
	var txn 	= {};
	txn.inputs 	= [];
	txn.outputs	= [];
	txn.scripts	= [];
	txn.state	= {};
	
	return txn;	
}

function startTrade(){

	console.log("BUYSELL:"+MKT_BUYSELL+" "+MKT_CURRENT_AMOUNT+" of "+CURRENT_MARKET.token1.name);
	console.log("TOTAL : "+MKT_TOTAL_AMOUNT+" "+CURRENT_MARKET.token2.name);
	
	//MUST be > 0
	if(MKT_TOTAL_AMOUNT <= 0){
		alert("Cannot have zero size trade..");
		return;
	}
	
	//Are we buying..
	if(MKT_BUYSELL){
		
		//Check we have enough..
		var available = getAvailableBalance(CURRENT_MARKET.token2.tokenid);
		if(available < MKT_TOTAL_AMOUNT){
			alert("Insufficient funds..\n\nYou only have "+available+" "+CURRENT_MARKET.token2.name+" available..");
			return;
		}
		
		//Ok - we have enough.. find an order / user
		var tradeorder = findValidOrder(CURRENT_MARKET.mktuid, CURRENT_MARKET.token1.tokenid, "sell", MKT_CURRENT_PRICE, MKT_CURRENT_AMOUNT);
		
		//CHECK THEY have enough..
		//..
		
		console.log("FOUND ORDER : "+JSON.stringify(tradeorder));
		
		//NOW - create transaction..
		var txn = createEmptyTxn();
		
		//Add MY Coins first..
		var mytokbal = getTokenBalance(CURRENT_MARKET.token2.tokenid, USER_BALANCE);
		console.log("My BALANCE : "+JSON.stringify(mytokbal));
		
		//Send the amount to the User
		addCoins(txn, mytokbal, CURRENT_MARKET.token2.tokenid, MKT_TOTAL_AMOUNT, tradeorder.address);
		
		//Now add THEIR coins and send to us..
		addCoins(txn, tradeorder.balance, CURRENT_MARKET.token1.tokenid, MKT_CURRENT_AMOUNT, USER_ACCOUNT.ADDRESS);
		
		//Now add both the scripts..
		txn.scripts.push(USER_ACCOUNT.SCRIPT);
		txn.scripts.push(tradeorder.script);
		
		//PRINT IT OUT
		console.log("TRADE : "+JSON.stringify(txn));
		
		//Create a RAW Txn..
		MINIMASK.meg.rawtxn(txn.inputs, txn.outputs, txn.scripts, txn.state, function(rawresp){
			console.log("RAWTXN : "+JSON.stringify(rawresp,null,2));
			
			
			//Now Sign the Transaction..
			utility_sign(rawresp.data.data, false, function(signedrexp){
				console.log("SIGNTXN : "+JSON.stringify(signedrexp,null,2));
				
				//And send it to them to finish!
				postTradeToUser(tradeorder.userid, CURRENT_MARKET.mktuid, signedrexp.data.data);	
			});	
		});
		
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
function addCoins(txn, balance, tokenid, amount, toaddress){
	
	//Cycle through and add
	var addamount 	= new Decimal(amount); 
	var totaladded 	= new Decimal(0);
	
	//What is the address
	var address = "";
	
	//Get coins!
	var coins 	= balance.coinlist;
	var coinlen = coins.length; 
	for(var i=0;i<coinlen;i++){
		
		//Store
		address = coins[i].miniaddress;
		
		//Add the first coin..
		txn.inputs.push(coins[i].coinid);
		
		//Add to the total
		if(tokenid == "0x00"){
			totaladded = totaladded.plus(coins[i].amount);	
		}else{
			totaladded = totaladded.plus(coins[i].tokenamount);
		}
		
		//Have we added enough
		if(totaladded.greaterThanOrEqualTo(addamount)){
			break;
		}
	}
	
	//Did we add enough ? - if not throw error..
	//..
	
	//Now add the output to the User..
	var mainoutput 			= {};
	mainoutput.address		= ""+toaddress;
	mainoutput.amount		= ""+addamount;
	mainoutput.storestate	= false;
	mainoutput.tokenid		= ""+tokenid;
	
	//Add output
	txn.outputs.push(mainoutput);
	 
	//Now add the change..
	var change = totaladded.minus(addamount);
	if(change > 0){
		//Create an output..
		var outputchange 			= {};
		outputchange.address		= ""+address;
		outputchange.amount			= ""+change;
		outputchange.storestate		= false;
		outputchange.tokenid		= ""+tokenid;
		
		//Add output
		txn.outputs.push(outputchange);	
	}
}

/**
 * Post your orders to the server
 */
function postTradeToUser(userid, mktuid, txndata){
	
	//This is the message for the User
	var msg  			= {};
	msg.type 			= "trade";
	msg.data			= {};
	msg.data.mktuid 	= mktuid;
	msg.data.txndata 	= txndata;
	
	//This is the message sent to the server
	var servermsg 			= {};
	servermsg.type			= "message";
	servermsg.data			= {};
	servermsg.data.uuid		= userid;
	servermsg.data.message	= msg;
	
	//Post to server
	wsPostToServer(servermsg);
}

/**
 * Check Trade Transaction you have received..
 */
function checkAndSignTrade(mktuid, txndata){
	
	//First convert to a readable format
	MINIMASK.meg.viewtxn(txndata, function(viewresp){
		console.log("CHECK TRADE : "+mktuid+"\n"+JSON.stringify(viewresp,null,2));
		
		//Get the inputs and outputs and CHECK they are a valid trade you will accept..
		var insouts = getMyInputsAndOutputs(viewresp.data.transaction);	
		
		//Check thisis valid given this mktuid..
		var valid = checkValid(mktuid, insouts);
		
		//If so - Sign and POST!
		if(valid){
			
			//Sign it.. and POST..
			utility_sign(txndata, true, function(signedrexp){
				console.log("POSTED : "+JSON.stringify(signedrexp,null,2));
				
				//Now Update your Order Book.. as this trade will have used up some of your offering
				//..
				
				//And send msg back to the User - so they know..
				//..
				
			});
			
		}else{
			//Invalid..
			console.log("Invalid Trade.. "+mktuid);
			
			//Tell User..
			//..
		}
	}); 
}

function getMyInputsAndOutputs(txn){
	
	var mycoins = {};
	
	//Cycle Inputs..
	
	//Cycle Outputs..
	
	return mycoins;
}

function checkValid(mktuid, insouts){
	return true;
}