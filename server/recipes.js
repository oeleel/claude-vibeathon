// Korean ingredient definitions
export const ingredients = {
  // Staples
  rice: { id: 'rice', nameKR: '밥', nameEN: 'Rice', emoji: '🍚', category: 'staple' },
  gochujang: { id: 'gochujang', nameKR: '고추장', nameEN: 'Gochujang', emoji: '🌶️', category: 'sauce' },
  gochugaru: { id: 'gochugaru', nameKR: '고춧가루', nameEN: 'Red Pepper Flakes', emoji: '🌶️', category: 'seasoning' },
  doenjang: { id: 'doenjang', nameKR: '된장', nameEN: 'Soybean Paste', emoji: '🫘', category: 'sauce' },
  sesameOil: { id: 'sesameOil', nameKR: '참기름', nameEN: 'Sesame Oil', emoji: '🫗', category: 'oil' },
  soySauce: { id: 'soySauce', nameKR: '간장', nameEN: 'Soy Sauce', emoji: '🥫', category: 'sauce' },
  garlic: { id: 'garlic', nameKR: '마늘', nameEN: 'Garlic', emoji: '🧄', category: 'seasoning' },
  ginger: { id: 'ginger', nameKR: '생강', nameEN: 'Ginger', emoji: '🫚', category: 'seasoning' },
  
  // Vegetables
  napaCabbage: { id: 'napaCabbage', nameKR: '배추', nameEN: 'Napa Cabbage', emoji: '🥬', category: 'vegetable' },
  kimchi: { id: 'kimchi', nameKR: '김치', nameEN: 'Kimchi', emoji: '🥬', category: 'banchan' },
  spinach: { id: 'spinach', nameKR: '시금치', nameEN: 'Spinach', emoji: '🥬', category: 'vegetable' },
  beanSprouts: { id: 'beanSprouts', nameKR: '콩나물', nameEN: 'Bean Sprouts', emoji: '🌱', category: 'vegetable' },
  carrot: { id: 'carrot', nameKR: '당근', nameEN: 'Carrot', emoji: '🥕', category: 'vegetable' },
  zucchini: { id: 'zucchini', nameKR: '호박', nameEN: 'Zucchini', emoji: '🥒', category: 'vegetable' },
  mushroom: { id: 'mushroom', nameKR: '버섯', nameEN: 'Mushroom', emoji: '🍄', category: 'vegetable' },
  onion: { id: 'onion', nameKR: '양파', nameEN: 'Onion', emoji: '🧅', category: 'vegetable' },
  greenOnion: { id: 'greenOnion', nameKR: '파', nameEN: 'Green Onion', emoji: '🧅', category: 'vegetable' },
  radish: { id: 'radish', nameKR: '무', nameEN: 'Radish', emoji: '🥕', category: 'vegetable' },
  
  // Proteins
  beef: { id: 'beef', nameKR: '소고기', nameEN: 'Beef', emoji: '🥩', category: 'protein' },
  porkBelly: { id: 'porkBelly', nameKR: '삼겹살', nameEN: 'Pork Belly', emoji: '🥓', category: 'protein' },
  chicken: { id: 'chicken', nameKR: '닭고기', nameEN: 'Chicken', emoji: '🍗', category: 'protein' },
  tofu: { id: 'tofu', nameKR: '두부', nameEN: 'Tofu', emoji: '🧊', category: 'protein' },
  egg: { id: 'egg', nameKR: '계란', nameEN: 'Egg', emoji: '🥚', category: 'protein' },
  
  // Noodles & Rice Cakes
  dangmyeon: { id: 'dangmyeon', nameKR: '당면', nameEN: 'Glass Noodles', emoji: '🍜', category: 'noodle' },
  tteok: { id: 'tteok', nameKR: '떡', nameEN: 'Rice Cake', emoji: '🍡', category: 'rice_cake' },
  
  // Other
  seaweed: { id: 'seaweed', nameKR: '김', nameEN: 'Seaweed', emoji: '🌿', category: 'other' },
  anchovyBroth: { id: 'anchovyBroth', nameKR: '멸치육수', nameEN: 'Anchovy Broth', emoji: '🥣', category: 'broth' },
  fishCake: { id: 'fishCake', nameKR: '어묵', nameEN: 'Fish Cake', emoji: '🍥', category: 'processed' }
};

// Korean recipe definitions - simplified to max 4 ingredients for fast-paced gameplay
export const recipes = {
  bibimbap: {
    id: 'bibimbap',
    nameKR: '비빔밥',
    nameEN: 'Bibimbap',
    difficulty: 'easy',
    ingredients: ['rice', 'beef', 'egg', 'gochujang'],
    baseTime: 40,
    points: 100,
    description: 'Mixed rice with beef and egg'
  },
  
  kimbap: {
    id: 'kimbap',
    nameKR: '김밥',
    nameEN: 'Kimbap',
    difficulty: 'easy',
    ingredients: ['rice', 'seaweed', 'egg', 'carrot'],
    baseTime: 40,
    points: 100,
    description: 'Seaweed rice rolls'
  },
  
  kimchiJjigae: {
    id: 'kimchiJjigae',
    nameKR: '김치찌개',
    nameEN: 'Kimchi Jjigae',
    difficulty: 'medium',
    ingredients: ['kimchi', 'porkBelly', 'tofu', 'gochugaru'],
    baseTime: 35,
    points: 120,
    description: 'Kimchi stew'
  },
  
  tteokbokki: {
    id: 'tteokbokki',
    nameKR: '떡볶이',
    nameEN: 'Tteokbokki',
    difficulty: 'medium',
    ingredients: ['tteok', 'fishCake', 'gochujang', 'onion'],
    baseTime: 35,
    points: 120,
    description: 'Spicy rice cakes'
  },
  
  japchae: {
    id: 'japchae',
    nameKR: '잡채',
    nameEN: 'Japchae',
    difficulty: 'medium',
    ingredients: ['dangmyeon', 'beef', 'spinach', 'sesameOil'],
    baseTime: 35,
    points: 130,
    description: 'Glass noodles'
  },
  
  bulgogi: {
    id: 'bulgogi',
    nameKR: '불고기',
    nameEN: 'Bulgogi',
    difficulty: 'medium',
    ingredients: ['beef', 'soySauce', 'garlic', 'onion'],
    baseTime: 35,
    points: 120,
    description: 'Marinated beef'
  }
};

// Get all ingredient IDs
export function getAllIngredientIds() {
  return Object.keys(ingredients);
}

// Get recipes by difficulty
export function getRecipesByDifficulty(difficulty) {
  return Object.values(recipes).filter(r => r.difficulty === difficulty);
}

// Get all recipes
export function getAllRecipes() {
  return Object.values(recipes);
}

// Get recipe by ID
export function getRecipeById(id) {
  return recipes[id];
}

// Get ingredient by ID
export function getIngredientById(id) {
  return ingredients[id];
}

