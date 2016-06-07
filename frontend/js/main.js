//frontend

function onNewPlayerJoin(username){//TODO
	//username is a string that is the name of the joining user.
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


function onJoinRoom(roomData){//TODO
	/*
	input structure:
		roomData
			.roomName : string
			.team : int
	*/
}

;(function(){
	var UPDATESPEED = 16; //ms
	
})();