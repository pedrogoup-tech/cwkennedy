import React from 'react';
import { Play, RotateCcw, Home, MapPin } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onLevelSelect,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="game-card max-w-md w-full mx-4 text-center animate-scale-in">
        <h2 className="font-pixel text-2xl text-primary mb-8">PAUSADO</h2>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={onResume}
            className="game-button flex items-center justify-center gap-3 w-full"
          >
            <Play className="w-5 h-5" />
            CONTINUAR
          </button>
          
          <button
            onClick={onRestart}
            className="game-button-secondary flex items-center justify-center gap-3 w-full"
          >
            <RotateCcw className="w-5 h-5" />
            REINICIAR FASE
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

        {/* Controls reminder */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="font-pixel text-xs text-muted-foreground mb-4">CONTROLES</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
            <div className="flex items-center gap-2 justify-center">
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-pixel">← →</kbd>
              <span>Mover</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-pixel">ESPAÇO</kbd>
              <span>Pular</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-pixel">J</kbd>
              <span>Atirar</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-pixel">ESC</kbd>
              <span>Pausar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
