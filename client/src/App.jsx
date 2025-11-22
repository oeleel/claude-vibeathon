import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import HomePage from './components/HomePage';
import LobbyScreen from './components/LobbyScreen';
import CalibrationScreen from './components/CalibrationScreen';
import GameScreen from './components/GameScreen';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby" element={<LobbyScreen />} />
          <Route path="/calibration" element={<CalibrationScreen />} />
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;

