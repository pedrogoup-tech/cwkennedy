import React, { useEffect, useState } from 'react';
import { Play, Info, Sparkles, Gamepad2, Trophy, Users } from 'lucide-react';
import { characters } from '@/data/characters';

import coffeeSprite from '@/assets/sprites/coffee.png';
import wifiSprite from '@/assets/sprites/wifi.png';
import networkingSprite from '@/assets/sprites/networking.png';
import slothSprite from '@/assets/sprites/sloth.png';
import deadlineSprite from '@/assets/sprites/deadline.png';
import spamSprite from '@/assets/sprites/spam.png';

interface MainMenuProps {
  onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    // Create floating particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at ${50 + mousePosition.x}% ${30 + mousePosition.y}%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at ${30 - mousePosition.x}% ${70 - mousePosition.y}%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at ${70 + mousePosition.x}% ${60 + mousePosition.y}%, rgba(34, 211, 238, 0.3) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/20 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${3 + particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `perspective(500px) rotateX(60deg) translateY(-50%)`,
            transformOrigin: 'center top',
          }}
        />
      </div>

      {/* Animated buildings silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Buildings */}
          <rect x="50" y="80" width="80" height="120" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0s' }} />
          <rect x="150" y="40" width="100" height="160" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
          <rect x="270" y="60" width="70" height="140" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <rect x="360" y="30" width="120" height="170" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0.3s' }} />
          <rect x="500" y="50" width="90" height="150" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0.7s' }} />
          <rect x="610" y="20" width="140" height="180" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0.2s' }} />
          <rect x="770" y="60" width="80" height="140" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0.9s' }} />
          <rect x="870" y="40" width="110" height="160" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
          <rect x="1000" y="70" width="90" height="130" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0.6s' }} />
          <rect x="1110" y="50" width="80" height="150" fill="url(#buildingGrad)" className="animate-pulse-glow" style={{ animationDelay: '0.8s' }} />
          
          {/* Windows */}
          {[...Array(60)].map((_, i) => (
            <rect
              key={i}
              x={80 + (i % 10) * 110 + (i % 3) * 15}
              y={50 + Math.floor(i / 10) * 30}
              width="8"
              height="12"
              fill="#fbbf24"
              opacity={Math.random() > 0.3 ? 0.8 : 0.2}
              className="animate-pulse"
              style={{ animationDelay: `${Math.random() * 3}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Logo badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-sm animate-slide-up">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white/80">Jogo Indie 2024</span>
        </div>

        {/* Title with enhanced effects */}
        <div className="relative mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30" />
          <h1 className="relative font-pixel text-5xl md:text-7xl lg:text-8xl font-bold mb-2">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
              COWORKING
            </span>
          </h1>
          <h2 className="relative font-pixel text-3xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              KENNEDY
            </span>
          </h2>
          <p className="font-pixel text-xs md:text-sm text-white/60 mt-4 tracking-[0.3em]">
            ADVENTURE
          </p>
        </div>

        {/* Tagline */}
        <p className="font-game text-lg md:text-xl text-white/70 mb-10 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Enfrente a procrastinação e conquiste o sucesso no mundo corporativo!
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={onStartGame}
            className="group relative px-10 py-5 rounded-2xl font-bold text-xl text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30"
          >
            {/* Button gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            
            {/* Border glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
            
            <span className="relative flex items-center gap-3">
              <Play className="w-7 h-7" fill="currentColor" />
              JOGAR
            </span>
          </button>
          
          <button className="group relative px-8 py-4 rounded-xl font-bold text-lg text-white/90 border-2 border-white/20 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/40 hover:bg-white/5">
            <span className="relative flex items-center gap-2">
              <Info className="w-5 h-5" />
              COMO JOGAR
            </span>
          </button>
        </div>

        {/* Controls hint */}
        <div className="mt-12 flex flex-wrap gap-6 justify-center text-white/60 font-game text-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-pixel">← →</kbd>
            <span>Mover</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-pixel">ESPAÇO</kbd>
            <span>Pular</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-pixel">J</kbd>
            <span>Atirar</span>
          </div>
        </div>

        {/* Stats/Features */}
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/20">
              <Gamepad2 className="w-6 h-6 text-orange-400" />
            </div>
            <p className="font-pixel text-lg text-white">6</p>
            <p className="text-xs text-white/50">Fases</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <p className="font-pixel text-lg text-white">5</p>
            <p className="text-xs text-white/50">Personagens</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/20">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="font-pixel text-lg text-white">1</p>
            <p className="text-xs text-white/50">Boss</p>
          </div>
        </div>
      </div>

      {/* Power-ups preview with enhanced animations */}
      <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-8 z-10">
        <div className="relative group animate-float" style={{ animationDelay: '0s' }}>
          <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <img src={coffeeSprite} alt="Coffee" className="relative w-14 h-14 object-contain drop-shadow-2xl" />
        </div>
        <div className="relative group animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <img src={wifiSprite} alt="Wi-Fi" className="relative w-14 h-14 object-contain drop-shadow-2xl" />
        </div>
        <div className="relative group animate-float" style={{ animationDelay: '1s' }}>
          <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <img src={networkingSprite} alt="Networking" className="relative w-14 h-14 object-contain drop-shadow-2xl" />
        </div>
      </div>

      {/* Enemy previews */}
      <div className="absolute bottom-44 right-12 flex gap-4 z-10">
        <div className="relative animate-bounce-slow" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg" />
          <img src={deadlineSprite} alt="Deadline" className="relative w-12 h-12 object-contain" />
        </div>
        <div className="relative animate-bounce-slow">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg" />
          <img src={spamSprite} alt="Spam" className="relative w-12 h-12 object-contain" />
        </div>
        <div className="relative animate-bounce-slow" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-lg" />
          <img src={slothSprite} alt="Sloth" className="relative w-14 h-14 object-contain" />
        </div>
      </div>

      {/* Character previews with glass effect */}
      <div className="absolute bottom-44 left-12 flex -space-x-3 z-10">
        {characters.slice(0, 3).map((char, i) => (
          <div
            key={char.id}
            className="relative animate-float"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            <div 
              className="absolute inset-0 rounded-full blur-lg opacity-50"
              style={{ background: char.color }}
            />
            <img 
              src={char.sprite} 
              alt={char.name}
              className="relative w-14 h-14 object-contain rounded-full border-2 border-white/30 backdrop-blur-sm"
              style={{ background: `${char.color}40` }}
            />
          </div>
        ))}
      </div>

      {/* Version */}
      <div className="absolute bottom-4 right-4 text-white/30 text-xs font-pixel">
        v1.0.0
      </div>
    </div>
  );
};

export default MainMenu;
