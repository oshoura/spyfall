import { io, Socket } from 'socket.io-client';
import { ref } from 'vue';
import sessionService from './sessionService';
import { useRouter } from 'vue-router';
// import { useRouter } from 'vue-router'

const router = useRouter();

// Types
export interface Player {
  id: string;
  name: string;
  ready: boolean;
  hasVoted: boolean;
  votesReceived?: number;
  votedFor?: string; // ID of the player this player has voted for
}

export interface GameState {
  gameId: string;
  state: 'lobby' | 'playing' | 'spy_guessing' | 'voting' | 'results';
  players: Player[];
  hostId: string;
  round: number;
  maxRounds: number;
  isSpy?: boolean;
  location?: string;
  locationPacks?: LocationPack[];
  voteCallers?: string[];
  roundTime?: number; // Round time in minutes
  timerStarted?: string; // ISO timestamp when the timer started
  timerEnded?: string; // ISO timestamp when the timer ended
  possibleLocations?: string[]; // All possible locations for the spy to guess
  results?: {
    votes: Map<string, number>;
    spyId: string;
    mostVotedId: string;
    spyWon: boolean;
    location: string;
    spyGuess?: string;
    spyGuessedCorrectly?: boolean;
    reason?: string; // Added for time-up, spy-left, etc.
  };
}

export interface LocationPack {
  id: string;
  name: string;
  description: string;
  locationCount: number;
  selected: boolean;
}

class SocketService {
  public socket: Socket | null = null;
  private serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  // Reactive state
  public connected = ref(false);
  public gameState = ref<GameState | null>(null);
  public playerId = ref<string | null>(null);
  public playerName = ref<string>('');
  public error = ref<string | null>(null);

  // Initialize socket connection
  public init(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(this.serverUrl, {
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected.value = true;
      this.reconnectAttempts = 0;

      // If we have a session token, try to rejoin
      if (sessionService.hasSession()) {
        this.rejoinGame();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected.value = false;
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      this.error.value = 'Failed to connect to the server. Please try again.';
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        this.error.value = 'Failed to connect after multiple attempts. Please refresh the page.';
      }
    });

    // Handle rejoin responses
    this.socket.on('rejoin-success', (response) => {
      this.gameState.value = response.game;
      this.playerId.value = response.player?.id || null;
      this.error.value = null;
      router.push(`/lobby`);
    });

    this.socket.on('rejoin-error', (response) => {
      this.error.value = response.error;
      sessionService.clearSession();
    });

    // Handle create game responses
    this.socket.on('create-game-success', (response) => {
      this.gameState.value = response.game;
      this.playerId.value = response.player.id;
      this.error.value = null;
    });

    this.socket.on('create-game-error', (response) => {
      this.error.value = response.error;
    });

    // Handle join game responses
    this.socket.on('join-game-success', (response) => {
      this.gameState.value = response.game;
      this.playerId.value = response.player.id;
      this.error.value = null;
    });

    this.socket.on('join-game-error', (response) => {
      this.error.value = response.error;
    });

    // Game events
    this.setupGameEvents();
  }

  private rejoinGame() {
    if (!this.socket) return;

    const sessionToken = sessionService.getSessionToken();
    if (!sessionToken) return;

    console.log('Rejoining game with session token:', sessionToken);
    this.socket.emit('rejoin-game', { sessionToken });
  }

