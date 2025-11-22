import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getIngredient } from '../utils/ingredientData';
import styles from '../styles/WorkArea.module.css';

function WorkArea({ assembly, orders }) {
  const { submitDish, removeFromAssembly, room } = useGame();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const ingredientId = e.dataTransfer.getData('ingredientId');
    if (ingredientId) {
      // This will be handled by the inventory component's passthrough
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

  const handleSubmit = () => {
    if (!selectedOrderId) {
      alert('Please select which dish you are making!');
      return;
    }
    
    if (assembly.ingredients.length === 0) {
      alert('Add ingredients to the plate first!');
      return;
    }

    submitDish(selectedOrderId);
    setSelectedOrderId(null);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Work Area 🍽️</h2>
      
      {orders.length > 0 && (
        <div className={styles.orderSelection}>
          <label>Making:</label>
          <select 
            value={selectedOrderId || ''} 
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className={styles.orderSelect}
          >
            <option value="">Select a dish...</option>
            {orders.map(order => (
              <option key={order.id} value={order.id}>
                {order.nameKR} ({order.nameEN})
              </option>
            ))}
          </select>
        </div>
      )}

      <div 
        className={`${styles.plate} ${dragOver ? styles.plateHover : ''} ${assembly.ingredients.length > 0 ? styles.plateActive : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {assembly.ingredients.length === 0 ? (
          <div className={styles.plateEmpty}>
            <p>Drag ingredients here</p>
            <p className={styles.plateHint}>드래그 앤 드롭</p>
          </div>
        ) : (
          <div className={styles.assemblyGrid}>
            {assembly.ingredients.map((ingredientId, idx) => {
              const ingredient = getIngredient(ingredientId);
              return (
                <div 
                  key={`${ingredientId}-${idx}`} 
                  className={styles.assembledIngredient}
                  onClick={() => handleRemoveIngredient(ingredientId)}
                  title="Click to remove"
                >
                  <span className={styles.assembledEmoji}>{ingredient.emoji}</span>
                  <span className={styles.assembledName}>{ingredient.nameEN}</span>
                  <span className={styles.removeHint}>✕</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {assembly.ingredients.length > 0 && (
        <button 
          className={styles.submitButton}
          onClick={handleSubmit}
        >
          ✓ Submit Dish
        </button>
      )}
    </div>
  );
}

export default WorkArea;

