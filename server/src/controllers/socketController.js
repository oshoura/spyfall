const gameManager = require('../models/GameManager');
const { GameState } = require('../models/Game');

/**
 * Initialize socket controller
 * @param {Server} io - Socket.io server instance
 */
function initializeSocketController(io) {
  // Clean up inactive games every hour
  setInterval(() => {
    gameManager.cleanupInactiveGames();
  }, 3600000);
  
  // Check game timers every second
  setInterval(() => {
    for (const game of gameManager.getActiveGames()) {
      if (game.state === GameState.PLAYING && game.roundTime > 0) {
        const timerStatus = game.checkRoundTimer();
        
        // Only send timer updates when time is up, not on every check
        if (timerStatus.isTimeUp) {
          // Send results to each player
          for (const playerId of game.players.keys()) {
            const playerState = game.getStateForPlayer(playerId);
            io.to(playerId).emit('round-ended', playerState);
          }
          
          io.to(game.id).emit('time-up');
        }
      }
    }
  }, 1000);
  
  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Create a new game
    socket.on('create-game', ({ playerName }, callback) => {
      const result = gameManager.createGame(socket.id, playerName);
      
      if (result.error) {
        return callback({
          success: false,
          error: result.error
        });
      }
      
      const { game, player } = result;
      
      // Join the socket to the game room
      socket.join(game.id);
      
      callback({
        success: true,
        gameId: game.id,
        player: player.toJSON(),
        game: game.getStateForPlayer(socket.id)
      });
    });
    
    // Join an existing game
    socket.on('join-game', ({ gameId, playerName }, callback) => {
      const result = gameManager.joinGame(gameId, socket.id, playerName);
      
      if (!result.success) {
        return callback({
          success: false,
          error: result.error
        });
      }
      
      const { game, player } = result;
      
      // Join the socket to the game room
      socket.join(game.id);
      
      // Notify other players
      socket.to(game.id).emit('player-joined', {
        player: player.toJSON()
      });
      
      callback({
        success: true,
        player: player.toJSON(),
        game: game.getStateForPlayer(socket.id)
      });
    });
    
    // Toggle ready status
    socket.on('toggle-ready', (_, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      const player = game.players.get(socket.id);
      const isReady = player.toggleReady();
      
      // Notify all players in the game
      io.to(game.id).emit('player-ready-changed', {
        playerId: socket.id,
        isReady
      });
      
      callback({
        success: true,
        isReady
      });
    });
    
    // Set location packs
    socket.on('set-location-packs', ({ packIds }, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can change location packs
      if (socket.id !== game.hostId) {
        return callback({
          success: false,
          error: 'Only the host can change location packs'
        });
      }
      
      // Only allowed in lobby state
      if (game.state !== GameState.LOBBY) {
        return callback({
          success: false,
          error: 'Cannot change location packs once the game has started'
        });
      }
      
      game.setLocationPacks(packIds);
      
      // Notify all players about the updated packs
      io.to(game.id).emit('location-packs-updated', {
        locationPacks: game.getLocationPacks()
      });
      
      callback({
        success: true,
        locationPacks: game.getLocationPacks()
      });
    });
    
    // Start the game
    socket.on('start-game', (settings, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can start the game
      if (socket.id !== game.hostId) {
        return callback({
          success: false,
          error: 'Only the host can start the game'
        });
      }
      
      // Check if all players are ready
      if (!game.areAllPlayersReady()) {
        return callback({
          success: false,
          error: 'Not all players are ready'
        });
      }
      
      // Process round time settings if provided
      if (settings && typeof settings === 'object') {
        if (settings.roundTime !== undefined) {
          // Convert minutes to seconds for the backend
          const roundTimeSeconds = settings.noMaxTime ? 0 : (settings.roundTime * 60);
          game.roundTime = roundTimeSeconds;
        }
      }
      
      // Start a new round
      const roundInfo = game.startNewRound();
      
      // Send game state to each player
      for (const playerId of game.players.keys()) {
        const playerState = game.getStateForPlayer(playerId);
        io.to(playerId).emit('game-started', playerState);
      }
      
      // Start the timer if there's a time limit
      if (game.roundTime > 0) {
        const timestamp = new Date().toISOString();
        io.to(game.id).emit('timer-started', {
          timestamp,
          roundTime: game.roundTime / 60 // Convert seconds back to minutes for the client
        });
      }
      
      callback({
        success: true,
        round: roundInfo.round
      });
    });
    
    // End turn (move to next player)
    socket.on('end-turn', (_, callback) => {
      // This is just for UI coordination, no game state changes needed
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Notify all players that the turn has ended
      io.to(game.id).emit('turn-ended', {
        nextPlayerId: socket.id // Frontend will determine the next player
      });
      
      callback({
        success: true
      });
    });
    
    // Call for a vote
    socket.on('call-for-vote', (_, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      const result = game.callForVote(socket.id);
      
      if (!result.success) {
        return callback({
          success: false,
          error: result.error
        });
      }
      
      // Notify all players about the vote call
      io.to(game.id).emit('vote-called', {
        playerId: socket.id,
        voteCallers: result.voteCallers
      });
      
      // If voting should start, notify all players
      if (result.votingStarted) {
        io.to(game.id).emit('voting-started', {
          state: game.getStateForPlayer(null)
        });
      }
      
      callback({
        success: true,
        votingStarted: result.votingStarted
      });
    });
    
    // Spy makes a location guess
    socket.on('spy-guess', ({ locationGuess }, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      const result = game.makeSpyGuess(socket.id, locationGuess);
      
      if (!result.success) {
        return callback({
          success: false,
          error: result.error
        });
      }
      
      // Notify all players about the spy's guess and the result
      io.to(game.id).emit('spy-guessed', {
        playerId: socket.id,
        locationGuess,
        isCorrect: result.isCorrect,
        actualLocation: result.actualLocation
      });
      
      // Send results to each player
      for (const playerId of game.players.keys()) {
        const playerState = game.getStateForPlayer(playerId);
        io.to(playerId).emit('round-ended', playerState);
      }
      
      callback({
        success: true,
        isCorrect: result.isCorrect,
        actualLocation: result.actualLocation
      });
    });
    
    // Submit a vote
    socket.on('submit-vote', ({ targetPlayerId }, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Vote for the target player
      const success = game.recordVote(socket.id, targetPlayerId);
      
      if (!success) {
        return callback({
          success: false,
          error: 'Vote could not be recorded'
        });
      }
      
      // Notify all players about the vote
      io.to(game.id).emit('player-voted', {
        playerId: socket.id,
        targetPlayerId: targetPlayerId,
        voteCounts: Object.fromEntries(game.votes)
      });
      
      // If all non-spy players have voted, transition to results
      if (game.state === GameState.RESULTS) {
        // Send results to each player
        for (const playerId of game.players.keys()) {
          const playerState = game.getStateForPlayer(playerId);
          io.to(playerId).emit('round-ended', playerState);
        }
      }
      
      callback({
        success: true
      });
    });
    
    // Return to lobby
    socket.on('return-to-lobby', (_, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Allow any player to return to lobby if the game is in RESULTS state,
      // but only the host can do it at other times
      if (socket.id !== game.hostId && game.state !== GameState.RESULTS) {
        return callback({
          success: false,
          error: 'Only the host can return the game to lobby before the round ends'
        });
      }
      
      game.returnToLobby();
      
      // Notify all players
      for (const playerId of game.players.keys()) {
        const playerState = game.getStateForPlayer(playerId);
        io.to(playerId).emit('returned-to-lobby', {
          game: playerState
        });
      }
      
      callback({
        success: true
      });
    });
    
    // Set round time
    socket.on('set-round-time', ({ minutes, noMaxTime }, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can set round time
      if (socket.id !== game.hostId) {
        return callback({
          success: false,
          error: 'Only the host can set round time'
        });
      }
      
      // Only allowed in lobby state
      if (game.state !== GameState.LOBBY) {
        return callback({
          success: false,
          error: 'Cannot change round time once the game has started'
        });
      }
      
      // Set round time (in seconds)
      const roundTimeSeconds = noMaxTime ? 0 : (minutes * 60);
      game.roundTime = roundTimeSeconds;
      
      callback({
        success: true,
        roundTime: minutes
      });
    });
    
    // Get all possible locations
    socket.on('get-possible-locations', (_, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      const locations = game.getAvailableLocations();
      
      callback({
        success: true,
        locations
      });
    });
    
    // End the round early (host only)
    socket.on('end-round-early', (_, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can end the round early
      if (socket.id !== game.hostId) {
        return callback({
          success: false,
          error: 'Only the host can end the round early'
        });
      }
      
      // Only allowed in playing state
      if (game.state !== GameState.PLAYING) {
        return callback({
          success: false,
          error: 'Can only end the round when game is in progress'
        });
      }
      
      // End the round early
      game.endRoundEarly('host-ended');
      
      // Send results to each player
      for (const playerId of game.players.keys()) {
        const playerState = game.getStateForPlayer(playerId);
        io.to(playerId).emit('round-ended', playerState);
      }
      
      callback({
        success: true
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (game) {
        // Store the player's ID before we remove them
        const playerId = socket.id;
        
        // Remove the player from the game
        game.removePlayer(playerId);
        
        // If there are still players in the game
        if (game.players.size > 0) {
          // Notify remaining players
          io.to(game.id).emit('player-left', {
            playerId,
            newHostId: game.hostId
          });
          
          // If we're in the middle of a game and the spy left, end the round
          if ((game.state === GameState.PLAYING || game.state === GameState.SPY_GUESSING) && playerId === game.getSpyId()) {
            game.endRoundEarly('spy-left');
            
            // Send updated game state to all players
            for (const pid of game.players.keys()) {
              io.to(pid).emit('round-ended', game.getStateForPlayer(pid));
            }
          }
        }
        
        // Remove mapping from player to game
        gameManager.playerGameMap.delete(playerId);
      }
      
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = initializeSocketController; 