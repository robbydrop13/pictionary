module.exports = function(socket, currentConnections) {

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

	socket.on('change brush size control', (size) => {
	  if (currentConnections[socket.id] !== undefined) {
			console.log("change brush size control");
			socket.broadcast.emit('change brush size control', size)
		}
	});

	socket.on('clear canvas', () => {
	  if (currentConnections[socket.id] !== undefined) {
			console.log("clear canvas");
			socket.broadcast.emit('clear canvas')
			}
	});
};