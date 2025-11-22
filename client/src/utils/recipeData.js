// Korean recipe definitions with container types
export const recipes = {
  bibimbap: {
    id: 'bibimbap',
    nameKR: '비빔밥',
    nameEN: 'Bibimbap',
    container: 'bowl',
    ingredients: ['rice', 'beef', 'spinach', 'beanSprouts', 'carrot', 'egg', 'gochujang']
  },
  kimbap: {
    id: 'kimbap',
    nameKR: '김밥',
    nameEN: 'Kimbap',
    container: 'plate',
    ingredients: ['rice', 'seaweed', 'egg', 'carrot', 'spinach', 'radish']
  },
  kimchiJjigae: {
    id: 'kimchiJjigae',
    nameKR: '김치찌개',
    nameEN: 'Kimchi Jjigae',
    container: 'pot',
    ingredients: ['kimchi', 'porkBelly', 'tofu', 'onion', 'gochugaru', 'anchovyBroth']
  },
  tteokbokki: {
    id: 'tteokbokki',
    nameKR: '떡볶이',
    nameEN: 'Tteokbokki',
    container: 'pot',
    ingredients: ['tteok', 'fishCake', 'gochujang', 'gochugaru', 'onion', 'greenOnion']
  },
  japchae: {
    id: 'japchae',
    nameKR: '잡채',
    nameEN: 'Japchae',
    container: 'plate',
    ingredients: ['dangmyeon', 'beef', 'spinach', 'carrot', 'mushroom', 'onion', 'sesameOil', 'soySauce']
  },
  bulgogi: {
    id: 'bulgogi',
    nameKR: '불고기',
    nameEN: 'Bulgogi',
    container: 'plate',
    ingredients: ['beef', 'soySauce', 'garlic', 'sesameOil', 'onion', 'mushroom']
  }
};

export function getRecipeById(id) {
  return recipes[id];
}

