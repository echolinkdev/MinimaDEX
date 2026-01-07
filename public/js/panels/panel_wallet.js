
const seed_blakout_panel	= document.getElementById('id_blackoutdiv');
const seed_show_panel 		= document.getElementById('id_seedphrasepanel');

function initWallet(){
	
	var qrcode = new QRCode("wallet_receiveqr", {
		    text: USER_ADDRESS,
		    width: 250,
		    height: 250,
		    colorDark : "#000000",
		    colorLight : "#ffffff",
		    correctLevel : QRCode.CorrectLevel.H
		});	
		
	document.getElementById('id_wallet_address').innerHTML=USER_ADDRESS;
	
	document.getElementById('id_seedphrasedetails').innerHTML=USER_SEED;
}

function showSeedPhrase(){
	seed_blakout_panel.style.display = "block";
	seed_show_panel.style.display = "block";
}

function hideSeedPhrase(){
	seed_blakout_panel.style.display = "none";
	seed_show_panel.style.display = "none";
}

function fetchBalance(){
	
	MINIMASK.meg.balance(USER_ADDRESS, function(balresp){
		//console.log("BALANCE : "+JSON.stringify(balresp));
		
		//The balance bit
		var balance = balresp.data;
		
		//The OLD balance..
		var oldbalance = JSON.stringify(USER_BALANCE);
		
		//Check New vs Old
		if(JSON.stringify(balance) != oldbalance){
			
			if(oldbalance != "{}"){
				//Some thing has changed.. check for a few minutes..
				autoUpdateBalance();	
			}
			
		}else{
			
			//The SAME .. no change..
			return;
		}
		
		//Update DEX server..
		//..
		
		//Store for later
		USER_BALANCE = balance;
			
		//Put this in the page..
		updateBalancePanel(balresp.data);
	});
}

function updateBalancePanel(balance){
	console.log("Update balance display..");
	
	var baltable = document.getElementById('id_balance_table');
	
	//Clear Table
	baltable.innerHTML = "";
	
	//Set the Headers
	var row   = baltable.insertRow(0);
	row.insertCell(0).outerHTML = "<th>Token</th>";
	row.insertCell(1).outerHTML = "<th>Amount</th>"; 
	row.insertCell(2).outerHTML = "<th>Coins</th>";
		
	//Get my Orders
	var len = balance.length;
	for(var i=0;i<len;i++) {
		
		var tokenbal=balance[i];
		
		//Insert row
		var row = baltable.insertRow();
		
		var celltoken 	= row.insertCell();
		var cellamount 	= row.insertCell();
		var cellcoins 	= row.insertCell();
		
		if(tokenbal.tokenid == "0x00"){
			celltoken.innerHTML 	= "Minima";
		}else{
			celltoken.innerHTML 	= tokenbal.token.name;
		}
		
		if(tokenbal.unconfirmed != "0"){
			cellamount.innerHTML 	= tokenbal.confirmed+" ("+tokenbal.unconfirmed+")";
		}else{
			cellamount.innerHTML 	= tokenbal.confirmed;	
		}
		
		cellcoins.innerHTML 	= tokenbal.coins;
		
		//Insert row
		var rowid 				= baltable.insertRow();
		var celltokenid 		= rowid.insertCell();
		celltokenid.colSpan 				= "3";
		celltokenid.style.fontSize 			= "0.7em";
		celltokenid.style.color 	= "grey";
		celltokenid.innerHTML 	= tokenbal.tokenid;
		
		//Final gap
		var rowgap 	= baltable.insertRow();
		var rowgap 	= rowgap.insertCell();
		rowgap.innerHTML = "&nbsp;";	
	}
}

/**
 * Auto check balance for a certain amount of time.. 
 */
var AUTO_BALANCE_INTERVALID 		= 0;
var AUTO_BALANCE_INTERVAL_COUNTER 	= 0;
function autoUpdateBalance(){
	
	console.log("START Balance auto checker");
	
	//Disable the refresh button
	id_refreshbalance.disabled=true;
	
	//Clear the old
	clearInterval(AUTO_BALANCE_INTERVALID);
	
	//Reset counter
	AUTO_BALANCE_INTERVAL_COUNTER = 0;
	
	//Start a new one..
	AUTO_BALANCE_INTERVALID = setInterval(function(){
	
		console.log("Auto-Balance checker Called!! "+AUTO_BALANCE_INTERVAL_COUNTER);	
		
		fetchBalance();
		
		//Do we stop!!
		AUTO_BALANCE_INTERVAL_COUNTER++;
		if(AUTO_BALANCE_INTERVAL_COUNTER > 10){
			clearInterval(AUTO_BALANCE_INTERVALID);
			console.log("END Balance auto checker");
			
			id_refreshbalance.disabled=false;	
		}
		
	}, 10000);
	
}