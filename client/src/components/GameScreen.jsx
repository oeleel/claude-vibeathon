import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import OrderDisplay from './OrderDisplay';
import WorkArea from './WorkArea';
import PlayerInventory from './PlayerInventory';
import GameHeader from './GameHeader';
import Notifications from './Notifications';
import RoundComplete from './RoundComplete';
import GameOver from './GameOver';
import styles from '../styles/GameScreen.module.css';

function GameScreen() {
  const navigate = useNavigate();
  const { room, playerId } = useGame();

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }

    if (room.gameState === 'lobby') {
      navigate('/lobby');
    }
  }, [room, navigate]);

  if (!room || !playerId) {
    return null;
  }

  const currentPlayer = room.players.find(p => p.id === playerId);
  const currentAssembly = room.currentAssemblies?.[playerId] || { ingredients: [], targetOrderId: null };

  if (room.gameState === 'ended') {
    return <GameOver />;
  }

  if (room.gameState === 'round-complete') {
    return <RoundComplete />;
  }

  return (
    <div className={styles.container}>
      <GameHeader 
        roomCode={room.roomCode}
        round={room.round}
        teamScore={room.teamScore}
        lives={room.lives}
      />

      <div className={styles.gameArea}>
        <OrderDisplay orders={room.activeOrders} />
        
        <WorkArea 
          assembly={currentAssembly}
          orders={room.activeOrders}
        />
        
        <PlayerInventory 
          player={currentPlayer}
          neighbors={getNeighbors(room, playerId)}
        />
      </div>

      <Notifications />
    </div>
  );
}

// Helper to get left and right neighbors
function getNeighbors(room, playerId) {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { left: null, right: null };

  const totalPlayers = room.players.length;
  const leftPos = (player.position - 1 + totalPlayers) % totalPlayers;
  const rightPos = (player.position + 1) % totalPlayers;

  return {
    left: room.players.find(p => p.position === leftPos),
    right: room.players.find(p => p.position === rightPos)
  };
}

export default GameScreen;

