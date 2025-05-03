/**
 * Player class to represent a player in the game
 */
class Player {
  /**
   * Create a new player
   * @param {string} socketId - Socket ID of the connection
   * @param {string} name - Display name of the player
   */
  constructor(socketId, name) {
    // Generate a UUID for the player that's independent of the socket ID
    this.id = crypto.randomUUID();
    this.socketId = socketId; // Store the socket ID for communication
    this.name = name;
    this.ready = false;
    this.isSpy = false;
    this.hasVoted = false;
    this.votedFor = null;
  }

  /**
   * Toggle the ready status of the player
   * @returns {boolean} - New ready status
   */
  toggleReady() {
    this.ready = !this.ready;
    return this.ready;
  }

  /**
   * Reset the player's game state for a new round
   */
  resetForNewRound() {
    this.isSpy = false;
    this.hasVoted = false;
    this.votedFor = null;
  }

  /**
   * Record a vote from this player
   * @param {string} targetPlayerId - ID of the player being voted for
   */
  vote(targetPlayerId) {
    this.hasVoted = true;
    this.votedFor = targetPlayerId;
  }

  /**
   * Set the player's name
   * @param {string} newName - The new name
   */
  setName(newName) {
    // Add validation if needed (e.g., length, characters)
    if (newName && newName.trim().length > 0) {
      this.name = newName.trim();
    }
  }

  /**
   * Update the player's socket ID (used on reconnection)
   * @param {string} socketId - New socket ID
   */
  updateSocketId(socketId) {
    this.socketId = socketId;
  }

  /**
   * Get player data safe to send to clients
   * @returns {Object} - Player data without sensitive information
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      ready: this.ready,
      hasVoted: this.hasVoted,
      votedFor: this.votedFor
    };
  }
}

// Import crypto module at the top
const crypto = require('crypto');

module.exports = Player; 