import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getIngredient } from '../utils/ingredientData';
import styles from '../styles/PlayerInventory.module.css';

function PlayerInventory({ player, neighbors }) {
  const { passIngredient, addToAssembly } = useGame();
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [passingAnimation, setPassingAnimation] = useState(null);

  // Keyboard shortcuts for passing
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedIngredient) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePass('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handlePass('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedIngredient]);

  const handlePass = (direction) => {
    if (!selectedIngredient) {
      alert('Select an ingredient first!');
      return;
    }

    passIngredient(direction, selectedIngredient);
    setPassingAnimation(direction);
    setSelectedIngredient(null);

    setTimeout(() => setPassingAnimation(null), 600);
  };

  const handleDragStart = (e, ingredientId) => {
    e.dataTransfer.setData('ingredientId', ingredientId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleIngredientClick = (ingredientId) => {
    if (selectedIngredient === ingredientId) {
      // Double-click to add to assembly
      addToAssembly(ingredientId);
      setSelectedIngredient(null);
    } else {
      setSelectedIngredient(ingredientId);
    }
  };

  if (!player) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Ingredients 🧺</h2>
        <div className={styles.neighborInfo}>
          <span className={styles.neighbor}>← {neighbors.left?.name || 'None'}</span>
          <span className={styles.you}>You: {player.name}</span>
          <span className={styles.neighbor}>{neighbors.right?.name || 'None'} →</span>
        </div>
      </div>

      <div className={styles.inventoryGrid}>
        {player.inventory.length === 0 ? (
          <div className={styles.emptyInventory}>
            <p>No ingredients</p>
            <p className={styles.hint}>Wait for other players to pass ingredients</p>
          </div>
        ) : (
          player.inventory.map((ingredientId, idx) => {
            const ingredient = getIngredient(ingredientId);
            const isSelected = selectedIngredient === ingredientId;

            return (
              <div
                key={`${ingredientId}-${idx}`}
                className={`${styles.ingredientCard} ${isSelected ? styles.selected : ''} ${passingAnimation ? styles.passing : ''}`}
                onClick={() => handleIngredientClick(ingredientId)}
                draggable
                onDragStart={(e) => handleDragStart(e, ingredientId)}
                title={`${ingredient.nameKR} (${ingredient.nameEN})\nClick to select, double-click to add to plate`}
              >
                <div className={styles.ingredientEmoji}>{ingredient.emoji}</div>
                <div className={styles.ingredientNames}>
                  <div className={styles.ingredientKR}>{ingredient.nameKR}</div>
                  <div className={styles.ingredientEN}>{ingredient.nameEN}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedIngredient && (
        <div className={styles.actions}>
          <p className={styles.actionHint}>
            Selected: <strong>{getIngredient(selectedIngredient).nameEN}</strong>
          </p>
          <div className={styles.passButtons}>
            <button 
              className={`${styles.passButton} ${styles.passLeft}`}
              onClick={() => handlePass('left')}
              disabled={!neighbors.left}
            >
              ← Pass Left (A)
              <span className={styles.passTo}>{neighbors.left?.name}</span>
            </button>
            <button 
              className={styles.addButton}
              onClick={() => {
                addToAssembly(selectedIngredient);
                setSelectedIngredient(null);
              }}
            >
              Add to Plate
            </button>
            <button 
              className={`${styles.passButton} ${styles.passRight}`}
              onClick={() => handlePass('right')}
              disabled={!neighbors.right}
            >
              Pass Right (D) →
              <span className={styles.passTo}>{neighbors.right?.name}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerInventory;

