import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import styles from '../styles/ServeZone.module.css';

function ServeZone() {
  const [dragOver, setDragOver] = useState(false);
  const { socket, room } = useGame();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const ingredientId = e.dataTransfer.getData('sourceIngredientId');
    if (ingredientId && socket && room) {
      socket.emit('submit-dish', {
        roomCode: room.roomCode,
        ingredientId
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div 
      className={`${styles.serveZone} ${dragOver ? styles.active : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={styles.content}>
        <span className={styles.icon}>🍴</span>
        <span className={styles.text}>
          {dragOver ? 'Drop to Serve!' : 'Drag Completed Dish Here to Serve'}
        </span>
        <span className={styles.icon}>🍴</span>
      </div>
    </div>
  );
}

export default ServeZone;

