/**
 * Utility Funcions
 */
function getRandomHexString() {
    const hex = '0123456789ABCDEF';
    let output = '';
    for (let i = 0; i < 24; ++i) {
        output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return "0x"+output;
}

function getRandom(max){
	return Math.floor(Math.random() * max); 
}

function financial(x) {
  return new Decimal(x).toDecimalPlaces(4, Decimal.ROUND_DOWN).toNumber();		
  //return +Number.parseFloat(x).toFixed(4);
}

function getTimeMilli(){
	//Date as of NOW
	var recdate = new Date();
	return recdate.getTime();
}

function sortUserOrdersAlphabetically(a,b){
	var nameA = a.market.mktname.toLowerCase(); 
	var nameB = b.market.mktname.toLowerCase(); 
	
	if(nameA.startsWith("minima")){
		nameA="A";
	}
	
	if(nameB.startsWith("minima")){
		nameB="A";
	}
	
	if (nameA < nameB) {
	  return -1;
	}
	if (nameA > nameB) {
	  return 1;
	}
	
	// names must be equal
	return 0;
}

function sortMarketsAlphabetically(a,b){
	var nameA = a.mktname.toLowerCase(); 
	var nameB = b.mktname.toLowerCase();
	
	if(nameA.startsWith("minima")){
		nameA="A";
	}
	
	if(nameB.startsWith("minima")){
		nameB="A";
	}
	
	if (nameA < nameB) {
	  return -1;
	}
	if (nameA > nameB) {
	  return 1;
	}	

	return 0;
}

