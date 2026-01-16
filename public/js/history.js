/**
 * Load the saved History
 */
function initHistory(){
	
	//Load
	USER_HISTORY = STORAGE.getData("**USER_HISTORY**");
	
	//Check if exists
	if(USER_HISTORY == null){
		USER_HISTORY = [];
	}
	
	console.log("LOAD HISTORY : "+JSON.stringify(USER_HISTORY));
	
	//Reset the view..
	showHistory();
}

function saveHistory(){
	//Store!
	STORAGE.setData("**USER_HISTORY**",USER_HISTORY);
	
	console.log("SAVE HISTORY : "+JSON.stringify(USER_HISTORY));
}

function clearHistory(){
	USER_HISTORY = [];
	
	//Save it for later
	saveHistory();

	//Reset the view..
	showHistory();
}

function addHistoryLog(action, details, extra){
	
	var history 	= {};
	history.time 	= getTimeMilli();
	history.action 	= action;
	history.details = details;
	history.extra 	= extra;
	
	USER_HISTORY.push(history);
	
	//Save it for later
	saveHistory();
	
	//Reset the view..
	showHistory();
}
