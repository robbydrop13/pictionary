module.exports = function(socket, currentConnections) {

    socket.on('drawing mouse down', (point) => {
    if (currentConnections[socket.id] !== undefined) {
			console.log("drawing mouse down");
			socket.broadcast.emit('drawing mouse down', point)
		}
	});

	socket.on('drawing mouse move', (point) => {
		if (currentConnections[socket.id] !== undefined) {
			socket.broadcast.emit('drawing mouse move', point)
		}
	});
};