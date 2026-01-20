import React from 'react';
import { Play, Info, Volume2 } from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--gradient-sky)' }}
    >
      {/* Animated clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-16 bg-white/80 rounded-full animate-float" 
          style={{ animationDelay: '0s' }} 
        />
        <div className="absolute top-40 right-20 w-48 h-20 bg-white/70 rounded-full animate-float" 
          style={{ animationDelay: '1s' }} 
        />
        <div className="absolute top-32 left-1/3 w-40 h-16 bg-white/75 rounded-full animate-float" 
          style={{ animationDelay: '2s' }} 
        />
        <div className="absolute top-60 right-1/3 w-36 h-14 bg-white/80 rounded-full animate-float" 
          style={{ animationDelay: '0.5s' }} 
        />
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-32" 
        style={{ background: 'linear-gradient(to top, hsl(30, 50%, 35%), hsl(100, 40%, 45%))' }}
      >
        {/* Grass details */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-green-500 to-transparent" />
      </div>

      {/* Buildings silhouette */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-around items-end pointer-events-none">
        <div className="w-24 h-40 bg-slate-700/50 rounded-t-lg" />
        <div className="w-32 h-64 bg-slate-800/50 rounded-t-lg" />
        <div className="w-20 h-48 bg-slate-700/50 rounded-t-lg" />
        <div className="w-40 h-56 bg-slate-800/50 rounded-t-lg relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl">🏢</div>
          <div className="absolute inset-4 grid grid-cols-3 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-yellow-300/60 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="w-28 h-44 bg-slate-700/50 rounded-t-lg" />
        <div className="w-36 h-52 bg-slate-800/50 rounded-t-lg" />
      </div>

      {/* Logo and Title */}
      <div className="relative z-10 text-center animate-slide-up">
        <div className="mb-4 text-6xl">🏢</div>
        <h1 className="game-title mb-2">COWORKING</h1>
        <h2 className="game-title text-3xl md:text-4xl mb-2">KENNEDY</h2>
        <p className="font-pixel text-xs text-white/90 tracking-wider mb-8 drop-shadow-lg">
          ADVENTURE
        </p>

        {/* Subtitle */}
        <p className="font-game text-lg text-white/90 mb-12 max-w-md mx-auto drop-shadow-md">
          Enfrente a procrastinação e conquiste o sucesso no mundo corporativo!
        </p>

        {/* Menu buttons */}
        <div className="flex flex-col gap-4 items-center">
          <button 
            onClick={onStartGame}
            className="game-button flex items-center gap-3 min-w-[200px] justify-center animate-bounce-slow"
          >
            <Play className="w-6 h-6" />
            JOGAR
          </button>
          
          <button className="game-button-secondary flex items-center gap-3 min-w-[200px] justify-center opacity-80">
            <Info className="w-5 h-5" />
            COMO JOGAR
          </button>
        </div>

        {/* Controls hint */}
        <div className="mt-12 flex gap-8 justify-center text-white/80 font-game text-sm">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-pixel">← →</kbd>
            <span>Mover</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-pixel">ESPAÇO</kbd>
            <span>Pular</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-pixel">J</kbd>
            <span>Atirar</span>
          </div>
        </div>
      </div>

      {/* Power-ups preview */}
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 flex gap-6 z-10">
        <div className="power-up-icon power-up-coffee animate-float text-2xl" style={{ animationDelay: '0s' }}>
          ☕
        </div>
        <div className="power-up-icon power-up-wifi animate-float text-2xl" style={{ animationDelay: '0.5s' }}>
          📶
        </div>
        <div className="power-up-icon power-up-networking animate-float text-2xl" style={{ animationDelay: '1s' }}>
          🤝
        </div>
      </div>

      {/* Character teaser */}
      <div className="absolute bottom-36 right-8 text-4xl animate-bounce-slow">
        🦥
      </div>
    </div>
  );
};

export default MainMenu;
