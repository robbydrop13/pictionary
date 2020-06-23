import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import cors from 'cors';
const bodyParser = require('body-parser');
require('dotenv').config();
//const mongoose = require('mongoose');
const _ = require('lodash');

const whitelist = ['http://localhost:3000'];
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    if(whitelist.includes(origin))
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
}

const app = express();

//mongoose.Promise = global.Promise;
//mongoose.connect(process.env.MONGODB_URI || `mongodb://localhost:27017/node-react-starter`);

const server = http.createServer(app);
const io = socketIO(server);

//app.use(cors(corsOptions));
app.use(bodyParser.json());

const currentConnections = {};
var drawerShortList = {};
const words = ["dog","cat","bird","fish","boat","car","plane"];
const timer = 10000;


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

	
	io.emit('new word', {
		newWord: words[Math.floor(Math.random() * words.length)], 
		newTimer: timer, 
	});

	io.emit('players update', Object.values(currentConnections).map(connection => connection.player));

}

var newWordTimer = setInterval(setNewWord, timer);

//Setting up a socket with the namespace "connection" for new sockets
io.on("connection", socket => {

	console.log("New client connected");
	currentConnections[socket.id] = { socket: socket };
	drawerShortList = {...currentConnections};

	socket.on('new player', (player) => {
		console.log(player.pseudo + " joined!");
		currentConnections[socket.id].player = player;
		var players = Object.values(currentConnections).map(connection => connection.player);
		console.log(players.length + " players online.");
		io.emit('players update', players);
	});

	socket.on('new message', (message) => {

		// Drawer and player that guesses right both win points
		console.log(message);
		if (message.text.includes("bob") && !currentConnections[socket.id].player.drawer) {
			console.log("winner!");
			// Allocating points to the guesser
			currentConnections[socket.id].player.score = currentConnections[socket.id].player.score + 10;
			// Allocating points to the drawer
			

			// je dois trouver le socket id du drawer pour assigner 10 points au drawer, 
			// puis gérer le vrai mot clé et pas bob pour trouver le score
			// puis faire les messages pour dire machin WIN et faire la petite anim qu'il marque des points
			// puis eventuellement laisser quelques secondes avant le tour suivant
			// puis ajouter le header
			// puis cleaner le chat qui se reset
			// puis faire les controls
			// puis bloquer les controls et le dessin quand l'utilisateur dessine pas
			// puis mettre en valeur le joueur en gras dans le ranking
			// puis voir si je met le nombre de joueurs et la personne qui dessine en ce moment
			var playersConnexions = Object.values(currentConnections).map(connection => (connection));
			var drawer = playersConnexions.filter(connexion => connexion.player.drawer);
			drawer.score = drawer.score + 10;
			console.log(drawer);
			//drawer.player.score = drawer.player.score + 10;
			setNewWord();
			clearInterval(newWordTimer);
			newWordTimer = setInterval(setNewWord, timer);
		}
		socket.broadcast.emit('new message', message);
	});
    

    socket.on('drawing mouse down', (point) => {
		console.log("drawing mouse down");
		console.log(socket);
		socket.broadcast.emit('drawing mouse down', point)
	});

	socket.on('drawing mouse move', (point) => {
		console.log("drawing mouse move");
		socket.broadcast.emit('drawing mouse move', point)
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