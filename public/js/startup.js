
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
		
		//First start up message
		if(msg.type=="init_orderbooks"){
			
			//Tells us who we are
			USER_UUID = msg.uuid;
					
			//Store this..
			ALL_ORDERS = msg.data;
			
			//Update the markets 
			updateAllMarkets();
						
			//Set the Table
			setAllOrdersTable();
			
			//Set My Orders - need the markets setup..
			setMyOrdersTable();
			
			//Set ALL my orders table
			setAllMyOrders();
		
		}else if(msg.type=="message"){
			
			var recmsg = msg.data;
			if(recmsg.type=="trade_request"){
				
				//Check this Txn..!
				checkAndSignTrade(msg.uuid, recmsg.data);
					
			}else if(recmsg.type=="trade_complete"){
				
				//Just finished a trade
				tradeComplete(recmsg.data);	
			}
			
		}else if(msg.type=="trade"){
		
			//console.log("NEW TRADE : "+JSON.stringify(msg));
			
					
		}else if(msg.type=="closed"){
			//console.log("UUID CLOSED : "+JSON.stringify(msg));
			
			//Remove this user from All orders..
			delete ALL_ORDERS[msg.uuid];
			
			//Update the markets 
			updateAllMarkets();
						
			//Set the table
			setAllOrdersTable();
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
	
	//Init trade panel
	tradesInit();
	
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
