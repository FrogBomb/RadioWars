var socket;
function setupSocket(){
	socket = io.connect(window.location.href);
	socket.on('mouseBroadcast', onMouseBroadcast);
	socket.on('radioBroadcast', onRadioBroadcast);
	socket.on('newPlayer', onNewPlayerJoin);
	socket.on('roomIndex', setRoomIndex);
	socket.on('joinedRoom', onJoinRoom);
	socket.on('syncTime', onSyncTime);
}



//function socketUpdatesFrom(roomName){
//	socket.removeAllListeners('updateFromRoom '+ socketUpdatesFrom.oldRoomname);
//	socket.on('updateFromRoom ' + roomName, onRoomUpdate)
//}
//
//socketUpdatesFrom.oldRoomName = "";