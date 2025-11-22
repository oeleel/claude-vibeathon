import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import RoomManager from './roomManager.js';
import GameLogic from './gameLogic.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

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

  // Start game
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

    // Initialize first round
    const roundData = gameLogic.initializeRound(room);
    roomManager.updateRoom(roomCode, roundData);
    
    io.to(roomCode).emit('game-started', room);
    broadcastRoomState(roomCode);
    
    // Start game timer
    startGameTimer(roomCode);
    
    console.log(`Game started in room ${roomCode}`);
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

  // Add ingredient to assembly
  socket.on('add-to-assembly', (data) => {
    const { roomCode, ingredientId } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const result = gameLogic.addToAssembly(room, socket.id, ingredientId);
    
    if (result.success) {
      broadcastRoomState(roomCode);
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // Remove ingredient from assembly
  socket.on('remove-from-assembly', (data) => {
    const { roomCode, ingredientId } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const result = gameLogic.removeFromAssembly(room, socket.id, ingredientId);
    
    if (result.success) {
      broadcastRoomState(roomCode);
    }
  });

  // Submit completed dish
  socket.on('submit-dish', (data) => {
    const { roomCode, orderId } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (!room) return;

    const assembly = room.currentAssemblies[socket.id];
    if (!assembly) return;

    const validation = gameLogic.validateDish(assembly.ingredients, orderId, room);
    
    if (validation.valid) {
      // Remove completed order
      const orderIndex = room.activeOrders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        room.activeOrders.splice(orderIndex, 1);
      }

      // Add score
      room.teamScore += validation.score;

      // Clear assembly
      room.currentAssemblies[socket.id] = { ingredients: [], targetOrderId: null };

      io.to(roomCode).emit('dish-completed', {
        orderId: orderId,
        score: validation.score,
        totalScore: room.teamScore,
        playerName: room.players.find(p => p.id === socket.id)?.name
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