  // Set up game event listeners
  private setupGameEvents(): void {
    if (!this.socket) return;

    // Player joined
    this.socket.on('player-joined', ({ player }) => {
      if (this.gameState.value) {
        this.gameState.value.players.push(player);
      }
    });

    // Player ready changed
    this.socket.on('player-ready-changed', ({ playerId, isReady }) => {
      if (this.gameState.value) {
        const player = this.gameState.value.players.find(p => p.id === playerId);
        if (player) {
          player.ready = isReady;
        }
      }
    });

    // Game started
    this.socket.on('game-started', (gameState) => {
      console.log("socket service game started", gameState)
      this.gameState.value = gameState;
    });

    // Phase change
    this.socket.on('phase-change', ({ phase }) => {
      console.log("phase change", phase)
      if (this.gameState.value) {
        this.gameState.value.state = phase;
      }
    });

    // Turn ended
    this.socket.on('turn-ended', () => {
      // This is handled by the UI
    });

    // Player voted
    this.socket.on('player-voted', ({ playerId, targetPlayerId, voteCounts }) => {
      if (this.gameState.value) {
        // Update the player who voted
        const voter = this.gameState.value.players.find(p => p.id === playerId);
        if (voter) {
          voter.hasVoted = true;
          voter.votedFor = targetPlayerId;
        }

        // Update vote counts for all players
        if (voteCounts) {
          this.gameState.value.players.forEach(player => {
            player.votesReceived = voteCounts[player.id] || 0;
          });
        }
      }
    });

    // Voting complete
    this.socket.on('voting-complete', (gameState) => {
      this.gameState.value = gameState;
    });

    // Round started
    this.socket.on('round-started', (gameState) => {
      console.log("round started")
      this.gameState.value = gameState;
    });

    // Timer started
    this.socket.on('timer-started', ({ timestamp, roundTime }) => {
      if (this.gameState.value) {
        this.gameState.value.timerStarted = timestamp;
        this.gameState.value.roundTime = roundTime;
      }
    });

    // Timer ended
    this.socket.on('timer-ended', ({ timestamp }) => {
      if (this.gameState.value) {
        this.gameState.value.timerEnded = timestamp;
      }
    });

    // Game over
    this.socket.on('game-over', () => {
      // Handle game over
    });

    // Returned to lobby
    this.socket.on('returned-to-lobby', ({ game }) => {
      this.gameState.value = game;
    });

    // Player left
    this.socket.on('player-left', ({ playerId, newHostId }) => {
      if (this.gameState.value) {
        this.gameState.value.players = this.gameState.value.players.filter(p => p.id !== playerId);
        this.gameState.value.hostId = newHostId;
      }
    });

    // Location packs updated
    this.socket.on('location-packs-updated', ({ locationPacks }) => {
      if (this.gameState.value) {
        this.gameState.value.locationPacks = locationPacks;
      }
    });

    // Vote called
    this.socket.on('vote-called', ({ voteCallers }) => {
      if (this.gameState.value) {
        this.gameState.value.voteCallers = voteCallers;
      }
    });

    // Voting started
    this.socket.on('voting-started', ({ state }) => {
      this.gameState.value = state;
    });

    // Spy guessed
    this.socket.on('spy-guessed', (data) => {
      // This will be handled by the round-ended event
      console.log('Spy guessed:', data);
    });

    // Round ended (replaces voting-complete)
    this.socket.on('round-ended', (gameState) => {
      this.gameState.value = gameState;
    });
  }

