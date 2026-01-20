
/**
 * Create a tmp empty txn
 */
function createEmptyTxn(){
	
	var txn 	= {};
	txn.inputs 	= [];
	txn.outputs	= [];
	txn.scripts	= [];
	txn.state	= {};
	
	return txn;	
}

/**
 * When you accept a trade from the frontend..
 */
function startTrade(){

	console.log("BUYSELL:"+MKT_BUYSELL+" "+MKT_CURRENT_AMOUNT+" of "+CURRENT_MARKET.token1.name);
	console.log("TOTAL : "+MKT_TOTAL_AMOUNT+" "+CURRENT_MARKET.token2.name);
	
	//MUST be > 0
	if(MKT_TOTAL_AMOUNT <= 0){
		alert("Cannot have zero size trade..");
		return;
	}
	
	//Create transaction..
	var txn = createEmptyTxn();
	
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
		
		console.log("FOUND SELL ORDER : "+JSON.stringify(tradeorder));
		
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
		
	//Or Selling	
	}else{
		
		//Check we have enough..
		var available = getAvailableBalance(CURRENT_MARKET.token1.tokenid);
		if(available < MKT_CURRENT_AMOUNT){
			alert("Insufficient funds..\n\n"
				+"You are trying to sell "+MKT_CURRENT_AMOUNT+"\n\n"
				+"You only have "+available+" "+CURRENT_MARKET.token1.name+" available..");
			return;
		}
		
		//Ok - we have enough.. find an order / user
		var tradeorder = findValidOrder(CURRENT_MARKET.mktuid, CURRENT_MARKET.token2.tokenid, "buy", MKT_CURRENT_PRICE, MKT_CURRENT_AMOUNT);
		
		console.log("FOUND BUY ORDER : "+JSON.stringify(tradeorder));
		
		
		//Add MY Coins first..
		var mytokbal = getTokenBalance(CURRENT_MARKET.token1.tokenid, USER_BALANCE);
		console.log("My BALANCE : "+JSON.stringify(mytokbal));
		
		//Send the amount to the User
		addCoins(txn, mytokbal, CURRENT_MARKET.token1.tokenid, MKT_CURRENT_AMOUNT, tradeorder.address);
		
		//Now add THEIR coins and send to us..
		addCoins(txn, tradeorder.balance, CURRENT_MARKET.token2.tokenid, MKT_TOTAL_AMOUNT, USER_ACCOUNT.ADDRESS);
		
		//Now add both the scripts..
		txn.scripts.push(USER_ACCOUNT.SCRIPT);
		txn.scripts.push(tradeorder.script);
		
		//PRINT IT OUT
		console.log("TRADE : "+JSON.stringify(txn));
	}
	
	//Create a RAW Txn..
	MINIMASK.meg.rawtxn(txn.inputs, txn.outputs, txn.scripts, txn.state, function(rawresp){
		console.log("RAWTXN : "+JSON.stringify(rawresp,null,2));
		
		//Now Sign the Transaction..
		utility_sign(rawresp.data.data, false, function(signedrexp){
			console.log("SIGNTXN : "+JSON.stringify(signedrexp,null,2));
			
			//And send it to them to finish!
			postTradeToUser(tradeorder.userid, tradeorder.book.uuid, signedrexp.data.data);	
		});
	});
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
	if(change.greaterThan(DECIMAL_ZERO)){
		
		console.log("Change : "+change+" "+tokenid);
		
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
function postTradeToUser(userid, bookuid, txndata){
	
	//This is the message for the User
	var msg  			= {};
	msg.type 			= "trade";
	msg.data			= {};
	msg.data.bookuid 	= bookuid;
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
function checkAndSignTrade(tradereq){
		
	//First convert to a readable format
	MINIMASK.meg.viewtxn(tradereq.txndata, function(viewresp){
		console.log("CHECK TRADE bookuid:"+tradereq.bookuid+"\n"+JSON.stringify(viewresp,null,2));
		
		//Get the inputs and outputs and CHECK they are a valid trade you will accept..
		var insouts = getMyInputsAndOutputs(viewresp.data.transaction);	
		console.log("insouts:"+JSON.stringify(insouts,null,2));
		
		//Check thisis valid given this mktuid..
		var valid = checkValid(tradereq.bookuid, insouts);
		
		console.log("VALID:"+valid);
		
		return;
		
		//If so - Sign and POST!
		if(valid){
			
			//Now Update your Order Book.. as this trade will have used up some of your offering
			//..
			
			//Sign it.. and POST..
			utility_sign(txndata, true, function(signedrexp){
				console.log("POSTED : "+JSON.stringify(signedrexp,null,2));
				
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
	
	var mycoins 		= {};
	
	//Total Amounts / TokenID
	mycoins.inputtokenid 	= "xxx";
	mycoins.inputtotal 		= DECIMAL_ZERO;
	mycoins.outputtokenid 	= "xxx";
	mycoins.outputtotal 	= DECIMAL_ZERO;
	
	//Cycle Inputs..
	var ins = txn.inputs.length;
	for(var i=0;i<ins;i++){
		var input = txn.inputs[i];
		
		//Only coins that belong to us matter
		if(input.miniaddress == USER_ACCOUNT.ADDRESS){
			
			//Check is the same as before..	
			if(mycoins.inputtokenid != "xxx"){
				if(input.tokenid != mycoins.inputtokenid){
					throw new Error("TRADE INPUT TOKEN different : "+input.tokenid+" / "+mycoins.inputtokenid);
				}
			}				
			
			//Add to the total
			if(input.tokenid == "0x00"){
				mycoins.inputtotal = mycoins.inputtotal.plus(new Decimal(input.amount));	
			}else{
				mycoins.inputtotal = mycoins.inputtotal.plus(new Decimal(input.tokenamount));
			}
			
			//Next check
			mycoins.inputtokenid = input.tokenid;	
		}
	}
	console.log("Input total : "+mycoins.inputtokenid+" "+mycoins.inputtotal);
	
	//Cycle Outputs..
	var outs = txn.outputs.length;
	for(var i=0;i<outs;i++){
		
		//Only coins that belong to us matter				
		var output = txn.outputs[i];
		if(output.miniaddress == USER_ACCOUNT.ADDRESS){
			
			//Is it the change from the input..
			if(output.tokenid == mycoins.inputtokenid){
				console.log("Found change coin output.. ");
				if(output.tokenid == "0x00"){
					mycoins.inputtotal = mycoins.inputtotal.minus(new Decimal(output.amount));	
				}else{
					mycoins.inputtotal = mycoins.inputtotal.minus(new Decimal(output.tokenamount));
				}
				console.log("NEW Input total : "+mycoins.inputtokenid+" "+mycoins.inputtotal);
			
			}else{
				
				//Check the token..  
				if(mycoins.outputtokenid != "xxx"){
					if(output.tokenid != mycoins.outputtokenid){
						throw new Error("TRADE OUTPUT TOKEN different : "+output.tokenid+" / "+mycoins.outputtokenid);
					}
				}				
				
				//Add to the total
				if(output.tokenid == "0x00"){
					mycoins.outputtotal = mycoins.outputtotal.plus(new Decimal(output.amount));	
				}else{
					mycoins.outputtotal = mycoins.outputtotal.plus(new Decimal(output.tokenamount));
				}
				
				//Next check
				mycoins.outputtokenid = output.tokenid;		
			}
		}
	}
	console.log("Output total : "+mycoins.outputtokenid+" "+mycoins.outputtotal);
	
	return mycoins;
}

function checkValid(bookuid, insouts){
	
	//Get the book
	var mybook = getMyOrder(bookuid);
	if(mybook == null){
		console.log("Could not find my order book : "+bookuid);
		return false;
	}
	
	//We now have the total put in and the total out.. check this against the book!!
	if(mybook.type == "sell"){
		
		//Check the tokenid..
		if(mybook.market.token1.tokenid != insouts.inputtokenid){
			console.log("Wrong token1 for sell.."+JSON.stringify(mybook.market));
			return false;
		
		}else if(mybook.market.token2.tokenid != insouts.outputtokenid){
			console.log("Wrong token2 for sell.."+JSON.stringify(mybook.market));
			return false;
		}
		
		//Check the price..
		var bookprice 	= new Decimal(mybook.price);
		var price 		= insouts.outputtotal.dividedBy(insouts.inputtotal);
		if(!price.eq(bookprice)){
			console.log("Wrong price for sell.."+price+" / "+JSON.stringify(mybook.market));
			return false;
		}
		
		//Check the amount is MORE than requested
		var bookamount = new Decimal(mybook.amount); 
		if(bookamount.lessThan(insouts.inputtotal)){
			console.log("Amount too large for sell.."+JSON.stringify(mybook.market));
			return false;
		}
		
	}else if(mybook.type == "buy"){
		
		//Check the tokenid..
		if(mybook.market.token2.tokenid != insouts.inputtokenid){
			console.log("Wrong token2 for buy.."+JSON.stringify(mybook.market));
			return false;
		
		}else if(mybook.market.token1.tokenid != insouts.outputtokenid){
			console.log("Wrong token1 for buy.."+JSON.stringify(mybook.market));
			return false;
		}
		
		//Check the price..
		var bookprice 	= new Decimal(mybook.price);
		var price 		= insouts.inputtotal.dividedBy(insouts.outputtotal);
		if(!price.eq(bookprice)){
			console.log("Wrong price for buy.."+price+" / "+JSON.stringify(mybook.market));
			return false;
		}
		
		//Check the amount is MORE than requested
		var bookamount = new Decimal(mybook.amount); 
		if(bookamount.lessThan(insouts.outputtotal)){
			console.log("Amount too large for buy.."+JSON.stringify(mybook.market));
			return false;
		}
		
	}else{
		console.log("ERRO book entry type "+JSON.stringify(mybook));
		return false;
	} 
	
	return true;
}