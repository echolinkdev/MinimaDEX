
//Get the canvas..
var CHART_CANVAS = document.getElementById('chartgraph');
CHART_CANVAS.style.width	='100%';
CHART_CANVAS.style.height	='100%';
CHART_CANVAS.width  		= CHART_CANVAS.offsetWidth;
CHART_CANVAS.height 		= CHART_CANVAS.offsetHeight;

var CHART_CONTEXT = CHART_CANVAS.getContext('2d');

var CHART;

var CHART_BARS 		= 20;
var CURRENT_BARDATA = [];

/**
 * Update the price chart given the current trades and market
 */
function initPriceChart(){
		
	//What is the current Market
	CHART = new Chart(CHART_CONTEXT, {
	  type: 'candlestick',
	  data: {
	    datasets: [{
	      label: "Price Chart",
	      data: CURRENT_BARDATA,
	    }]
	  }
	}); 
}

function setPriceData(){
	
	//Set the title
	var dataset = CHART.config.data.datasets[0].label = CURRENT_MARKET.mktname;
	
	//First get all the trades for the current market
	var ctrades = [];
	var len = ALL_TRADES.length;
	for(var i=0;i<len;i++) {
		var trade=ALL_TRADES[i];
		if(trade.market.mktuid == CURRENT_MARKET.mktuid){
			ctrades.push(trade);
		}
	}
	var ctradelen 	= ctrades.length;
	
	//Find the high / low
	var highestprice = 0;
	var lowestprice  = 1000000000;
	for(var j=0;j<ctradelen;j++){
		var ctrade = ctrades[j];
	
		if(ctrade.price<lowestprice){
			lowestprice = ctrade.price; 
		}else if(ctrade.price>highestprice){
			highestprice = ctrade.price; 
		} 
	}
	
	if(lowestprice == 1000000000){
		lowestprice = 0;
	}
	
	//Add a little head room
	highestprice 	= highestprice * 1.5;
	lowestprice  	= lowestprice  * 0.75;
	var midprice	= (highestprice + lowestprice) / 2;  
	
	//Now create the hourly candles
	var timewindowgap 	= 60000 * 10;
	var fullgap 		= timewindowgap * CHART_BARS;
	var timenow 		= getTimeMilli();
	
	var current_close=lowestprice;
	for(var i=0;i<CHART_BARS;i++){
		
		//Create the time window..
		var starttime 	= timenow - fullgap + (timewindowgap * i);
		var endtime 	= starttime + timewindowgap; 
		 
		var maxtime 	= timenow + (60000 * 60 * 24);
		
		var open 		= 0;
		var opentime	= maxtime;
		
		var close 		= 0;
		var closetime 	= 0;
		
		var high 		= 0;
		var low 		= 1000000000;
		
		//Cycle through valuid trades..
		for(var j=0;j<ctradelen;j++){
			var ctrade = ctrades[j];
			
			//Is this trade in the window.. ?
			if(ctrade.date>=starttime && ctrade.date<=endtime){
				
				console.log("TRADE IN WINDOW : "+ctrade.date+" @ "+ctrade.price+" "+ctrade.type);
				
				//Add to totals..
				if(ctrade.date < opentime){
					open 		= ctrade.price;
					opentime 	= ctrade.date;  
				}
				
				if(ctrade.date > closetime){
					close 			= ctrade.price;
					closetime 		= ctrade.date;
					current_close 	= close;  
				}
				
				if(ctrade.price > high){
					high = ctrade.price;
				}
				
				if(ctrade.price < low){
					low = ctrade.price;
				}
			}			
		}
		
		//Did we find any..
		if(low == 1000000000){
			low 	= current_close;
			high 	= current_close;
			open 	= current_close;
			close 	= current_close;
		
		}else{
			var test = createCandle(starttime, open, high, low, close);
			console.log("CANDLE : "+JSON.stringify(test));
		}
		
		//var cc = createCandle(starttime, open, high, low, close);
		//CURRENT_BARDATA[i] = cc;
		
		var newtime = timenow + (60000 * i); 
		var cc = createCandle(starttime, getRandom(10), getRandom(10), getRandom(10), getRandom(10));
		CURRENT_BARDATA[i] = cc;
	}
}

function updatePriceChart() {
	
	//Set the chart data
	setPriceData();
	
	//Update the chart
  	CHART.update();
};


function createCandle(timemilli, open, high, low, close){
	var candle 	= {};
	candle.time	= getTimeStr(timemilli);
	candle.x 	= timemilli;
	candle.o	= open;
	candle.h	= high;
	candle.l	= low;
	candle.c	= close;
	
	return candle;
}