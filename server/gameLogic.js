import { getAllIngredientIds, getRecipesByDifficulty, getAllRecipes, getRecipeById, getIngredientById } from './recipes.js';

class GameLogic {
  constructor() {
    this.UPDATE_INTERVAL = 1000; // Update timers every second
  }

  // Distribute ingredients to individual players (not visible to all)
  distributeIngredientsToPlayers(room, orders, round) {
    const allIngredients = getAllIngredientIds();
    const playerCount = room.players.length;
    
    // Get all ingredients needed for current orders
    const neededIngredients = [];
    orders.forEach(order => {
      order.requiredIngredients.forEach(ing => {
        neededIngredients.push(ing);
      });
    });
    
    // Add extra random ingredients based on round (chaos increases)
    let extraPercent = 0;
    if (round >= 3) extraPercent = 0.25; // 25% extra from round 3
    if (round >= 5) extraPercent = 0.5;  // 50% extra from round 5
    if (round >= 7) extraPercent = 0.75; // 75% extra from round 7
    
    const extraCount = Math.floor(neededIngredients.length * extraPercent);
    for (let i = 0; i < extraCount; i++) {
      const randomIng = allIngredients[Math.floor(Math.random() * allIngredients.length)];
      neededIngredients.push(randomIng);
    }
    
    // Shuffle and distribute to players
    const shuffled = [...neededIngredients].sort(() => Math.random() - 0.5);
    
    // Assign ingredients to specific players
    const playerIngredients = {};
    room.players.forEach(player => {
      playerIngredients[player.id] = [];
    });
    
    shuffled.forEach((ingredientId, idx) => {
      const playerId = room.players[idx % playerCount].id;
      playerIngredients[playerId].push({
        id: `ingredient_${Date.now()}_${idx}`,
        ingredientId,
        x: Math.random() * 80 + 10, // 10-90% across screen
        y: Math.random() * 60 + 20, // 20-80% down screen
        ownerId: playerId, // Who this ingredient belongs to / can see
        combinedWith: [] // array of ingredient IDs this has been combined with
      });
    });
    
    console.log(`Distributed ${shuffled.length} ingredients across ${playerCount} players (${neededIngredients.length - extraCount} needed + ${extraCount} chaos)`);
    return playerIngredients;
  }
  
  // Track progress on each order
  updateOrderProgress(order, currentIngredients) {
    const completed = [...currentIngredients].sort();
    const required = [...order.requiredIngredients].sort();
    
    // Find how many match so far
    let matchCount = 0;
    for (let i = 0; i < Math.min(completed.length, required.length); i++) {
      if (completed[i] === required[i]) {
        matchCount++;
      }
    }
    
    // Determine next ingredient needed
    const nextIngredient = required[matchCount] || null;
    
    return {
      completed: matchCount,
      total: required.length,
      nextIngredient,
      isComplete: matchCount === required.length && completed.length === required.length
    };
  }

  // Generate orders for a round
  generateOrders(round) {
    const orders = [];
    const allRecipes = getAllRecipes();
    
    // Determine number of orders and difficulty based on round
    let numOrders = 2;
    let difficulties = ['easy'];
    
    if (round >= 3) {
      numOrders = 3;
      difficulties = ['easy', 'medium'];
    }
    
    if (round >= 5) {
      numOrders = 3;
      difficulties = ['easy', 'medium', 'medium'];
    }
    
    // Generate orders
    for (let i = 0; i < numOrders; i++) {
      const difficulty = difficulties[i % difficulties.length];
      const recipesOfDifficulty = allRecipes.filter(r => r.difficulty === difficulty);
      
      if (recipesOfDifficulty.length > 0) {
        const recipe = recipesOfDifficulty[Math.floor(Math.random() * recipesOfDifficulty.length)];
        
        orders.push({
          id: `order_${Date.now()}_${i}`,
          recipeId: recipe.id,
          nameKR: recipe.nameKR,
          nameEN: recipe.nameEN,
          requiredIngredients: [...recipe.ingredients],
          timeRemaining: recipe.baseTime,
          maxTime: recipe.baseTime,
          points: recipe.points,
          createdAt: Date.now()
        });
      }
    }
    
    console.log(`Generated ${orders.length} orders for round ${round}`);
    return orders;
  }

  // Initialize a new round
  initializeRound(room) {
    const newRound = room.round + 1;
    
    // Generate orders
    const orders = this.generateOrders(newRound);
    
    // Distribute ingredients to individual players
    const playerIngredients = this.distributeIngredientsToPlayers(room, orders, newRound);
    
    return {
      round: newRound,
      activeOrders: orders,
      playerIngredients, // Map of playerId -> array of ingredients
      gameState: 'active'
    };
  }

