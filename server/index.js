const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const socketController = require('./src/controllers/socketController');

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).send('Spyfall game server alive');
});

// API endpoints for getting game data
app.get('/api/locations', (req, res) => {
  const locationPacks = require('./src/data/locations');
  res.status(200).json(locationPacks);
});

app.get('/api/games/:gameId', (req, res) => {
  const gameManager = require('./src/models/GameManager');
  const game = gameManager.getGame(req.params.gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // Return a safe version of the game state (no sensitive info)
  res.status(200).json(game.getStateForPlayer(null));
});

// Initialize socket controller
socketController(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
