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

## Location Packs

The game includes several location packs:

- **Basic Locations**: Common everyday locations like School, Hospital, Restaurant, etc.
- **Advanced Locations**: More unique and challenging locations like Space Station, Submarine, Casino, etc.
- **Tourist Attractions**: Famous landmarks and tourist destinations like Eiffel Tower, Pyramids of Giza, etc.

The host can select which location packs to use for the game.

## Image Generation

The game includes a script to generate images for all locations using OpenAI's DALL-E API. To generate the images:

1. Navigate to the scripts directory:
   ```
   cd scripts
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set your OpenAI API key:
   ```
   export OPENAI_API_KEY=your_api_key_here
   ```

4. Run the script:
   ```
   npm run generate-images
   ```

See the [scripts README](scripts/README.md) for more details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.