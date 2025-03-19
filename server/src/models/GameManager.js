const { Game } = require('./Game');
const Player = require('./Player');

/**
 * GameManager class to manage multiple games
 */
class GameManager {
  constructor() {
    this.games = new Map(); // Map of game ID to Game object
    this.playerGameMap = new Map(); // Map of player ID to game ID
  }

  /**
   * Create a new game
   * @param {string} hostId - Socket ID of the host player
   * @param {string} hostName - Name of the host player
   * @returns {Object} - New game and host player
   */
  createGame(hostId, hostName) {
    const game = new Game(hostId);
    const host = new Player(hostId, hostName);
    
    const result = game.addPlayer(host);
    if (!result.success) {
      return { error: result.error };
    }
    
    this.games.set(game.id, game);
    this.playerGameMap.set(hostId, game.id);
    
    return { game, player: host };
  }

  /**
   * Join an existing game
   * @param {string} gameId - ID of the game to join
   * @param {string} playerId - Socket ID of the player
   * @param {string} playerName - Name of the player
   * @returns {Object|null} - Game and player if successful, or error message
   */
  joinGame(gameId, playerId, playerName) {
    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }
    
    const player = new Player(playerId, playerName);
    const result = game.addPlayer(player);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    this.playerGameMap.set(playerId, gameId);
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
   * Remove a player from their game
   * @param {string} playerId - ID of the player to remove
   * @returns {Game|null} - Game object if player was removed, null otherwise
   */
  removePlayer(playerId) {
    const game = this.getGameByPlayerId(playerId);
    if (!game) {
      return null;
    }
    
    game.removePlayer(playerId);
    this.playerGameMap.delete(playerId);
    
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