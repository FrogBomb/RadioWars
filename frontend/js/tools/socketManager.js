var socket;
function setupSocket(){
	socket = io.connect(window.location.href);
//	socket.on('mouseBroadcast', onMouseBroadcast);
	socket.on('radiosToRoom', onRadioBroadcast);
	socket.on('newPlayer', onNewPlayerJoin);
	socket.on('roomIndex', setRoomIndex);
	socket.on('joinedRoom', onJoinRoom);
//	socket.on('syncTime', onSyncTime);
	socket.on('win', onWin);
}



//function socketUpdatesFrom(roomName){
//	socket.removeAllListeners('updateFromRoom '+ socketUpdatesFrom.oldRoomname);
//	socket.on('updateFromRoom ' + roomName, onRoomUpdate)
//}
//
//socketUpdatesFrom.oldRoomName = "";