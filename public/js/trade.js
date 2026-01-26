
const trade_blakout_panel	= document.getElementById('id_blackoutdiv');
const tradeinfo_panel 		= document.getElementById('id_tradeinfo_panel');
const tradeinfo_text 		= document.getElementById('id_tradeinfo_textarea');

function showTradeInfoPanel(){
	tradeinfo_text.value="";
	trade_blakout_panel.style.display 	= "block";
	tradeinfo_panel.style.display 		= "block";
}

function hideTradeInfoPanel(){
	trade_blakout_panel.style.display 	= "none";
	tradeinfo_panel.style.display 		= "none";
}

function addTextTradeInfo(msg){
	tradeinfo_text.value += msg+"\n";
}


/**
 * When you accept a trade from the frontend..
 */
var CURRENT_TRADE_STATS = "";

function startTrade(){
	
	//MUST be > 0
	if(MKT_TOTAL_AMOUNT <= 0){
		alert("Cannot have zero size trade..");
		return;
	}
	
	//Hide trade choose window
	hideMktActionPanel()
	
	//Show main window
	showTradeInfoPanel();
	
	//Create transaction..
	var txn 	= {};
	txn.inputs 	= [];
	txn.outputs	= [];
	txn.scripts	= [];
	txn.state	= {};
	
	try{
		
		//Are we buying..
		if(MKT_BUYSELL){
			
			//Store for later
			CURRENT_TRADE_STATS = "BUY "+MKT_CURRENT_AMOUNT+" "+CURRENT_MARKET.token1.name
							+" FOR "+MKT_TOTAL_AMOUNT+" "+CURRENT_MARKET.token2.name+" @ "+MKT_CURRENT_PRICE;
			
			//Info
			addTextTradeInfo(CURRENT_TRADE_STATS);
				
			//Check we have enough..
			var available = getAvailableBalance(CURRENT_MARKET.token2.tokenid);
			if(available < MKT_TOTAL_AMOUNT){
				addTextTradeInfo("Insufficient funds..\n\nYou only have "+available+" "+CURRENT_MARKET.token2.name+" available..");
				return;
			}
			
			//Ok - we have enough.. find an order / user
			var tradeorder = findValidOrder(CURRENT_MARKET.mktuid, CURRENT_MARKET.token1.tokenid, "sell", MKT_CURRENT_PRICE, MKT_CURRENT_AMOUNT);
			if(tradeorder == null){
				addTextTradeInfo("Error.. could not find valid order.. ?");
				return;
			}
			
			
			//CHECK THEY have enough..
			//..
			
			//Add MY Coins first..
			addTextTradeInfo("Create trade transaction..");
			var mytokbal = getTokenBalance(CURRENT_MARKET.token2.tokenid, USER_BALANCE);
			
			//Send the amount to the User
			addCoins(txn, mytokbal, CURRENT_MARKET.token2.tokenid, MKT_TOTAL_AMOUNT, tradeorder.address);
			addTextTradeInfo("Your coins added..");
			
			//Now add THEIR coins and send to us..
			addCoins(txn, tradeorder.balance, CURRENT_MARKET.token1.tokenid, MKT_CURRENT_AMOUNT, USER_ACCOUNT.ADDRESS);
			addTextTradeInfo("Counter-party coins added..");
			
			//Now add both the scripts..
			txn.scripts.push(USER_ACCOUNT.SCRIPT);
			txn.scripts.push(tradeorder.script);
			addTextTradeInfo("Scripts added..");
			
		//Or Selling	
		}else{
			
			//Store for later
			CURRENT_TRADE_STATS ="SELL "+MKT_CURRENT_AMOUNT+" "+CURRENT_MARKET.token1.name
							+" FOR "+MKT_TOTAL_AMOUNT+" "+CURRENT_MARKET.token2.name+" @ "+MKT_CURRENT_PRICE;
						
										
			//Info
			addTextTradeInfo(CURRENT_TRADE_STATS);
						
							
			//Check we have enough..
			var available = getAvailableBalance(CURRENT_MARKET.token1.tokenid);
			if(available < MKT_CURRENT_AMOUNT){
				addTextTradeInfo("Insufficient funds..\n\n"
								+"You are trying to sell "+MKT_CURRENT_AMOUNT+"\n\n"
								+"You only have "+available+" "+CURRENT_MARKET.token1.name+" available..");
				return;
			}
			
			//Ok - we have enough.. find an order / user
			var tradeorder = findValidOrder(CURRENT_MARKET.mktuid, CURRENT_MARKET.token2.tokenid, "buy", MKT_CURRENT_PRICE, MKT_CURRENT_AMOUNT);
			
			
			//Add MY Coins first..
			addTextTradeInfo("Create trade transaction..");
			var mytokbal = getTokenBalance(CURRENT_MARKET.token1.tokenid, USER_BALANCE);
			//console.log("My BALANCE : "+JSON.stringify(mytokbal));
			
			//Send the amount to the User
			addCoins(txn, mytokbal, CURRENT_MARKET.token1.tokenid, MKT_CURRENT_AMOUNT, tradeorder.address);
			addTextTradeInfo("Your coins added..");
			
			//Now add THEIR coins and send to us..
			addCoins(txn, tradeorder.balance, CURRENT_MARKET.token2.tokenid, MKT_TOTAL_AMOUNT, USER_ACCOUNT.ADDRESS);
			addTextTradeInfo("Counter-party coins added..");
			
			//Now add both the scripts..
			txn.scripts.push(USER_ACCOUNT.SCRIPT);
			txn.scripts.push(tradeorder.script);
			addTextTradeInfo("Scripts added..");
		}
		
		//Create a RAW Txn..
		MINIMASK.meg.rawtxn(txn.inputs, txn.outputs, txn.scripts, txn.state, function(rawresp){
			//console.log("RAWTXN : "+JSON.stringify(rawresp,null,2));
			
			addTextTradeInfo("Signing transaction..");
			
			//Now Sign the Transaction..
			utility_sign(rawresp.data.data, false, function(signedrexp){
				//console.log("SIGNTXN : "+JSON.stringify(signedrexp,null,2));
				
				//And send it to them to finish!
				var msg = postTradeToUser(tradeorder.userid, tradeorder.book.uuid, signedrexp.data.data);
				
				addTextTradeInfo("Sending transaction to counter-party to sign.. uuid:"+msg.data.tradeuuid);
								
				//Start auto balance refresh..
				autoUpdateBalance();	
			});
		});	
		
	}catch(Error){
		//Something wqent wrong..
		addTextTradeInfo("ERROR : "+Error);
		return;
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
	if(totaladded.lessThan(addamount)){
		throw new Error("Could not add required amount.. pls try again..\n\n"+amount);
	}
	
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
 * Post your orders to the user
 */
var CURRENT_TRADE_UUID = ""; 
function postTradeToUser(userid, bookuid, txndata){
	
	//This is the message for the User
	var msg  			= {};
	msg.type 			= "trade_request";
	msg.data			= {};
	msg.data.bookuid 	= bookuid;
	msg.data.txndata 	= txndata;
	
	msg.data.tradeuuid 	= getRandomHexString();
	CURRENT_TRADE_UUID	= msg.data.tradeuuid; 
	
	//This is the message sent to the server
	var servermsg 			= {};
	servermsg.type			= "message";
	servermsg.data			= {};
	servermsg.data.uuid		= userid;
	servermsg.data.message	= msg;
	
	//Post to server
	wsPostToServer(servermsg);
	
	return msg;
}

/**
 * Post your orders to the user
 */
function postResultToUser(userid, status, txpowid, tradeuuid){
	
	//This is the message for the User
	var msg  			= {};
	msg.type 			= "trade_complete";
	msg.data			= {};
	msg.data.status 	= status;
	msg.data.txpowid 	= txpowid;
	msg.data.tradeuuid 	= tradeuuid;
	
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
 * When you rec a tyrade_complete message
 */
function tradeComplete(msg){
	if(msg.status && msg.tradeuuid == CURRENT_TRADE_UUID){
		addTextTradeInfo("Trade Success! "+msg.txpowid);
		
		//Add a history log..!
		addHistoryLog("TRADE", CURRENT_TRADE_STATS, msg.txpowid);
			
	}else if(msg.tradeuuid == CURRENT_TRADE_UUID){
		console.log("ERROR TRADE COMPLETE "+JSON.stringify(msg));
		
		addTextTradeInfo("Something went wrong.. "+msg.txpowid);
	}
}

/**
 * Post your orders to the server
 */
function postFinishedTrade(orderbook, insouts, txpowid){
	
	var trade = {};
	trade.date 		= getTimeMilli();
	trade.txpowid 	= txpowid;
	trade.market 	= orderbook.market;
	trade.price  	= orderbook.price;
	
	//OK - Let's work out the trade
	if(orderbook.type=="buy"){
		
		//TAKER WAS A SELL
		trade.type	 		= "sell";
		trade.amount 		= insouts.outputtotal;
		trade.amounttoken 	= insouts.outputtokenid;
		trade.total	 		= insouts.inputtotal;
		trade.totaltoken	= insouts.inputtokenid;
		
	}else{
		
		//TAKER WAS A BUY
		trade.type	 		= "buy";
		trade.amount 		= insouts.inputtotal;
		trade.amounttoken 	= insouts.inputtokenid;
		trade.total	 		= insouts.outputtotal;
		trade.totaltoken	= insouts.outputtokenid;
	}
	
	//This is the message sent to the server
	var servermsg 			= {};
	servermsg.type			= "trade";
	servermsg.data			= trade;
	
	//Post to server
	wsPostToServer(servermsg);
}

/**
 * Check Trade Transaction you have received..
 */
function checkAndSignTrade(fromuser, tradereq){
		
	//First convert to a readable format
	MINIMASK.meg.viewtxn(tradereq.txndata, function(viewresp){
		//console.log("CHECK TRADE bookuid:"+tradereq.bookuid+"\n"+JSON.stringify(viewresp,null,2));
		
		//Get the inputs and outputs and CHECK they are a valid trade you will accept..
		var insouts = getMyInputsAndOutputs(viewresp.data.transaction);	
		
		//Check thisis valid given this mktuid..
		var valid = checkValid(tradereq.bookuid, insouts);
		
		//If so - Sign and POST!
		if(valid){
		
			//Get the book - before update/removed..
			var mytradebook = getMyOrder(tradereq.bookuid);
				
			//Now Update your Order Book.. as this trade will have used up some of your offering
			updateOrderAfterTrade(tradereq.bookuid, insouts);
						
			//Sign it.. and POST..
			utility_sign(tradereq.txndata, true, function(signedrexp){
				//console.log("POSTED : "+JSON.stringify(signedrexp,null,2));
				
				if(!signedrexp.status){
					//Something went wrong..
					console.log("ERROR TRADE : "+signedrexp.error);
					
					//Tell the User
					postResultToUser(fromuser, false, "",tradereq.tradeuuid);
									
					return;
				}
				
				//Get the txpowid..
				var txpowid = signedrexp.data.txpow.txpowid;	
				
				//Tell the User
				postResultToUser(fromuser, true, txpowid, tradereq.tradeuuid);
				
				//And notify the rest - the TAKER TRADE
				postFinishedTrade(mytradebook, insouts, txpowid);
				
				//Start auto balance refresh..
				autoUpdateBalance();
				
				//Add History log
				addTradeHistoryLog(mytradebook, insouts, txpowid);
			});
			
		}else{
			//Invalid..
			console.log("Invalid Trade.. ");
			
			//Tell User..
			//..
		}
	}); 
}

function addTradeHistoryLog(order, insouts, txpowid){
	
	var histlog  = "";
	if(order.type=="buy"){
		histlog = "BUY "+insouts.outputtotal+" "+order.market.token1.name
				+" FOR "+insouts.inputtotal+" "+order.market.token2.name+" @ "+order.price;
		
	}else{
		histlog = "SELL "+insouts.inputtotal+" "+order.market.token1.name
				+" FOR "+insouts.outputtotal+" "+order.market.token2.name+" @ "+order.price;
	}
	
	addHistoryLog("TRADE_BOOK", histlog, txpowid);
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
		var price 		= decimalRUp(insouts.outputtotal.dividedBy(insouts.inputtotal));
		if(!price.greaterThanOrEqualTo(bookprice)){
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
		var price 		= decimalRDown(insouts.inputtotal.dividedBy(insouts.outputtotal));
		if(!price.lessThanOrEqualTo(bookprice)){
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
		console.log("ERROR book entry type "+JSON.stringify(mybook));
		return false;
	} 
	
	return true;
}