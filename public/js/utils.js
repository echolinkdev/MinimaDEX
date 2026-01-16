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

function financial(x) {
  return new Decimal(x).toDecimalPlaces(4, Decimal.ROUND_DOWN).toNumber();		
  //return +Number.parseFloat(x).toFixed(4);
}

function getTimeMilli(){
	//Date as of NOW
	var recdate = new Date();
	return recdate.getTime();
}