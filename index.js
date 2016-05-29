;(function(){
	"use strict";
	
	var PORT = 3000;
	var BASE_HTML_FILE = './dist/index.html'
	
	var express = require('express');
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var expressSession = require('express-session');
	
	var config = require('./config.js');
	
	var app = express();
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(cookieParser());
	app.use(expressSession({
		secret: config.secret,
		resave: true,
    	saveUninitialized: true
	}));
	
	//All availible rooms
	var ROOMS = [];
	
	//Constructor for a new RadioState
	function RadioGroupState(state, time){
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
	
	//Constructor for a new GameState (Reference for what the status of the game is)
	function GameState(numRadios){
		//array of radioGroupStates, indicating the current value of each radio button group.
		this.radios = [];
		for(var i = 0; i<numRadios; i++){
			this.radios.push(new RadioGroupState());
		}
		
		
	}

	GameState.prototype = Object.create({
		updateRadio: function(radio, i){
			this.radios[i].update(radio.time, radio.state);
		}
	});
	
	
	//Constructor for a new room (Holds the game and manages players)
	function Room(name, numPlayers, numRadios, pageInfoRef){
		this.name = name;//Name of the room
		this.pageInfoRef = pageInfoRef;//JSON file reference for the front end to generate the game room. 
		this.numPlayers = numPlayers;
		
		//Server side game state.
		this.gameState = new GameState(numRadios);
		//array of current mouse positions (pos), velocities (vel), and update timestamps (time).
		this.mouses = [];
		//array of previous mouse positions (pos), velocities (vel), and update timestamps (time).
		this.prevMouses = [];
		
		for(var i = 0; i<numPlayers; i++){
			this.mouses.push({pos:[0, 0], vel: [0, 0], time: 0});
			this.prevMouses.push({pos:[0, 0], vel: [0, 0], time: 0});
		}
	}
	
	
	Room.prototype = Object.create({
		updateMouse: function(newP, newV, time, i){
			if(time>this.mouses[index].time){
				this.prevMouses[index] = this.mouses[index];
				this.mouses[index] = {pos: newP, vel: newV, time: time}; 
			}
		}
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
	function getRadioDataOf(req){
		return [{state: req.session.state, time: req.session.time}, getPIndexOf(req)];
	}
	//Gets the mouse data of the request to put directly into room.updateMouse
	function getMouseDataOf(req){
		return [req.session.pos, req.session.vel, req.session.time, getPIndexOf(req)]
	}
	
	//GET ROOT: send the base html page. 
	app.get('/', function(req, res){
		res.sendfile(BASE_HTML_FILE);
	});
	
	//POST /login: Login with a requested username (no password needed!)
	app.post('/login', function(req, res){
		req.session.username = req.body.username;
		res.send("Logged in as: " + req.session.username);
	});
	
	//GET /gameroom: send JSON file for the gameroom.
	app.get('/gameroom', function(req, res){
		res.sendfile(getRoomOf(req).pageInfoRef);
	});
	
	//POST /gameroom: assign the room number of the player to the requested room number.
	app.post('/gameroom', function(req, res){
		req.session.roomNumber = req.body.roomNumber;
		res.send("success");
	});
	
	//POST /mouses: sends info about the current player's mouse.
	app.post('/mouses', function(req, res){
		var room = getRoomOf(req);
		var mData = getMouseDataOf(req);
		room.updateMouse.apply(mData);			
	});
	
	//GET /mouses: gets the mouse info of all players in the room.
	app.get('/mouses', function(req, res){
		var room = getRoomOf(req);
		res.send(JSON.stringify({cur: room.mouses, prev: room.prevMouses}));
	});
	
	//POST /radiostatus: sends info about a radio button change
	app.post('/radiostatus', function(req, res){
		var room = getRoomOf(req);
		var rData = getRadioStatusDataOf(req);
		room.gameState.updateRadio.apply(rData);
	});
	
	//GET /radiostatus: gets the status of all radio buttons. 
	app.get('/radiostatus', function(req, res){
		var room = getRoomOf(req);
		res.send(JSON.stringify(room.gameState.radios));
	});
	
	
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