var socket;
function setupSocket(){
	socket = io.connect(window.location.href);
	socket.on('newPlayer', onNewPlayerJoin);

	socket.on('joinedRoom', onJoinRoom);
}



function socketUpdatesFrom(roomName){
	socket.removeAllListeners('updateFromRoom '+ socketUpdatesFrom.oldRoomname);
	socket.on('updateFromRoom ' + roomName, onRoomUpdate)
}

socketUpdatesFrom.oldRoomName = "";