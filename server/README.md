# Spyfall Game Server

This is the backend server for the Spyfall game. It manages game lobbies, player connections, and game state using WebSockets for real-time communication.

## Features

- Create and join game lobbies
- Real-time player synchronization
- Game state management
- Role assignment (spy vs. non-spy)
- Timer management
- Voting system
- Multiple rounds

## Technologies

- Node.js
- Express
- Socket.io

## Project Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── socketController.js  # Socket.io event handlers
│   ├── data/
│   │   └── locations.js         # Game locations and roles
│   ├── models/
│   │   ├── Game.js              # Game state management
│   │   ├── GameManager.js       # Manages multiple games
│   │   └── Player.js            # Player state management
│   └── utils/
│       └── codeGenerator.js     # Generates unique game codes
├── index.js                     # Main server entry point
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

3. The server will be running at `http://localhost:3000`

## WebSocket Events

### Client to Server

- `create-game`: Create a new game lobby
- `join-game`: Join an existing game lobby
- `toggle-ready`: Toggle player ready status
- `start-game`: Start the game (host only)
- `end-turn`: End the current player's turn
- `submit-vote`: Submit a vote for who is the spy
- `next-round`: Start the next round (host only)
- `return-to-lobby`: Return to the lobby after game ends (host only)

### Server to Client

- `player-joined`: A new player joined the game
- `player-ready-changed`: A player's ready status changed
- `game-started`: The game has started
- `timer-update`: Timer update
- `phase-change`: Game phase changed
- `turn-ended`: A player's turn ended
- `player-voted`: A player has voted
- `voting-complete`: All players have voted
- `round-started`: A new round has started
- `game-over`: The game has ended
- `returned-to-lobby`: The game has returned to lobby
- `player-left`: A player has left the game 