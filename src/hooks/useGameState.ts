import { useState, useCallback } from 'react';
import { GameState, GameProgress, CharacterId, Level } from '@/types/game';
import { levels as initialLevels } from '@/data/levels';

const initialProgress: GameProgress = {
  unlockedLevels: [1],
  completedLevels: [],
  totalNetworking: 0,
  totalCoins: 0,
  selectedCharacter: null,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [progress, setProgress] = useState<GameProgress>(initialProgress);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [levels, setLevels] = useState<Level[]>(initialLevels);

  const selectCharacter = useCallback((characterId: CharacterId) => {
    setProgress(prev => ({ ...prev, selectedCharacter: characterId }));
  }, []);

  const startGame = useCallback(() => {
    if (progress.selectedCharacter) {
      setGameState('level-select');
    }
  }, [progress.selectedCharacter]);

  const selectLevel = useCallback((levelId: number) => {
    if (progress.unlockedLevels.includes(levelId)) {
      setCurrentLevelId(levelId);
      setGameState('playing');
    }
  }, [progress.unlockedLevels]);

  const completeLevel = useCallback((levelId: number, networkingCollected: number) => {
    setProgress(prev => {
      const newCompleted = prev.completedLevels.includes(levelId)
        ? prev.completedLevels
        : [...prev.completedLevels, levelId];
      
      const nextLevelId = levelId + 1;
      // Agora temos 7 fases jogáveis
      const newUnlocked = nextLevelId <= 7 && !prev.unlockedLevels.includes(nextLevelId)
        ? [...prev.unlockedLevels, nextLevelId]
        : prev.unlockedLevels;

      return {
        ...prev,
        completedLevels: newCompleted,
        unlockedLevels: newUnlocked,
        totalNetworking: prev.totalNetworking + networkingCollected,
      };
    });

    setLevels(prev => prev.map(level => 
      level.id === levelId 
        ? { ...level, completed: true }
        : level.id === levelId + 1 && levelId < 7
          ? { ...level, unlocked: true }
          : level
    ));

    setGameState('level-complete');
  }, []);

  const bossDefeated = useCallback(() => {
    setGameState('boss-defeated');
  }, []);

  const goToMenu = useCallback(() => {
    setGameState('menu');
  }, []);

  const goToCharacterSelect = useCallback(() => {
    setGameState('character-select');
  }, []);

  const goToLevelSelect = useCallback(() => {
    setGameState('level-select');
  }, []);

  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  const resumeGame = useCallback(() => {
    setGameState('playing');
  }, []);

  const gameOver = useCallback(() => {
    setGameState('game-over');
  }, []);

  const restartLevel = useCallback(() => {
    setGameState('playing');
  }, []);

  return {
    gameState,
    progress,
    currentLevelId,
    levels,
    selectCharacter,
    startGame,
    selectLevel,
    completeLevel,
    bossDefeated,
    goToMenu,
    goToCharacterSelect,
    goToLevelSelect,
    pauseGame,
    resumeGame,
    gameOver,
    restartLevel,
  };
};
