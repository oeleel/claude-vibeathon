import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PlayerList from './PlayerList';
import RoomCode from './RoomCode';
import styles from '../styles/LobbyScreen.module.css';

function LobbyScreen() {
  const navigate = useNavigate();
  const { room, playerId, toggleReady, startGame } = useGame();

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }

    // Navigate to calibration phase
    if (room.gameState === 'calibration') {
      console.log('Navigating to calibration from lobby');
      navigate('/calibration');
    }

    // Navigate to game when it starts (2 players skip calibration)
    if (room.gameState === 'active') {
      console.log('Navigating to game from lobby');
      navigate('/game');
    }
  }, [room, navigate]);

  if (!room) {
    return null;
  }

  const currentPlayer = room.players.find(p => p.id === playerId);
  const isHost = room.hostId === playerId;
  const allReady = room.players.length >= 2 && 
    room.players.filter(p => p.id !== room.hostId).every(p => p.ready);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>대기실 (Lobby)</h1>
          <RoomCode code={room.roomCode} />
        </div>

        <div className={styles.lobbyInfo}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>👥</span>
            <div>
              <div className={styles.infoLabel}>Players</div>
              <div className={styles.infoValue}>{room.players.length}/8</div>
            </div>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎮</span>
            <div>
              <div className={styles.infoLabel}>Status</div>
              <div className={styles.infoValue}>
                {room.players.length < 2 ? 'Waiting' : allReady ? 'Ready!' : 'Not Ready'}
              </div>
            </div>
          </div>
        </div>

        <PlayerList 
          players={room.players} 
          hostId={room.hostId}
          currentPlayerId={playerId}
        />

        <div className={styles.actions}>
          {!isHost && (
            <button 
              className={`${styles.button} ${currentPlayer?.ready ? styles.readyButton : styles.notReadyButton}`}
              onClick={toggleReady}
            >
              {currentPlayer?.ready ? '✓ Ready' : 'Ready Up'}
            </button>
          )}

          {isHost && (
            <button 
              className={`${styles.button} ${styles.startButton}`}
              onClick={startGame}
              disabled={!allReady}
            >
              {allReady ? '🎮 Start Game' : `Waiting for players... (${room.players.length}/2)`}
            </button>
          )}
        </div>

        <div className={styles.instructions}>
          <h3>How to Play</h3>
          <ul>
            <li>👨‍🍳 Work together to prepare Korean dishes</li>
            <li>🔄 Pass ingredients to your neighbors (A/D or ← →)</li>
            <li>🥘 Drag ingredients to assemble dishes</li>
            <li>⏱️ Complete orders before time runs out</li>
            <li>❤️ Don't let orders expire or you'll lose lives!</li>
          </ul>
        </div>

        <button 
          className={`${styles.button} ${styles.leaveButton}`}
          onClick={() => navigate('/')}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}

export default LobbyScreen;

