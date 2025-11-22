// Utility functions for constraining ingredient positions to safe playable area
// Keeps ingredients away from screen edges, passing zones, and UI elements

const BOUNDARIES = {
  MIN_X: 15,  // Keep away from left edge and passing zone
  MAX_X: 85,  // Keep away from right edge and passing zone
  MIN_Y: 25,  // Keep away from top (orders display, serve zone)
  MAX_Y: 75   // Keep away from bottom (UI elements, trash can)
};

/**
 * Generate a random position within safe boundaries
 * @returns {{x: number, y: number}} Position as percentages
 */
export function getRandomSafePosition() {
  return {
    x: Math.random() * (BOUNDARIES.MAX_X - BOUNDARIES.MIN_X) + BOUNDARIES.MIN_X,
    y: Math.random() * (BOUNDARIES.MAX_Y - BOUNDARIES.MIN_Y) + BOUNDARIES.MIN_Y
  };
}

/**
 * Constrain a position to safe boundaries
 * @param {number} x - X position as percentage
 * @param {number} y - Y position as percentage
 * @returns {{x: number, y: number}} Constrained position
 */
export function constrainPosition(x, y) {
  return {
    x: Math.max(BOUNDARIES.MIN_X, Math.min(BOUNDARIES.MAX_X, x)),
    y: Math.max(BOUNDARIES.MIN_Y, Math.min(BOUNDARIES.MAX_Y, y))
  };
}

/**
 * Generate multiple random safe positions with some spacing
 * @param {number} count - Number of positions to generate
 * @returns {Array<{x: number, y: number}>} Array of positions
 */
export function getRandomSafePositions(count) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push(getRandomSafePosition());
  }
  return positions;
}

export default {
  BOUNDARIES,
  getRandomSafePosition,
  constrainPosition,
  getRandomSafePositions
};

