
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
				postTradeToUser(tradeorder.userid, tradeorder.book.uuid, signedrexp.data.data);	
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
	
	var mycoins 	= {};
	mycoins.inputs 	= [];
	mycoins.outputs = [];
	
	//Cycle Inputs..
	var ins = txn.inputs.length;
	for(var i=0;i<ins;i++){
		//Check the address..				
		var input = txn.inputs[i];
		if(input.miniaddress == USER_ACCOUNT.ADDRESS){
			mycoins.inputs.push(input);
		}
	}
	
	//Cycle Outputs..
	var outs = txn.outputs.length;
	for(var i=0;i<outs;i++){
		//Check the address..				
		var output = txn.outputs[i];
		if(output.miniaddress == USER_ACCOUNT.ADDRESS){
			mycoins.outputs.push(output);
		}
	}
	
	return mycoins;
}

function checkValid(bookuid, insouts){
	
	//Get the book
	//var  = getMyOrder(bookuid);
	//if(mybook == null){
	//	return false;
	//}
	
	//Check all the input coins are the same tokenid
	var inputtotal = DECIMAL_ZERO;
	var oldinputtoken = "xxx";
	var ins = insouts.inputs.length;
	for(var i=0;i<ins;i++){
		var input = insouts.inputs[i];
		
		//Check the token..
		if(oldinputtoken != "xxx"){
			if(input.tokenid != oldinputtoken){
				console.log("INPUT TOKEN diffrent : "+input.tokenid+" / "+oldinputtoken);
				return false;
			}
		}				
		
		//Add to the total
		if(input.tokenid == "0x00"){
			inputtotal = inputtotal.plus(new Decimal(input.amount));	
		}else{
			inputtotal = inputtotal.plus(new Decimal(input.tokenamount));
		}
		
		//Next check
		oldinputtoken = input.tokenid;
	}
	
	//Now the outs
	var outputtotal = DECIMAL_ZERO;
	oldtoken = "xxx";
	var outs = insouts.outputs.length;
	for(var i=0;i<outs;i++){
		var output = insouts.outputs[i];
		
		//Check the token..
		if(oldtoken != "xxx"){
			if(output.tokenid != oldtoken){
				console.log("OUTPUT TOKEN different : "+output.tokenid+" / "+oldtoken);
				return false;
			}
		}				
		
		//Add to the total
		if(output.tokenid == "0x00"){
			outputtotal = outputtotal.plus(new Decimal(output.amount));	
		}else{
			outputtotal = outputtotal.plus(new Decimal(output.tokenamount));
		}
		
		//Next check
		oldtoken = output.tokenid;
	}
	
	console.log("Check coins all the saem tokenid : "+oldtoken);
	console.log("Input total : "+oldinputtoken+" "+inputtotal);
	console.log("Output total : "+oldtoken+" "+outputtotal);
	
	return true;
}