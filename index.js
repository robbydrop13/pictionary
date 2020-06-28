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
var drawerList = {};
var word = "";
var drawer = {};

const selectDrawer = (obj) => {
  var keys = Object.keys(obj);
  // Here I pick randomly the next drawer, but it might be better suited to always take 
  // the same order, for instance with 2 players, to have one after the other.
  var i = keys.length * Math.random() << 0;
  var newDrawer = obj[keys[i]];
  console.log('New drawer ' + newDrawer.player.pseudo);
  // Remove drawer from the drawer list or reset drawer list if empty
  if (keys.length == 1) {
  	drawerList = {...currentConnections};
  	console.log('reset drawerList');
  } else {
  	delete drawerList[keys[i]];
  	console.log('pop drawer from drawerList');
  }
  console.log(Object.keys(drawerList).length);
  return newDrawer;
}

const assignDrawer = () => {
	if (!_.isEmpty(currentConnections)) {
		// Select Drawer from drawerList and update drawerList for next time
		drawer = selectDrawer(drawerList);
		// Reset drawer status to false for all players except new drawer
		Object.values(currentConnections).map(connection => (connection === drawer) ? 
			connection.player.drawer = true : 
			connection.player.drawer = false
		);
	}
	// As a new game comes with a new drawer, players need to be updated on the front
	io.emit('players update', Object.values(currentConnections).map(connection => connection.player));
}

const selectWord = (words) => {
	return words[Math.floor(Math.random() * words.length)]
}

const assignWord = () => {
	word = selectWord(words);
	io.emit('new word', {
		newWord: word, 
		newTimer: gameTimer, 
	});
}

const startNewGame = () => {
	// Initialization of drawerList the first time 
	if (_.isEmpty(drawerList)) {
		drawerList = {...currentConnections};
		assignDrawer();
	}
	assignWord();

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
	assignDrawer();
} 

var finishTimeOut;
const finishGameTimeOut = () => {
  finishTimeOut = setTimeout(() => {finishGame()}, gameTimer);
}

// First game starts after timer+buffer seconds on the server
// Game finishes after the gameTimer is expired 
var newWordTimer = setInterval(() => {
	startNewGame();
	finishGameTimeOut();
},gameTimer+transitionTimer);

var timeOutAfterWin;
const winTimeOut = () => {
	timeOutAfterWin = setTimeout(() => { 
		startNewGame();
		finishGameTimeOut();
		newWordTimer = setInterval(() => {
			startNewGame();
			finishGameTimeOut();
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
			drawerList = {...currentConnections};
			console.log(player.pseudo + " joined!");
			currentConnections[socket.id].player = player;
			var players = Object.values(currentConnections).map(connection => connection.player);
			console.log(players.length + " players online.");
			io.emit('players update', players);
		}
	});

		//require('./events/messages.js')(socket, currentConnections, word, finishTimeOut, timeOutAfterWin, winTimeOut);
    
    	socket.on('new message', (message) => {

		if (currentConnections[socket.id] !== undefined) {

			// Drawer and player that guesses right both win points
			var playersConnections = Object.values(currentConnections).map(connection => (connection));
			if (message.text.includes(word) 
				&& !currentConnections[socket.id].player.drawer 
				&& !_.isEmpty(playersConnections.filter(connexion => connexion.player.drawer))) {
				console.log("winner!");
				// Allocating points to the guesser
				currentConnections[socket.id].player.score += 10;
				// Allocating points to the drawer
				var drawerId = playersConnections.filter(connexion => connexion.player.drawer)[0].socket.id;
				currentConnections[drawerId].player.score += 10;

				// As a win comes with new scores, players need to be updated on the front
				io.emit('players update', Object.values(currentConnections).map(connection => connection.player));
				
				clearInterval(newWordTimer);
				clearTimeout(finishTimeOut);
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

    socket.on("disconnect", () => {
    	delete currentConnections[socket.id];
    	drawerList = {...currentConnections};
    	var players = Object.values(currentConnections).map(connection => connection.player);
    	console.log("Client disconnected");
    	io.emit('players update', players);
	});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`app running on port ${PORT}`)
});

// Variabiliser les message avec une fonction new message (?) 
// et envoyer les différents messages admin (machin a rejoint, machin a quitté, machin a gagné next drawer is

	// io.emit('new message', {
	//    id: uuidv4(),
	//    sender: systemSender,
	//    text: "Victoire!!!",
	//  });