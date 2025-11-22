import React from 'react';
import styles from '../styles/GameHeader.module.css';

function GameHeader({ roomCode, round, teamScore, lives }) {
  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Room</span>
          <span className={styles.value}>{roomCode}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Round</span>
          <span className={styles.value}>{round}/10</span>
        </div>
      </div>

      <div className={styles.centerSection}>
        <div className={styles.scoreDisplay}>
          <span className={styles.scoreLabel}>Team Score</span>
          <span className={styles.scoreValue}>{teamScore}</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.livesDisplay}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < lives ? styles.heartFull : styles.heartEmpty}>
              {i < lives ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameHeader;