  // Create a new game
  public createGame(playerName: string): Promise<{ gameId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.playerName.value = playerName;
      const sessionToken = sessionService.generateNewSession();

      this.socket.emit('create-game', { playerName, sessionToken });

      // Set up one-time listeners for this specific create game attempt
      const successHandler = (response: any) => {
        this.socket?.off('create-game-success', successHandler);
        this.socket?.off('create-game-error', errorHandler);
        resolve({ gameId: response.gameId });
      };

      const errorHandler = (response: any) => {
        this.socket?.off('create-game-success', successHandler);
        this.socket?.off('create-game-error', errorHandler);
        reject(new Error(response.error || 'Failed to create game'));
      };

      this.socket.once('create-game-success', successHandler);
      this.socket.once('create-game-error', errorHandler);
    });
  }

  // Join an existing game
  public joinGame(gameId: string, playerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.playerName.value = playerName;
      const sessionToken = sessionService.generateNewSession();

      this.socket.emit('join-game', { gameId, playerName, sessionToken });

      // Set up one-time listeners for this specific join game attempt
      const successHandler = () => {
        this.socket?.off('join-game-success', successHandler);
        this.socket?.off('join-game-error', errorHandler);
        resolve();
      };

      const errorHandler = (response: any) => {
        this.socket?.off('join-game-success', successHandler);
        this.socket?.off('join-game-error', errorHandler);
        reject(new Error(response.error || 'Failed to join game'));
      };

      this.socket.once('join-game-success', successHandler);
      this.socket.once('join-game-error', errorHandler);
    });
  }

  // Toggle ready status
  public toggleReady(): Promise<{ isReady: boolean }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('toggle-ready', {}, (response: any) => {
        if (response.success) {
          resolve({ isReady: response.isReady });
        } else {
          reject(new Error(response.error || 'Failed to toggle ready status'));
        }
      });
    });
  }

  // Start the game
  public startGame(settings?: { roundTime?: number, noMaxTime?: boolean }): Promise<{ round: number }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('start-game', settings || {}, (response: any) => {
        if (response.success) {
          resolve({ round: response.round });
        } else {
          reject(new Error(response.error || 'Failed to start game'));
        }
      });
    });
  }

  // End turn
  public endTurn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('end-turn', {}, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to end turn'));
        }
      });
    });
  }

  // Submit vote
  public submitVote(targetPlayerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('submit-vote', { targetPlayerId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to submit vote'));
        }
      });
    });
  }

  // Start next round
  public nextRound(): Promise<{ round: number, gameOver: boolean }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('next-round', {}, (response: any) => {
        if (response.success) {
          resolve({
            round: response.round,
            gameOver: response.gameOver || false
          });
        } else {
          reject(new Error(response.error || 'Failed to start next round'));
        }
      });
    });
  }

  // Return to lobby
  public returnToLobby(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('return-to-lobby', {}, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to return to lobby'));
        }
      });
    });
  }

  // Disconnect
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected.value = false;
      this.gameState.value = null;
    }
  }

  // Set location packs
  public setLocationPacks(packIds: string[]): Promise<{ locationPacks: LocationPack[] }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('set-location-packs', { packIds }, (response: any) => {
        if (response.success) {
          if (this.gameState.value) {
            this.gameState.value.locationPacks = response.locationPacks;
          }
          resolve({ locationPacks: response.locationPacks });
        } else {
          reject(new Error(response.error || 'Failed to set location packs'));
        }
      });
    });
  }

  // Set round time
  public setRoundTime(minutes: number): Promise<{ roundTime: number }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      // Set a timeout for the socket emit
      const timeout = setTimeout(() => {
        reject(new Error('Server did not respond in time'));
      }, 4000);

      this.socket.emit('set-round-time', { minutes }, (response: any) => {
        clearTimeout(timeout);

        if (response && response.success) {
          if (this.gameState.value) {
            this.gameState.value.roundTime = response.roundTime || minutes;
          }
          resolve({ roundTime: response.roundTime || minutes });
        } else {
          // If the server doesn't support this feature yet, just resolve with the minutes
          // This allows the UI to work even if the server isn't updated
          console.warn('Server may not support set-round-time yet, using client value');
          if (this.gameState.value) {
            this.gameState.value.roundTime = minutes;
          }
          resolve({ roundTime: minutes });
        }
      });
    });
  }

  /**
   * Call for a vote to find the spy
   */
  public callForVote(): Promise<{ votingStarted: boolean }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('call-for-vote', {}, (response: any) => {
        if (response.success) {
          resolve({ votingStarted: response.votingStarted });
        } else {
          reject(new Error(response.error || 'Failed to call for vote'));
        }
      });
    });
  }

  /**
   * Spy makes a guess for the location
   */
  public makeSpyGuess(locationGuess: string): Promise<{ isCorrect: boolean, actualLocation: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('spy-guess', { locationGuess }, (response: any) => {
        if (response.success) {
          resolve({
            isCorrect: response.isCorrect,
            actualLocation: response.actualLocation
          });
        } else {
          reject(new Error(response.error || 'Failed to make spy guess'));
        }
      });
    });
  }

  /**
   * Get all possible locations for the current game
   */
  public getPossibleLocations(): Promise<{ locations: string[] }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('get-possible-locations', {}, (response: any) => {
        if (response.success) {
          resolve({ locations: response.locations });
        } else {
          reject(new Error(response.error || 'Failed to get locations'));
        }
      });
    });
  }

  /**
   * End the current round early (host only)
   */
  public endRoundEarly(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('end-round-early', {}, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to end round early'));
        }
      });
    });
  }

  /**
   * Leave the current game/party
   */
  public leaveGame(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve();
        return;
      }
      this.socket.emit('leave-game', {}, () => {
        this.gameState.value = null;
        this.playerId.value = null;
        this.playerName.value = '';
        resolve();
      });
    });
  }
}

// Export as singleton
export default new SocketService(); 