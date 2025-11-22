import { v4 as uuidv4 } from 'uuid';

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> room state
  }

  generateRoomCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostId, hostName) {
    const roomCode = this.generateRoomCode();
    const room = {
      roomCode,
      hostId,
      players: [{
        id: hostId,
        name: hostName,
        position: 0,
        inventory: [],
        connected: true,
        ready: false
      }],
      activeOrders: [],
      currentAssemblies: {}, // playerId -> {ingredients: [], targetOrderId: null}
      round: 0,
      teamScore: 0,
      lives: 3,
      gameState: 'lobby',
      gameStartTime: null,
      orderTimers: {} // orderId -> {startTime, duration}
    };
    this.rooms.set(roomCode, room);
    console.log(`Room created: ${roomCode} by ${hostName}`);
    return room;
  }

  joinRoom(roomCode, playerId, playerName) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.players.length >= 8) {
      return { success: false, error: 'Room is full' };
    }

    if (room.gameState !== 'lobby') {
      return { success: false, error: 'Game already in progress' };
    }

    // Check if player already in room (reconnection)
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.connected = true;
      console.log(`Player reconnected: ${playerName} to room ${roomCode}`);
      return { success: true, room };
    }

    // Add new player
    const position = room.players.length;
    room.players.push({
      id: playerId,
      name: playerName,
      position,
      inventory: [],
      connected: true,
      ready: false
    });

    console.log(`Player joined: ${playerName} in room ${roomCode} at position ${position}`);
    return { success: true, room };
  }

  leaveRoom(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    console.log(`Player left: ${player.name} from room ${roomCode}`);

    if (room.gameState === 'lobby') {
      // Remove player completely in lobby
      room.players.splice(playerIndex, 1);
      
      // Reassign positions
      room.players.forEach((p, idx) => {
        p.position = idx;
      });

      // If host left, assign new host
      if (playerId === room.hostId && room.players.length > 0) {
        room.hostId = room.players[0].id;
        console.log(`New host: ${room.players[0].name}`);
      }

      // Delete room if empty
      if (room.players.length === 0) {
        this.rooms.delete(roomCode);
        console.log(`Room deleted: ${roomCode}`);
      }
    } else {
      // Mark as disconnected during game
      player.connected = false;
    }

    return room;
  }

  toggleReady(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    player.ready = !player.ready;
    console.log(`Player ${player.name} ready status: ${player.ready}`);
    return room;
  }

  canStartGame(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return false;

    if (room.players.length < 2) return false;
    
    // All players except host must be ready
    const nonHostPlayers = room.players.filter(p => p.id !== room.hostId);
    return nonHostPlayers.every(p => p.ready);
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  updateRoom(roomCode, updates) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    Object.assign(room, updates);
    return room;
  }

  getPlayerNeighbors(roomCode, playerId) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    const totalPlayers = room.players.length;
    const leftPos = (player.position - 1 + totalPlayers) % totalPlayers;
    const rightPos = (player.position + 1) % totalPlayers;

    return {
      left: room.players.find(p => p.position === leftPos),
      right: room.players.find(p => p.position === rightPos)
    };
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }
}

export default RoomManager;

