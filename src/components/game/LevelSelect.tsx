import React from 'react';
import { ArrowLeft, Lock, Star, ChevronRight } from 'lucide-react';
import { Level } from '@/types/game';
import { futureLevels } from '@/data/levels';

interface LevelSelectProps {
  levels: Level[];
  completedLevels: number[];
  unlockedLevels: number[];
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({
  levels,
  completedLevels,
  unlockedLevels,
  onSelectLevel,
  onBack,
}) => {
  const allLevels = [...levels, ...futureLevels.map(l => ({ 
    ...l, 
    unlocked: false, 
    completed: false,
    platforms: [],
    enemies: [],
    powerUps: [],
    background: 'urban' as const,
    width: 0,
    goal: { x: 0, y: 0 },
  }))];

  // Map path coordinates
  const pathPositions = [
    { x: 15, y: 75 },
    { x: 30, y: 60 },
    { x: 50, y: 55 },
    { x: 70, y: 45 },
    { x: 85, y: 35 },
    { x: 65, y: 25 },
    { x: 45, y: 20 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, hsl(145, 50%, 35%) 0%, hsl(100, 40%, 45%) 50%, hsl(45, 50%, 55%) 100%)' }}
    >
      {/* Back button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-20 p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Title */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center">
        <h1 className="font-pixel text-xl md:text-2xl text-white drop-shadow-lg">
          MAPA DAS FASES
        </h1>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Trees */}
        <div className="absolute left-[5%] top-[40%] text-4xl">🌳</div>
        <div className="absolute left-[20%] top-[30%] text-3xl">🌲</div>
        <div className="absolute right-[10%] top-[50%] text-4xl">🌳</div>
        <div className="absolute right-[25%] top-[60%] text-3xl">🌲</div>
        <div className="absolute left-[40%] top-[70%] text-3xl">🌳</div>
        
        {/* Buildings */}
        <div className="absolute right-[5%] top-[15%] text-5xl">🏢</div>
        <div className="absolute left-[10%] top-[15%] text-4xl">🏠</div>
        
        {/* Clouds */}
        <div className="absolute top-[5%] left-[30%] text-6xl opacity-60">☁️</div>
        <div className="absolute top-[8%] right-[20%] text-5xl opacity-50">☁️</div>
      </div>

      {/* Path connecting levels */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={`M ${pathPositions.map(p => `${p.x} ${p.y}`).join(' L ')}`}
          fill="none"
          stroke="hsl(35, 60%, 55%)"
          strokeWidth="3"
          strokeDasharray="4 2"
          className="drop-shadow-md"
        />
      </svg>

      {/* Level nodes */}
      <div className="absolute inset-0">
        {allLevels.map((level, index) => {
          const pos = pathPositions[index];
          const isUnlocked = unlockedLevels.includes(level.id);
          const isCompleted = completedLevels.includes(level.id);
          const isPlayable = level.id <= 3;

          return (
            <div
              key={level.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <button
                onClick={() => isUnlocked && isPlayable && onSelectLevel(level.id)}
                className={`level-node ${isCompleted ? 'completed' : ''} ${!isUnlocked || !isPlayable ? 'locked' : ''} 
                  ${isUnlocked && isPlayable ? 'hover:scale-110' : ''}`}
                disabled={!isUnlocked || !isPlayable}
              >
                {!isUnlocked || !isPlayable ? (
                  <Lock className="w-6 h-6 text-gray-400" />
                ) : isCompleted ? (
                  <Star className="w-6 h-6 text-yellow-600 fill-yellow-400" />
                ) : (
                  <span className="text-white font-bold">{level.id}</span>
                )}
              </button>

              {/* Level name */}
              <div className="bg-black/60 px-3 py-1 rounded-lg text-center">
                <p className="font-pixel text-xs text-white whitespace-nowrap">
                  {isPlayable ? level.name : level.name}
                </p>
                {!isPlayable && (
                  <p className="text-xs text-yellow-400">Em breve</p>
                )}
              </div>

              {/* Completion stars */}
              {isCompleted && (
                <div className="flex gap-1">
                  {[1, 2, 3].map(star => (
                    <Star key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-6 py-3 rounded-xl flex gap-6 text-sm text-white">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ background: 'var(--gradient-button)' }} />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ background: 'var(--gradient-gold)' }} />
          <span>Completa</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span>Bloqueada</span>
        </div>
      </div>

      {/* Start indicator for first level */}
      <div 
        className="absolute animate-bounce-slow text-2xl"
        style={{ left: `${pathPositions[0].x - 8}%`, top: `${pathPositions[0].y}%` }}
      >
        <ChevronRight className="w-8 h-8 text-yellow-400" />
      </div>
    </div>
  );
};

export default LevelSelect;
