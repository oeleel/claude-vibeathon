import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import OrderDisplay from './OrderDisplay';
import FloatingIngredients from './FloatingIngredients';
import PassingZones from './PassingZones';
import TrashCan from './TrashCan';
import GameHeader from './GameHeader';
import Notifications from './Notifications';
import RoundComplete from './RoundComplete';
import GameOver from './GameOver';
import ServeZone from './ServeZone';
import styles from '../styles/GameScreen.module.css';

function GameScreen() {
  const navigate = useNavigate();
  const { room, playerId, socket } = useGame();

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }

    if (room.gameState === 'lobby') {
      navigate('/lobby');
    }

    if (room.gameState === 'calibration') {
      navigate('/calibration');
    }
  }, [room, navigate]);

  if (!room || !playerId) {
    return null;
  }

  if (room.gameState === 'ended') {
    return <GameOver />;
  }

  if (room.gameState === 'round-complete') {
    return <RoundComplete />;
  }

  const handleCombineIngredients = (sourceId, targetId) => {
    if (!socket || !room) return;
    socket.emit('combine-ingredients', {
      roomCode: room.roomCode,
      sourceId,
      targetId
    });
  };

  const handleServeDish = (ingredientId) => {
    if (!socket || !room) return;
    socket.emit('submit-dish', {
      roomCode: room.roomCode,
      ingredientId
    });
  };

  const handleDiscardIngredient = ({ floatingIngredientId }) => {
    if (!socket || !room || !floatingIngredientId) return;
    
    socket.emit('discard-ingredient', {
      roomCode: room.roomCode,
      ingredientId: floatingIngredientId
    });
  };

  return (
    <div className={styles.container}>
      <GameHeader 
        roomCode={room.roomCode}
        round={room.round}
        teamScore={room.teamScore}
        lives={room.lives}
      />

      <ServeZone onServe={() => {}} />

      <div className={styles.gameArea}>
        <OrderDisplay orders={room.activeOrders} />
        
        <FloatingIngredients 
          ingredients={room.playerIngredients?.[playerId] || []}
          onCombine={handleCombineIngredients}
          onServe={handleServeDish}
        />

        <PassingZones />

        <TrashCan onDiscard={handleDiscardIngredient} />
      </div>

      <Notifications />
    </div>
  );
}

export default GameScreen;

