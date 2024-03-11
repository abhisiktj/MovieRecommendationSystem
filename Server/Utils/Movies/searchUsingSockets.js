// socketLogic.js
const socketIo = require('socket.io');

function initializeSocket(server) {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    
    socket.on('autocomplete', (searchTerm) => {
        
      // Implement autocomplete logic here
      console.log(searchTerm);
      const suggestions = ['suggestion1', 'suggestion2', 'suggestion3'];
      socket.emit('autocompleteSuggestions', suggestions);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

module.exports = initializeSocket;

