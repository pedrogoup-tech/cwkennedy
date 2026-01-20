import React from 'react';
import { RotateCcw, MapPin, Home } from 'lucide-react';

interface GameOverProps {
  onRestart: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({
  onRestart,
  onLevelSelect,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="game-card max-w-md w-full mx-4 text-center animate-shake">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="font-pixel text-2xl text-destructive mb-4">GAME OVER</h2>
        <p className="font-game text-white/70 mb-8">
          A procrastinação venceu dessa vez...
          <br />
          Mas não desista!
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={onRestart}
            className="game-button flex items-center justify-center gap-3 w-full"
          >
            <RotateCcw className="w-5 h-5" />
            TENTAR NOVAMENTE
          </button>

          <button
            onClick={onLevelSelect}
            className="game-button-secondary flex items-center justify-center gap-3 w-full"
          >
            <MapPin className="w-5 h-5" />
            MAPA DE FASES
          </button>

          <button
            onClick={onMainMenu}
            className="game-button-secondary flex items-center justify-center gap-3 w-full"
          >
            <Home className="w-5 h-5" />
            MENU PRINCIPAL
          </button>
        </div>

        {/* Sloth enemy */}
        <div className="mt-8 text-4xl animate-bounce-slow">
          🦥
        </div>
        <p className="font-pixel text-xs text-white/40 mt-2">
          O bicho-preguiça ri de você
        </p>
      </div>
    </div>
  );
};

export default GameOver;
