import React from 'react';
import { useGame } from '../context/GameContext';
import styles from '../styles/Notifications.module.css';

function Notifications() {
  const { notifications } = useGame();

  return (
    <div className={styles.container}>
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`${styles.notification} ${styles[notification.type]}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

export default Notifications;

