import React, { useEffect, useState, useRef } from 'react';
import { Play, Info, Sparkles, Gamepad2, Trophy, Users } from 'lucide-react';
import { characters } from '@/data/characters';

import coffeeSprite from '@/assets/sprites/coffee.png';
import wifiSprite from '@/assets/sprites/wifi.png';
import networkingSprite from '@/assets/sprites/networking.png';
import slothSprite from '@/assets/sprites/sloth.png';
import deadlineSprite from '@/assets/sprites/deadline.png';
import spamSprite from '@/assets/sprites/spam.png';
import bossSprite from '@/assets/sprites/boss.png';

interface MainMenuProps {
  onStartGame: () => void;
}

interface FloatingSprite {
  id: number;
  sprite: string;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'character' | 'enemy' | 'powerup';
  scale: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingSprites, setFloatingSprites] = useState<FloatingSprite[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const spritesRef = useRef<FloatingSprite[]>([]);

  // Initialize floating sprites
  useEffect(() => {
    const allSprites = [
      // Characters
      ...characters.map(c => ({ sprite: c.sprite, type: 'character' as const })),
      // Enemies
      { sprite: slothSprite, type: 'enemy' as const },
      { sprite: deadlineSprite, type: 'enemy' as const },
      { sprite: spamSprite, type: 'enemy' as const },
      { sprite: bossSprite, type: 'enemy' as const },
      // Power-ups
      { sprite: coffeeSprite, type: 'powerup' as const },
      { sprite: wifiSprite, type: 'powerup' as const },
      { sprite: networkingSprite, type: 'powerup' as const },
    ];

    const sprites: FloatingSprite[] = allSprites.map((s, i) => ({
      id: i,
      sprite: s.sprite,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: s.type === 'powerup' ? 40 : s.type === 'enemy' ? 50 : 60,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      opacity: 0.4 + Math.random() * 0.3,
      type: s.type,
      scale: 0.8 + Math.random() * 0.4,
    }));

    setFloatingSprites(sprites);
    spritesRef.current = sprites;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas animation for floating sprites
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load all images
    const loadedImages: Map<string, HTMLImageElement> = new Map();
    const allSpriteSrcs = [
      ...characters.map(c => c.sprite),
      slothSprite, deadlineSprite, spamSprite, bossSprite,
      coffeeSprite, wifiSprite, networkingSprite,
    ];

    Promise.all(
      allSpriteSrcs.map(src => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loadedImages.set(src, img);
            resolve();
          };
          img.src = src;
        });
      })
    ).then(() => {
      const animate = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        spritesRef.current = spritesRef.current.map(sprite => {
          let newX = sprite.x + sprite.speedX;
          let newY = sprite.y + sprite.speedY;
          let newSpeedX = sprite.speedX;
          let newSpeedY = sprite.speedY;

          // Bounce off edges
          if (newX < -sprite.size) newX = canvas.width + sprite.size;
          if (newX > canvas.width + sprite.size) newX = -sprite.size;
          if (newY < -sprite.size) newY = canvas.height + sprite.size;
          if (newY > canvas.height + sprite.size) newY = -sprite.size;

          const newRotation = sprite.rotation + sprite.rotationSpeed;

          // Draw the sprite
          const img = loadedImages.get(sprite.sprite);
          if (img) {
            ctx.save();
            ctx.globalAlpha = sprite.opacity;
            ctx.translate(newX, newY);
            
            // Add slight bobbing animation
            const bobbing = Math.sin(Date.now() * 0.002 + sprite.id) * 5;
            ctx.translate(0, bobbing);
            
            // Add glow effect based on type
            if (sprite.type === 'powerup') {
              ctx.shadowColor = sprite.sprite.includes('coffee') ? '#FF9800' : 
                               sprite.sprite.includes('wifi') ? '#2196F3' : '#4CAF50';
              ctx.shadowBlur = 15;
            } else if (sprite.type === 'enemy') {
              ctx.shadowColor = '#F44336';
              ctx.shadowBlur = 10;
            } else {
              ctx.shadowColor = '#6366F1';
              ctx.shadowBlur = 12;
            }
            
            const size = sprite.size * sprite.scale;
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
          }

          return {
            ...sprite,
            x: newX,
            y: newY,
            speedX: newSpeedX,
            speedY: newSpeedY,
            rotation: newRotation,
          };
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Floating sprites canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden z-1">
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

      {/* Pixel art scanlines effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-2 opacity-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10 z-1">
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

      {/* Pixel art buildings silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-3">
        <svg className="w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice" style={{ imageRendering: 'pixelated' }}>
          <defs>
            <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          
          {/* Pixelated buildings */}
          <rect x="40" y="80" width="80" height="120" fill="url(#buildingGrad)" />
          <rect x="140" y="40" width="100" height="160" fill="url(#buildingGrad)" />
          <rect x="260" y="60" width="70" height="140" fill="url(#buildingGrad)" />
          <rect x="350" y="30" width="120" height="170" fill="url(#buildingGrad)" />
          <rect x="490" y="50" width="90" height="150" fill="url(#buildingGrad)" />
          <rect x="600" y="20" width="140" height="180" fill="url(#buildingGrad)" />
          <rect x="760" y="60" width="80" height="140" fill="url(#buildingGrad)" />
          <rect x="860" y="40" width="110" height="160" fill="url(#buildingGrad)" />
          <rect x="990" y="70" width="90" height="130" fill="url(#buildingGrad)" />
          <rect x="1100" y="50" width="80" height="150" fill="url(#buildingGrad)" />
          
          {/* Pixel windows - animated glow */}
          {[...Array(80)].map((_, i) => {
            const buildingX = [50, 160, 275, 370, 510, 630, 775, 880, 1010, 1115][i % 10];
            const offsetX = (i % 3) * 20 + 10;
            const offsetY = 50 + Math.floor((i / 10) % 4) * 25;
            const isLit = (i * 7 + Math.floor(Date.now() / 2000)) % 5 !== 0;
            return (
              <rect
                key={i}
                x={buildingX + offsetX}
                y={offsetY}
                width="12"
                height="16"
                fill={isLit ? "url(#windowGlow)" : "#1a1a2e"}
                opacity={isLit ? 0.9 : 0.4}
              />
            );
          })}
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Logo badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-sm animate-slide-up">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white/80 font-pixel">Jogo Indie 2024</span>
        </div>

        {/* Title with pixel art style */}
        <div className="relative mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30" />
          <h1 className="relative font-pixel text-4xl md:text-6xl lg:text-7xl font-bold mb-2 tracking-wide">
            <span 
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent"
              style={{ 
                textShadow: '4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                WebkitTextStroke: '2px #000',
              }}
            >
              COWORKING
            </span>
          </h1>
          <h2 className="relative font-pixel text-3xl md:text-5xl font-bold">
            <span 
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent"
              style={{ 
                textShadow: '3px 3px 0 #000',
              }}
            >
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

        {/* Action buttons with pixel art style */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={onStartGame}
            className="group relative px-10 py-5 rounded-lg font-pixel text-xl text-white overflow-hidden transition-all duration-150 hover:scale-105 hover:-translate-y-1 active:translate-y-1"
            style={{
              background: 'linear-gradient(180deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
              boxShadow: '0 6px 0 #7C2D12, 0 8px 10px rgba(0,0,0,0.4)',
              border: '3px solid #FDBA74',
            }}
          >
            <span className="relative flex items-center gap-3">
              <Play className="w-7 h-7" fill="currentColor" />
              JOGAR
            </span>
          </button>
          
          <button 
            className="group relative px-8 py-4 rounded-lg font-pixel text-lg text-white/90 transition-all duration-150 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)',
              boxShadow: '0 4px 0 #312E81, 0 6px 8px rgba(0,0,0,0.3)',
              border: '2px solid #818CF8',
            }}
          >
            <span className="relative flex items-center gap-2">
              <Info className="w-5 h-5" />
              COMO JOGAR
            </span>
          </button>
        </div>

        {/* Controls hint with pixel style */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center text-white/60 font-pixel text-xs animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded border-2 border-white/20">
            <kbd className="px-2 py-1 bg-white/10 rounded text-white/80">← →</kbd>
            <span>Mover</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded border-2 border-white/20">
            <kbd className="px-2 py-1 bg-white/10 rounded text-white/80">ESPAÇO</kbd>
            <span>Pular</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded border-2 border-white/20">
            <kbd className="px-2 py-1 bg-white/10 rounded text-white/80">J</kbd>
            <span>Atirar</span>
          </div>
        </div>

        {/* Stats with pixel art icons */}
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="text-center">
            <div 
              className="w-14 h-14 mx-auto mb-2 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 4px 0 #7C2D12',
                border: '2px solid #FDBA74',
              }}
            >
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <p className="font-pixel text-xl text-white">6</p>
            <p className="text-xs text-white/50 font-pixel">FASES</p>
          </div>
          <div className="text-center">
            <div 
              className="w-14 h-14 mx-auto mb-2 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
                boxShadow: '0 4px 0 #4C1D95',
                border: '2px solid #C4B5FD',
              }}
            >
              <Users className="w-7 h-7 text-white" />
            </div>
            <p className="font-pixel text-xl text-white">5</p>
            <p className="text-xs text-white/50 font-pixel">HERÓIS</p>
          </div>
          <div className="text-center">
            <div 
              className="w-14 h-14 mx-auto mb-2 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                boxShadow: '0 4px 0 #92400E',
                border: '2px solid #FDE68A',
              }}
            >
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <p className="font-pixel text-xl text-white">1</p>
            <p className="text-xs text-white/50 font-pixel">BOSS</p>
          </div>
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-4 right-4 text-white/30 text-xs font-pixel z-10">
        v1.0.0
      </div>
    </div>
  );
};

export default MainMenu;
