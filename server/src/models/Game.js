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
   * @param {string} hostId - Player ID of the host player
   */
  constructor(hostId) {
    this.id = generateCode();
    this.hostId = hostId;
    this.players = new Map(); // Map of player ID to Player object
    this.socketToPlayer = new Map(); // Map of socket ID to player ID
    this.playerToSocker = new Map()
    this.state = GameState.LOBBY;
    this.roundTime = 2 * 60; // 2 minutes in seconds
    this.timeRemaining = this.roundTime;
    this.currentLocation = null;
    this.currentRound = 0;
    this.maxRounds = 5;
    this.usedLocations = new Set();
    this.lastUpdateTime = Date.now();
    this.selectedLocationPacks = ['basic1']; // Default to basic pack
    this.voteCallers = new Set(); // Players who called for a vote
    this.spyGuess = null; // The spy's guess for the location
    this.votes = new Map(); // Map of player ID to votes received
    this.roundStartTime = null; // Timestamp when the round started
    this.roundEndTime = null; // Timestamp when the round ended
    this.minPlayers = 3; // Minimum players required to start
    this.maxPlayers = 16; // Maximum players allowed
    this.locationToPack = this.generateLocationToPackMap(); // Map of location names to pack IDs
  }

  /**
   * Generate a mapping of location names to their respective pack IDs
   * @returns {Object} - Map of location names to pack IDs they belong to
   */
  generateLocationToPackMap() {
    const mapping = {};
    
    // Loop through all location packs
    Object.entries(locationPacks).forEach(([packId, packData]) => {
      // For each location in the pack, add to the mapping
      packData.locations.forEach(locationName => {
        // Some locations might exist in multiple packs
        // We'll use the first pack we find for each location
        if (!mapping[locationName]) {
          mapping[locationName] = packId;
        }
      });
    });
    
    return mapping;
  }

  /**
   * Add a player to the game
   * @param {Player} player - Player to add
   * @returns {boolean|object} - Whether the player was added successfully or an error message
   */
  addPlayer(player) {
    if (this.state !== GameState.LOBBY) {
      return { success: false, error: 'Cannot join a game that has already started' };
    }

    if (this.players.size >= this.maxPlayers) {
      return { success: false, error: `Game is full (maximum ${this.maxPlayers} players)` };
    }
    
    this.players.set(player.id, player);
    this.socketToPlayer.set(player.socketId, player.id); // Map socket ID to player ID
    this.playerToSocker.set(player.id, player.socketId)
    this.lastUpdateTime = Date.now();
    return { success: true };
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
    
    const player = this.players.get(playerId);
    
    // Remove socket to player mapping if it exists
    if (player && player.socketId) {
      this.socketToPlayer.delete(player.socketId);
      this.playerToSocker.delete(player.id)
    }
    
    this.players.delete(playerId);
    
    // If the host leaves, assign a new host
    if (playerId === this.hostId && this.players.size > 0) {
      this.hostId = this.players.keys().next().value;
    }
    
    // If a vote caller leaves, remove them from vote callers
    if (this.voteCallers.has(playerId)) {
      this.voteCallers.delete(playerId);
    }
    
    // If player has votes, remove them
    this.votes.delete(playerId);
    
    // Update timestamp
    this.lastUpdateTime = Date.now();
    
    return true;
  }

  /**
   * Update a player's socket ID (on reconnection)
   * @param {string} playerId - Player ID
   * @param {string} socketId - New socket ID
   * @returns {boolean} - Whether the update was successful
   */
  updatePlayerSocket(playerId, socketId) {
    const player = this.players.get(playerId);
    if (!player) {
      return false;
    }
    
    // Remove old socket mapping if exists
    if (player.socketId) {
      this.socketToPlayer.delete(player.socketId);
    }
    
    // Update player socket ID
    player.updateSocketId(socketId);
    
    // Add new socket mapping
    this.socketToPlayer.set(socketId, playerId);
    this.playerToSocker.set(playerId, socketId)
    
    return true;
  }

  /**
   * Get player ID from socket ID
   * @param {string} socketId - Socket ID
   * @returns {string|null} - Player ID or null if not found
   */
  getPlayerIdFromSocket(socketId) {
    return this.socketToPlayer.get(socketId) || null;
  }

  getSocketIDFromPlayerID(playerID) {
    return this.playerToSocker.get(playerID) || null
  }

  /**
   * Check if all players are ready
   * @returns {boolean} - Whether all players are ready
   */
  areAllPlayersReady() {
    if (this.players.size < this.minPlayers) {
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
        this.selectedLocationPacks = ['basic1'];
      }
    }
    
    this.lastUpdateTime = Date.now();
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
   * Get information about the selected location packs
   * @returns {Object[]} - Array of location pack info
   */
  getLocationPacks() {
    const availablePacks = Object.keys(locationPacks);
    
    return availablePacks.map(packId => {
      const pack = locationPacks[packId];
      return {
        id: packId,
        name: pack.name,
        description: pack.description,
        locationCount: pack.locations.length,
        selected: this.selectedLocationPacks.includes(packId)
      };
    });
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
    this.votes.clear();
    this.lastUpdateTime = Date.now();
    this.roundStartTime = Date.now();
    this.roundEndTime = null;
    
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
      this.lastUpdateTime = Date.now();
    }
    
    return { 
      success: true, 
      voteCallers: Array.from(this.voteCallers),
      votingStarted: shouldStartVoting
    };
  }

  /**
   * Record a vote from a player
   * @param {string} voterId - ID of the player voting
   * @param {string} targetId - ID of the player being voted for
   * @returns {boolean} - Whether the vote was recorded successfully
   */
  recordVote(voterId, targetId) {
    // Allow voting during playing phase or voting phase
    if (this.state !== GameState.PLAYING && this.state !== GameState.VOTING) {
      return false;
    }
    
    const voter = this.players.get(voterId);
    const target = this.players.get(targetId);
    
    if (!voter || !target) {
      return false;
    }
    
    // If player has already voted for someone else, remove that vote first
    if (voter.hasVoted && voter.votedFor !== targetId) {
      const previousTargetId = voter.votedFor;
      if (previousTargetId && this.votes.has(previousTargetId)) {
        // Decrement the vote count for the previous target
        const previousVotes = this.votes.get(previousTargetId);
        if (previousVotes > 1) {
          this.votes.set(previousTargetId, previousVotes - 1);
        } else {
          this.votes.delete(previousTargetId);
        }
      }
    }
    
    // Record the vote
    voter.vote(targetId);
    
    // Count this vote for the target
    if (!this.votes.has(targetId)) {
      this.votes.set(targetId, 0);
    }
    this.votes.set(targetId, this.votes.get(targetId) + 1);
    
    // Check if all non-spy players have voted
    let allNonSpyPlayersVoted = true;
    let spyId = null;
    
    for (const [playerId, player] of this.players.entries()) {
      if (player.isSpy) {
        spyId = playerId;
        continue; // Skip checking if the spy has voted
      }
      
      if (!player.hasVoted) {
        allNonSpyPlayersVoted = false;
        break;
      }
    }
    
    // End the voting phase if all non-spy players have voted and there are at least 2 players
    if (allNonSpyPlayersVoted && this.players.size > 1) {
      this.endVoting();
    }
    
    this.lastUpdateTime = Date.now();
    
    return true;
  }

  /**
   * Calculate final game results for any end-game scenario
   * @param {string} reason - Reason for game ending ('voting', 'time-up', 'host-ended', 'spy-guess')
   * @param {string|null} spyGuess - The spy's guess for the location (if applicable)
   * @returns {Object} - Complete game results
   */
  calculateGameResults(reason = 'voting', spyGuess = null) {
    // Find the spy
    let spyId = this.getSpyId();
    
    // Determine most voted player (if any votes were cast)
    let mostVotedId = null;
    let maxVotes = -1;
    
    for (const [playerId, voteCount] of this.votes.entries()) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        mostVotedId = playerId;
      }
    }
    
    // Set game to results state and record end time
    this.state = GameState.RESULTS;
    this.roundEndTime = Date.now();
    
    // Determine outcome based on reason
    let spyWon = false;
    let spyGuessedCorrectly = false;
    
    if (reason === 'spy-guess') {
      // Spy wins if their guess is correct
      spyGuessedCorrectly = spyGuess && spyGuess.toLowerCase() === this.currentLocation.toLowerCase();
      spyWon = spyGuessedCorrectly;
    } else if (reason === 'voting') {
      // Spy wins if they weren't the most voted, or if no votes were cast
      spyWon = mostVotedId !== spyId;
    } else if (reason === 'time-up' || reason === 'host-ended') {
      // If time ran out or host ended, spy wins UNLESS they were the most voted
      spyWon = mostVotedId !== spyId;
    }
    
    // Create comprehensive results object
    const results = {
      // Basic info
      reason,
      spyId,
      location: this.currentLocation,
      
      // Voting results
      votes: this.votes,
      mostVotedId,
      hasVotes: this.votes.size > 0,
      
      // Outcome
      spyWon,
      
      // Spy guess info (if applicable)
      spyGuess,
      spyGuessedCorrectly
    };
    
    // Store results for getStateForPlayer to use
    this.results = results;
    
    return results;
  }

  /**
   * End the voting phase and determine results
   */
  endVoting() {
    this.calculateGameResults('voting');
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
    
    // Calculate results with spy guess
    const results = this.calculateGameResults('spy-guess', locationGuess);
    
    this.lastUpdateTime = Date.now();
    
    return { 
      success: true, 
      isCorrect: results.spyGuessedCorrectly,
      actualLocation: this.currentLocation
    };
  }

  /**
   * Update the game timer
   * @returns {number} - Updated time remaining
   */
  updateTimer() {
    if (this.state !== GameState.PLAYING || this.roundTime <= 0) {
      return this.timeRemaining;
    }
    
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.roundStartTime) / 1000);
    this.timeRemaining = Math.max(0, this.roundTime - elapsedSeconds);
    
    // Check if time is up
    if (this.timeRemaining === 0) {
      this.endRoundEarly('time-up');
    }
    
    return this.timeRemaining;
  }

  /**
   * Check the round timer and return current status
   * @returns {Object} - Timer information including if time is up
   */
  checkRoundTimer() {
    if (this.state !== GameState.PLAYING || this.roundTime <= 0) {
      return { 
        isTimeUp: false
      };
    }
    
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.roundStartTime) / 1000);
    this.timeRemaining = Math.max(0, this.roundTime - elapsedSeconds);
    
    // Check if time is up
    if (this.timeRemaining === 0) {
      this.endRoundEarly('time-up');
      return {
        isTimeUp: true
      };
    }
    
    return {
      isTimeUp: false
    };
  }

  /**
   * Return to lobby after a round
   */
  returnToLobby() {
    this.state = GameState.LOBBY;
    
    this.resetState()
    
    this.lastUpdateTime = Date.now();
  }

  resetState() {
    for (const player of this.players.values()) {
        player.ready = false;
        player.hasVoted = false;
        player.votedFor = null;
    }

    this.votes.clear();
    this.voteCallers.clear();
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
   * End the round early due to special circumstances
   * @param {string} reason - Reason for ending the round early (e.g., 'spy-left', 'time-up', 'host-ended')
   */
  endRoundEarly(reason) {
    this.calculateGameResults(reason);
  }

  /**
   * Get the game state safe to send to a specific player
   * @param {string|null} playerId - ID of the player to get state for, or null for public state
   * @returns {Object} - Game state with only information the player should know
   */
  getStateForPlayer(playerId) {
    // Basic state that everyone can see
    const state = {
      gameId: this.id,
      state: this.state,
      players: Array.from(this.players.values()).map(p => {
        const playerData = p.toJSON();
        // Add vote counts during all phases - playing, voting, and results
        playerData.votesReceived = this.votes.get(p.id) || 0;
        return playerData;
      }),
      hostId: this.hostId,
      round: this.currentRound,
      maxRounds: this.maxRounds,
      voteCallers: Array.from(this.voteCallers),
      roundTime: this.roundTime / 60, // Convert to minutes for the client
      timeRemaining: Math.ceil(this.timeRemaining / 60), // Convert to minutes and round up
      locationToPack: this.locationToPack // Add location-to-pack mapping
    };
    
    // Add location packs info if in lobby
    if (this.state === GameState.LOBBY) {
      state.locationPacks = this.getLocationPacks();
    }
    
    // Player specific info
    if (playerId && this.players.has(playerId)) {
      const player = this.players.get(playerId);
      state.isSpy = player.isSpy;
      
      // Only show the location if player is not the spy (unless in results)
      if (!player.isSpy || this.state === GameState.RESULTS) {
        state.location = this.currentLocation;
      }
      
      // For spy in spy_guessing state, show all possible locations
      if (player.isSpy && this.state === GameState.SPY_GUESSING) {
        state.possibleLocations = this.getAvailableLocations();
      }
    }
    
    // Results state available to all players
    if (this.state === GameState.RESULTS && this.results) {
      state.results = {
        spyId: this.results.spyId,
        mostVotedId: this.results.mostVotedId,
        spyWon: this.results.spyWon,
        location: this.results.location,
        spyGuess: this.results.spyGuess,
        spyGuessedCorrectly: this.results.spyGuessedCorrectly
      };
      
      // Convert votes map to a format that can be serialized
      state.results.votes = {};
      for (const [playerId, voteCount] of this.results.votes.entries()) {
        state.results.votes[playerId] = voteCount;
      }
    }
    
    return state;
  }
}

module.exports = { Game, GameState }; 