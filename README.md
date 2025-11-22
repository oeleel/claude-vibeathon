# Korean Kitchen Party 🍜🎮

A real-time cooperative cooking game where 2-8 players work together to prepare authentic Korean dishes in a chaotic kitchen environment!

## 🎯 Game Overview

Players connect from separate computers and collaborate to complete Korean dish orders before time runs out. Pass ingredients between connected "stations", assemble dishes, and score points as a team!

### Features

- **Real-time Multiplayer**: 2-8 players on separate computers
- **Korean Cuisine**: Authentic dishes like Bibimbap, Kimchi Jjigae, Tteokbokki, Japchae, and more
- **Cooperative Gameplay**: Pass ingredients to neighbors, work together to complete orders
- **Progressive Difficulty**: 10 rounds with increasing complexity
- **Team Scoring**: Work together to achieve high scores

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 📚 Documentation

- [`ENV_VARIABLES.md`](./ENV_VARIABLES.md) - Environment variable configuration
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Full deployment guide for Render
- [`TESTING.md`](./TESTING.md) - Comprehensive testing checklist

### Installation

1. **Install Server Dependencies**

```bash
cd server
npm install
```

2. **Install Client Dependencies**

```bash
cd client
npm install
```

### Running the Game

You need to run both the server and client:

**Terminal 1 - Start the Backend Server:**

```bash
cd server
npm run dev
```

Server will run on `http://localhost:3001`

**Terminal 2 - Start the Frontend Client:**

```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

### Playing Locally with Multiple Players

To test multiplayer locally, open multiple browser windows/tabs or use different browsers:

1. Open `http://localhost:5173` in multiple browser windows
2. In the first window, click "Create Room"
3. Share the room code with other windows
4. In other windows, click "Join Room" and enter the code
5. Once 2+ players are ready, the host can start the game!

**Tip**: Use Chrome's Incognito mode or different browsers to simulate multiple players on one computer.

## 🎮 How to Play

### Lobby

1. **Create or Join**: Host creates a room and gets a 4-character code, others join with that code
2. **Ready Up**: Non-host players click "Ready Up"
3. **Start**: Host starts the game when 2+ players are ready

### Gameplay

1. **View Orders**: Active Korean dishes appear at the top with required ingredients
2. **Check Inventory**: See your ingredients at the bottom
3. **Pass Ingredients**: 
   - Click to select an ingredient
   - Press `A` or `←` to pass left
   - Press `D` or `→` to pass right
4. **Assemble Dishes**:
   - Drag ingredients from inventory to the plate
   - Or double-click ingredient to add to plate
   - Select which dish you're making from dropdown
5. **Submit**: Click "Submit Dish" when complete
6. **Complete Orders**: Before the timer runs out!

### Scoring

- Base points per dish (100-200 depending on difficulty)
- Speed bonus for fast completion (+20%)
- Lose a life if order expires
- Game ends at 0 lives or after 10 rounds

### Controls

- **Select Ingredient**: Click on ingredient in inventory
- **Pass Left**: `A` or `←` (Left Arrow)
- **Pass Right**: `D` or `→` (Right Arrow)
- **Add to Plate**: Double-click ingredient or drag to work area
- **Remove from Plate**: Click on ingredient in work area

## 📁 Project Structure

```
claude-vibeathon/
├── server/                    # Backend Node.js server
│   ├── index.js              # Main server with Socket.io
│   ├── roomManager.js        # Room/lobby management
│   ├── gameLogic.js          # Game mechanics and logic
│   ├── recipes.js            # Korean recipe definitions
│   └── package.json
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LobbyScreen.jsx
│   │   │   ├── GameScreen.jsx
│   │   │   ├── OrderDisplay.jsx
│   │   │   ├── WorkArea.jsx
│   │   │   ├── PlayerInventory.jsx
│   │   │   └── ...
│   │   ├── context/          # Game state context
│   │   │   └── GameContext.jsx
│   │   ├── styles/           # CSS modules
│   │   ├── utils/            # Helper functions
│   │   │   └── ingredientData.js
│   │   ├── assets/           # Korean cultural assets
│   │   │   ├── images/
│   │   │   ├── sounds/
│   │   │   └── fonts/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🍚 Korean Dishes

### Easy Dishes (100 points)
- **Bibimbap (비빔밥)**: Mixed rice with vegetables, beef, and egg
- **Kimbap (김밥)**: Seaweed rice rolls

### Medium Dishes (140-160 points)
- **Kimchi Jjigae (김치찌개)**: Kimchi stew with pork and tofu
- **Tteokbokki (떡볶이)**: Spicy rice cakes with fish cake
- **Japchae (잡채)**: Stir-fried glass noodles with vegetables
- **Bulgogi (불고기)**: Marinated beef BBQ

## 🔧 Technical Details

### Technologies Used

**Frontend:**
- React 18 with hooks
- React Router for navigation
- Socket.io Client for real-time communication
- CSS Modules for styling
- Vite for fast development

**Backend:**
- Node.js with Express
- Socket.io for WebSocket communication
- ES6 modules

### Architecture

- **Client-Server Model**: Centralized server maintains authoritative game state
- **WebSocket Communication**: Real-time bidirectional updates
- **Circular Player Topology**: Players arranged in a circle, can pass to left/right neighbors
- **State Synchronization**: Server broadcasts state updates to all clients on every change

### Key Game Mechanics

1. **Ingredient Distribution**: Fair random distribution ensuring collaboration is required
2. **Order Generation**: Difficulty scales with round number
3. **Timer Management**: Server-authoritative with client interpolation
4. **Validation**: Server validates all dish submissions

## 🎨 Customization

### Adding Custom Assets

The game is set up to support custom Korean cultural assets. Add your files to:

```
client/src/assets/
├── images/
│   ├── ingredients/       # PNG/SVG ingredient icons
│   ├── dishes/            # Completed dish images
│   └── backgrounds/       # Kitchen backgrounds
├── sounds/
│   ├── fx/                # Cooking sounds, passing effects
│   └── music/             # Background music
└── fonts/
    └── korean/            # Korean typography
```

Currently, the game uses emoji placeholders for ingredients. To use custom images, update the `ingredientData.js` file to reference image paths instead of emoji.

## 🐛 Troubleshooting

### Server won't start
- Make sure you're in the `server` directory
- Run `npm install` to install dependencies
- Check that port 3001 is not in use

### Client won't connect
- Ensure the server is running first
- Check that both are using the correct ports (client: 5173, server: 3001)
- Clear browser cache and reload

### Players can't join room
- Verify room code is entered correctly (case-sensitive)
- Make sure room is in lobby state (not already in game)
- Check that room isn't full (8 player max)

### Game lags or disconnects
- Check network connection
- Ensure server isn't overloaded
- For production use, deploy to proper hosting with good network infrastructure

## 🚀 Future Enhancements (Not in MVP)

- Achievement system and player statistics
- Special game modes (Pojangmacha Rush, Kimjang Festival)
- Unlockable content (new dishes, kitchen themes)
- Mobile responsiveness
- Voice chat integration
- Leaderboards
- More Korean dishes and ingredients
- Royal court cuisine (궁중음식) difficulty tier

## 📝 License

MIT License - Feel free to use and modify for your projects!

## 🙏 Acknowledgments

- Korean cuisine and cultural elements
- Inspired by cooperative party games like Overcooked
- Built with love for Korean food! 🇰🇷

---

**Enjoy cooking together! 화이팅! (Fighting!)**

