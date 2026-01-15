/**
 * Called to  init DEX
 */
function initDEX(){
	
	//Init each Panel
	chatroomInit();
	allordersInit();
	
	//Wallet
	walletInit();
	
	//Load your Orders
	loadMyOrders();
	
	//Now connect to server
	wsInitSocket(function(){
		
		//Have connected to server - post your orders to it..
		postMyOrdersToServer();
		
	});
			
	//Wait for page to load
	window.onload = function () {
		
		//Have we loaded the MiniMask Extension
		if(typeof MINIMASK !== "undefined"){
			
			//Lets see if we are logged in..
			MINIMASK.init(function(initmsg){
				
				//Log all messages
				console.log("MINIMASK init : "+JSON.stringify(initmsg,null,2));
				
				if(initmsg.event == "MINIMASK_INIT"){
					
					fetchFullBalance(function(){
						navigate_dex();	
					});
					
				}else if(initmsg.event == "MINIMASK_PENDING"){
					//Confirmed Pending actions will be sent here..
					
				}	
			});
			
		}else{
			console.log("MINIMASK extension not active!");	
			alert("MiniMask Extensiopn Not Active!\n\nThis applicatgion requires MiniMask");
		}	
	}
}
