
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
			console.log("Chat room : "+JSON.stringify(msg));
			chatarea.value+=msg.data+"\n";
		}
	});	
}

/**
 * Listen for chat messages
 */
chatbutton.addEventListener('click', () => {
    var msg  = {};
	msg.type = "chat";
	msg.data = USER_NAME+" > "+chatinput.value.trim();
	
	wsPostToServer(msg);
	
	//ws.send(JSON.stringify(msg));
    chatinput.value = '';
});