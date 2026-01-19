/**
 * The init panels..
 */
const init_blakout_panel	= document.getElementById('id_blackoutdiv');
const init_panel 			= document.getElementById('id_initpanel'); 

const init_create_seed		= document.getElementById('id_createseed_panel');


function showInitPanel(){
	init_blakout_panel.style.display 	= "block";
	init_panel.style.display 			= "block";
}

function hideInitPanel(){
	init_blakout_panel.style.display 	= "none";
	init_panel.style.display 			= "none";
}

function init_passwordcheck(){
	
	//Get the password..
	var password = id_init_password.value.trim();
	if(password == ""){
		alert("Cannot have a blank password..");
		return;
	}
	
	//Set this for all the storage
	STORAGE.setPassword(password);
	
	//Now load the details..
	var userdetails = STORAGE.getData("**USER_DETAILS**");	
	
	
	//Do they exist..
	if(userdetails == -1){
		//Incorrect password..
		alert("WRONG PASSWORD..");
	
	}else if(userdetails == null){
		
		//Need to create the details..!
		init_panel.style.display 			= "none";
		init_create_seed.style.display 		= "block";
		
	}else{
		
		//Store..
		USER_ACCOUNT = userdetails;
		
		//Hide the init panel..
		hideInitPanel();	
		
		//Start the DEX up..
		postStartupDex();
	}	
}

function init_createnew(){
	
	//Create a new seed phrase..
	MINIMASK.meg.random(function(createresp){
		
		//Set these details..
		id_init_seed.value 		= createresp.data.keycode;
		id_init_keyuses.value 	= 0;
	});
}

function init_continueseed(){
	
	//Get the details..
	CREATE_NEW_SEED 	= id_init_seed.value;
	CREATE_NEW_KEYUSES 	= id_init_keyuses.value;
	
	//Now generate full details..
	MINIMASK.meg.createseed(id_init_seed.value, function(resp){
		
		//Set these details..
		USER_ACCOUNT.SEED 			= resp.data.phrase;
		USER_ACCOUNT.ADDRESS 		= resp.data.miniaddress;
		USER_ACCOUNT.PUBLICKEY 		= resp.data.publickey;
		USER_ACCOUNT.PRIVATEKEY 	= resp.data.privatekey;
		USER_ACCOUNT.SCRIPT 		= resp.data.script;
		USER_ACCOUNT.KEYUSES 		= id_init_keyuses.value;
		
		//Now STORE this..
		STORAGE.setData("**USER_DETAILS**", USER_ACCOUNT);
				
		postStartupDex();
	});
}



