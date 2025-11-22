import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setPlayerId(newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server');
    });

    // Game state updates
    newSocket.on('game-state-update', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    // Room events
    newSocket.on('room-created', (createdRoom) => {
      setRoom(createdRoom);
      addNotification(`Room ${createdRoom.roomCode} created!`, 'success');
    });

    newSocket.on('room-joined', (joinedRoom) => {
      setRoom(joinedRoom);
      addNotification(`Joined room ${joinedRoom.roomCode}!`, 'success');
    });

    newSocket.on('join-error', (data) => {
      setError(data.error);
      addNotification(data.error, 'error');
    });

    newSocket.on('player-joined', (data) => {
      addNotification(`${data.player.name} joined the room`, 'info');
    });

    newSocket.on('player-left', (data) => {
      addNotification(`${data.playerName} left the room`, 'info');
    });

    // Game events
    newSocket.on('game-started', (gameRoom) => {
      setRoom(gameRoom);
      addNotification('Game started! 화이팅!', 'success');
    });

    newSocket.on('round-started', (gameRoom) => {
      setRoom(gameRoom);
      addNotification(`Round ${gameRoom.round} started!`, 'info');
    });

    newSocket.on('round-complete', (data) => {
      addNotification(`Round ${data.round} complete! Score: ${data.teamScore}`, 'success');
    });

    newSocket.on('dish-completed', (data) => {
      addNotification(`${data.playerName} completed a dish! +${data.score} points`, 'success');
    });

    newSocket.on('dish-invalid', (data) => {
      addNotification(data.error, 'error');
    });

    newSocket.on('orders-expired', (data) => {
      addNotification(`Order expired! Lives: ${data.livesRemaining}`, 'warning');
    });

    newSocket.on('ingredient-passed', (data) => {
      // Visual feedback handled in components
    });

    newSocket.on('game-over', (results) => {
      addNotification(results.success ? '수고하셨습니다! (Good work!)' : 'Game Over', 
        results.success ? 'success' : 'error');
    });

    newSocket.on('error', (data) => {
      setError(data.message);
      addNotification(data.message, 'error');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Helper to add notifications
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Game actions
  const createRoom = useCallback((name) => {
    if (!socket) return;
    setPlayerName(name);
    socket.emit('create-room', { playerName: name });
  }, [socket]);

  const joinRoom = useCallback((code, name) => {
    if (!socket) return;
    setPlayerName(name);
    socket.emit('join-room', { roomCode: code.toUpperCase(), playerName: name });
  }, [socket]);

  const toggleReady = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('toggle-ready', { roomCode: room.roomCode });
  }, [socket, room]);

  const startGame = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('start-game', { roomCode: room.roomCode });
  }, [socket, room]);

  const passIngredient = useCallback((direction, ingredientId) => {
    if (!socket || !room) return;
    socket.emit('pass-ingredient', {
      roomCode: room.roomCode,
      direction,
      ingredientId
    });
  }, [socket, room]);

  const addToAssembly = useCallback((ingredientId) => {
    if (!socket || !room) return;
    socket.emit('add-to-assembly', {
      roomCode: room.roomCode,
      ingredientId
    });
  }, [socket, room]);

  const removeFromAssembly = useCallback((ingredientId) => {
    if (!socket || !room) return;
    socket.emit('remove-from-assembly', {
      roomCode: room.roomCode,
      ingredientId
    });
  }, [socket, room]);

  const submitDish = useCallback((orderId) => {
    if (!socket || !room) return;
    socket.emit('submit-dish', {
      roomCode: room.roomCode,
      orderId
    });
  }, [socket, room]);

  const continueRound = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('continue-round', {
      roomCode: room.roomCode
    });
  }, [socket, room]);

  const value = {
    socket,
    connected,
    room,
    playerId,
    playerName,
    error,
    notifications,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    passIngredient,
    addToAssembly,
    removeFromAssembly,
    submitDish,
    continueRound,
    clearError: () => setError(null)
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

