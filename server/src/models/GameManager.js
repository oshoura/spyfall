const { Game } = require('./Game');
const Player = require('./Player');

/**
 * GameManager class to manage multiple games
 */
class GameManager {
  constructor() {
    this.games = new Map(); // Map of game ID to Game object
    this.playerGameMap = new Map(); // Map of player ID to game ID
    this.socketPlayerMap = new Map(); // Map of socket ID to player ID
  }

  /**
   * Create a new game
   * @param {string} socketId - Socket ID of the host
   * @param {string} hostName - Name of the host player
   * @returns {Object} - New game and host player
   */
  createGame(socketId, hostName) {
    // Create player first to get generated player ID
    const host = new Player(socketId, hostName);
    const game = new Game(host.id); // Use player ID as host ID
    
    const result = game.addPlayer(host);
    if (!result.success) {
      return { error: result.error };
    }
    
    this.games.set(game.id, game);
    this.playerGameMap.set(host.id, game.id);
    this.socketPlayerMap.set(socketId, host.id);
    
    return { game, player: host };
  }

  /**
   * Join an existing game
   * @param {string} gameId - ID of the game to join
   * @param {string} socketId - Socket ID of the player
   * @param {string} playerName - Name of the player
   * @returns {Object|null} - Game and player if successful, or error message
   */
  joinGame(gameId, socketId, playerName) {
    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }
    
    const player = new Player(socketId, playerName);
    const result = game.addPlayer(player);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    this.playerGameMap.set(player.id, gameId);
    this.socketPlayerMap.set(socketId, player.id);
    
    return { success: true, game, player };
  }

  /**
   * Get a game by ID
   * @param {string} gameId - ID of the game
   * @returns {Game|null} - Game object if found, null otherwise
   */
  getGame(gameId) {
    return this.games.get(gameId) || null;
  }

  /**
   * Get a game by player ID
   * @param {string} playerId - ID of the player
   * @returns {Game|null} - Game object if found, null otherwise
   */
  getGameByPlayerId(playerId) {
    const gameId = this.playerGameMap.get(playerId);
    if (!gameId) {
      return null;
    }
    
    return this.getGame(gameId);
  }

  /**
   * Get a game by socket ID
   * @param {string} socketId - Socket ID
   * @returns {Game|null} - Game object if found, null otherwise
   */
  getGameBySocketId(socketId) {
    const playerId = this.socketPlayerMap.get(socketId);
    if (!playerId) {
      return null;
    }
    
    return this.getGameByPlayerId(playerId);
  }

  /**
   * Get player ID from socket ID
   * @param {string} socketId - Socket ID
   * @returns {string|null} - Player ID if found, null otherwise
   */
  getPlayerIdFromSocketId(socketId) {
    return this.socketPlayerMap.get(socketId) || null;
  }


  /**
   * Update socket ID for a player
   * @param {string} playerId - Player ID
   * @param {string} socketId - New socket ID
   * @returns {boolean} - Whether the update was successful
   */
  updatePlayerSocket(playerId, socketId) {
    const game = this.getGameByPlayerId(playerId);
    if (!game) {
      return false;
    }
    
    // Remove old socket mapping if any
    for (const [oldSocketId, oldPlayerId] of this.socketPlayerMap.entries()) {
      if (oldPlayerId === playerId) {
        this.socketPlayerMap.delete(oldSocketId);
      }
    }
    
    console.log("updating new player socket", socketId, playerId)
    this.socketPlayerMap.set(socketId, playerId);
    
    // Update socket ID in game
    return game.updatePlayerSocket(playerId, socketId);
  }

  /**
   * Remove a player from their game
   * @param {string} playerId - ID of the player to remove
   * @returns {Game|null} - Game object if player was removed, null otherwise
   */
  removePlayer(playerId) {
    const game = this.getGameByPlayerId(playerId);
    if (!game) {
      return null;
    }
    
    // Get the player to get their socket ID before removing
    const player = game.players.get(playerId);
    
    game.removePlayer(playerId);
    this.playerGameMap.delete(playerId);
    
    // Remove socket mapping if exists
    if (player && player.socketId) {
      this.socketPlayerMap.delete(player.socketId);
    }
    
    // If the game is empty, remove it
    if (game.players.size === 0) {
      this.games.delete(game.id);
    }
    
    return game;
  }

  /**
   * Update timers for all active games
   */
  updateTimers() {
    for (const game of this.games.values()) {
      game.updateTimer();
    }
  }

  /**
   * Get all active games
   * @returns {Game[]} - Array of active games
   */
  getActiveGames() {
    return Array.from(this.games.values());
  }

  /**
   * Clean up inactive games
   * @param {number} maxInactiveTime - Maximum inactive time in milliseconds
   */
  cleanupInactiveGames(maxInactiveTime = 3600000) { // Default: 1 hour
    const now = Date.now();
    
    for (const [gameId, game] of this.games.entries()) {
      const inactiveTime = now - game.lastUpdateTime;
      
      if (inactiveTime > maxInactiveTime) {
        // Remove all players from the game
        for (const playerId of game.players.keys()) {
          this.playerGameMap.delete(playerId);
        }
        
        // Remove the game
        this.games.delete(gameId);
      }
    }
  }
}

module.exports = new GameManager(); // Export a singleton instance 