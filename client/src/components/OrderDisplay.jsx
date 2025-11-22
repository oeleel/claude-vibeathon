import React from 'react';
import { getIngredient } from '../utils/ingredientData';
import styles from '../styles/OrderDisplay.module.css';

function OrderDisplay({ orders }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Active Orders</h2>
      <div className={styles.orderList}>
        {orders.length === 0 && (
          <div className={styles.noOrders}>
            <p>No active orders</p>
          </div>
        )}
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const timePercent = (order.timeRemaining / order.maxTime) * 100;
  
  let timerColor = styles.timerGreen;
  if (timePercent < 30) timerColor = styles.timerRed;
  else if (timePercent < 50) timerColor = styles.timerYellow;

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div className={styles.dishName}>
          <div className={styles.nameKR}>{order.nameKR}</div>
          <div className={styles.nameEN}>{order.nameEN}</div>
        </div>
        <div className={styles.points}>+{order.points}</div>
      </div>

      <div className={styles.ingredientsList}>
        {order.requiredIngredients.map((ingredientId, idx) => {
          const ingredient = getIngredient(ingredientId);
          return (
            <div key={`${ingredientId}-${idx}`} className={styles.ingredientItem}>
              <span className={styles.ingredientEmoji}>{ingredient.emoji}</span>
              <span className={styles.ingredientName}>{ingredient.nameEN}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.timerContainer}>
        <div className={`${styles.timerBar} ${timerColor}`}>
          <div 
            className={styles.timerFill} 
            style={{ width: `${timePercent}%` }}
          />
        </div>
        <div className={styles.timerText}>
          ⏱️ {Math.max(0, Math.ceil(order.timeRemaining))}s
        </div>
      </div>
    </div>
  );
}

export default OrderDisplay;

