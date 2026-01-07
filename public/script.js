/*const ws = new WebSocket('ws://localhost:8081');

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const messages = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.textContent = `Server: ${event.data}`;
    messages.appendChild(newMessage);
};

ws.onclose = () => {
    console.log('Disconnected from server');
};*/

var t = document.getElementById('id_chatwindow');
console.log("t : "+t);

/*
document.getElementById('send').addEventListener('click', () => {
    const input = document.getElementById('message');
    
	var msg  = {};
	msg.type = "chat";
	msg.data = input.value;
	
	ws.send(JSON.stringify(msg));
	
    input.value = '';
});

document.getElementById('send_book').addEventListener('click', () => {
    const input = document.getElementById('orderbook_input');
    
	var msg  = {};
	msg.type = "update_orderbook";
	
	var book 		= {};
	book.token_1 	= "0x00";
	book.token_2 	= "0xFFEEDD";
	book.buysell 	= "BUY";
	book.amount 	= ""+10;
	book.price 		= ""+input.value;
	 
	msg.data 		= book;
	
	ws.send(JSON.stringify(msg));
	
    input.value = '';
});

document.getElementById('send_msg').addEventListener('click', () => {
    const msg_to  = document.getElementById('message_to_uuid');
	const msg_msg = document.getElementById('message_to_msg');
	
	var msg  			= {};
	msg.type 			= "message";
	msg.data 			= {};
	msg.data.uuid 		= msg_to.value;
	msg.data.message 	= msg_msg.value;
	
	ws.send(JSON.stringify(msg));
	
    //msg_to.value = '';
	msg_msg.value = '';
});


*/