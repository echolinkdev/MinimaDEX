
/**
 * Called to  init DEX
 */
function initDEX(){
	
	//Wait for page to load - CHECK MINIMASK
	window.onload = function () {
		
		//Have we loaded the MiniMask Extension
		if(typeof MINIMASK !== "undefined"){
			
			//Lets see if we are logged in..
			MINIMASK.init(function(initmsg){
				
				//Log all messages
				console.log("MINIMASK init : "+JSON.stringify(initmsg,null,2));
				
				if(initmsg.event == "MINIMASK_INIT"){
					
					//Load the User Details..
					showInitPanel();
					
				}else if(initmsg.event == "MINIMASK_PENDING"){
					//Confirmed Pending actions will be sent here..
					
				}	
			});
			
		}else{
			console.log("MINIMASK extension not active!");	
			alert("MiniMask Extension Not Active!\n\nThis applicatgion requires MiniMask");
		}	
	}
}

function mainListenerLoop(){
	
	//Add yourself to thew conversation
	wsAddListener(function(msg){
		
		//Is it a trade message
		if(msg.type=="message"){
			console.log("REC MESSAGE : "+JSON.stringify(msg));
			
			var recmsg = msg.data;
			if(recmsg.type=="trade"){
				
				//Check this Txn..!
				checkAndSignTrade(recmsg.data.mktuid, recmsg.data.txndata);	
			}
		}
	});
	
}


function postStartupDex(){
	
	//Init each Panel
	chatroomInit();
	allordersInit();
	
	//Wallet
	walletInit();
	
	//Load your Orders
	loadMyOrders();
	
	//Init History
	initHistory();
	
	fetchFullBalance(function(){
		navigate_dex();	
	});
	
	//Listen for messages..
	mainListenerLoop();
						
	//Now connect to server
	wsInitSocket(function(){
		
		//Have connected to server - post your orders to it..
		postMyOrdersToServer();
	});
}

function loadUserDetails(){
	return STORAGE.getData("**USER_DETAILS**");
}

function saveUserDetails(){
	STORAGE.setData("**USER_DETAILS**", USER_ACCOUNT);
}
