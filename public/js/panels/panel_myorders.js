
/**
 * Get the HTML elements of the chatroom
 */
const myorderstable = document.getElementById('id_myorders_table');

/**
 * Initialise chat area
 */
function myordersInit(){
	
	wsAddListener(function(msg){
		//Is it a chat message
		if(msg.type=="update_orderbook"){
			//console.log("My Orders : "+JSON.stringify(msg));
			myordersSetTable();
		}
	});	
}

/**
 * Remove an order from Your OrderBook
 */
function removeMyOrder(uuid){
	var neworders = [];
	var len = USER_ORDERS.length;
	for(var i=0;i<len;i++) {
		if(USER_ORDERS[i].uuid != uuid){
			neworders.push(USER_ORDERS[i]);
		}
	}
	
	USER_ORDERS = neworders;
}

function _rmorder(uuid){
	
	//First remove the ortder..
	removeMyOrder(uuid);
	
	//Now send updated book to server
	var msg  = {};
	msg.type = "update_orderbook";
	msg.data = USER_ORDERS;
	
	//Will update table when I receive the server message
	wsPostToServer(msg);
}

function myordersSetTable(){
	
	//Clear Table
	myorderstable.innerHTML = "";
	
	//Set the Headers
	var row   = myorderstable.insertRow(0);
	row.insertCell(0).outerHTML = "<th>Amount</th>";
	row.insertCell(1).outerHTML = "<th>Price</th>"; 
	row.insertCell(2).outerHTML = "<th>Type</th>";
	row.insertCell(3).outerHTML = "<th style='width:0%;'>Action</th>";
		
	//Get my Orders
	var len = USER_ORDERS.length;
	for(var i=0;i<len;i++) {
		
		var order=USER_ORDERS[i];
		
		//Insert row
		var row = myorderstable.insertRow();
		
		var cellamount 	= row.insertCell();
		var cellprice 	= row.insertCell();
		var celltype 	= row.insertCell();
		var cellaction 	= row.insertCell();
		
		//Set row color
		if(order.type == "buy"){
			cellamount.className 	= "buyorder";
			cellprice.className 	= "buyorder";
			celltype.className 		= "buyorder";
			
		}else{
			cellamount.className 	= "sellorder";
			cellprice.className 	= "sellorder";
			celltype.className 		= "sellorder";	
		}
		
		cellamount.innerHTML 	= "&nbsp;"+order.amount;
		cellprice.innerHTML 	= "&nbsp;"+order.price;
		celltype.innerHTML 		= "&nbsp;"+order.type; 
		cellaction.innerHTML 	= "<button class='mybtn' onclick='_rmorder(\""+order.uuid+"\")'>Cancel</button>";
	}
}