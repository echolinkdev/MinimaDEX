const DEX_SERVER = "ws://localhost:8081";
var WEB_SOCKET;
const MESSAGE_LISTENERS = [];

var LOGGING_ENABLED = true;

function wsInitSocket(){
	
	WEB_SOCKET = new WebSocket(DEX_SERVER);

	WEB_SOCKET.onopen = () => {
	    console.log('Connected to server');
	};

	WEB_SOCKET.onmessage = (event) => {
		if(LOGGING_ENABLED){
			console.log("WS : "+`Server: ${event.data}`);	
		}
				
		//What is the message
		var msg = JSON.parse(`${event.data}`);
		var len = MESSAGE_LISTENERS.length;
		for(var i=0;i<len;i++){
			MESSAGE_LISTENERS[i](msg);
		}
	};

	WEB_SOCKET.onclose = () => {
	    console.log('Disconnected from server');
	};
}

function wsAddListener(listener){
	MESSAGE_LISTENERS.push(listener);
}

function wsPostToServer(jsonmsg){
	var strmsg = JSON.stringify(jsonmsg);
	
	if(LOGGING_ENABLED){
		console.log("Post to server : "+strmsg);
	}
	
	WEB_SOCKET.send(strmsg);
}
