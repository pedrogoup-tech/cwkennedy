import React from 'react';
import { Play, Info, Gamepad2, Trophy, Users } from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#1a1a2e' }}>
      {/* Pixel art background pattern */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: `
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '8px 8px',
      }} />

      {/* Stars - pixel art */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white"
            style={{
              width: i % 3 === 0 ? 4 : 2,
              height: i % 3 === 0 ? 4 : 2,
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 60}%`,
              opacity: 0.3 + (i % 5) * 0.1,
              animation: `pulse ${2 + (i % 3)}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Pixel art city skyline */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 180" preserveAspectRatio="xMidYMax slice">
          {/* Buildings layer 1 (far) */}
          <g fill="#0f0f23">
            <rect x="0" y="100" width="60" height="80" />
            <rect x="80" y="60" width="80" height="120" />
            <rect x="180" y="80" width="50" height="100" />
            <rect x="250" y="40" width="100" height="140" />
            <rect x="370" y="70" width="70" height="110" />
            <rect x="460" y="50" width="90" height="130" />
            <rect x="570" y="90" width="60" height="90" />
            <rect x="650" y="30" width="120" height="150" />
            <rect x="790" y="60" width="70" height="120" />
            <rect x="880" y="80" width="80" height="100" />
            <rect x="980" y="50" width="90" height="130" />
            <rect x="1090" y="70" width="60" height="110" />
            <rect x="1160" y="90" width="50" height="90" />
          </g>
          
          {/* Windows - pixel art */}
          {[...Array(40)].map((_, i) => {
            const buildingX = [30, 110, 200, 290, 400, 500, 590, 700, 820, 920, 1020, 1110][i % 12];
            const offsetX = (i % 3) * 18 + 8;
            const offsetY = 70 + (i % 4) * 20;
            const isLit = i % 4 !== 0;
            return (
              <rect
                key={i}
                x={buildingX + offsetX - 25}
                y={offsetY}
                width="10"
                height="12"
                fill={isLit ? "#fbbf24" : "#1a1a2e"}
                opacity={isLit ? 0.9 : 0.5}
              />
            );
          })}
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Pixel art badge */}
        <div 
          className="mb-6 inline-block px-6 py-2"
          style={{
            background: 'linear-gradient(180deg, #4338CA 0%, #3730A3 100%)',
            border: '4px solid #6366F1',
            boxShadow: '0 4px 0 #1E1B4B',
          }}
        >
          <span className="font-pixel text-sm text-yellow-400">⭐ JOGO INDIE 2024 ⭐</span>
        </div>

        {/* Title with pixel art style */}
        <div className="relative mb-8">
          {/* Pixel shadow */}
          <h1 
            className="font-pixel text-4xl md:text-6xl lg:text-7xl font-bold mb-2"
            style={{
              color: '#000',
              textShadow: '4px 4px 0 #000',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%) translate(4px, 4px)',
              opacity: 0.3,
            }}
          >
            COWORKING
          </h1>
          <h1 
            className="relative font-pixel text-4xl md:text-6xl lg:text-7xl font-bold mb-2"
            style={{
              background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(2px 2px 0 #92400E)',
            }}
          >
            COWORKING
          </h1>
          
          <h2 
            className="relative font-pixel text-3xl md:text-5xl font-bold"
            style={{
              background: 'linear-gradient(180deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(2px 2px 0 #1E40AF)',
            }}
          >
            KENNEDY
          </h2>
          
          <p 
            className="font-pixel text-xs md:text-sm mt-4 tracking-[0.4em]"
            style={{ color: '#9CA3AF' }}
          >
            ADVENTURE
          </p>
        </div>

        {/* Tagline */}
        <p className="font-pixel text-sm md:text-base mb-10 max-w-lg mx-auto" style={{ color: '#9CA3AF' }}>
          Enfrente a procrastinação e conquiste o sucesso!
        </p>

        {/* Action buttons with pixel art style */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button 
            onClick={onStartGame}
            className="group relative px-12 py-5 font-pixel text-xl text-white transition-all duration-100 hover:-translate-y-1 active:translate-y-1"
            style={{
              background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 50%, #15803D 100%)',
              boxShadow: '0 6px 0 #14532D, 4px 6px 0 #14532D, -4px 6px 0 #14532D',
              border: '4px solid #4ADE80',
              imageRendering: 'pixelated',
            }}
          >
            <span className="relative flex items-center gap-3">
              <Play className="w-7 h-7" fill="currentColor" />
              JOGAR
            </span>
          </button>
          
          <button 
            className="group relative px-10 py-4 font-pixel text-lg text-white/90 transition-all duration-100 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)',
              boxShadow: '0 4px 0 #312E81, 4px 4px 0 #312E81, -4px 4px 0 #312E81',
              border: '4px solid #818CF8',
            }}
          >
            <span className="relative flex items-center gap-2">
              <Info className="w-5 h-5" />
              COMO JOGAR
            </span>
          </button>
        </div>

        {/* Controls hint with pixel style */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <div 
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: '#0f0f23',
              border: '3px solid #374151',
            }}
          >
            <kbd 
              className="px-3 py-1 font-pixel text-xs"
              style={{ background: '#1F2937', color: '#9CA3AF' }}
            >
              ← →
            </kbd>
            <span className="font-pixel text-xs" style={{ color: '#6B7280' }}>Mover</span>
          </div>
          <div 
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: '#0f0f23',
              border: '3px solid #374151',
            }}
          >
            <kbd 
              className="px-3 py-1 font-pixel text-xs"
              style={{ background: '#1F2937', color: '#9CA3AF' }}
            >
              ESPAÇO
            </kbd>
            <span className="font-pixel text-xs" style={{ color: '#6B7280' }}>Pular</span>
          </div>
          <div 
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: '#0f0f23',
              border: '3px solid #374151',
            }}
          >
            <kbd 
              className="px-3 py-1 font-pixel text-xs"
              style={{ background: '#1F2937', color: '#9CA3AF' }}
            >
              J
            </kbd>
            <span className="font-pixel text-xs" style={{ color: '#6B7280' }}>Atirar</span>
          </div>
        </div>

        {/* Stats with pixel art icons */}
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-2 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 4px 0 #7C2D12, 4px 4px 0 #7C2D12, -4px 4px 0 #7C2D12',
                border: '4px solid #FDBA74',
              }}
            >
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <p className="font-pixel text-2xl text-white">7</p>
            <p className="font-pixel text-xs" style={{ color: '#6B7280' }}>FASES</p>
          </div>
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-2 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
                boxShadow: '0 4px 0 #4C1D95, 4px 4px 0 #4C1D95, -4px 4px 0 #4C1D95',
                border: '4px solid #C4B5FD',
              }}
            >
              <Users className="w-8 h-8 text-white" />
            </div>
            <p className="font-pixel text-2xl text-white">5</p>
            <p className="font-pixel text-xs" style={{ color: '#6B7280' }}>HERÓIS</p>
          </div>
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-2 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                boxShadow: '0 4px 0 #92400E, 4px 4px 0 #92400E, -4px 4px 0 #92400E',
                border: '4px solid #FDE68A',
              }}
            >
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <p className="font-pixel text-2xl text-white">2</p>
            <p className="font-pixel text-xs" style={{ color: '#6B7280' }}>BOSSES</p>
          </div>
        </div>
      </div>

      {/* Version - pixel style */}
      <div 
        className="absolute bottom-4 right-4 font-pixel text-xs px-3 py-1"
        style={{
          background: '#0f0f23',
          border: '2px solid #374151',
          color: '#4B5563',
        }}
      >
        v2.0.0
      </div>
    </div>
  );
};

export default MainMenu;
