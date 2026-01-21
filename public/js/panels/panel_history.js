
const history_table = document.getElementById('id_history_table');

/**
 * Show all the history
 */
function showHistory(){
	//Clear Table
	history_table.innerHTML = "";
	
	//Set the Headers
	var row   = history_table.insertRow(0);
	row.insertCell().outerHTML = "<th class='smalltableheadertext'>Time</th>";
	row.insertCell().outerHTML = "<th class='smalltableheadertext'>Action</th>"; 
	row.insertCell().outerHTML = "<th class='smalltableheadertext'>Details</th>";
	
	//Get my Orders
	var len = USER_HISTORY.length;
	for(var i=0;i<len;i++) {
		
		var history=USER_HISTORY[i];
		
		//Insert row
		var row = history_table.insertRow();
		
		var celltime 		= row.insertCell();
		var cellaction 		= row.insertCell();
		var celldetails 	= row.insertCell();
		
		var dateString 		= getTimeStr(history.time);
		
		celltime.innerHTML 		= "&nbsp;"+dateString
		cellaction.innerHTML 	= "&nbsp;"+history.action;
		celldetails.innerHTML 	= "&nbsp;"+history.details; 
		
		//Insert 1 row for the TxPoWID
		if(history.extra != ""){
			var extrarow 		= history_table.insertRow();
			var cellextra 		= extrarow.insertCell();
			cellextra.colSpan 	= "3";
			
			if(history.extra.startsWith("0x")){
				cellextra.innerHTML 	= "&nbsp;<a target='history_txpowid' href='https://minimask.org/block/txpow.html?txpowid="+history.extra+"'>"+history.extra+"</a>";	
			}else{
				cellextra.innerHTML 	= "&nbsp;"+history.extra;
			}	
		}
		
		//Final gap
		var rowgap 	= history_table.insertRow();
		var rowgap 	= rowgap.insertCell();
		rowgap.innerHTML = "&nbsp;";
	}	
}