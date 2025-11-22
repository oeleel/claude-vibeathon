import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import styles from '../styles/HomePage.module.css';

function HomePage() {
  const navigate = useNavigate();
  const { createRoom, joinRoom, connected, room } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigate to lobby once room is created/joined
  useEffect(() => {
    if (room && isSubmitting) {
      navigate('/lobby');
      setIsSubmitting(false);
    }
  }, [room, isSubmitting, navigate]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (playerName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      createRoom(playerName.trim());
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim() && !isSubmitting) {
      setIsSubmitting(true);
      joinRoom(roomCode.trim(), playerName.trim());
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.korean}>한국 부엌 파티</span>
            <span className={styles.english}>Korean Kitchen Party</span>
          </h1>
          <p className={styles.subtitle}>
            🍜 Cook together, serve together, win together! 🍚
          </p>
        </div>

        {!connected && (
          <div className={styles.connecting}>
            <div className={styles.spinner}></div>
            <p>Connecting to server...</p>
          </div>
        )}

        {connected && !mode && (
          <div className={styles.modeSelection}>
            <button 
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={() => setMode('create')}
            >
              <span className={styles.buttonIcon}>🎮</span>
              Create Room
            </button>
            <button 
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => setMode('join')}
            >
              <span className={styles.buttonIcon}>🚪</span>
              Join Room
            </button>
          </div>
        )}

        {connected && mode === 'create' && (
          <form className={styles.form} onSubmit={handleCreateRoom}>
            <h2>Create a New Room</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={styles.input}
              maxLength={20}
              required
            />
            <div className={styles.formButtons}>
              <button 
                type="submit" 
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create & Host'}
              </button>
              <button 
                type="button" 
                className={`${styles.button} ${styles.backButton}`}
                onClick={() => setMode(null)}
                disabled={isSubmitting}
              >
                Back
              </button>
            </div>
          </form>
        )}

        {connected && mode === 'join' && (
          <form className={styles.form} onSubmit={handleJoinRoom}>
            <h2>Join a Room</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={styles.input}
              maxLength={20}
              required
            />
            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className={styles.input}
              maxLength={6}
              required
            />
            <div className={styles.formButtons}>
              <button 
                type="submit" 
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join Room'}
              </button>
              <button 
                type="button" 
                className={`${styles.button} ${styles.backButton}`}
                onClick={() => setMode(null)}
                disabled={isSubmitting}
              >
                Back
              </button>
            </div>
          </form>
        )}

        <div className={styles.footer}>
          <p>2-8 players • Real-time multiplayer • Korean cuisine</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

