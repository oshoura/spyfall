const gameManager = require('../models/GameManager');
const sessionManager = require('../models/SessionManager');
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
          broadcastGameResults(io, game);
        }
      }
    }
  }, 1000);
  
  /**
   * Helper function to broadcast game results to all players
   * @param {Server} io - Socket.io server
   * @param {Game} game - Game instance
   * @param {string} reason - Reason for game end
   */
  const broadcastGameResults = (io, game) => {
    // Send the results to each player
    game.resetState();
    for (const playerId of game.players.keys()) {
      const playerState = game.getStateForPlayer(playerId);
      const socketID = game.getSocketIDFromPlayerID(playerId)
      io.to(socketID).emit('round-ended', playerState);
    }
  };
  
  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle rejoin game
    socket.on('rejoin-game', ({ sessionToken }) => {
      console.log('Rejoining game with session token:', sessionToken);
      try {
        const session = sessionManager.getSession(sessionToken);
        
        if (!session) {
          socket.emit('rejoin-error', { error: 'Session not found' });
          return;
        }
        
        const game = gameManager.getGame(session.gameId);
        if (!game) {
          socket.emit('rejoin-error', { error: 'Game not found' });
          return;
        }
        
        sessionManager.updateSocketId(sessionToken, socket.id);
        socket.join(game.id);
        sessionManager.clearDisconnectTimeout(session.playerId);
        const playerState = game.getStateForPlayer(session.playerId);
        const player = playerState.players.find(p => p.id === session.playerId);
        gameManager.updatePlayerSocket(player.id, socket.id)
        socket.emit('rejoin-success', {
          game: playerState,
          player: player
        });
      } catch (error) {
        console.error('Error in rejoin-game:', error);
        socket.emit('rejoin-error', { error: 'Internal server error' });
      }
    });
    
    // Create a new game
    socket.on('create-game', ({ playerName, sessionToken }) => {
      try {
        const result = gameManager.createGame(socket.id, playerName);
        
        if (result.error) {
          socket.emit('create-game-error', { error: result.error });
          return;
        }
        
        const { game, player } = result;
        
        // Create session
        sessionManager.createSession(sessionToken, player.id, game.id);
        sessionManager.updateSocketId(sessionToken, socket.id);
        
        // Join the socket to the game room
        socket.join(game.id);
        
        socket.emit('create-game-success', {
          gameId: game.id,
          player: player.toJSON(),
          game: game.getStateForPlayer(socket.id)
        });
      } catch (error) {
        console.error('Error in create-game:', error);
        socket.emit('create-game-error', { error: 'Internal server error' });
      }
    });
    
    // Join an existing game
    socket.on('join-game', ({ gameId, playerName, sessionToken }) => {
      try {
        const result = gameManager.joinGame(gameId, socket.id, playerName);
        
        if (!result.success) {
          socket.emit('join-game-error', { error: result.error });
          return;
        }
        
        const { game, player } = result;
        
        // Create session
        sessionManager.createSession(sessionToken, player.id, game.id);
        sessionManager.updateSocketId(sessionToken, socket.id);
        
        // Join the socket to the game room
        socket.join(game.id);
        
        // Notify other players
        socket.to(game.id).emit('player-joined', {
          player: player.toJSON()
        });
        
        socket.emit('join-game-success', {
          player: player.toJSON(),
          game: game.getStateForPlayer(socket.id)
        });
      } catch (error) {
        console.error('Error in join-game:', error);
        socket.emit('join-game-error', { error: 'Internal server error' });
      }
    });
    
    // Toggle ready status
    socket.on('toggle-ready', (_, callback) => {
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      const player = game.players.get(playerId);
      const isReady = player.toggleReady();
      
      // Notify all players in the game
      io.to(game.id).emit('player-ready-changed', {
        playerId: playerId,
        isReady
      });
      
      callback({
        success: true,
        isReady
      });
    });
    
    // Set location packs
    socket.on('set-location-packs', ({ packIds }, callback) => {
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can change location packs
      if (playerId !== game.hostId) {
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
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can start the game
      if (playerId !== game.hostId) {
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
        const socketID = game.getSocketIDFromPlayerID(playerId)
        io.to(socketID).emit('game-started', playerState);
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
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Notify all players that the turn has ended
      io.to(game.id).emit('turn-ended', {
        nextPlayerId: playerId // Frontend will determine the next player
      });
      
      callback({
        success: true
      });
    });
    
    // Call for a vote
    socket.on('call-for-vote', (_, callback) => {
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      const result = game.callForVote(playerId);
      
      if (!result.success) {
        return callback({
          success: false,
          error: result.error
        });
      }
      
      // Notify all players about the vote call
      io.to(game.id).emit('vote-called', {
        playerId: playerId,
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
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      const result = game.makeSpyGuess(playerId, locationGuess);
      
      if (!result.success) {
        return callback({
          success: false,
          error: result.error
        });
      }
      
      // Broadcast to all players that the spy made a guess
      io.to(game.id).emit('spy-guessed', {
        playerId: playerId,
        locationGuess,
        isCorrect: result.isCorrect,
        actualLocation: result.actualLocation
      });
      
      // Broadcast the game results
      broadcastGameResults(io, game);
      
      callback({
        success: true,
        isCorrect: result.isCorrect,
        actualLocation: result.actualLocation
      });
    });
    
    // Submit a vote
    socket.on('submit-vote', ({ targetPlayerId }, callback) => {
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Vote for the target player
      const success = game.recordVote(playerId, targetPlayerId);
      
      if (!success) {
        return callback({
          success: false,
          error: 'Vote could not be recorded'
        });
      }
      
      // Notify all players about the vote
      io.to(game.id).emit('player-voted', {
        playerId: playerId,
        targetPlayerId: targetPlayerId,
        voteCounts: Object.fromEntries(game.votes)
      });
      
      // If all non-spy players have voted, transition to results
      if (game.state === GameState.RESULTS) {
        broadcastGameResults(io, game);
      }
      
      callback({
        success: true
      });
    });
    
    // Return to lobby
    socket.on('return-to-lobby', (_, callback) => {
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Allow any player to return to lobby if the game is in RESULTS state,
      // but only the host can do it at other times
      if (playerId !== game.hostId && game.state !== GameState.RESULTS) {
        return callback({
          success: false,
          error: 'Only the host can return the game to lobby before the round ends'
        });
      }
      
      game.returnToLobby();
      
      // Notify all players
      for (const playerId of game.players.keys()) {
        const playerState = game.getStateForPlayer(playerId);
        const socketID = game.getSocketIDFromPlayerID(playerId)
        io.to(socketID).emit('returned-to-lobby', {
          game: playerState
        });
      }
      
      callback({
        success: true
      });
    });
    
    // Set round time
    socket.on('set-round-time', ({ minutes, noMaxTime }, callback) => {
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can set round time
      if (playerId !== game.hostId) {
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
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
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
      const playerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(playerId);
      
      if (!game) {
        return callback({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Only the host can end the round early
      if (playerId !== game.hostId) {
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
      
      // Broadcast the game results
      broadcastGameResults(io, game);
      
      callback({
        success: true
      });
    });
    
    // Leave game/party
    socket.on('leave-game', (_, callback) => {
      const session = Array.from(sessionManager.sessions.values())
        .find(s => s.socketId === socket.id);
      if (session) {
        const game = gameManager.getGame(session.gameId);
        if (game) {
          game.removePlayer(session.playerId);
          io.to(game.id).emit('player-left', {
            playerId: session.playerId,
            newHostId: game.hostId
          });
        }
        sessionManager.removeSession(session.playerId);
      }
      if (callback) callback();
    });
    
    // Handle host assigning a new host
    socket.on('make-host', ({ newHostId }, callback) => {
      const currentHostId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(currentHostId);

      if (!game) {
        return callback({ success: false, error: 'Game not found' });
      }

      if (game.hostId !== currentHostId) {
        return callback({ success: false, error: 'Only the current host can assign a new host' });
      }

      if (currentHostId === newHostId) {
        return callback({ success: false, error: 'Cannot assign yourself as host' });
      }
      
      const success = game.setHost(newHostId);

      if (!success) {
        return callback({ success: false, error: 'Failed to set new host (player not found?)' });
      }

      // Notify all players in the game room about the host change
      io.to(game.id).emit('host-changed', { newHostId });

      callback({ success: true });
    });
    
    // Handle host removing a player
    socket.on('remove-player', ({ playerIdToRemove }, callback) => {
      const hostPlayerId = gameManager.getPlayerIdFromSocketId(socket.id);
      const game = gameManager.getGameByPlayerId(hostPlayerId);

      if (!game) {
        return callback({ success: false, error: 'Game not found' });
      }

      if (game.hostId !== hostPlayerId) {
        return callback({ success: false, error: 'Only the host can remove players' });
      }

      if (hostPlayerId === playerIdToRemove) {
        return callback({ success: false, error: 'Host cannot remove themselves' });
      }

      const removedPlayerSocketId  = game.getSocketIDFromPlayerID(playerIdToRemove)
      const removed = game.removePlayer(playerIdToRemove);

      if (!removed) {
        return callback({ success: false, error: 'Player not found or could not be removed' });
      }

      // Notify remaining players
      io.to(game.id).emit('player-left', {
        playerId: playerIdToRemove,
        newHostId: game.hostId // Host might change if the removed player was the host (though prevented above)
      });

      // Find the socket of the removed player to disconnect them
      if (removedPlayerSocketId) {
        const removedSocket = io.sockets.sockets.get(removedPlayerSocketId);
        if (removedSocket) {
          removedSocket.disconnect(true); // Force disconnect
        }
      }
      sessionManager.removeSession(playerIdToRemove);
      
      callback({ success: true });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const session = Array.from(sessionManager.sessions.values())
        .find(s => s.socketId === socket.id);
      
      if (session) {
        // Clear socket ID from session
        session.socketId = null;
        
        // Start disconnect timeout
        sessionManager.startDisconnectTimeout(session.playerId, () => {
          const game = gameManager.getGame(session.gameId);
          if (game) {
            // Remove player from game
            game.removePlayer(session.playerId);
            
            // Notify remaining players
            io.to(game.id).emit('player-left', {
              playerId: session.playerId,
              newHostId: game.hostId
            });
            
            // If we're in the middle of a game and the spy left, end the round
            if ((game.state === GameState.PLAYING || game.state === GameState.SPY_GUESSING) && 
                session.playerId === game.getSpyId()) {
              game.endRoundEarly('spy-left');
              broadcastGameResults(io, game);
            }
          }
        });
      }
      
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

module.exports = initializeSocketController; 