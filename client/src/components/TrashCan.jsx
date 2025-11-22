import React, { useState } from 'react';
import styles from '../styles/TrashCan.module.css';

function TrashCan({ onDiscard }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const floatingIngredientId = e.dataTransfer.getData('sourceIngredientId');
    
    if (floatingIngredientId) {
      onDiscard({ floatingIngredientId });
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
      className={`${styles.trashCan} ${dragOver ? styles.active : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={styles.icon}>🗑️</div>
      {dragOver && <div className={styles.label}>Drop to Trash</div>}
    </div>
  );
}

export default TrashCan;

