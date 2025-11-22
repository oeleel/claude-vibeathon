import React from 'react';
import { useGame } from '../context/GameContext';
import styles from '../styles/RoundComplete.module.css';

function RoundComplete() {
  const { room, playerId, continueRound } = useGame();

  if (!room) return null;

  const isHost = room.hostId === playerId;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Round {room.round} Complete! 🎉</h1>
        
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Team Score</div>
            <div className={styles.statValue}>{room.teamScore}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Lives Remaining</div>
            <div className={styles.statValue}>
              {Array.from({ length: room.lives }).map((_, i) => (
                <span key={i}>❤️</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.message}>
          <p className={styles.korean}>잘했어요!</p>
          <p className={styles.english}>Great work!</p>
        </div>

        {isHost ? (
          <button 
            className={styles.continueButton}
            onClick={continueRound}
          >
            Continue to Round {room.round + 1}
          </button>
        ) : (
          <p className={styles.waiting}>Waiting for host to continue...</p>
        )}
      </div>
    </div>
  );
}

export default RoundComplete;

