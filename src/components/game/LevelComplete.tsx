import React from 'react';
import { Star, ArrowRight, MapPin, RotateCcw } from 'lucide-react';

interface LevelCompleteProps {
  levelName: string;
  networkingCollected: number;
  networkingTotal: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
}

const LevelComplete: React.FC<LevelCompleteProps> = ({
  levelName,
  networkingCollected,
  networkingTotal,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelSelect,
}) => {
  const stars = networkingCollected >= networkingTotal ? 3 : networkingCollected >= 2 ? 2 : networkingCollected >= 1 ? 1 : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="game-card max-w-md w-full mx-4 text-center animate-scale-in">
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <h2 className="font-pixel text-xl text-green-400 mb-2">FASE COMPLETA!</h2>
          <p className="font-game text-lg text-white/80 mb-6">{levelName}</p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`w-12 h-12 transition-all duration-500 ${
                  starNum <= stars
                    ? 'text-yellow-400 fill-yellow-400 animate-bounce-slow'
                    : 'text-gray-600'
                }`}
                style={{ animationDelay: `${starNum * 0.2}s` }}
              />
            ))}
          </div>

          {/* Networking collected */}
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🤝</span>
              <span className="font-pixel text-xl text-white">
                {networkingCollected} / {networkingTotal}
              </span>
            </div>
            <p className="font-game text-sm text-white/60 mt-2">
              Networking coletados
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {hasNextLevel && (
              <button
                onClick={onNextLevel}
                className="game-button flex items-center justify-center gap-3 w-full"
              >
                <ArrowRight className="w-5 h-5" />
                PRÓXIMA FASE
              </button>
            )}

            <button
              onClick={onReplay}
              className="game-button-secondary flex items-center justify-center gap-3 w-full"
            >
              <RotateCcw className="w-5 h-5" />
              JOGAR NOVAMENTE
            </button>

            <button
              onClick={onLevelSelect}
              className="game-button-secondary flex items-center justify-center gap-3 w-full"
            >
              <MapPin className="w-5 h-5" />
              MAPA DE FASES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
