class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionToken -> sessionData
    this.playerSessions = new Map(); // playerId -> sessionToken
    this.disconnectTimeouts = new Map(); // playerId -> timeout
    this.DISCONNECT_TIMEOUT = 60000; // 60 seconds
  }

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

  getSession(sessionToken) {
    return this.sessions.get(sessionToken);
  }

  getSessionByPlayerId(playerId) {
    const sessionToken = this.playerSessions.get(playerId);
    return sessionToken ? this.sessions.get(sessionToken) : null;
  }

  updateSocketId(sessionToken, socketId) {
    const session = this.sessions.get(sessionToken);
    if (session) {
      session.socketId = socketId;
      session.lastActive = Date.now();
    }
  }

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

  clearDisconnectTimeout(playerId) {
    const timeout = this.disconnectTimeouts.get(playerId);
    if (timeout) {
      clearTimeout(timeout);
      this.disconnectTimeouts.delete(playerId);
    }
  }

  removeSession(playerId) {
    const sessionToken = this.playerSessions.get(playerId);
    if (sessionToken) {
      this.sessions.delete(sessionToken);
      this.playerSessions.delete(playerId);
      this.clearDisconnectTimeout(playerId);
    }
  }

  updateLastActive(sessionToken) {
    const session = this.sessions.get(sessionToken);
    if (session) {
      session.lastActive = Date.now();
    }
  }
}

module.exports = new SessionManager(); 