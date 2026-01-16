
const market_select 	= document.getElementById('id_allmarkets');
const market_tokenname 	= document.getElementById('id_market_tokenname');
const market_tokenid 	= document.getElementById('id_market_tokenid');

/**
 * The Market Select
 */

market_select.onchange = function (e) {
    
	var selectedOption = this[this.selectedIndex];
 	var selectedText 	= selectedOption.text;
	var selectedValue 	= selectedOption.value;
	
	//Set the current market
	CURRENT_MARKET = ALL_MARKETS[selectedValue];
	
	console.log("Market Change : "+JSON.stringify(CURRENT_MARKET));
	
	//Reload all orders
	setAllOrdersTable();
	
	//Reload My Orders..
	setMyOrdersTable();
	
	//Set ALL my orders table
	setAllMyOrders();
	
	//Set the market tokenid
	setMarketTokenID();
}

function setMarketSelect(){
	
	//Get the previous mkt..
	prevmktuid = CURRENT_MARKET.mktuid;
	
	//Clear it..
	market_select.innerHTML = "";
	
	//Previous market
	var previousmkt = 0;
	
	var len = ALL_MARKETS.length;
	for(var i=0;i<len;i++){
		
		var mkt 	= ALL_MARKETS[i];
		
		//Is this the prvious selected
		if(mkt.mktuid == prevmktuid){
			previousmkt = i;
		}
		
		var opt 		= document.createElement('option');
        opt.value 		= i;
        opt.innerHTML 	= mkt.mktname;
        market_select.appendChild(opt);
	}
	
	//Set the previous.. if any
	market_select.value = previousmkt;
	
	//Now set the Current Market
	CURRENT_MARKET = ALL_MARKETS[previousmkt];
	
	//Set the market tokenid
	setMarketTokenID(); 
}

function setMarketTokenID(){
	
	if(CURRENT_MARKET.token1.tokenid == "0x00"){
		//Use token2
		market_tokenname.innerHTML 	= CURRENT_MARKET.token2.name;
		market_tokenid.innerHTML 	= CURRENT_MARKET.token2.tokenid;
	}else{
		market_tokenname.innerHTML 	= CURRENT_MARKET.token1.name;
		market_tokenid.innerHTML 	= CURRENT_MARKET.token1.tokenid;	
	}
}

/**
 * Create a market given 2 tokens
 */
function createMinimaMarket(userbal){
	
	var market				= {};
	
	market.mktname 			= userbal.token.name+" / Minima";
	market.mktuid 			= userbal.tokenid+" / 0x00";
	
	market.token1 			= {};
	market.token1.name 		= userbal.token.name;
	market.token1.tokenid 	= userbal.tokenid;
	
	market.token2 			= {};
	market.token2.name 		= "Minima";
	market.token2.tokenid 	= "0x00";	
	
	return market;
}

/**
 * Initialise Market Panel
 */
function updateAllMarkets(){
	console.log("updateAllMarkets");
	
	//Find all unique tokens - except Minima and MxUSD
	var unique_tokenid 	= new Set();
	unique_tokenid.add("0x00");
	unique_tokenid.add(MXUSD_TOKENID);
	
	//Add the MxUSD Market
	var markets = [];
	markets.push(MXUSD_MARKET);
	
	//Cycle through ALL_ORDERS
	for(const key in ALL_ORDERS) {
		
		//Get the Users balance
		var balance = ALL_ORDERS[key].balance;
		
		//Cycle through the balance
		var len = balance.length;
		for(var i=0;i<len;i++) {
			
			var baltok = balance[i];
			
			//Is it in the set.. ONLTY TOKENS.. Minima is the base 
			if(!unique_tokenid.has(baltok.tokenid)){
				
				//Add it!
				unique_tokenid.add(baltok.tokenid);
				
				//Create that market
				markets.push(createMinimaMarket(baltok));
			}
		}
	}
	
	console.log("MARKETS : "+JSON.stringify(markets));
	
	//Order the Markets..!
	markets.sort(sortMarketsAlphabetically);
	
	//Set this..
	ALL_MARKETS = markets;
	
	setMarketSelect();
}