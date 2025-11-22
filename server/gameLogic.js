import { getAllIngredientIds, getRecipesByDifficulty, getAllRecipes, getRecipeById, getIngredientById } from './recipes.js';

class GameLogic {
  constructor() {
    this.UPDATE_INTERVAL = 1000; // Update timers every second
  }

  // Distribute ingredients fairly among players
  distributeIngredients(players, round) {
    const allIngredients = getAllIngredientIds();
    const numPlayers = players.length;
    
    // Determine how many ingredients each player gets based on round
    let ingredientsPerPlayer = Math.min(8, 5 + Math.floor(round / 2));
    
    // Shuffle ingredients
    const shuffled = [...allIngredients].sort(() => Math.random() - 0.5);
    
    // Distribute to players
    players.forEach((player, index) => {
      const startIdx = (index * ingredientsPerPlayer) % shuffled.length;
      const playerIngredients = [];
      
      for (let i = 0; i < ingredientsPerPlayer; i++) {
        const ingredientId = shuffled[(startIdx + i) % shuffled.length];
        playerIngredients.push(ingredientId);
      }
      
      player.inventory = playerIngredients;
    });
    
    console.log('Ingredients distributed to players');
    return players;
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
    
    // Distribute ingredients
    this.distributeIngredients(room.players, newRound);
    
    // Reset current assemblies
    const currentAssemblies = {};
    room.players.forEach(player => {
      currentAssemblies[player.id] = {
        ingredients: [],
        targetOrderId: null
      };
    });
    
    return {
      round: newRound,
      activeOrders: orders,
      currentAssemblies,
      gameState: 'active'
    };
  }

  // Validate a completed dish
  validateDish(assembledIngredients, orderId, room) {
    const order = room.activeOrders.find(o => o.id === orderId);
    
    if (!order) {
      return { valid: false, error: 'Order not found' };
    }
    
    // Check if all required ingredients are present
    const required = [...order.requiredIngredients].sort();
    const assembled = [...assembledIngredients].sort();
    
    if (required.length !== assembled.length) {
      return { valid: false, error: 'Wrong number of ingredients' };
    }
    
    for (let i = 0; i < required.length; i++) {
      if (required[i] !== assembled[i]) {
        return { valid: false, error: 'Wrong ingredients' };
      }
    }
    
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

