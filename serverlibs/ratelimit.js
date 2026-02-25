/**
 * Simple Rate Limit function 
 */

//The list of rate limited users
var RLIMIT_USER_LIST 		= [];
const MAX_MESSAGES_PM		= 60;
const MAX_CHAT_MESSAGES_PM	= 30;

//Create a timer.. that wipes the users chat rate every minute..
setInterval(function(){
	//Set message count to ZERO
	var len = RLIMIT_USER_LIST.length;
	console.log("Reset Chat Rate Limit Messages size:"+len);
		
	for(var i=0;i<len;i++){
		RLIMIT_USER_LIST[i].messages 	 	= 0;
		RLIMIT_USER_LIST[i].chatmessages 	= 0;
		RLIMIT_USER_LIST[i].chatbin 		= false; 
	}
	
}, 1000 * 60);

//Create a timer.. that wipes the users from SINBIN every 10 minutes
setInterval(function(){
	console.log("Reset All Message Rate Limit Messages")
	//Set message count to ZERO
	var len = RLIMIT_USER_LIST.length;
	for(var i=0;i<len;i++){
		RLIMIT_USER_LIST[i].sinbin = false;
	}
	
}, 1000 * 60 * 5);

function addRLUser(uuid){
	
	//Current time
	var recdate = new Date();
	
	//create user
	var user 				= {};
	user.uuid 				= uuid;
	user.created 			= recdate.getTime();
	
	user.chatmessages 		= 0;
	user.chatbin 			= false;
	
	user.messages 			= 0;
	user.sinbin				= false;
	
	//Add to the List
	RLIMIT_USER_LIST.push(user);
}

function removeRLUser(uuid){
	
	var newarr = [];
	var len = RLIMIT_USER_LIST.length;
	for(var i=0;i<len;i++){
		if(RLIMIT_USER_LIST[i].uuid != uuid){
			newarr.push(RLIMIT_USER_LIST[i]);
		} 
	}
	
	RLIMIT_USER_LIST = newarr;
}

function getRLUser(uuid){
	
	var len = RLIMIT_USER_LIST.length;
	for(var i=0;i<len;i++){
		if(RLIMIT_USER_LIST[i].uuid == uuid){
			return RLIMIT_USER_LIST[i];
		} 
	}
	
	return null;
}

//Add an event.. chat, trade, etc..
function newValidRLMessage(uuid){
	
	//Get the User
	var user = getRLUser(uuid);
	
	//Does that exist..
	if(!user){
		return false;
	}
	
	if(user.messages >= MAX_MESSAGES_PM){
		return false;
	}
	
	console.log("Check message limit : "+user.messages);
	
	//Increment
	user.messages++;
	
	return true; 
}

//Add an event.. chat, trade, etc..
function newValidRLChatMessage(uuid){
	
	//Get the User
	var user = getRLUser(uuid);
	
	//How many chat messages have they sent
	if(user.chatmessages >= MAX_CHAT_MESSAGES_PM){
		return false;
	}
	
	//Increment
	user.chatmessages++;
	
	return true; 
}

function addUserSinBin(uuid){
	//Get the User
	var user = getRLUser(uuid);
	
	//ASdd to SIN BIN
	user.sinbin = true;
}

function addUserChatBin(uuid){
	//Get the User
	var user = getRLUser(uuid);
	
	//ASdd to SIN BIN
	user.chatbin = true;
}

function checkSinBin(uuid){
	return getRLUser(uuid).sinbin;
}

function checkChatBin(uuid){
	return getRLUser(uuid).chatbin;
}

//Export the Functions
export { 	addRLUser, 
			removeRLUser,
			newValidRLMessage, 
			newValidRLChatMessage, 
			addUserSinBin, 
			checkSinBin,
			addUserChatBin, 
			checkChatBin
	 };
