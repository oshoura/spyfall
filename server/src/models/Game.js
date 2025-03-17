const locationPacks = require('../data/locations');
const { generateCode } = require('../utils/codeGenerator');

/**
 * Game states
 * @enum {string}
 */
const GameState = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  SPY_GUESSING: 'spy_guessing',
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
    this.selectedLocationPacks = ['basic']; // Default to basic pack
    this.voteCallers = new Set(); // Players who called for a vote
    this.spyGuess = null; // The spy's guess for the location
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
    if (this.players.size < 2) {
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
   * Set the location packs to use for the game
   * @param {string[]} packIds - Array of pack IDs
   */
  setLocationPacks(packIds) {
    if (packIds && packIds.length > 0) {
      // Filter to only include valid pack IDs
      this.selectedLocationPacks = packIds.filter(id => locationPacks[id]);
      
      // If no valid packs, default to basic
      if (this.selectedLocationPacks.length === 0) {
        this.selectedLocationPacks = ['basic'];
      }
    }
  }

  /**
   * Get all available locations from selected packs
   * @returns {string[]} - Array of location names
   */
  getAvailableLocations() {
    let allLocations = [];
    
    for (const packId of this.selectedLocationPacks) {
      if (locationPacks[packId]) {
        allLocations = allLocations.concat(locationPacks[packId].locations);
      }
    }
    
    return allLocations;
  }

  /**
   * Start a new round
   * @returns {Object} - Round information
   */
  startNewRound() {
    this.currentRound++;
    this.state = GameState.PLAYING;
    this.voteCallers.clear();
    this.spyGuess = null;
    this.lastUpdateTime = Date.now();
    
    // Reset player states
    for (const player of this.players.values()) {
      player.resetForNewRound();
    }
    
    // Get all available locations from selected packs
    const allLocations = this.getAvailableLocations();
    
    // Filter out used locations
    let availableLocations = allLocations.filter(loc => !this.usedLocations.has(loc));
    
    // If all locations have been used, reset
    if (availableLocations.length === 0) {
      this.usedLocations.clear();
      availableLocations = allLocations;
    }
    
    // Select a random location
    const locationIndex = Math.floor(Math.random() * availableLocations.length);
    this.currentLocation = availableLocations[locationIndex];
    this.usedLocations.add(this.currentLocation);
    
    // Assign spy role
    const playerIds = Array.from(this.players.keys());
    const spyIndex = Math.floor(Math.random() * playerIds.length);
    
    playerIds.forEach((playerId, index) => {
      const player = this.players.get(playerId);
      player.isSpy = (index === spyIndex);
    });
    
    return {
      round: this.currentRound,
      location: this.currentLocation
    };
  }

  /**
   * Call for a vote to find the spy
   * @param {string} playerId - ID of the player calling for a vote
   * @returns {Object} - Vote call information
   */
  callForVote(playerId) {
    if (this.state !== GameState.PLAYING) {
      return { success: false, error: 'Cannot call for vote in current state' };
    }
    
    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }
    
    if (player.isSpy) {
      return { success: false, error: 'Spy cannot call for a vote' };
    }
    
    // Add player to vote callers
    this.voteCallers.add(playerId);
    
    // Check if we have enough vote callers
    const shouldStartVoting = this.voteCallers.size >= 2;
    
    if (shouldStartVoting) {
      this.state = GameState.VOTING;
    }
    
    return { 
      success: true, 
      voteCallers: Array.from(this.voteCallers),
      votingStarted: shouldStartVoting
    };
  }

  /**
   * Spy makes a guess for the location
   * @param {string} playerId - ID of the player (spy) making the guess
   * @param {string} locationGuess - The location guess
   * @returns {Object} - Guess result
   */
  makeSpyGuess(playerId, locationGuess) {
    if (this.state !== GameState.PLAYING && this.state !== GameState.SPY_GUESSING) {
      return { success: false, error: 'Cannot make a guess in current state' };
    }
    
    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }
    
    if (!player.isSpy) {
      return { success: false, error: 'Only the spy can make a location guess' };
    }
    
    this.state = GameState.RESULTS;
    this.spyGuess = locationGuess;
    
    const isCorrect = locationGuess.toLowerCase() === this.currentLocation.toLowerCase();
    
    return { 
      success: true, 
      isCorrect,
      actualLocation: this.currentLocation
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
    // Allow voting during playing or voting phase
    if (this.state !== GameState.PLAYING && this.state !== GameState.VOTING) {
      return false;
    }
    
    const player = this.players.get(playerId);
    if (!player || player.hasVoted || player.isSpy) {
      return false;
    }
    
    player.vote(targetId);
    
    // If we're in playing phase, transition to voting phase
    if (this.state === GameState.PLAYING) {
      this.state = GameState.VOTING;
    }
    
    // Check if all non-spy players have voted
    const allNonSpyPlayersVoted = Array.from(this.players.values())
      .filter(p => !p.isSpy)
      .every(p => p.hasVoted);
      
    if (allNonSpyPlayersVoted) {
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
    const spyGuessedCorrectly = this.spyGuess && this.spyGuess.toLowerCase() === this.currentLocation.toLowerCase();
    
    return {
      votes,
      spyId,
      mostVotedId,
      spyWon,
      location: this.currentLocation,
      spyGuess: this.spyGuess,
      spyGuessedCorrectly
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
   * Get all available location packs
   * @returns {Object[]} - Array of location pack info
   */
  getLocationPacks() {
    return Object.entries(locationPacks).map(([id, pack]) => ({
      id,
      name: pack.name,
      description: pack.description,
      locationCount: pack.locations.length,
      selected: this.selectedLocationPacks.includes(id)
    }));
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
      locationPacks: this.getLocationPacks(),
      voteCallers: Array.from(this.voteCallers),
      roundTime: this.roundTime / 60 // Convert seconds to minutes for the client
    };
    
    if (!player) {
      return baseState;
    }
    
    // Add player-specific information
    if (this.state === GameState.PLAYING || 
        this.state === GameState.VOTING || 
        this.state === GameState.SPY_GUESSING) {
      baseState.isSpy = player.isSpy;
      
      if (!player.isSpy) {
        baseState.location = this.currentLocation;
      }
    }
    
    if (this.state === GameState.RESULTS) {
      baseState.results = this.getVotingResults();
    }
    
    return baseState;
  }
}

module.exports = { Game, GameState }; 