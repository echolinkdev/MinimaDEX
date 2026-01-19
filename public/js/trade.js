

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