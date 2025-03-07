const gameManager = require('../models/GameManager');
const { GameState } = require('../models/Game');

/**
 * Initialize socket controller
 * @param {Server} io - Socket.io server instance
 */
function initializeSocketController(io) {
  // Set up timer updates
  const TIMER_INTERVAL = 1000; // 1 second
  setInterval(() => {
    gameManager.updateTimers();
    
    // Broadcast updated time to all games in playing state
    for (const game of gameManager.games.values()) {
      if (game.state === GameState.PLAYING) {
        io.to(game.id).emit('timer-update', { timeRemaining: game.timeRemaining });
        
        // If time is up, transition to voting phase
        if (game.timeRemaining === 0) {
          io.to(game.id).emit('phase-change', { phase: GameState.VOTING });
        }
      }
    }
  }, TIMER_INTERVAL);
  
  // Clean up inactive games every hour
  setInterval(() => {
    gameManager.cleanupInactiveGames();
  }, 3600000);
  
  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Create a new game
    socket.on('create-game', ({ playerName }, callback) => {
      const { game, player } = gameManager.createGame(socket.id, playerName);
      
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
      
      if (!result) {
        return callback({
          success: false,
          error: 'Game not found or cannot be joined'
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
    
    // Start the game
    socket.on('start-game', (_, callback) => {
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
      
      // Start a new round
      const roundInfo = game.startNewRound();
      
      // Send game state to each player
      for (const playerId of game.players.keys()) {
        const playerState = game.getStateForPlayer(playerId);
        io.to(playerId).emit('game-started', playerState);
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
    
    // Submit a vote
    socket.on('submit-vote', ({ targetPlayerId }, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      if (game.state !== GameState.VOTING) {
        return callback({
          success: false,
          error: 'Voting is not active'
        });
      }
      
      const success = game.recordVote(socket.id, targetPlayerId);
      
      if (!success) {
        return callback({
          success: false,
          error: 'Vote could not be recorded'
        });
      }
      
      // Notify all players about the vote
      io.to(game.id).emit('player-voted', {
        playerId: socket.id
      });
      
      // If all players have voted, transition to results
      if (game.state === GameState.RESULTS) {
        // Send results to each player
        for (const playerId of game.players.keys()) {
          const playerState = game.getStateForPlayer(playerId);
          io.to(playerId).emit('voting-complete', playerState);
        }
      }
      
      callback({
        success: true
      });
    });
    
    // Start next round
    socket.on('next-round', (_, callback) => {
      const game = gameManager.getGameByPlayerId(socket.id);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can start the next round
      if (socket.id !== game.hostId) {
        return callback({
          success: false,
          error: 'Only the host can start the next round'
        });
      }
      
      if (game.state !== GameState.RESULTS) {
        return callback({
          success: false,
          error: 'Cannot start next round yet'
        });
      }
      
      // Check if the game is over
      if (game.isGameOver()) {
        // End the game
        io.to(game.id).emit('game-over', {
          rounds: game.currentRound
        });
        
        return callback({
          success: true,
          gameOver: true
        });
      }
      
      // Start a new round
      const roundInfo = game.startNewRound();
      
      // Send game state to each player
      for (const playerId of game.players.keys()) {
        const playerState = game.getStateForPlayer(playerId);
        io.to(playerId).emit('round-started', playerState);
      }
      
      callback({
        success: true,
        round: roundInfo.round
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
      
      // Only the host can return to lobby
      if (socket.id !== game.hostId) {
        return callback({
          success: false,
          error: 'Only the host can return to lobby'
        });
      }
      
      // Reset the game state
      game.state = GameState.LOBBY;
      game.currentRound = 0;
      game.usedLocations.clear();
      
      // Reset all players
      for (const player of game.players.values()) {
        player.resetForNewRound();
        player.ready = false;
      }
      
      // Notify all players
      io.to(game.id).emit('returned-to-lobby', {
        game: game.getStateForPlayer(null) // Public game state
      });
      
      callback({
        success: true
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      const game = gameManager.removePlayer(socket.id);
      
      if (game) {
        // Notify remaining players
        io.to(game.id).emit('player-left', {
          playerId: socket.id,
          newHostId: game.hostId
        });
      }
    });
  });
}

module.exports = { initializeSocketController }; 