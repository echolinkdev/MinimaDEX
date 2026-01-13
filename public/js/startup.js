/**
 * Called to  init DEX
 */
var MINIMASK_INITED = false;

function initDEX(){
	
	//Init
	initPanels();
			
	//Wait for page to load
	window.onload = function () {
		
		//Have we loaded the MiniMask Extension
		if(typeof MINIMASK !== "undefined"){
			
			//Lets see if we are logged in..
			MINIMASK.init(function(initmsg){
				
				//Log all messages
				console.log("MINIMASK init : "+JSON.stringify(initmsg,null,2));
				
				if(initmsg.event == "MINIMASK_INIT"){
					
					MINIMASK_INITED = true;		
					
					fetchBalance(function(){
						navigate_dex();	
					});
					
				}else if(initmsg.event == "MINIMASK_PENDING"){
					//Confirmed Pending actions will be sent here..
					
				}	
			});
			
		}else{
			console.log("MINIMASK extension not active!");	
		}	
	}
	
	
}

function initPanels(){
	
	//Init each Panel
	chatroomInit();
	myordersInit();
	allordersInit();
	
	//Wallet
	walletInit();
	
	//Now connect to server
	wsInitSocket();
	
	//navigate_wallet();
}
