import { useGame } from '../context/GameContext';

/**
 * Hook to handle ingredient sharing between players
 * For 2 players: automatically determines the other player
 * For 3+ players: uses calibration data to find neighbors
 */
export function useIngredientSharing() {
  const { room, playerId } = useGame();

  const getPlayerNeighbors = () => {
    if (!room || !playerId) return { left: null, right: null };

    const currentPlayer = room.players.find(p => p.id === playerId);
    if (!currentPlayer) return { left: null, right: null };

    // For 2 players: the other player is both left and right
    if (room.players.length === 2) {
      const otherPlayer = room.players.find(p => p.id !== playerId);
      return {
        left: otherPlayer,
        right: otherPlayer,
        isTwoPlayer: true
      };
    }

    // For 3+ players: use calibration data to find neighbors by ingredient
    const leftNeighbor = room.players.find(
      p => p.calibrationIngredient === currentPlayer.leftIngredient
    );
    const rightNeighbor = room.players.find(
      p => p.calibrationIngredient === currentPlayer.rightIngredient
    );

    return {
      left: leftNeighbor || null,
      right: rightNeighbor || null,
      isTwoPlayer: false
    };
  };

  const canShareWith = (direction) => {
    const neighbors = getPlayerNeighbors();
    return direction === 'left' ? !!neighbors.left : !!neighbors.right;
  };

  return {
    getPlayerNeighbors,
    canShareWith
  };
}

