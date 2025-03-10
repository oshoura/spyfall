import { io, Socket } from 'socket.io-client';
import { ref } from 'vue';

// Types
export interface Player {
  id: string;
  name: string;
  ready: boolean;
  hasVoted: boolean;
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
  results?: {
    votes: Map<string, number>;
    spyId: string;
    mostVotedId: string;
    spyWon: boolean;
    location: string;
    spyGuess?: string;
    spyGuessedCorrectly?: boolean;
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
  private socket: Socket | null = null;
  private serverUrl = 'http://localhost:3000';
  
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
    
    this.socket = io(this.serverUrl);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected.value = true;
      this.playerId.value = this.socket?.id || null;
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected.value = false;
    });
    
    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      this.error.value = 'Failed to connect to the server. Please try again.';
    });
    
    // Game events
    this.setupGameEvents();
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
      this.gameState.value = gameState;
    });
    
    // Phase change
    this.socket.on('phase-change', ({ phase }) => {
      if (this.gameState.value) {
        this.gameState.value.state = phase;
      }
    });
    
    // Turn ended
    this.socket.on('turn-ended', ({ nextPlayerId }) => {
      // This is handled by the UI
    });
    
    // Player voted
    this.socket.on('player-voted', ({ playerId }) => {
      if (this.gameState.value) {
        const player = this.gameState.value.players.find(p => p.id === playerId);
        if (player) {
          player.hasVoted = true;
        }
      }
    });
    
    // Voting complete
    this.socket.on('voting-complete', (gameState) => {
      this.gameState.value = gameState;
    });
    
    // Round started
    this.socket.on('round-started', (gameState) => {
      this.gameState.value = gameState;
    });
    
    // Game over
    this.socket.on('game-over', ({ rounds }) => {
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
    this.socket.on('vote-called', ({ playerId, voteCallers }) => {
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
      
      this.socket.emit('create-game', { playerName }, (response: any) => {
        if (response.success) {
          this.gameState.value = response.game;
          resolve({ gameId: response.gameId });
        } else {
          reject(new Error(response.error || 'Failed to create game'));
        }
      });
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
      
      this.socket.emit('join-game', { gameId, playerName }, (response: any) => {
        if (response.success) {
          this.gameState.value = response.game;
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join game'));
        }
      });
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
  public startGame(): Promise<{ round: number }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }
      
      this.socket.emit('start-game', {}, (response: any) => {
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
          resolve({ locationPacks: response.locationPacks });
        } else {
          reject(new Error(response.error || 'Failed to set location packs'));
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
}

// Export as singleton
export default new SocketService(); 