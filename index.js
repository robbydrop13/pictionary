import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import cors from 'cors';
const bodyParser = require('body-parser');
require('dotenv').config();
const _ = require('lodash');
import { v4 as uuidv4 } from 'uuid';
import { words, gameTimer, transitionTimer, systemSender } from './config.js';

const whitelist = ['http://localhost:3000', 'http://localhost:3000/draw'];
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    if(whitelist.includes(origin))
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
}

const app = express();

const server = http.createServer(app);
const io = socketIO(server);

//app.use(cors(corsOptions));
app.use(bodyParser.json());

// init variables
const currentConnections = {};
var drawerShortList = {};
var word = "";

const selectDrawer = (obj) => {
  var keys = Object.keys(obj);
  // Here I pick randomly the next drawer, but it might be better suited to always take 
  // the same order, for instance with 2 players, to have one after the other.
  var i = keys.length * Math.random() << 0;
  var newDrawer = obj[keys[i]];
  console.log('New drawer ' + newDrawer.player.pseudo);
  if (keys.length == 1) {
  	drawerShortList = {...currentConnections};
  	console.log('reset');
  } else {
  	delete drawerShortList[keys[i]];
  	console.log('pop');
  }
  console.log(Object.keys(drawerShortList).length);
  return newDrawer;
}

const selectWord = (words) => {
	return words[Math.floor(Math.random() * words.length)]
}

const startNewGame = () => {
	// Assign the new drawer and select a new word

	if (!_.isEmpty(currentConnections)) {
		// Initialization of drawerShortlist the first time 
		if (_.isEmpty(drawerShortList)) {
			drawerShortList = {...currentConnections};
		}
		// Select Drawer from drawerShortList and update drawerShortList for next time
		var drawer = selectDrawer(drawerShortList);
		// Reset drawer status to false for all players except new drawer
		Object.values(currentConnections).map(connection => (connection === drawer) ? 
			connection.player.drawer = true : 
			connection.player.drawer = false
		);
	}
	// As a new game comes with a new drawer, players need to be updated on the front
	io.emit('players update', Object.values(currentConnections).map(connection => connection.player));

	// Select and emit the new word to the front
	word = selectWord(words);
	io.emit('new word', {
		newWord: word, 
		newTimer: gameTimer, 
	});

// Variabiliser les message avec une fonction new message (?) 
// et envoyer les différents messages admin (machin a rejoint, machin a quitté, machin a gagné next drawer is

	// io.emit('new message', {
	//    id: uuidv4(),
	//    sender: systemSender,
	//    text: "Victoire!!!",
	//  });
}

const resetWord = () => {
	return "XTRANSITION";
}

const finishGame = () => {
	word=resetWord();
	io.emit('new word', {
		newWord: word, 
		newTimer: transitionTimer, 
	});
	io.emit('players update', Object.values(currentConnections).map(connection => connection.player));
} 

var timeOut;
const bufferTimeOut = () => {
  //timeOut = setTimeout(() => {io.emit('win');}, timer);
  timeOut = setTimeout(() => {finishGame()}, gameTimer);
}

// First game starts after timer+buffer seconds on the server 
// (timer should be paused on the front as we don't know when the game starts)
var newWordTimer = setInterval(() => {
	startNewGame();
	bufferTimeOut();
},gameTimer+transitionTimer);

var timeOutAfterWin;
const winTimeOut = () => {
	timeOutAfterWin = setTimeout(() => { 
		startNewGame();
		bufferTimeOut();
		newWordTimer = setInterval(() => {
			startNewGame();
			bufferTimeOut();
		},gameTimer+transitionTimer);
	}, transitionTimer);
} 

//Setting up a socket with the namespace "connection" for new sockets
io.on("connection", socket => {

	console.log("New client connected");

	socket.on('new player', (player) => {
		if (player !== null && player !== {}) {
			// Add player to the connections here to make sure client has a pseudo and is real user
			currentConnections[socket.id] = { socket: socket };
			drawerShortList = {...currentConnections};
			console.log(player.pseudo + " joined!");
			currentConnections[socket.id].player = player;
			var players = Object.values(currentConnections).map(connection => connection.player);
			console.log(players.length + " players online.");
			io.emit('players update', players);
		}
	});

	socket.on('new message', (message) => {

		if (currentConnections[socket.id] !== undefined) {

			// Drawer and player that guesses right both win points
			var playersConnexions = Object.values(currentConnections).map(connection => (connection));
			if (message.text.includes(word) 
				&& !currentConnections[socket.id].player.drawer 
				&& !_.isEmpty(playersConnexions.filter(connexion => connexion.player.drawer))) {
				console.log("winner!");
				// Allocating points to the guesser
				currentConnections[socket.id].player.score += 10;
				// Allocating points to the drawer
				var drawerId = playersConnexions.filter(connexion => connexion.player.drawer)[0].socket.id;
				currentConnections[drawerId].player.score += 10;

				// As a win comes with new scores, players need to be updated on the front
				io.emit('players update', Object.values(currentConnections).map(connection => connection.player));
				
				clearInterval(newWordTimer);
				clearTimeout(timeOut);
				clearTimeout(timeOutAfterWin);
				//io.emit('win');
				finishGame();
				winTimeOut();

			}
			console.log(message);
			socket.broadcast.emit('new message', message);

		}
	});
    
    require('./events/drawControls.js')(socket, currentConnections);

    require('./events/draw.js')(socket, currentConnections);

    //A special namespace "disconnect" for when a client disconnects
    socket.on("disconnect", () => {
    	delete currentConnections[socket.id];
    	drawerShortList = {...currentConnections};
    	var players = Object.values(currentConnections).map(connection => connection.player);
    	console.log("Client disconnected");
    	io.emit('players update', players);
	});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`app running on port ${PORT}`)
});