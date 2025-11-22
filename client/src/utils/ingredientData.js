// Korean ingredient definitions with emojis
export const ingredientData = {
  // Staples
  rice: { id: 'rice', nameKR: '밥', nameEN: 'Rice', emoji: '🍚' },
  gochujang: { id: 'gochujang', nameKR: '고추장', nameEN: 'Gochujang', emoji: '🌶️' },
  gochugaru: { id: 'gochugaru', nameKR: '고춧가루', nameEN: 'Red Pepper', emoji: '🌶️' },
  doenjang: { id: 'doenjang', nameKR: '된장', nameEN: 'Doenjang', emoji: '🫘' },
  sesameOil: { id: 'sesameOil', nameKR: '참기름', nameEN: 'Sesame Oil', emoji: '🫗' },
  soySauce: { id: 'soySauce', nameKR: '간장', nameEN: 'Soy Sauce', emoji: '🥫' },
  garlic: { id: 'garlic', nameKR: '마늘', nameEN: 'Garlic', emoji: '🧄' },
  ginger: { id: 'ginger', nameKR: '생강', nameEN: 'Ginger', emoji: '🫚' },
  
  // Vegetables
  napaCabbage: { id: 'napaCabbage', nameKR: '배추', nameEN: 'Cabbage', emoji: '🥬' },
  kimchi: { id: 'kimchi', nameKR: '김치', nameEN: 'Kimchi', emoji: '🥬' },
  spinach: { id: 'spinach', nameKR: '시금치', nameEN: 'Spinach', emoji: '🥬' },
  beanSprouts: { id: 'beanSprouts', nameKR: '콩나물', nameEN: 'Bean Sprouts', emoji: '🌱' },
  carrot: { id: 'carrot', nameKR: '당근', nameEN: 'Carrot', emoji: '🥕' },
  zucchini: { id: 'zucchini', nameKR: '호박', nameEN: 'Zucchini', emoji: '🥒' },
  mushroom: { id: 'mushroom', nameKR: '버섯', nameEN: 'Mushroom', emoji: '🍄' },
  onion: { id: 'onion', nameKR: '양파', nameEN: 'Onion', emoji: '🧅' },
  greenOnion: { id: 'greenOnion', nameKR: '파', nameEN: 'Green Onion', emoji: '🧅' },
  radish: { id: 'radish', nameKR: '무', nameEN: 'Radish', emoji: '🥕' },
  
  // Proteins
  beef: { id: 'beef', nameKR: '소고기', nameEN: 'Beef', emoji: '🥩' },
  porkBelly: { id: 'porkBelly', nameKR: '삼겹살', nameEN: 'Pork Belly', emoji: '🥓' },
  chicken: { id: 'chicken', nameKR: '닭고기', nameEN: 'Chicken', emoji: '🍗' },
  tofu: { id: 'tofu', nameKR: '두부', nameEN: 'Tofu', emoji: '🧊' },
  egg: { id: 'egg', nameKR: '계란', nameEN: 'Egg', emoji: '🥚' },
  
  // Noodles & Rice Cakes
  dangmyeon: { id: 'dangmyeon', nameKR: '당면', nameEN: 'Glass Noodles', emoji: '🍜' },
  tteok: { id: 'tteok', nameKR: '떡', nameEN: 'Rice Cake', emoji: '🍡' },
  
  // Other
  seaweed: { id: 'seaweed', nameKR: '김', nameEN: 'Seaweed', emoji: '🌿' },
  anchovyBroth: { id: 'anchovyBroth', nameKR: '멸치육수', nameEN: 'Anchovy Broth', emoji: '🥣' },
  fishCake: { id: 'fishCake', nameKR: '어묵', nameEN: 'Fish Cake', emoji: '🍥' }
};

export function getIngredient(id) {
  return ingredientData[id] || { id, nameKR: id, nameEN: id, emoji: '❓' };
}

