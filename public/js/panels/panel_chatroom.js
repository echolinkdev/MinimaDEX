
/**
 * Get the HTML elements of the chatroom
 */
const chatarea 		= document.getElementById('id_chatroom_textarea');
const chatinput 	= document.getElementById('id_chatroom_message');
const chatbutton 	= document.getElementById('id_chatroom_chatbutton');

/**
 * Initialise chat area
 */
function chatroomInit(){
	
	wsAddListener(function(msg){
		//Is it a chat message
		if(msg.type=="chat"){
			chatarea.value+= msg.data+"\n";
		}
	});	
	
	chatinput.addEventListener("keydown", function(event) {
	    if (event.key === "Enter") {
	        getSendChat();		
	    }
	});
	
	chatbutton.addEventListener('click', () => {
		getSendChat()
	});
}

function dexChatHistory(allchat){
	
	//First wipe..
	chatarea.value = "";
	
	//Now add the chat
	try{
		for(var i=0;i<allchat.length;i++){
			chatarea.value+= allchat[i]+"\n";
		}	
	}catch(Error){
		console.log9("Error importing startup chat.. "+JSON.stringify(allchat));	
	}
}

//Check not too long..
function addChatLine(){
	
}

function getSendChat(){
	var msg  = {};
	msg.type = "chat";
	
	msg.data = chatinput.value.trim();
	
	chatinput.value = '';
	
	if(msg.data == ""){
		return;
	}
	
	wsPostToServer(msg);
} 