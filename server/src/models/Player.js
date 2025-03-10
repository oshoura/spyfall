/**
 * Player class to represent a player in the game
 */
class Player {
  /**
   * Create a new player
   * @param {string} id - Socket ID of the player
   * @param {string} name - Display name of the player
   */
  constructor(id, name) {
    this.id = id;
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
   * Get player data safe to send to clients
   * @returns {Object} - Player data without sensitive information
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      ready: this.ready,
      hasVoted: this.hasVoted
    };
  }
}

module.exports = Player; 