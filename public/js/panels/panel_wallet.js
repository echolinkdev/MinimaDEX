
const seed_blakout_panel	= document.getElementById('id_blackoutdiv');
const seed_show_panel 		= document.getElementById('id_seedphrasepanel');

function walletInit(){
	
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
			
			if(oldbalance != "[]"){
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
			
		try{
			
			//Put this in the page..
			updateBalancePanel(balresp.data);
				
		}catch(Error){
			console.log("Error update balance : "+Error);
			console.log("balanceresp : "+JSON.stringify(balresp));
		}
		
	});
}

function updateBalancePanel(balance){
	console.log("Update balance display..");
	
	var baltable 	= document.getElementById('id_balance_table');
	var tokenselect	= document.getElementById('id_wallet_tokenselect');
	
	//Clear Table
	baltable.innerHTML 		= "";
	tokenselect.innerHTML 	= "";
	
	//Set the Headers
	var row   = baltable.insertRow(0);
	row.insertCell().outerHTML = "<th>Token</th>";
	row.insertCell().outerHTML = "<th>Available&nbsp;&nbsp;&nbsp;&nbsp;</th>"; 
	row.insertCell().outerHTML = "<th>Amount&nbsp;&nbsp;&nbsp;&nbsp;</th>"; 
	row.insertCell().outerHTML = "<th>Coins&nbsp;&nbsp;&nbsp;&nbsp;</th>";
		
	//Get my Orders
	var len = balance.length;
	for(var i=0;i<len;i++) {
		
		var tokenbal=balance[i];
		
		//Insert row
		var row = baltable.insertRow();
		
		var celltoken 		= row.insertCell();
		var cellavailable 	= row.insertCell();
		var cellamount 		= row.insertCell();
		var cellcoins 		= row.insertCell();
		var cellsplt 		= row.insertCell();
		
		var tokenname = "";
		if(tokenbal.tokenid == "0x00"){
			tokenname = "Minima";
		}else{
			tokenname = tokenbal.token.name;
		}
		
		celltoken.innerHTML = tokenname;
		celltoken.style.width="100%";
		
		cellavailable.innerHTML = "0";
		
		if(tokenbal.unconfirmed != "0"){
			cellamount.innerHTML 	= tokenbal.confirmed+" ("+tokenbal.unconfirmed+")";
		}else{
			cellamount.innerHTML 	= tokenbal.confirmed;	
		}
		
		cellcoins.innerHTML = tokenbal.coins;
		
		cellsplt.innerHTML 	= "<button class=mybtn onclick='splitWalletCoins(\""+tokenname+"\",\""+tokenbal.tokenid+"\");'>Split Coins</button>";
		
		//Insert row
		var rowid 				= baltable.insertRow();
		var celltokenid 		= rowid.insertCell();
		celltokenid.colSpan 		= "4";
		celltokenid.style.fontSize 	= "0.7em";
		celltokenid.style.color 	= "grey";
		celltokenid.innerHTML 	= tokenbal.tokenid;
		
		//Final gap
		var rowgap 	= baltable.insertRow();
		var rowgap 	= rowgap.insertCell();
		rowgap.innerHTML = "&nbsp;";
		
		//And sort the select
		var opt 		= document.createElement('option');
        opt.value 		= tokenbal.tokenid;
        opt.innerHTML 	= tokenname;
        tokenselect.appendChild(opt); 	
	}
}

function getTokenBalance(tokenid){
	
	//Search through the Balance and get total..
	//..
	
	return 103;
}

/**
 * Send fundxs from the wallet
 */
function wallet_sendfunds(){
	
	var sel = id_wallet_tokenselect.selectedIndex;
	
	//Get the details..
	var tokenname 	= id_wallet_tokenselect.options[sel].text;
	var tokenid 	= id_wallet_tokenselect.value;
	var address 	= id_wallet_send_address.value.trim();
	var amount  	= financial(id_wallet_send_amount.value);
	
	if(amount <= 0){
		alert("Invalid amount : "+amount);
		return;
	}
	
	if(address == ""){
		alert("Cannot have blank address");
		return;
	}
	
	if(confirm("You are about to send "+amount+" "+tokenname+" to "+address+"\n\nContinue ?")){
		
		//Send
		utility_send(tokenid, amount, address, 1, function(resp){
			//console.log("WALLET SEND : "+JSON.stringify(resp));
			
			if(resp.status){
				alert("Funds Sent!");
			}else{
				alert(resp.error);
			}
		});
		
		id_wallet_send_amount.value  = 0;
		id_wallet_send_address.value = "";
	}
}

/**
 * Split token coins back into 10
 */
function splitWalletCoins(tokenname, tokenid){
	
	if(confirm("This will split your "+tokenname+" coins into 10 equal amounts.\n\nContinue ?")){
		
		//Get the balance..
		var balance = getTokenBalance(tokenid);
		
		//Send and split..
		utility_send(tokenid, balance, USER_ADDRESS, 10, function(resp){
			console.log("WALLET SPLIT : "+JSON.stringify(resp));
		});
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

/**
 * Utility SEND function that deals
 */
function utility_send(tokenid, amount, address, split, callback){
	//Send
	MINIMASK.meg.send(amount+"", address, tokenid, USER_ADDRESS, USER_PRIVATEKEY, USER_SCRIPT, USER_KEYUSES, split, function(resp){
		
		//Update KEY USES
		USER_KEYUSES++;
		
		//And Auto Update the balance..
		autoUpdateBalance();
					
		//Callback
		callback(resp);
	});
}
