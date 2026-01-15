
/**
 * The Market Select
 */
const market_select = document.getElementById('id_allmarkets');
market_select.onchange = function (e) {
    
	var selectedOption = this[this.selectedIndex];
    
	var selectedText 	= selectedOption.text;
	var selectedValue 	= selectedOption.value;
	
	console.log("Market Change : "+selectedValue);
}

function setMarketSelect(){
	
	//Get the selected item..
	var selectedText 	= market_select[market_select.selectedIndex].text;
	
	//Clear it..
	market_select.innerHTML = "";
	
	//Previous market
	var previousmkt = -1;
	
	var len = ALL_MARKETS.length;
	for(var i=0;i<len;i++){
		
		var mkt 	= ALL_MARKETS[i];
		
		var mktname = mkt.token1.name+" / "+mkt.token2.name;  
		if(mktname == selectedText){
			previousmkt = i;
		}
		
		var opt 		= document.createElement('option');
        opt.value 		= i;
        opt.innerHTML 	= mktname;
        market_select.appendChild(opt);
	}
	
	//Set the previous..
	if(previousmkt != -1){
		market_select.value = previousmkt;
	}
}

/**
 * Create a market given 2 tokens
 */
function createMinimaMarket(userbal){
	
	var market				= {};
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
	
	//Order the Markets..!
	
	
	//Set this..
	ALL_MARKETS = markets;
	
	setMarketSelect();
}