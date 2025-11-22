# Assets Folder

This folder is set up to hold custom Korean cultural assets for the game.

## Structure

### `/images/ingredients/`
Add PNG or SVG files for individual Korean ingredients:
- Name files matching ingredient IDs (e.g., `rice.png`, `kimchi.png`, `gochujang.png`)
- Recommended size: 128x128px or 256x256px
- Transparent backgrounds preferred

### `/images/dishes/`
Add images of completed Korean dishes:
- Name files matching recipe IDs (e.g., `bibimbap.png`, `kimchiJjigae.png`)
- Recommended size: 512x512px or larger
- Show authentic plating and presentation

### `/images/ui/`
Decorative UI elements:
- Korean patterns (오방색 patterns, 단청)
- Decorative borders
- Button backgrounds
- Icons

### `/images/backgrounds/`
Kitchen background images:
- Traditional hanok kitchen
- Modern apartment kitchen
- Pojangmacha (street food tent)
- Restaurant kitchen

### `/sounds/fx/`
Sound effects (MP3 or OGG format):
- Cooking sounds (sizzling, chopping, bubbling)
- Ingredient passing ("주세요!", "감사합니다!")
- Dish completion success sounds
- Timer warning beeps
- Order expiration sounds

### `/sounds/music/`
Background music (MP3 or OGG format):
- Traditional Korean instrumental music
- Modern K-indie tracks
- Upbeat cooking music
- Menu/lobby music

### `/fonts/korean/`
Korean typography files (TTF, WOFF, WOFF2):
- Hangul fonts for dish names
- Decorative fonts for titles
- Readable fonts for UI text

## Using Custom Assets

### To use custom images instead of emoji:

1. Add your image files to the appropriate folders
2. Update `src/utils/ingredientData.js`:

```javascript
// Instead of emoji
export const ingredientData = {
  rice: { 
    id: 'rice', 
    nameKR: '밥', 
    nameEN: 'Rice', 
    image: '/src/assets/images/ingredients/rice.png' // Add this
  },
  // ...
}
```

3. Update components to use `<img src={ingredient.image} />` instead of `{ingredient.emoji}`

### To add background music:

1. Add music files to `/sounds/music/`
2. Import and play in components:

```javascript
import backgroundMusic from '../assets/sounds/music/korean-kitchen.mp3';

// In component
useEffect(() => {
  const audio = new Audio(backgroundMusic);
  audio.loop = true;
  audio.play();
  return () => audio.pause();
}, []);
```

### To add sound effects:

1. Add sound files to `/sounds/fx/`
2. Play on events:

```javascript
import passingSound from '../assets/sounds/fx/pass-ingredient.mp3';

const playSound = () => {
  new Audio(passingSound).play();
};
```

## Asset Guidelines

- **File Sizes**: Keep images under 500KB each for good performance
- **Formats**: PNG for images with transparency, JPG for photos, SVG for icons
- **Audio**: MP3 for broad compatibility, keep files under 2MB
- **Cultural Authenticity**: Ensure assets accurately represent Korean culture and cuisine
- **Attribution**: Keep track of asset sources and licenses

## Current Status

The MVP currently uses:
- **Emoji** for ingredient icons
- **CSS gradients** for backgrounds
- **System fonts** with Korean character support
- **No sounds** (silent by default)

This structure is ready for you to add custom assets to enhance the Korean cultural theme!

