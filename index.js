import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import cors from 'cors';
const bodyParser = require('body-parser');
require('dotenv').config();
const _ = require('lodash');
import { v4 as uuidv4 } from 'uuid';

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

const currentConnections = {};
var drawerShortList = {};
const words = ["dog","cat","bird","fish","boat","car","plane"];
const timer = 10000;
var currentWord = "";
const systemSender = {
	pseudo: "Draw!",
  score: 0,
  drawer: false,
  color: "primaryBlue",
}


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

const setNewWord = () => {
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

	// Select and emit new word to the front
	currentWord = words[Math.floor(Math.random() * words.length)]
	io.emit('new word', {
		newWord: currentWord, 
		newTimer: timer, 
	});

	// As a new word comes with a new drawer, player update needs to be sent to the front
	io.emit('players update', Object.values(currentConnections).map(connection => connection.player));
	io.emit('new message', {
      id: uuidv4(),
      sender: systemSender,
      text: "Victoire!!!",
    });
}

// Variabiliser les message avec une fonction new message (?) 
// et envoyer les différents messages admin (machin a rejoint, machin a quitté, machin a gagné next drawer is

var newWordTimer = setInterval(setNewWord, timer);

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

			var playersConnexions = Object.values(currentConnections).map(connection => (connection));
			console.log(playersConnexions.filter(connexion => connexion.player.drawer));
			// Drawer and player that guesses right both win points
			console.log(message);
			if (message.text.includes(currentWord) 
				&& !currentConnections[socket.id].player.drawer 
				&& !_.isEmpty(playersConnexions.filter(connexion => connexion.player.drawer))) {
				console.log("winner!");
				// Allocating points to the guesser
				currentConnections[socket.id].player.score += 10;
				// Allocating points to the drawer
				var drawerId = playersConnexions.filter(connexion => connexion.player.drawer)[0].socket.id;
				currentConnections[drawerId].player.score += 10;
				
				setNewWord();
				clearInterval(newWordTimer);
				newWordTimer = setInterval(setNewWord, timer);
			}
			socket.broadcast.emit('new message', message);

		}
	});
    
    socket.on('change brush color control', (color) => {
    if (currentConnections[socket.id] !== undefined) {
			console.log("change brush color control");
			socket.broadcast.emit('change brush color control', color)
		}
	});

    socket.on('change background control', (color) => {
    if (currentConnections[socket.id] !== undefined) {
			console.log("change background control");
			socket.broadcast.emit('change background control', color)
		}
	});

	socket.on('change brush size control', (color) => {
    if (currentConnections[socket.id] !== undefined) {
			console.log("change brush size control");
			socket.broadcast.emit('change brush size control', size)
		}
	});

    socket.on('drawing mouse down', (point) => {
    if (currentConnections[socket.id] !== undefined) {
			console.log("drawing mouse down");
			socket.broadcast.emit('drawing mouse down', point)
		}
	});

	socket.on('drawing mouse move', (point) => {
		if (currentConnections[socket.id] !== undefined) {
			console.log("drawing mouse move");
			socket.broadcast.emit('drawing mouse move', point)
		}
	});

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