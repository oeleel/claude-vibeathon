import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useIngredientSharing } from '../hooks/useIngredientSharing';
import styles from '../styles/PassingZones.module.css';

function PassingZones() {
  const { socket, room, playerId } = useGame();
  const { getPlayerNeighbors } = useIngredientSharing();
  const [leftDragOver, setLeftDragOver] = useState(false);
  const [rightDragOver, setRightDragOver] = useState(false);

  const neighbors = getPlayerNeighbors();

  const handleDrop = (e, direction) => {
    e.preventDefault();
    
    if (direction === 'left') {
      setLeftDragOver(false);
    } else {
      setRightDragOver(false);
    }
    
    const ingredientId = e.dataTransfer.getData('sourceIngredientId');
    if (!ingredientId || !socket || !room) return;

    const targetPlayer = direction === 'left' ? neighbors.left : neighbors.right;
    if (!targetPlayer) return;

    socket.emit('pass-ingredient-to-player', {
      roomCode: room.roomCode,
      ingredientId,
      targetPlayerId: targetPlayer.id,
      direction
    });
  };

  const handleDragOver = (e, direction) => {
    e.preventDefault();
    if (direction === 'left') {
      setLeftDragOver(true);
    } else {
      setRightDragOver(true);
    }
  };

  const handleDragLeave = (direction) => {
    if (direction === 'left') {
      setLeftDragOver(false);
    } else {
      setRightDragOver(false);
    }
  };

  return (
    <>
      {/* Left Passing Zone */}
      <div
        className={`${styles.passingZone} ${styles.left} ${leftDragOver ? styles.active : ''} ${!neighbors.left ? styles.disabled : ''}`}
        onDrop={(e) => handleDrop(e, 'left')}
        onDragOver={(e) => handleDragOver(e, 'left')}
        onDragLeave={() => handleDragLeave('left')}
      >
        <div className={styles.arrow}>←</div>
        <div className={styles.label}>
          {neighbors.left ? (
            <>
              <div className={styles.direction}>Pass Left</div>
              <div className={styles.playerName}>{neighbors.left.name}</div>
            </>
          ) : (
            <div className={styles.direction}>No neighbor</div>
          )}
        </div>
      </div>

      {/* Right Passing Zone */}
      <div
        className={`${styles.passingZone} ${styles.right} ${rightDragOver ? styles.active : ''} ${!neighbors.right ? styles.disabled : ''}`}
        onDrop={(e) => handleDrop(e, 'right')}
        onDragOver={(e) => handleDragOver(e, 'right')}
        onDragLeave={() => handleDragLeave('right')}
      >
        <div className={styles.arrow}>→</div>
        <div className={styles.label}>
          {neighbors.right ? (
            <>
              <div className={styles.direction}>Pass Right</div>
              <div className={styles.playerName}>{neighbors.right.name}</div>
            </>
          ) : (
            <div className={styles.direction}>No neighbor</div>
          )}
        </div>
      </div>
    </>
  );
}

export default PassingZones;

