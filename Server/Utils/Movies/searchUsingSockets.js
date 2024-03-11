const {getMoviesByName}=require('./tmdb');


const socketIo = require('socket.io');

function initializeSocket(server) {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    
    socket.on('autocomplete', async (searchTerm) => {
       const suggestions=await getMoviesByName(searchTerm,1);
       socket.emit('autocompleteSuggestions', suggestions);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected`);
    });
  });
}

module.exports = initializeSocket;

