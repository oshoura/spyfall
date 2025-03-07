# Spyfall Game

A real-time multiplayer implementation of the popular party game Spyfall. In this game, players are assigned roles at a specific location, except for one player who is the spy. The spy's goal is to figure out the location, while other players try to identify the spy through careful questioning.

## Features

- Create and join game lobbies with unique codes
- Real-time multiplayer gameplay
- Multiple locations and roles
- Timer for each round
- Voting system to identify the spy
- Multiple rounds with different locations

## Project Structure

The project is divided into two main parts:

- `client/`: Vue.js frontend application
- `server/`: Node.js backend server

## Technologies Used

### Frontend
- Vue 3 with Composition API
- Vue Router
- Vite
- TypeScript
- Socket.io client

### Backend
- Node.js
- Express
- Socket.io
- JavaScript

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/spyfall.git
   cd spyfall
   ```

2. Install dependencies for both client and server:
   ```
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. Start the development servers:

   In one terminal, start the backend server:
   ```
   cd server
   npm run dev
   ```

   In another terminal, start the frontend development server:
   ```
   cd client
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the client terminal (typically http://localhost:5173)

## How to Play

1. **Create a Party**: The first player creates a party and gets a unique party code
2. **Invite Friends**: Share the party code with friends so they can join
3. **Start the Game**: Once everyone is ready, the host starts the game
4. **Gameplay**:
   - Everyone except the spy sees the location and their role
   - Players take turns asking each other questions about the location
   - The spy tries to blend in without revealing they don't know the location
   - Other players try to identify the spy without giving away the location
5. **Voting**: After the timer ends, players vote on who they think is the spy
6. **Results**: The spy is revealed, and points are awarded
7. **Next Round**: Play multiple rounds with different locations and a new spy each time

## License

This project is licensed under the MIT License - see the LICENSE file for details.