class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionToken -> sessionData
    this.playerSessions = new Map(); // playerId -> sessionToken
    this.disconnectTimeouts = new Map(); // playerId -> timeout
    this.DISCONNECT_TIMEOUT = 60000; // 60 seconds
  }

  /**
   * Create a new session
   * @param {string} sessionToken - Session token from client
   * @param {string} playerId - Player ID (UUID)
   * @param {string} gameId - Game ID
   * @returns {Object} - Session data
   */
  createSession(sessionToken, playerId, gameId) {
    const sessionData = {
      playerId,
      gameId,
      lastActive: Date.now(),
      socketId: null
    };

    this.sessions.set(sessionToken, sessionData);
    this.playerSessions.set(playerId, sessionToken);
    return sessionData;
  }

  /**
   * Get a session by token
   * @param {string} sessionToken - Session token
   * @returns {Object|undefined} - Session data
   */
  getSession(sessionToken) {
    return this.sessions.get(sessionToken);
  }

  /**
   * Get a session by player ID
   * @param {string} playerId - Player ID
   * @returns {Object|null} - Session data
   */
  getSessionByPlayerId(playerId) {
    const sessionToken = this.playerSessions.get(playerId);
    return sessionToken ? this.sessions.get(sessionToken) : null;
  }

  /**
   * Update socket ID for a session
   * @param {string} sessionToken - Session token
   * @param {string} socketId - Socket ID
   */
  updateSocketId(sessionToken, socketId) {
    const session = this.sessions.get(sessionToken);
    if (session) {
      session.socketId = socketId;
      session.lastActive = Date.now();
    }
  }

  /**
   * Start disconnect timeout for a player
   * @param {string} playerId - Player ID
   * @param {Function} callback - Function to call when timeout expires
   */
  startDisconnectTimeout(playerId, callback) {
    // Clear any existing timeout
    this.clearDisconnectTimeout(playerId);

    const timeout = setTimeout(() => {
      const session = this.getSessionByPlayerId(playerId);
      if (session && session.socketId === null) {
        // Player hasn't reconnected, clean up
        this.removeSession(playerId);
        callback();
      }
    }, this.DISCONNECT_TIMEOUT);

    this.disconnectTimeouts.set(playerId, timeout);
  }

  /**
   * Clear disconnect timeout for a player
   * @param {string} playerId - Player ID
   */
  clearDisconnectTimeout(playerId) {
    const timeout = this.disconnectTimeouts.get(playerId);
    if (timeout) {
      clearTimeout(timeout);
      this.disconnectTimeouts.delete(playerId);
    }
  }

  /**
   * Remove a session
   * @param {string} playerId - Player ID
   */
  removeSession(playerId) {
    const sessionToken = this.playerSessions.get(playerId);
    if (sessionToken) {
      this.sessions.delete(sessionToken);
      this.playerSessions.delete(playerId);
      this.clearDisconnectTimeout(playerId);
    }
  }

  /**
   * Update last active timestamp for a session
   * @param {string} sessionToken - Session token
   */
  updateLastActive(sessionToken) {
    const session = this.sessions.get(sessionToken);
    if (session) {
      session.lastActive = Date.now();
    }
  }
}

module.exports = new SessionManager(); 