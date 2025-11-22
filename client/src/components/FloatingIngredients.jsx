import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useIngredientSharing } from '../hooks/useIngredientSharing';
import { getIngredient } from '../utils/ingredientData';
import styles from '../styles/FloatingIngredients.module.css';

function FloatingIngredients({ ingredients, onCombine, onServe }) {
  const { playerId, room, disassembleDish } = useGame();
  const { getPlayerNeighbors } = useIngredientSharing();
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDragStart = (e, ingredient) => {
    setDraggingId(ingredient.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('sourceIngredientId', ingredient.id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragOver = (e, ingredient) => {
    if (ingredient.id !== draggingId) {
      e.preventDefault();
      setDragOverId(ingredient.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e, targetIngredient) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('sourceIngredientId');
    
    if (sourceId && sourceId !== targetIngredient.id) {
      onCombine(sourceId, targetIngredient.id);
    }
    
    setDragOverId(null);
  };

  const handleDoubleClick = (ingredient) => {
    // Only allow disassembly if it's a plate (has combined ingredients)
    const combinedCount = (ingredient.combinedWith || []).length;
    if (combinedCount > 0 && disassembleDish) {
      disassembleDish(ingredient.id);
    }
  };

  const neighbors = getPlayerNeighbors();
  const isTwoPlayer = room?.players.length === 2;

  return (
    <div className={styles.container}>
      {isTwoPlayer && (
        <div className={styles.twoPlayerHint}>
          <p>2-Player Mode: Drag ingredients left or right to share!</p>
        </div>
      )}
      {ingredients.map(ingredient => {
        const ingredientData = getIngredient(ingredient.ingredientId);
        const isHeld = ingredient.heldBy && ingredient.heldBy !== playerId;
        const isDragging = draggingId === ingredient.id;
        const isDragOver = dragOverId === ingredient.id;
        const combinedCount = (ingredient.combinedWith || []).length;
        const isPlate = combinedCount > 0;

        return (
          <div
            key={ingredient.id}
            className={`${styles.ingredient} ${isHeld ? styles.held : ''} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''} ${isPlate ? styles.plate : ''}`}
            style={{
              left: `${ingredient.x}%`,
              top: `${ingredient.y}%`
            }}
            draggable={!isHeld}
            onDragStart={(e) => handleDragStart(e, ingredient)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, ingredient)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, ingredient)}
            onDoubleClick={() => handleDoubleClick(ingredient)}
            title={`${ingredientData.nameKR} (${ingredientData.nameEN})${combinedCount > 0 ? ` + ${combinedCount} more - Double-click to disassemble` : ''}`}
          >
            {isPlate ? (
              <div className={styles.plateView}>
                <div className={styles.plateIcon}>🍽️</div>
                <div className={styles.ingredientStack}>
                  <div className={styles.stackEmoji}>{ingredientData.emoji}</div>
                  {ingredient.combinedWith.slice(0, 3).map((ingId, idx) => {
                    const combInData = getIngredient(ingId);
                    return (
                      <div key={idx} className={styles.stackEmoji}>
                        {combInData.emoji}
                      </div>
                    );
                  })}
                  {combinedCount > 3 && (
                    <div className={styles.moreCount}>+{combinedCount - 3}</div>
                  )}
                </div>
                <div className={styles.plateLabel}>
                  {combinedCount + 1} items
                </div>
              </div>
            ) : (
              <>
                <div className={styles.ingredientEmoji}>
                  {ingredientData.emoji}
                </div>
                <div className={styles.ingredientLabel}>
                  {ingredientData.nameKR}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FloatingIngredients;

