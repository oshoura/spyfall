const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { initializeSocketController } = require('./src/controllers/socketController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('Spyfall Game Server');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Initialize socket controller
initializeSocketController(io);

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
