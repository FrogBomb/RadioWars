//frontend
function onNewPlayerJoin(username){//TODO
	//username is a string that is the name of the joining user.
	console.log(username + " joined!");
}

function onRoomUpdate(gameData){//TODO
	/*
	input structure:
		gameData
			.mouseData
				.cur[i]
					.pos : int[2]
					.vel : int[2]
					.time: int
				.prev[i]
					.pos : int[2]
					.vel : int[2]
					.time: int
			.radios[i]
				.state : int
				.time  : int
		}
	*/

}

function onLoad(){
	setupSocket();
//	document.getElementsByClassName("mapHolder")[0].innerHTML =
//		RadioWars
//		.templates.map(
//		{mapData: {startFields:[], mapGridSize:[12, 5],
//					teamNames: ["red", "blue"],
//					radioGridLoc:[[1,1],[4,4], [11, 0]]}});

}

var ROOM_INDEX = null;
function setRoomIndex(i){
	ROOM_INDEX = i;
}

function onJoinRoom(roomData){//TODO
	/*
	input structure:
		roomData
			.roomName : string
			.team : int
			.mapData: JSON of map file data
	*/
	console.log("Joined Room " + roomData.roomName + " on team " + roomData.team);
	displayMapFromFile(roomData);
	socketUpdatesFrom(roomData.roomName);
}

function displayMapFromFile(mapContext){
	document.getElementsByClassName("mapHolder")[0].innerHTML =
		RadioWars.templates.map(mapContext);
}

var SERVER_TIME;
function onSyncTime(serverTime){
	SERVER_TIME = serverTime;
}

function gameTimeNow(){
	return SERVER_TIME-Date.now();
}

function handleMouseMove(event){
	socket.emit('updateMouse',  {
		mouseCoords: [event.pageX, event.pageY], 
		index: ROOM_INDEX, 
		time: gameTimeNow()})
}

function onRadioClick(){
	socket.emit('updateRadio', [this.value, gameTimeNow()]);
}
function login(userdata){
	socket.emit('login', userdata);
}

function gotoRoom(roomNumber){
	hideButtons();
	socket.emit('gameroom', roomNumber);
}

function hideButtons(){
	var roomButtonDiv = document.getElementsByClassName("roomButtons")[0];
	var buttons = roomButtonDiv.children;
	for(var i = 0; i<buttons.length; i++){
		buttons[i].style.visibility = "hidden";
	}
}

document.addEventListener("DOMContentLoaded", onLoad);

document.onmousemove = handleMouseMove;