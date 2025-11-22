import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getIngredient } from '../utils/ingredientData';
import styles from '../styles/CalibrationScreen.module.css';

function CalibrationScreen() {
  const navigate = useNavigate();
  const { room, playerId, socket } = useGame();
  const [leftIngredient, setLeftIngredient] = useState(null);
  const [rightIngredient, setRightIngredient] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const currentPlayer = room?.players.find(p => p.id === playerId);
  const myIngredient = currentPlayer?.calibrationIngredient;
  const myIngredientData = myIngredient ? getIngredient(myIngredient) : null;

  const availableIngredients = room?.calibrationIngredients || [];
  const playerCount = room?.players.length || 0;

  // Navigate to game when it starts (after calibration complete)
  useEffect(() => {
    if (room?.gameState === 'active') {
      console.log('Calibration complete, navigating to game...');
      navigate('/game');
    }
  }, [room?.gameState, navigate]);

  useEffect(() => {
    if (leftIngredient && rightIngredient) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
  }, [leftIngredient, rightIngredient]);

  const handleSubmitCalibration = () => {
    if (!socket || !room || !isComplete) return;

    socket.emit('submit-calibration', {
      roomCode: room.roomCode,
      leftIngredient: leftIngredient,
      rightIngredient: rightIngredient
    });
  };

  const allPlayersReady = room?.players.every(p => p.calibrationComplete) || false;
  const isHost = room?.hostId === playerId;

  // Safety check - shouldn't be here with only 2 players
  if (playerCount === 2) {
    return (
      <div className={styles.container}>
        <div className={styles.waiting}>
          <div className={styles.checkmark}>⏳</div>
          <h2>Starting Game...</h2>
          <p>No calibration needed with 2 players!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Game Setup - Know Your Neighbors!</h1>
        <p className={styles.subtitle}>Look around and identify who's next to you ({playerCount} players)</p>
      </div>

      <div className={styles.myIngredient}>
        <h2>Your Ingredient:</h2>
        {myIngredientData && (
          <div className={styles.ingredientDisplay}>
            <div className={styles.bigEmoji}>{myIngredientData.emoji}</div>
            <div className={styles.ingredientName}>
              <div className={styles.nameKR}>{myIngredientData.nameKR}</div>
              <div className={styles.nameEN}>{myIngredientData.nameEN}</div>
            </div>
          </div>
        )}
        <p className={styles.instruction}>Remember this! Others will need to identify it.</p>
      </div>

      {!currentPlayer?.calibrationComplete ? (
        <div className={styles.calibrationForm}>
          <div className={styles.section}>
            <h3>👈 What ingredient is to your LEFT?</h3>
            <p className={styles.sectionHint}>Look to your left and identify their ingredient</p>
            <div className={styles.ingredientButtons}>
              {availableIngredients.map(ingredientId => {
                const ing = getIngredient(ingredientId);
                return (
                  <button
                    key={ingredientId}
                    className={`${styles.ingredientButton} ${leftIngredient === ingredientId ? styles.selected : ''}`}
                    onClick={() => setLeftIngredient(ingredientId)}
                    disabled={ingredientId === myIngredient || ingredientId === rightIngredient}
                  >
                    <div className={styles.ingEmoji}>{ing.emoji}</div>
                    <div className={styles.ingName}>{ing.nameKR}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.section}>
            <h3>👉 What ingredient is to your RIGHT?</h3>
            <p className={styles.sectionHint}>Look to your right and identify their ingredient</p>
            <div className={styles.ingredientButtons}>
              {availableIngredients.map(ingredientId => {
                const ing = getIngredient(ingredientId);
                return (
                  <button
                    key={ingredientId}
                    className={`${styles.ingredientButton} ${rightIngredient === ingredientId ? styles.selected : ''}`}
                    onClick={() => setRightIngredient(ingredientId)}
                    disabled={ingredientId === myIngredient || ingredientId === leftIngredient}
                  >
                    <div className={styles.ingEmoji}>{ing.emoji}</div>
                    <div className={styles.ingName}>{ing.nameKR}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className={styles.submitButton}
            onClick={handleSubmitCalibration}
            disabled={!isComplete}
          >
            {isComplete ? '✓ Confirm Setup' : 'Identify ingredients to your left and right'}
          </button>
        </div>
      ) : (
        <div className={styles.waiting}>
          <div className={styles.checkmark}>✓</div>
          <h2>Setup Complete!</h2>
          <p>Waiting for other players to finish...</p>
        </div>
      )}

      <div className={styles.playerStatus}>
        <h3>Player Status:</h3>
        <div className={styles.statusList}>
          {room?.players.map(player => (
            <div key={player.id} className={styles.statusItem}>
              <span className={styles.playerName}>
                {player.name} {player.id === playerId && '(You)'}
              </span>
              <span className={`${styles.status} ${player.calibrationComplete ? styles.complete : styles.pending}`}>
                {player.calibrationComplete ? '✓ Ready' : '⏳ Setting up...'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {allPlayersReady && isHost && (
        <button 
          className={styles.startGameButton} 
          onClick={() => {
            console.log('Host starting calibrated game...');
            if (socket && room) {
              socket.emit('start-calibrated-game', { roomCode: room.roomCode });
            }
          }}
        >
          🎮 Start Game!
        </button>
      )}

      {allPlayersReady && !isHost && (
        <div className={styles.waitingForHost}>
          <p>Waiting for host to start the game...</p>
        </div>
      )}
    </div>
  );
}

export default CalibrationScreen;

