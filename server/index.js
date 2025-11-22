import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import RoomManager from './roomManager.js';
import GameLogic from './gameLogic.js';
import { getRandomSafePosition, constrainPosition } from './utils/boundaries.js';

const app = express();
const httpServer = createServer(app);

// Configure CORS for production and development
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const roomManager = new RoomManager();
const gameLogic = new GameLogic();

// Store timer intervals for each room
const roomTimers = new Map();

// Helper function to broadcast room state to all players
function broadcastRoomState(roomCode) {
  const room = roomManager.getRoom(roomCode);
  if (room) {
    io.to(roomCode).emit('game-state-update', room);
  }
}

// Start game timer for a room
function startGameTimer(roomCode) {
  // Clear existing timer if any
  if (roomTimers.has(roomCode)) {
    clearInterval(roomTimers.get(roomCode));
  }

  const timer = setInterval(() => {
    const room = roomManager.getRoom(roomCode);
    if (!room || room.gameState !== 'active') {
      clearInterval(timer);
      roomTimers.delete(roomCode);
      return;
    }

    // Update timers
    const result = gameLogic.updateTimers(room, 1);
    
    // Broadcast expired orders if any
    if (result.expiredOrders.length > 0) {
      io.to(roomCode).emit('orders-expired', {
        orders: result.expiredOrders,
        livesRemaining: result.livesRemaining
      });
    }

    // Check if game is over
    if (gameLogic.isGameOver(room)) {
      room.gameState = 'ended';
      const results = gameLogic.calculateResults(room);
      io.to(roomCode).emit('game-over', results);
      clearInterval(timer);
      roomTimers.delete(roomCode);
    }
    // Check if round is complete
    else if (gameLogic.isRoundComplete(room)) {
      room.gameState = 'round-complete';
      io.to(roomCode).emit('round-complete', {
        round: room.round,
        teamScore: room.teamScore
      });
      clearInterval(timer);
      roomTimers.delete(roomCode);
    }

    broadcastRoomState(roomCode);
  }, 1000);

  roomTimers.set(roomCode, timer);
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create room
  socket.on('create-room', (data) => {
    const { playerName } = data;
    const room = roomManager.createRoom(socket.id, playerName);
    
    socket.join(room.roomCode);
    socket.emit('room-created', room);
    
    console.log(`Room ${room.roomCode} created by ${playerName}`);
  });

  // Join room
  socket.on('join-room', (data) => {
    const { roomCode, playerName } = data;
    const result = roomManager.joinRoom(roomCode, socket.id, playerName);
    
    if (result.success) {
      socket.join(roomCode);
      socket.emit('room-joined', result.room);
      broadcastRoomState(roomCode);
      
      // Notify others
      socket.to(roomCode).emit('player-joined', {
        player: result.room.players[result.room.players.length - 1]
      });
    } else {
      socket.emit('join-error', { error: result.error });
    }
  });

  // Toggle ready status
  socket.on('toggle-ready', (data) => {
    const { roomCode } = data;
    const room = roomManager.toggleReady(roomCode, socket.id);
    
    if (room) {
      broadcastRoomState(roomCode);
    }
  });

  // Start game (enters calibration phase or starts directly for 2 players)
  socket.on('start-game', (data) => {
    const { roomCode } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      socket.emit('error', { message: 'Only host can start game' });
      return;
    }

    if (!roomManager.canStartGame(roomCode)) {
      socket.emit('error', { message: 'Not all players are ready' });
      return;
    }

    // If only 2 players, skip calibration and start directly
    if (room.players.length === 2) {
      // Initialize first round
      const roundData = gameLogic.initializeRound(room);
      roomManager.updateRoom(roomCode, roundData);
      
      io.to(roomCode).emit('game-started', room);
      broadcastRoomState(roomCode);
      
      // Start game timer
      startGameTimer(roomCode);
      
      console.log(`Game started directly in room ${roomCode} (2 players, no calibration needed)`);
      return;
    }

    // 3+ players: Enter calibration phase
    const allIngredients = gameLogic.getAllIngredientIds();
    const shuffled = [...allIngredients].sort(() => Math.random() - 0.5);
    
    room.players.forEach((player, idx) => {
      player.calibrationIngredient = shuffled[idx % shuffled.length];
      player.calibrationComplete = false;
    });
    
    room.calibrationIngredients = room.players.map(p => p.calibrationIngredient);
    room.gameState = 'calibration';
    
    io.to(roomCode).emit('calibration-started', room);
    broadcastRoomState(roomCode);
    
    console.log(`Calibration phase started in room ${roomCode} (${room.players.length} players)`);
  });

  // Submit calibration data
  socket.on('submit-calibration', (data) => {
    const { roomCode, leftIngredient, rightIngredient } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.leftIngredient = leftIngredient;
    player.rightIngredient = rightIngredient;
    player.calibrationComplete = true;

    console.log(`${player.name} completed calibration - Left: ${leftIngredient}, Right: ${rightIngredient}`);
    broadcastRoomState(roomCode);
  });

  // Start calibrated game
  socket.on('start-calibrated-game', (data) => {
    const { roomCode } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room || room.hostId !== socket.id) return;

    // Verify all players completed calibration
    const allComplete = room.players.every(p => p.calibrationComplete);
    if (!allComplete) {
      socket.emit('error', { message: 'Not all players have completed calibration' });
      return;
    }

    // Initialize first round
    const roundData = gameLogic.initializeRound(room);
    roomManager.updateRoom(roomCode, roundData);
    
    io.to(roomCode).emit('game-started', room);
    broadcastRoomState(roomCode);
    
    // Start game timer
    startGameTimer(roomCode);
    
    console.log(`Game started in room ${roomCode} after calibration`);
  });

  // Pass ingredient to neighbor
  socket.on('pass-ingredient', (data) => {
    const { roomCode, direction, ingredientId } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const neighbors = roomManager.getPlayerNeighbors(roomCode, socket.id);
    if (!neighbors) return;

    const toPlayer = direction === 'left' ? neighbors.left : neighbors.right;
    
    const result = gameLogic.passIngredient(room, socket.id, toPlayer.id, ingredientId);
    
    if (result.success) {
      io.to(roomCode).emit('ingredient-passed', {
        fromPlayerId: socket.id,
        toPlayerId: toPlayer.id,
        ingredientId: ingredientId,
        direction: direction
      });
      
      broadcastRoomState(roomCode);
    }
  });

  // Combine ingredients
  socket.on('combine-ingredients', (data) => {
    const { roomCode, sourceId, targetId } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const playerIngredients = room.playerIngredients[socket.id] || [];
    const sourceIngredient = playerIngredients.find(i => i.id === sourceId);
    const targetIngredient = playerIngredients.find(i => i.id === targetId);
    
    if (!sourceIngredient || !targetIngredient) {
      socket.emit('error', { message: 'Ingredient not found' });
      return;
    }

    // Combine: add source's ingredients to target
    if (!targetIngredient.combinedWith) {
      targetIngredient.combinedWith = [];
    }
    
    // Preserve target's position - make sure it doesn't move!
    const originalX = targetIngredient.x;
    const originalY = targetIngredient.y;
    
    // Add source ingredient
    targetIngredient.combinedWith.push(sourceIngredient.ingredientId);
    
    // Add any ingredients that were combined into source
    if (sourceIngredient.combinedWith && sourceIngredient.combinedWith.length > 0) {
      targetIngredient.combinedWith.push(...sourceIngredient.combinedWith);
    }
    
    // Ensure position hasn't changed
    targetIngredient.x = originalX;
    targetIngredient.y = originalY;
    
    // Remove source ingredient from player's list
    room.playerIngredients[socket.id] = playerIngredients.filter(i => i.id !== sourceId);

    io.to(roomCode).emit('ingredients-combined', {
      playerId: socket.id,
      sourceId,
      targetId,
      combinedIngredients: [targetIngredient.ingredientId, ...targetIngredient.combinedWith]
    });

    broadcastRoomState(roomCode);
  });

  // Pass ingredient to another player
  socket.on('pass-ingredient-to-player', (data) => {
    const { roomCode, ingredientId, targetPlayerId, direction } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const senderIngredients = room.playerIngredients[socket.id] || [];
    const ingredient = senderIngredients.find(i => i.id === ingredientId);
    
    if (!ingredient) {
      socket.emit('error', { message: 'Ingredient not found' });
      return;
    }

    // Remove from sender
    room.playerIngredients[socket.id] = senderIngredients.filter(i => i.id !== ingredientId);

    // Add to receiver
    if (!room.playerIngredients[targetPlayerId]) {
      room.playerIngredients[targetPlayerId] = [];
    }
    
    // Update owner and randomize position on receiver's screen
    ingredient.ownerId = targetPlayerId;
    const newPosition = getRandomSafePosition();
    ingredient.x = newPosition.x;
    ingredient.y = newPosition.y;
    
    room.playerIngredients[targetPlayerId].push(ingredient);

    const senderName = room.players.find(p => p.id === socket.id)?.name;
    const receiverName = room.players.find(p => p.id === targetPlayerId)?.name;
    
    io.to(roomCode).emit('ingredient-passed-between-players', {
      fromPlayerId: socket.id,
      toPlayerId: targetPlayerId,
      ingredientId: ingredient.ingredientId,
      direction
    });

    console.log(`${senderName} passed ${ingredient.ingredientId} to ${receiverName} (${direction})`);
    broadcastRoomState(roomCode);
  });

  // Discard ingredient (trash can)
  socket.on('discard-ingredient', (data) => {
    const { roomCode, ingredientId } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const playerIngredients = room.playerIngredients[socket.id] || [];
    const ingredient = playerIngredients.find(i => i.id === ingredientId);
    
    if (!ingredient) {
      socket.emit('error', { message: 'Ingredient not found' });
      return;
    }

    // Remove from player's ingredients
    room.playerIngredients[socket.id] = playerIngredients.filter(i => i.id !== ingredientId);

    console.log(`${room.players.find(p => p.id === socket.id)?.name} discarded ingredient ${ingredient.ingredientId}`);
    broadcastRoomState(roomCode);
  });

  // Disassemble dish (double-click on assembled plate)
  socket.on('disassemble-dish', (data) => {
    const { roomCode, ingredientId } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const playerIngredients = room.playerIngredients[socket.id] || [];
    const plateIngredient = playerIngredients.find(i => i.id === ingredientId);
    
    if (!plateIngredient || !plateIngredient.combinedWith || plateIngredient.combinedWith.length === 0) {
      socket.emit('error', { message: 'Not a combined dish or ingredient not found' });
      return;
    }

    // Get all ingredients from the plate
    const allIngredients = [plateIngredient.ingredientId, ...plateIngredient.combinedWith];
    
    // Remove the plate
    room.playerIngredients[socket.id] = playerIngredients.filter(i => i.id !== ingredientId);

    // Create individual ingredients from the disassembled plate
    allIngredients.forEach((ingId, index) => {
      // Spread ingredients around the original plate position, but constrain to safe area
      const offsetX = (index % 3) * 8 - 8; // -8, 0, or +8
      const offsetY = Math.floor(index / 3) * 6 - 3; // -3, 3, 9, etc
      const rawX = plateIngredient.x + offsetX;
      const rawY = plateIngredient.y + offsetY;
      const safePos = constrainPosition(rawX, rawY);
      
      const newIngredient = {
        id: uuidv4(),
        ingredientId: ingId,
        ownerId: socket.id,
        x: safePos.x,
        y: safePos.y,
        combinedWith: []
      };
      room.playerIngredients[socket.id].push(newIngredient);
    });

    const playerName = room.players.find(p => p.id === socket.id)?.name;
    console.log(`${playerName} disassembled a dish with ${allIngredients.length} ingredients`);
    
    io.to(roomCode).emit('dish-disassembled', {
      playerId: socket.id,
      ingredientCount: allIngredients.length
    });
    
    broadcastRoomState(roomCode);
  });

  // Submit completed dish (auto-matches against any order)
  socket.on('submit-dish', (data) => {
    const { roomCode, ingredientId } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const playerIngredients = room.playerIngredients[socket.id] || [];
    const ingredient = playerIngredients.find(i => i.id === ingredientId);
    
    if (!ingredient) {
      socket.emit('error', { message: 'Ingredient not found' });
      return;
    }

    // Get all combined ingredients (including the base ingredient)
    const allIngredients = [ingredient.ingredientId, ...(ingredient.combinedWith || [])];

    const validation = gameLogic.validateDish(allIngredients, room);
    
    if (validation.valid) {
      // Remove completed order
      const orderIndex = room.activeOrders.findIndex(o => o.id === validation.order.id);
      if (orderIndex !== -1) {
        room.activeOrders.splice(orderIndex, 1);
      }

      // Add score
      room.teamScore += validation.score;

      // Remove the completed dish ingredient from player's list
      room.playerIngredients[socket.id] = playerIngredients.filter(i => i.id !== ingredientId);

      io.to(roomCode).emit('dish-completed', {
        orderId: validation.order.id,
        dishName: validation.order.nameEN,
        score: validation.score,
        totalScore: room.teamScore,
        playerName: room.players.find(p => p.id === socket.id)?.name,
        ingredientId
      });

      broadcastRoomState(roomCode);

      console.log(`Dish completed in room ${roomCode}: ${validation.order.nameEN}`);
    } else {
      socket.emit('dish-invalid', { error: validation.error });
    }
  });

  // Continue to next round
  socket.on('continue-round', (data) => {
    const { roomCode } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room || room.hostId !== socket.id) return;

    if (gameLogic.isGameOver(room)) {
      socket.emit('error', { message: 'Game is over' });
      return;
    }

    // Initialize next round
    const roundData = gameLogic.initializeRound(room);
    roomManager.updateRoom(roomCode, roundData);
    
    io.to(roomCode).emit('round-started', room);
    broadcastRoomState(roomCode);
    
    // Start game timer
    startGameTimer(roomCode);
    
    console.log(`Round ${room.round} started in room ${roomCode}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Find which room the player was in
    const rooms = roomManager.getAllRooms();
    rooms.forEach(room => {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        roomManager.leaveRoom(room.roomCode, socket.id);
        
        socket.to(room.roomCode).emit('player-left', {
          playerId: socket.id,
          playerName: player.name
        });
        
        broadcastRoomState(room.roomCode);
      }
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: roomManager.getAllRooms().length });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Korean Kitchen Party server running on port ${PORT}`);
});

