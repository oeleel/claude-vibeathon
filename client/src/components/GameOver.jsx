import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import styles from '../styles/GameOver.module.css';

function GameOver() {
  const navigate = useNavigate();
  const { room } = useGame();

  if (!room) return null;

  const success = room.lives > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1 className={`${styles.title} ${success ? styles.success : styles.failure}`}>
          {success ? '수고하셨습니다!' : 'Game Over'}
        </h1>
        <p className={styles.subtitle}>
          {success ? 'Excellent work, team!' : 'Better luck next time!'}
        </p>

        <div className={styles.finalStats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏆</div>
            <div className={styles.statLabel}>Final Score</div>
            <div className={styles.statValue}>{room.teamScore}</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statLabel}>Rounds Completed</div>
            <div className={styles.statValue}>{room.round}/10</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>❤️</div>
            <div className={styles.statLabel}>Lives Remaining</div>
            <div className={styles.statValue}>{room.lives}/3</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.homeButton}
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOver;

