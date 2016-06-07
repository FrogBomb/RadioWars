;(function(){
	"use strict";
	
	var PORT = 80;
	var BASE_HTML_FILE = './index.html'
	
	var fs = require('fs');
	
	var express = require('express');
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var config = require('./config.js');
	
	var expressSession = require('express-session')({
			secret: config.secret,
			resave: true,
			saveUninitialized: true
		});
	var ioSession = require("express-socket.io-session");
	
	
	var app = express.createServer();
	var io = require("socket.io")(app);
	
	var cpCalled = cookieParser();
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(cpCalled);
	app.use(expressSession);
	io.use(ioSession(expressSession, cpCalled)); 
	
	
	//All availible rooms
	var ROOMS = [];
	
	var MAPS = {loaded: false};
	
	var DEFAULT_MAP_NAME = "alpha";
	
	//Loading the maps here, which then generates the default rooms.
	loadMaps();
	
	function loadMaps(){
		fs.readfile('./maps.json', function(err, data){
			if(err){return console.log(err);}
			MAPS = JSON.parse(data);
			MAPS.loaded = true;

			makeRooms();
		});
	}
	
	function makeRooms(){
		//Clears the existing rooms
		ROOMS.length = 0;
		//Generating default rooms
		ROOMS.push(Room('noob room', MAPS['alpha']));
		ROOMS.push(Room('kinda good room', MAPS['alpha']));
		ROOMS.push(Room('pro room', MAPS['alpha']));
	}
	
	//Constructor for a new RadioState
	function RadioGroupState(time, state){
		//integer indicating the current value of each radio button group, and the time when it was last clicked.
		if(!state){
			state = 0;
		}
		if(!time){
			time = 0;
		}
		this.state = state;
		this.time = time;
	}
	RadioGroupState.prototype = Object.create({
		update: function(time, newState){
			if(this.time<time){
				this.time = time;
				this.state = newState;
			}
		}
	});
	
	//Constructor for a new GameState (Reference for what the status of the game is). numRadios arguement is optional.
	function GameState(numRadios){
		//array of radioGroupStates, indicating the current value of each radio button group.
		this.radios = [];
		for(var i = 0; i<numRadios; i++){
			this.radios.push(new RadioGroupState());
		}
	}

	GameState.prototype = Object.create({
		updateRadio: function(radio, i){
			if(this.radios[i]){
				this.radios[i].update(radio.time, radio.state);
			}
			else{
				this.radio[i] = new RadioGroupState(radio.time, radio.state);
			}
		}
	});
	
	function readMapFileCallback(err, data){
		if(err){return console.log(err);}
		this.mapData = JSON.parse(data);
		this.mapFileRead = true;
	}
	
	//Constructor for a new room (Holds the game and manages players)
	function Room(name, mapInfoRef){
		this.name = name;//Name of the room
		this.mapInfoRef = mapInfoRef;//file reference to generate the game room.
		this.mapData; // Will hold the map data object from mapInfoRef
		this.mapFileRead = false;
		fs.readfile(mapInfoRef, readMapFileCallback.bind(this))
		//Server side game state.
		this.gameState = new GameState();
		//array of current mouse positions (pos), velocities (vel), and update timestamps (time).
		this.mouses = [];
		//array of previous mouse positions (pos), velocities (vel), and update timestamps (time).
		this.prevMouses = [];
	}
	
	
	Room.prototype = Object.create({
		updateMouse: function(newP, newV, time, index){
			if(time>this.mouses[index].time){
				this.prevMouses[index] = this.mouses[index];
				this.mouses[index] = {pos: newP, vel: newV, time: time}; 
			}
		},
		/*
		Updates the room to have a new player and
		returns the roomIndex to be able to interact with the room.
		*/
		addPlayer: function(){
			
			this.mouses.push({pos:[-200, -200], vel: [0, 0], time: -1});
			this.prevMouses.push({pos:[-200, -200], vel: [0, 0], time: -1});
			
			return this.mouses.length - 1;
			
		},
		//Returns radio team of the player with the passed roomIndex
		getRadioTeam: function(roomIndex){
			if(this.mapFileRead){
				return roomIndex%this.mapInfo.numTeams;
			}
			return -1;//Map file not yet read
		},
		//Clears the room
		clear: function(){ Room(this.name, this.mapInfoRef) },
		//Starts a game in the room
		start: function(){ console.log("Game started")}//TODO
	});
	
	//Gets the player room index of the request
	function getPIndexOf(req){
		return req.session.roomIndex;
	}
	//Gets the Room object associated with the request. 
	function getRoomOf(req){
		return ROOMS[req.session.roomNumber];
	}
	//Gets the single radio change data of the request to put directly into gameState.updateRadio
//	function getRadioDataOf(req){
//		return [{state: req.body.state, time: req.body.time}, getPIndexOf(req)];
//	}
//	//Gets the mouse data of the request to put directly into room.updateMouse
//	function getMouseDataOf(req){
//		return [req.body.pos, req.body.vel, req.body.time, getPIndexOf(req)];
//	}
//	
//	//GET ROOT: send the base html page. 
	app.get('/', function(req, res){
		res.sendfile(BASE_HTML_FILE);
	});
	
	var UPDATESPEED =  16; //ms
	io.on('connection', function(socket){
		
		//Variables that will change later
		var room = null;
		var getUpdates = null;
		socket.handshake.session.roomNumber = null;
		socket.handshake.session.roomIndex = null;
		
		//login: Currently will only expect a name in userdata.
		socket.on("login", function(userdata) {
			socket.handshake.session.userdata = userdata;
		});
		
		//gameroom: join the room with the given room number
		socket.on('gameroom', function(roomNumber){
			room = ROOMS[roomNumber];
			socket.handshake.session.roomIndex = room.addPlayer();
			socket.handshake.session.roomNumber = roomNumber;
			socket.join(room.name);
			
			//Tell other players a new player has joined
			socket.broadcast
				.to(room.name)
				.emit('newPlayer', socket.handshake.session.userdata.name);
			
			//Give the joined player room information and assign them a team
			socket.broadcast
				.to(socket.id)
				.emit('joinedRoom', 
					{
						roomname: room.name,
						team: room.getRadioTeam(res.session.roomIndex)
					});
			
			//Send regular updates to the joining player according to their room name
			getUpdates = setInterval(function(){
				socket.voltile
					.emit('updateFromRoom ' + room.name, 
						{
							mouseData: {cur: room.mouses, prev: room.prevMouses},
							radios: room.gameState.radios
						});
			}, UPDATESPEED);
			
			//Handle for a user leaving a gameroom.
			socket.on('leaveGameroom', function(){
				if(room){
					socket.leave(room.name);
				}
				if(getUpdates !== null){
					clearInterval(getUpdates);
					getUpdates = null;
				}
				room = null;
				socket.handshake.session.roomNumber = null;
				socket.handshake.session.roomIndex = null;
			});
		});
		
		//Update the server about a mouse position, velocity, and time of polling
		socket.on('mouseUpdate', function(mouseData){
			if(room){
				room.updateMouse.apply(mouseData);
			}
		});
		
		//Update the server about the radio state and time of polling
		socket.on('radioUpdate', function(radioData){
			if(room){
				room.gameState.radios.apply(radioData);
			}
		});
		
		//Log Disconnects
		socket.on('disconnect', function(){
			var username = socket.handshake.session.userdata.name;
			if(!user){
				username = "Unknown User";
			}
			console.log(username + " has disconnected on " + (new Date(Date.now())).toLocaleString());
		}); 
		
	});
	
	//GET /gameroom: send JSON file for the gameroom.
	app.get('/gameroom', function(req, res){
		res.sendfile(getRoomOf(req).mapInfoRef);
	});
	
//	//POST /gameroom: assign the room number of the player to the requested room number.
//	app.post('/gameroom', function(req, res){
//		req.session.roomNumber = req.body.roomNumber;
//		var room = getRoomOf(req);
//		req.session.roomIndex = room.addPlayer();
//		res.send(JSON.stringify({radioTeam: room.getRadioTeam(res.session.roomIndex)}));
//	});
//	
//	//POST /mouses: sends info about the current player's mouse.
//	app.post('/mouses', function(req, res){
//		var room = getRoomOf(req);
//		var mData = getMouseDataOf(req);
//		room.updateMouse.apply(mData);			
//	});
//	
//	//GET /mouses: gets the mouse info of all players in the room.
//	app.get('/mouses', function(req, res){
//		var room = getRoomOf(req);
//		res.send(JSON.stringify({cur: room.mouses, prev: room.prevMouses}));
//	});
//	
//	//POST /radiostatus: sends info about a radio button change
//	app.post('/radiostatus', function(req, res){
//		var room = getRoomOf(req);
//		var rData = getRadioStatusDataOf(req);
//		room.gameState.updateRadio.apply(rData);
//	});
//	
//	//GET /radiostatus: gets the status of all radio buttons. 
//	app.get('/radiostatus', function(req, res){
//		var room = getRoomOf(req);
//		res.send(JSON.stringify(room.gameState.radios));
//	});
//	
	
	
	app.use(express.static('public'));
	
	app.use(function(req, res, next) {
  		res.status(404).send('Sorry cant find that!');
	});
	
	app.use(function(err, req, res, next) {
  		console.error(err.stack);
  		res.status(500).send('Something broke!');
	});
	
	app.listen(PORT, function() {
		console.log("server started on port " + PORT);
	});
})();