  // Validate a completed dish against all active orders
  validateDish(assembledIngredients, room) {
    // Check if all required ingredients are present
    const assembled = [...assembledIngredients].sort();
    
    // Try to match against any active order
    for (const order of room.activeOrders) {
      const required = [...order.requiredIngredients].sort();
      
      // Check if lengths match
      if (required.length !== assembled.length) {
        continue;
      }
      
      // Check if all ingredients match
      let matches = true;
      for (let i = 0; i < required.length; i++) {
        if (required[i] !== assembled[i]) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        // Calculate score with time bonus
        let score = order.points;
        const timeRemainingPercent = order.timeRemaining / order.maxTime;
        
        if (timeRemainingPercent > 0.5) {
          score = Math.floor(score * 1.2); // 20% bonus for fast completion
        }
        
        return {
          valid: true,
          score,
          order
        };
      }
    }
    
    // No matching order found
    return { 
      valid: false, 
      error: 'No matching order for these ingredients' 
    };
  }

  // Handle ingredient passing between players
  passIngredient(room, fromPlayerId, toPlayerId, ingredientId) {
    const fromPlayer = room.players.find(p => p.id === fromPlayerId);
    const toPlayer = room.players.find(p => p.id === toPlayerId);
    
    if (!fromPlayer || !toPlayer) {
      return { success: false, error: 'Player not found' };
    }
    
    const ingredientIndex = fromPlayer.inventory.indexOf(ingredientId);
    if (ingredientIndex === -1) {
      return { success: false, error: 'Ingredient not in inventory' };
    }
    
    // Remove from sender
    fromPlayer.inventory.splice(ingredientIndex, 1);
    
    // Add to receiver
    toPlayer.inventory.push(ingredientId);
    
    console.log(`${fromPlayer.name} passed ${ingredientId} to ${toPlayer.name}`);
    
    return {
      success: true,
      fromPlayer,
      toPlayer,
      ingredientId
    };
  }

  // Add ingredient to player's current assembly
  addToAssembly(room, playerId, ingredientId) {
    const player = room.players.find(p => p.id === playerId);
    
    if (!player) {
      return { success: false, error: 'Player not found' };
    }
    
    const ingredientIndex = player.inventory.indexOf(ingredientId);
    if (ingredientIndex === -1) {
      return { success: false, error: 'Ingredient not in inventory' };
    }
    
    // Remove from inventory
    player.inventory.splice(ingredientIndex, 1);
    
    // Add to assembly
    if (!room.currentAssemblies[playerId]) {
      room.currentAssemblies[playerId] = { ingredients: [], targetOrderId: null };
    }
    
    room.currentAssemblies[playerId].ingredients.push(ingredientId);
    
    return {
      success: true,
      assembly: room.currentAssemblies[playerId]
    };
  }

  // Remove ingredient from assembly back to inventory
  removeFromAssembly(room, playerId, ingredientId) {
    if (!room.currentAssemblies[playerId]) {
      return { success: false, error: 'No assembly found' };
    }
    
    const assembly = room.currentAssemblies[playerId];
    const ingredientIndex = assembly.ingredients.indexOf(ingredientId);
    
    if (ingredientIndex === -1) {
      return { success: false, error: 'Ingredient not in assembly' };
    }
    
    // Remove from assembly
    assembly.ingredients.splice(ingredientIndex, 1);
    
    // Add back to inventory
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.inventory.push(ingredientId);
    }
    
    return {
      success: true,
      assembly
    };
  }

  // Get all ingredient IDs (for external use)
  getAllIngredientIds() {
    return getAllIngredientIds();
  }

  // Update timers and check for expired orders
  updateTimers(room, deltaSeconds = 1) {
    const expiredOrders = [];
    
    room.activeOrders.forEach(order => {
      order.timeRemaining -= deltaSeconds;
      
      if (order.timeRemaining <= 0) {
        expiredOrders.push(order);
      }
    });
    
    // Remove expired orders and deduct lives
    expiredOrders.forEach(order => {
      const index = room.activeOrders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        room.activeOrders.splice(index, 1);
        room.lives -= 1;
        console.log(`Order expired: ${order.nameEN}, lives remaining: ${room.lives}`);
      }
    });
    
    return {
      expiredOrders,
      livesRemaining: room.lives
    };
  }

  // Check if round is complete
  isRoundComplete(room) {
    return room.activeOrders.length === 0;
  }

  // Check if game is over
  isGameOver(room) {
    return room.lives <= 0 || room.round >= 10;
  }

  // Calculate final results
  calculateResults(room) {
    return {
      finalScore: room.teamScore,
      roundsCompleted: room.round,
      livesRemaining: room.lives,
      success: room.lives > 0
    };
  }
}

export default GameLogic;

