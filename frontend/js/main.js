//frontend
function onNewPlayerJoin(username){//TODO
	//username is a string that is the name of the joining user.
	console.log(username + " joined!");
}

//function onRoomUpdate(gameData){//TODO
//	/*
//	input structure:
//		gameData
//			.mouseData
//				.cur[i]
//					.pos : int[2]
//					.vel : int[2]
//					.time: int
//				.prev[i]
//					.pos : int[2]
//					.vel : int[2]
//					.time: int
//			.radios[i]
//				.state : int
//				.time  : int
//		}
//	*/
//
//}

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

var ROOM_NAME = "";
function setRoomName(roomName){
	ROOM_NAME = roomName;
}

function onJoinRoom(roomData){//TODO
	/*
	input structure:
		roomData
			.roomIndex
			.roomName : string
			.team : int
			.mapData: JSON of map file data
	*/
	setRoomName(roomData.roomName);
	console.log("Joined Room " + roomData.roomName + " on team " + roomData.team);
	displayMapFromRoomData(roomData);
//	socketUpdatesFrom(roomData.roomName);
}

function displayMapFromRoomData(mapContext){
	document.getElementsByClassName("mapHolder")[0].innerHTML =
		RadioWars.templates.map(mapContext);
}

var SERVER_OFFSET = 0;
function onSyncTime(serverTime){
	SERVER_OFFSET = Date.now() - serverTime;
}

function gameTimeNow(){
	return Date.now()+SERVER_OFFSET;
}

function handleMouseMove(event){
	socket.broadcast.to(ROOM_NAME).emit('mouseBroadcast',  {
			mouseCoords: [event.pageX, event.pageY], 
			index: ROOM_INDEX, 
			time: gameTimeNow()}
	);	
}

function onMouseBroadcast(mouseData){//TODO
}

function onRadioClick(value, radioIndex){
	socket.emit('radioBroadcast', {state: value, radioIndex: radioIndex});
}
function onRadioBroadcast(radioData){
//	var firstClick = false;
	onRadioBroadcast.queue.push(radioData);
	function apply(radioData){
			if(onRadioBroadcast.times[radioData.radioIndex] === undefined){
			onRadioBroadcast.times[radioData.radioIndex] = -1; //SINCE THE BEGINING OF TIME!
	//		firstClick = true;
		}
		if(radioData.time>onRadioBroadcast.times[radioData.radioIndex]){
			var button = document.getElementById("button_"+radioData.state+"_"+radioData.radioIndex);
			button.checked = true;
			button.parentNode.parentNode.classList.remove("red-selected","blue-selected");
			var newClass = button.parentNode.innerHTML.split(">")[1]+"-selected";
			button.parentNode.parentNode.classList.add(newClass);
			onRadioBroadcast.prevClass = newClass;
			onRadioBroadcast.times[radioData.radioIndex] = radioData.time;
		}
	}
	while(onRadioBroadcast.queue.length > 0){
		apply(onRadioBroadcast.queue.pop());
	}
}

onRadioBroadcast.times = [];
onRadioBroadcast.queue = [];

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

//document.onmousemove = handleMouseMove;