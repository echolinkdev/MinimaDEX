
const blakout_panel 	= document.getElementById('id_blackoutdiv'); 
const mktaction_panel 	= document.getElementById('id_buyselldiv'); 
const mktamount_slider 	= document.getElementById('id_mktamountrange');
const mktcurrentamount 	= document.getElementById('id_mktcurrentamount');
const mkttotal 			= document.getElementById('id_mkttotal');

mktamount_slider.addEventListener("input", (event) => {
	setCurrentAmount(event.target.value);
});

function setCurrentAmount(perc){
	
	//Calculate Amount
	var currentamt = financial(perc * MKT_CURRENT_MAXAMOUNT);
	mktcurrentamount.innerHTML = currentamt+" "+CURRENT_MARKET.token1.name;
	
	//And total
	var total = financial(currentamt * MKT_CURRENT_PRICE);
	mkttotal.innerHTML = total+" "+CURRENT_MARKET.token2.name;
}

var MKT_CURRENT_MAXAMOUNT 	= 0;
var MKT_CURRENT_PRICE 		= 0;

function showMktActionPanel(buysell, price, maxamount){
	
	MKT_CURRENT_PRICE		= price;
	MKT_CURRENT_MAXAMOUNT 	= maxamount;
	
	//Set the slider
	mktamount_slider.value = 1;
	setCurrentAmount(1);
	
	//BUY or SELL action
	if(buysell){
		id_mktaction_details.innerHTML = "You are about to <b>BUY</b> "+CURRENT_MARKET.token1.name+" for "+CURRENT_MARKET.token2.name;
	}else{
		id_mktaction_details.innerHTML = "You are about to <b>SELL</b> "+CURRENT_MARKET.token1.name+" for "+CURRENT_MARKET.token2.name;
	}
	
	id_mktaction_price.innerHTML 		= price;
	id_mktaction_maxamount.innerHTML 	= maxamount;
	
	blakout_panel.style.display = "block";
	mktaction_panel.style.display = "block";	
}

function hideMktActionPanel(){
	blakout_panel.style.display = "none";
	mktaction_panel.style.display = "none";
	
	
}