import React from 'react';
import styles from '../styles/PlayerList.module.css';

function PlayerList({ players, hostId, currentPlayerId }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Players</h2>
      <div className={styles.playerGrid}>
        {players.map((player, index) => {
          const isHost = player.id === hostId;
          const isCurrent = player.id === currentPlayerId;
          const isReady = player.ready || isHost;
          const isConnected = player.connected;

          return (
            <div 
              key={player.id} 
              className={`${styles.playerCard} ${isCurrent ? styles.currentPlayer : ''} ${!isConnected ? styles.disconnected : ''}`}
            >
              <div className={styles.playerInfo}>
                <div className={styles.playerPosition}>
                  Position {player.position + 1}
                </div>
                <div className={styles.playerName}>
                  {player.name}
                  {isCurrent && <span className={styles.youBadge}> (You)</span>}
                </div>
                <div className={styles.playerBadges}>
                  {isHost && <span className={styles.badge} title="Host">👑 Host</span>}
                  {!isHost && isReady && <span className={styles.badge} title="Ready">✓ Ready</span>}
                  {!isHost && !isReady && <span className={styles.badgeNotReady}>⏳ Not Ready</span>}
                  {!isConnected && <span className={styles.badgeDisconnected}>🔌 Offline</span>}
                </div>
              </div>
              <div className={styles.playerAvatar}>
                {['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🍳'][index % 8]}
              </div>
            </div>
          );
        })}
      </div>

      {players.length < 8 && (
        <div className={styles.emptySlots}>
          <p>Waiting for more players... ({8 - players.length} slots available)</p>
        </div>
      )}
    </div>
  );
}

export default PlayerList;

