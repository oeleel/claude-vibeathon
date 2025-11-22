import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getIngredient } from '../utils/ingredientData';
import { getRecipeById } from '../utils/recipeData';
import styles from '../styles/WorkArea.module.css';

function WorkArea({ assembly, orders }) {
  const { submitDish, removeFromAssembly, addToAssembly } = useGame();
  const [dragOver, setDragOver] = useState(false);
  const [isDraggingDish, setIsDraggingDish] = useState(false);
  const containerRef = useRef(null);

  // Determine container type based on ingredients
  const getContainerType = () => {
    if (assembly.ingredients.length === 0) return 'empty';
    
    // Check what dish this might be
    for (const order of orders) {
      const recipe = getRecipeById(order.recipeId);
      if (!recipe) continue;
      
      // Check if ingredients so far could be part of this dish
      const allInRecipe = assembly.ingredients.every(ing => 
        recipe.ingredients.includes(ing)
      );
      
      if (allInRecipe) {
        return recipe.container || 'plate';
      }
    }
    
    return 'plate';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const ingredientId = e.dataTransfer.getData('ingredientId');
    if (ingredientId) {
      addToAssembly(ingredientId);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveIngredient = (ingredientId) => {
    removeFromAssembly(ingredientId);
  };

  // Drag the entire dish to serve
  const handleDishDragStart = (e) => {
    if (assembly.ingredients.length === 0) {
      e.preventDefault();
      return;
    }
    setIsDraggingDish(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('servingDish', 'true');
  };

  const handleDishDragEnd = () => {
    setIsDraggingDish(false);
  };

  const containerType = getContainerType();
  const containerEmoji = {
    'bowl': '🥣',
    'plate': '🍽️',
    'pot': '🍲',
    'empty': '🍽️'
  }[containerType] || '🍽️';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Work Station</h2>
        {assembly.ingredients.length > 0 && (
          <div className={styles.hint}>
            ↑ Drag dish upward to serve! ↑
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className={`${styles.dishContainer} ${dragOver ? styles.dragOver : ''} ${isDraggingDish ? styles.dragging : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        draggable={assembly.ingredients.length > 0}
        onDragStart={handleDishDragStart}
        onDragEnd={handleDishDragEnd}
      >
        <div className={styles.containerIcon}>{containerEmoji}</div>
        
        {assembly.ingredients.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Drag ingredients here</p>
            <p className={styles.subtext}>Combine to create dishes</p>
          </div>
        ) : (
          <div className={styles.ingredientsList}>
            {assembly.ingredients.map((ingredientId, idx) => {
              const ingredient = getIngredient(ingredientId);
              return (
                <div 
                  key={`${ingredientId}-${idx}`} 
                  className={styles.ingredientChip}
                  onClick={() => handleRemoveIngredient(ingredientId)}
                  title="Click to remove"
                >
                  <span className={styles.chipEmoji}>{ingredient.emoji}</span>
                  <span className={styles.chipName}>{ingredient.nameEN}</span>
                  <span className={styles.chipRemove}>✕</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.instructions}>
        <p>💡 <strong>Tip:</strong> Drag ingredients onto the container to combine them</p>
        <p>💡 Drag the full dish upward to serve when ready!</p>
      </div>
    </div>
  );
}

export default WorkArea;

