import fs from 'fs';

/**
 * Simple Rate Limit function 
 */

//The list of rate limited users
var RLIMIT_USER_LIST 		= [];

//Max messages that a user can send total per minute
const MAX_MESSAGES_PM		= 10;

//The RATE LIMIT DB file
var RATELIMIT_FILE = "ratelimit.json";

//Create a timer.. that wipes the users chat rate every minute..
setInterval(function(){
	//Set message count to ZERO
	var len = RLIMIT_USER_LIST.length;
	//console.log("Reset Chat Rate Limit Messages size:"+len);
		
	for(var i=0;i<len;i++){
		RLIMIT_USER_LIST[i].messages 	 	= 0; 
	}
	
}, 1000 * 60);

//Create a timer.. that wipes the users from SINBIN every 10 minutes
setInterval(function(){
	//console.log("Reset All Message Rate Limit Messages")
	//Set message count to ZERO
	var len = RLIMIT_USER_LIST.length;
	for(var i=0;i<len;i++){
		RLIMIT_USER_LIST[i].sinbin = false;
	}
	
}, 1000 * 60 * 1);

function loadRateLimitData(){
	
	try{
		console.log("Load Rate Limit data..");
		
		// Read file synchronously
	  	const data = fs.readFileSync(RATELIMIT_FILE, 'utf8');
	  
	  	//Convert
	  	RLIMIT_USER_LIST = JSON.parse(data);	
	}catch(err){
		//console.log("Error loading rate limit file : "+err);
	}
}

function saveRateLimitData(){
	fs.writeFileSync(RATELIMIT_FILE, JSON.stringify(RLIMIT_USER_LIST));
}

function addRLUser(uuid){
	
	//Current time
	var recdate = new Date();
	
	//create user
	var user 				= {};
	user.uuid 				= uuid;
	user.created 			= recdate.getTime();
	user.lastmessage		= recdate.getTime();
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

function checkForUser(uuid){
	if(getRLUser(uuid) != null){
		return true;
	}
	
	return false;
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
	
	console.log("Check User messages : "+user.messages);
	
	//Increment
	user.messages++;
	
	return true; 
}

function addUserSinBin(uuid){
	//Get the User
	var user = getRLUser(uuid);
	
	//ASdd to SIN BIN
	user.sinbin = true;
}

function checkSinBin(uuid){
	return getRLUser(uuid).sinbin;
}

//Export the Functions
export { 	loadRateLimitData,
			saveRateLimitData,
			addRLUser, 
			checkForUser,
			removeRLUser,
			newValidRLMessage, 
			addUserSinBin, 
			checkSinBin
	 };
