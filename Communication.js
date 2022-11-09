
/*
	onCloseFnc : callback to be called onClose of the socket
	
	onReceiveFnc : callback that will be called when a message is received 
	               When the python server sends something we call this function 
				   with the parsed object
	

	lifecycle of communication:

		1 - Browser connects to server 
		2 - Browser lister for incoming messages via callback (onmessage)
		3 - Upon receiving, forward data to onReceiveFnc callback 
		3.1 - game should update joystick position based on the value received on data
		3.2 - game should return the data about the game (position of target, player, bonuses, etc)
		4 - assemble string with data about the game just received and send back to the server
		5 - end of callback (returns to 2)


		server:
		The server should send control signals and receive game data. Upon receiving, the server should store that value to compute 
		next control signal based on that game information

*/

class Communication {

	constructor(onCloseFnc, onReceiveFnc) {

		this.onReceiveFnc = onReceiveFnc;

		this.socket = new WebSocket("ws://localhost:6660");

		this.socket.parent = this;

		this.socket.onopen = function(event) {
		  console.log("[open] Connection established");
		};

		this.socket.onmessage = function(event) {


			// received data (control signal) from server.py
			let data = event.data
			//console.log(`received:  ${data}`);
			let comm = event.target.parent;

			// sends control signal to the game via callback and receive game information
			let values = comm.onReceiveFnc(data);


			// stringfy game information
			let strValues = '';
			for (let i=0; i<values.length; i++) {
				strValues += fn(values[i])+',';
			}

			// send string with game information back to server
			comm.socket.send(strValues);

		};

		this.socket.onclose = function(event) {
			if (event.wasClean) {
				console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
			} else {
				console.log('[close] Connection died');
				onCloseFnc()
			}

		};

		this.socket.onerror = function(error) {
			console.log(`[error] ${error.message}`);

			onCloseFnc();
		};



	}
	


	sendData(dataFrame) {
		comm.socket.send(JSON.stringify(dataFrame));
	}




}