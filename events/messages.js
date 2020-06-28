module.exports = function(socket, currentConnections, word, finishTimeOut, timeOutAfterWin, winTimeOut) {
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
};