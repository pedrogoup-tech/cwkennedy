import React from 'react';
import { useGameState } from '@/hooks/useGameState';
import MainMenu from './MainMenu';
import CharacterSelect from './CharacterSelect';
import LevelSelect from './LevelSelect';
import GameCanvas from './GameCanvas';
import PauseMenu from './PauseMenu';
import LevelComplete from './LevelComplete';
import GameOver from './GameOver';

const Game: React.FC = () => {
  const {
    gameState,
    progress,
    currentLevelId,
    levels,
    selectCharacter,
    startGame,
    selectLevel,
    completeLevel,
    goToMenu,
    goToCharacterSelect,
    goToLevelSelect,
    pauseGame,
    resumeGame,
    gameOver,
    restartLevel,
  } = useGameState();

  const currentLevel = levels.find(l => l.id === currentLevelId);
  const networkingCollected = React.useRef(0);

  const handleLevelComplete = (collected: number) => {
    networkingCollected.current = collected;
    completeLevel(currentLevelId, collected);
  };

  const handleNextLevel = () => {
    if (currentLevelId < 3) {
      selectLevel(currentLevelId + 1);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      {gameState === 'menu' && (
        <MainMenu onStartGame={goToCharacterSelect} />
      )}

      {gameState === 'character-select' && (
        <CharacterSelect
          selectedCharacter={progress.selectedCharacter}
          onSelectCharacter={selectCharacter}
          onConfirm={startGame}
          onBack={goToMenu}
        />
      )}

      {gameState === 'level-select' && (
        <LevelSelect
          levels={levels}
          completedLevels={progress.completedLevels}
          unlockedLevels={progress.unlockedLevels}
          onSelectLevel={selectLevel}
          onBack={goToCharacterSelect}
        />
      )}

      {gameState === 'playing' && currentLevel && progress.selectedCharacter && (
        <GameCanvas
          level={currentLevel}
          characterId={progress.selectedCharacter}
          onLevelComplete={handleLevelComplete}
          onGameOver={gameOver}
          onPause={pauseGame}
        />
      )}

      {gameState === 'paused' && (
        <PauseMenu
          onResume={resumeGame}
          onRestart={restartLevel}
          onLevelSelect={goToLevelSelect}
          onMainMenu={goToMenu}
        />
      )}

      {gameState === 'level-complete' && currentLevel && (
        <LevelComplete
          levelName={currentLevel.name}
          networkingCollected={networkingCollected.current}
          networkingTotal={currentLevel.powerUps.filter(p => p.type === 'networking').length}
          hasNextLevel={currentLevelId < 3}
          onNextLevel={handleNextLevel}
          onReplay={restartLevel}
          onLevelSelect={goToLevelSelect}
        />
      )}

      {gameState === 'game-over' && (
        <GameOver
          onRestart={restartLevel}
          onLevelSelect={goToLevelSelect}
          onMainMenu={goToMenu}
        />
      )}
    </div>
  );
};

export default Game;
