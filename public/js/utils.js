/**
 * Utility Funcions
 */
var DECIMAL_ZERO 	= new Decimal(0);
const MAX_DECIMAL 	= 4;

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
  return financialDecimal(new Decimal(x));		
}

function financialDecimal(x) {
  return decimalRUp(x).toNumber();		
}

function decimalRUp(x) {
  return x.toDecimalPlaces(MAX_DECIMAL, Decimal.ROUND_UP);		
}

function financialRDown(x) {
  return financialDecimalRDown(new Decimal(x));		
}

function financialDecimalRDown(x) {
  return decimalRDown(x).toNumber();		
}

function decimalRDown(x) {
  return x.toDecimalPlaces(MAX_DECIMAL, Decimal.ROUND_DOWN);		
}

function getTimeMilli(){
	//Date as of NOW
	var recdate = new Date();
	return recdate.getTime();
}

function getTimeStr(timemilli){
	var dd = new Date(timemilli);
	var dateString = dd.getUTCHours()+":"+dd.getUTCMinutes()+":"+dd.getUTCSeconds()+" " 
					+dd.getUTCDate()+"/"
 					+(dd.getUTCMonth()+1)+"/"
 					+dd.getUTCFullYear()
 						 				 
	return dateString;
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

