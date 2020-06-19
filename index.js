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

app.use(cors(corsOptions));
app.use(bodyParser.json());

const currentConnections = {};
var drawerShortList = {};

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
		console.log(message);
		socket.broadcast.emit('new message', message)
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

setInterval(() => { 
	
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
		timer: timer, 
	});

	io.emit('players update', Object.values(currentConnections).map(connection => connection.player));
	
	
	// marche (voir comment passer la liste front à la partie de droite
}, timer);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`app running on port ${PORT}`)
});