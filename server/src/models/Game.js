const locations = require('../data/locations');
const { generateCode } = require('../utils/codeGenerator');

/**
 * Game states
 * @enum {string}
 */
const GameState = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  VOTING: 'voting',
  RESULTS: 'results'
};

/**
 * Game class to manage a Spyfall game
 */
class Game {
  /**
   * Create a new game
   * @param {string} hostId - Socket ID of the host player
   */
  constructor(hostId) {
    this.id = generateCode();
    this.hostId = hostId;
    this.players = new Map(); // Map of player ID to Player object
    this.state = GameState.LOBBY;
    this.roundTime = 8 * 60; // 8 minutes in seconds
    this.timeRemaining = this.roundTime;
    this.currentLocation = null;
    this.currentRound = 0;
    this.maxRounds = 5;
    this.usedLocations = new Set();
    this.lastUpdateTime = Date.now();
  }

  /**
   * Add a player to the game
   * @param {Player} player - Player to add
   * @returns {boolean} - Whether the player was added successfully
   */
  addPlayer(player) {
    if (this.state !== GameState.LOBBY) {
      return false;
    }
    
    this.players.set(player.id, player);
    return true;
  }

  /**
   * Remove a player from the game
   * @param {string} playerId - ID of the player to remove
   * @returns {boolean} - Whether the player was removed successfully
   */
  removePlayer(playerId) {
    if (!this.players.has(playerId)) {
      return false;
    }
    
    this.players.delete(playerId);
    
    // If the host leaves, assign a new host
    if (playerId === this.hostId && this.players.size > 0) {
      this.hostId = this.players.keys().next().value;
    }
    
    return true;
  }

  /**
   * Check if all players are ready
   * @returns {boolean} - Whether all players are ready
   */
  areAllPlayersReady() {
    if (this.players.size < 3) {
      return false;
    }
    
    for (const player of this.players.values()) {
      if (!player.ready) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Start a new round
   * @returns {Object} - Round information
   */
  startNewRound() {
    this.currentRound++;
    this.state = GameState.PLAYING;
    this.timeRemaining = this.roundTime;
    this.lastUpdateTime = Date.now();
    
    // Reset player states
    for (const player of this.players.values()) {
      player.resetForNewRound();
    }
    
    // Select a random location that hasn't been used yet
    let availableLocations = locations.filter(loc => !this.usedLocations.has(loc.name));
    if (availableLocations.length === 0) {
      // If all locations have been used, reset
      this.usedLocations.clear();
      availableLocations = locations;
    }
    
    const locationIndex = Math.floor(Math.random() * availableLocations.length);
    this.currentLocation = availableLocations[locationIndex];
    this.usedLocations.add(this.currentLocation.name);
    
    // Assign roles
    const playerIds = Array.from(this.players.keys());
    const spyIndex = Math.floor(Math.random() * playerIds.length);
    
    // Shuffle roles
    const roles = [...this.currentLocation.roles];
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    
    let roleIndex = 0;
    playerIds.forEach((playerId, index) => {
      const player = this.players.get(playerId);
      if (index === spyIndex) {
        player.assignRole(true);
      } else {
        player.assignRole(false, roles[roleIndex % roles.length]);
        roleIndex++;
      }
    });
    
    return {
      round: this.currentRound,
      location: this.currentLocation.name,
      timeRemaining: this.timeRemaining
    };
  }

  /**
   * Update the game timer
   * @returns {number} - Updated time remaining
   */
  updateTimer() {
    if (this.state !== GameState.PLAYING) {
      return this.timeRemaining;
    }
    
    const now = Date.now();
    const elapsed = Math.floor((now - this.lastUpdateTime) / 1000);
    this.lastUpdateTime = now;
    
    this.timeRemaining = Math.max(0, this.timeRemaining - elapsed);
    
    if (this.timeRemaining === 0) {
      this.state = GameState.VOTING;
    }
    
    return this.timeRemaining;
  }

  /**
   * Record a vote from a player
   * @param {string} playerId - ID of the player voting
   * @param {string} targetId - ID of the player being voted for
   * @returns {boolean} - Whether the vote was recorded successfully
   */
  recordVote(playerId, targetId) {
    if (this.state !== GameState.VOTING) {
      return false;
    }
    
    const player = this.players.get(playerId);
    if (!player || player.hasVoted) {
      return false;
    }
    
    player.vote(targetId);
    
    // Check if all players have voted
    const allVoted = Array.from(this.players.values()).every(p => p.hasVoted);
    if (allVoted) {
      this.state = GameState.RESULTS;
    }
    
    return true;
  }

  /**
   * Calculate the voting results
   * @returns {Object} - Voting results
   */
  getVotingResults() {
    const votes = new Map();
    const spyId = this.getSpyId();
    
    // Count votes
    for (const player of this.players.values()) {
      if (player.hasVoted && player.votedFor) {
        votes.set(player.votedFor, (votes.get(player.votedFor) || 0) + 1);
      }
    }
    
    // Find player with most votes
    let maxVotes = 0;
    let mostVotedId = null;
    
    for (const [playerId, voteCount] of votes.entries()) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        mostVotedId = playerId;
      }
    }
    
    const spyWon = mostVotedId !== spyId;
    
    return {
      votes,
      spyId,
      mostVotedId,
      spyWon,
      location: this.currentLocation.name
    };
  }

  /**
   * Get the ID of the spy
   * @returns {string|null} - ID of the spy
   */
  getSpyId() {
    for (const [playerId, player] of this.players.entries()) {
      if (player.isSpy) {
        return playerId;
      }
    }
    return null;
  }

  /**
   * Check if the game is over
   * @returns {boolean} - Whether the game is over
   */
  isGameOver() {
    return this.currentRound >= this.maxRounds;
  }

  /**
   * Get game state safe to send to a specific player
   * @param {string} playerId - ID of the player
   * @returns {Object} - Game state for the player
   */
  getStateForPlayer(playerId) {
    const player = this.players.get(playerId);
    const playersList = Array.from(this.players.values()).map(p => p.toJSON());
    
    const baseState = {
      gameId: this.id,
      state: this.state,
      players: playersList,
      hostId: this.hostId,
      round: this.currentRound,
      maxRounds: this.maxRounds,
      timeRemaining: this.timeRemaining
    };
    
    if (!player) {
      return baseState;
    }
    
    // Add player-specific information
    if (this.state === GameState.PLAYING || this.state === GameState.VOTING) {
      baseState.isSpy = player.isSpy;
      
      if (!player.isSpy) {
        baseState.location = this.currentLocation.name;
        baseState.role = player.role;
        baseState.possibleRoles = this.currentLocation.roles;
      }
    }
    
    if (this.state === GameState.RESULTS) {
      baseState.results = this.getVotingResults();
    }
    
    return baseState;
  }
}

module.exports = { Game, GameState }; 