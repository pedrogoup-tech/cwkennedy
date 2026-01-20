import React from 'react';
import { Pause } from 'lucide-react';

interface GameHUDProps {
  levelName: string;
  characterName: string;
  characterEmoji: string;
  networkingCollected: number;
  networkingTotal: number;
  hasCoffee: boolean;
  coffeeTimer: number;
  hasWifi: boolean;
  onPause: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  levelName,
  characterName,
  characterEmoji,
  networkingCollected,
  networkingTotal,
  hasCoffee,
  coffeeTimer,
  hasWifi,
  onPause,
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
      {/* Left side - Level info and character */}
      <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{characterEmoji}</span>
          <div>
            <p className="font-pixel text-xs text-yellow-400">{levelName}</p>
            <p className="font-game text-sm text-white/80">{characterName}</p>
          </div>
        </div>
      </div>

      {/* Center - Networking counter */}
      <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">🤝</span>
        <span className="font-pixel text-lg text-white">
          {networkingCollected} / {networkingTotal}
        </span>
      </div>

      {/* Right side - Power-ups and pause */}
      <div className="flex items-center gap-3">
        {/* Active power-ups */}
        <div className="flex gap-2">
          {hasCoffee && (
            <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${(coffeeTimer / 300) * 100}%` }}
                />
              </div>
            </div>
          )}
          {hasWifi && (
            <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-2xl">📶</span>
              <span className="font-pixel text-xs text-blue-400">J: Atirar</span>
            </div>
          )}
        </div>

        {/* Pause button */}
        <button
          onClick={onPause}
          className="pointer-events-auto bg-black/70 backdrop-blur-sm rounded-xl p-3 hover:bg-black/80 transition-colors"
        >
          <Pause className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default GameHUD;
