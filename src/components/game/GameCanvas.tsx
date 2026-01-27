import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Level, Player, Enemy, PowerUp, Projectile, CharacterId, BackgroundType, BossArena } from '@/types/game';
import { characters } from '@/data/characters';
import { updateEnemyAI, EnemyProjectile } from './EnemyAI';
import GameHUD from './GameHUD';

// Import sprites
import slothSprite from '@/assets/sprites/sloth.png';
import deadlineSprite from '@/assets/sprites/deadline.png';
import spamSprite from '@/assets/sprites/spam.png';
import bossSprite from '@/assets/sprites/boss.png';
import coffeeSprite from '@/assets/sprites/coffee.png';
import wifiSprite from '@/assets/sprites/wifi.png';
import networkingSprite from '@/assets/sprites/networking.png';

interface GameCanvasProps {
  level: Level;
  characterId: CharacterId;
  onLevelComplete: (networkingCollected: number, coinsCollected: number) => void;
  onGameOver: () => void;
  onPause: () => void;
  onBossDefeated?: () => void;
}

// Shoot timer for muzzle flash
interface ShootState {
  shootTimer: number;
  shootCooldown: number;
}

// Collect effect for power-ups
interface CollectEffect {
  id: string;
  x: number;
  y: number;
  type: 'coffee' | 'wifi' | 'networking' | 'coin';
  timer: number;
  particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }>;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -14;
const MOVE_SPEED = 5;
const COFFEE_SPEED_BOOST = 2;
const COFFEE_JUMP_BOOST = -3;
const COFFEE_DURATION = 300;
const PROJECTILE_SPEED = 12;
const PROGRAMMER_SHOOT_COOLDOWN = 180; // 3 segundos a 60fps
const NORMAL_SHOOT_COOLDOWN = 60; // 1 segundo a 60fps

// Character-specific modifiers
const getCharacterModifiers = (characterId: CharacterId) => {
  switch (characterId) {
    case 'entrepreneur':
      return { canDoubleJump: true, gravityMod: 1, speedMod: 1, collectRadius: 1, startsWithWifi: false, isProgrammer: false, jumpBoost: 1 };
    case 'designer':
      // Designer: gravidade muito reduzida + pulo mais alto
      return { canDoubleJump: false, gravityMod: 0.5, speedMod: 1, collectRadius: 1, startsWithWifi: false, isProgrammer: false, jumpBoost: 1.15 };
    case 'programmer':
      // Programador: começa com wifi mas tiro lento (1 a cada 3s)
      return { canDoubleJump: false, gravityMod: 1, speedMod: 1, collectRadius: 1, startsWithWifi: true, isProgrammer: true, jumpBoost: 1 };
    case 'socialmedia':
      // Social Media: raio de coleta MUITO maior (3x) + atrai itens
      return { canDoubleJump: false, gravityMod: 1, speedMod: 1, collectRadius: 3, startsWithWifi: false, isProgrammer: false, jumpBoost: 1 };
    case 'gestor':
      // Gestor: velocidade muito maior (40%)
      return { canDoubleJump: false, gravityMod: 1, speedMod: 1.4, collectRadius: 1, startsWithWifi: false, isProgrammer: false, jumpBoost: 1 };
    default:
      return { canDoubleJump: false, gravityMod: 1, speedMod: 1, collectRadius: 1, startsWithWifi: false, isProgrammer: false, jumpBoost: 1 };
  }
};

// Enhanced pixel art background drawing with parallax
const drawBackground = (
  ctx: CanvasRenderingContext2D,
  background: BackgroundType,
  cameraX: number,
  gameTime: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  
  switch (background) {
    case 'urban':
      bgGradient.addColorStop(0, '#87CEEB');
      bgGradient.addColorStop(0.5, '#B0E2FF');
      bgGradient.addColorStop(1, '#E0F4FF');
      break;
    case 'sunset':
      bgGradient.addColorStop(0, '#FF6B35');
      bgGradient.addColorStop(0.3, '#FF8C42');
      bgGradient.addColorStop(0.6, '#FF5E78');
      bgGradient.addColorStop(1, '#9C27B0');
      break;
    case 'coworking':
      bgGradient.addColorStop(0, '#F5F5F5');
      bgGradient.addColorStop(0.5, '#EEEEEE');
      bgGradient.addColorStop(1, '#E0E0E0');
      break;
    case 'meeting':
      bgGradient.addColorStop(0, '#E3F2FD');
      bgGradient.addColorStop(0.5, '#BBDEFB');
      bgGradient.addColorStop(1, '#90CAF9');
      break;
    case 'rooftop':
      bgGradient.addColorStop(0, '#0D1B2A');
      bgGradient.addColorStop(0.4, '#1B263B');
      bgGradient.addColorStop(0.7, '#415A77');
      bgGradient.addColorStop(1, '#778DA9');
      break;
    case 'happyhour':
      bgGradient.addColorStop(0, '#2D1B69');
      bgGradient.addColorStop(0.3, '#5B2C6F');
      bgGradient.addColorStop(0.6, '#8E44AD');
      bgGradient.addColorStop(1, '#D35400');
      break;
    case 'datacenter':
      bgGradient.addColorStop(0, '#0a0a0a');
      bgGradient.addColorStop(0.3, '#1a1a2e');
      bgGradient.addColorStop(0.7, '#16213e');
      bgGradient.addColorStop(1, '#0f3460');
      break;
    case 'office':
      bgGradient.addColorStop(0, '#E8E8E8');
      bgGradient.addColorStop(0.5, '#D0D0D0');
      bgGradient.addColorStop(1, '#B8B8B8');
      break;
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw pixel art stars for night scenes
  if (background === 'rooftop' || background === 'happyhour' || background === 'datacenter') {
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 60; i++) {
      const starX = ((i * 47 + cameraX * 0.05) % (canvasWidth + 100)) - 50;
      const starY = (i * 23) % (canvasHeight * 0.5);
      const twinkle = Math.sin(gameTime * 0.1 + i) > 0.3;
      if (twinkle) {
        ctx.globalAlpha = 0.6 + Math.sin(gameTime * 0.05 + i * 0.5) * 0.4;
        ctx.fillRect(Math.floor(starX), Math.floor(starY), 2, 2);
        ctx.fillRect(Math.floor(starX) - 1, Math.floor(starY) + 1, 1, 1);
        ctx.fillRect(Math.floor(starX) + 2, Math.floor(starY) + 1, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }
  
  // Draw pixel art clouds for day scenes with parallax
  if (background === 'urban' || background === 'sunset') {
    for (let i = 0; i < 6; i++) {
      const cloudX = ((i * 200 - cameraX * 0.08) % (canvasWidth + 300)) - 100;
      const cloudY = 30 + (i % 3) * 50;
      
      ctx.fillStyle = background === 'sunset' ? 'rgba(255, 200, 150, 0.6)' : 'rgba(255, 255, 255, 0.9)';
      
      const cloudWidth = 60 + (i % 3) * 20;
      ctx.fillRect(Math.floor(cloudX), Math.floor(cloudY) + 8, cloudWidth, 16);
      ctx.fillRect(Math.floor(cloudX) + 8, Math.floor(cloudY), cloudWidth - 16, 8);
      ctx.fillRect(Math.floor(cloudX) + 16, Math.floor(cloudY) + 24, cloudWidth - 32, 8);
    }
  }
  
  // Datacenter specific - server racks in background
  if (background === 'datacenter') {
    ctx.fillStyle = '#1a1a2e';
    for (let i = 0; i < 20; i++) {
      const rackX = Math.floor((i * 100 - cameraX * 0.15) % (canvasWidth + 300)) - 100;
      const rackH = 120 + (i % 3) * 40;
      ctx.fillRect(rackX, canvasHeight - 80 - rackH, 40, rackH);
      
      // Blinking LEDs
      for (let led = 0; led < 5; led++) {
        const isOn = (gameTime + i * 10 + led * 7) % 30 < 15;
        ctx.fillStyle = isOn ? '#00FF00' : '#003300';
        ctx.fillRect(rackX + 5, canvasHeight - 70 - rackH + led * 20, 4, 4);
        ctx.fillStyle = isOn ? '#FF0000' : '#330000';
        ctx.fillRect(rackX + 12, canvasHeight - 70 - rackH + led * 20, 4, 4);
      }
    }
  }
  
  // Draw pixel art buildings with parallax layers
  if (background === 'urban' || background === 'sunset' || background === 'rooftop') {
    const farColor = background === 'rooftop' ? '#1B263B' : background === 'sunset' ? '#4A3728' : '#64748B';
    ctx.fillStyle = farColor;
    for (let i = 0; i < 15; i++) {
      const bx = Math.floor((i * 120 - cameraX * 0.1) % (canvasWidth + 360) - 180);
      const bh = 60 + (i % 4) * 30;
      ctx.fillRect(bx, canvasHeight - 80 - bh, 50, bh);
    }
    
    const midColor = background === 'rooftop' ? '#415A77' : background === 'sunset' ? '#5D4037' : '#475569';
    ctx.fillStyle = midColor;
    for (let i = 0; i < 12; i++) {
      const bx = Math.floor((i * 150 - cameraX * 0.2) % (canvasWidth + 400) - 200);
      const bh = 80 + (i % 5) * 40;
      ctx.fillRect(bx, canvasHeight - 80 - bh, 70, bh);
      
      ctx.fillStyle = background === 'rooftop' ? '#FCD34D' : '#FEF3C7';
      for (let wy = 15; wy < bh - 20; wy += 20) {
        for (let wx = 10; wx < 60; wx += 18) {
          if ((i + wx + wy) % 3 !== 0) {
            ctx.fillRect(bx + wx, canvasHeight - 80 - bh + wy, 8, 10);
          }
        }
      }
      ctx.fillStyle = midColor;
    }
    
    const nearColor = background === 'rooftop' ? '#778DA9' : background === 'sunset' ? '#6D4C41' : '#334155';
    ctx.fillStyle = nearColor;
    for (let i = 0; i < 8; i++) {
      const bx = Math.floor((i * 200 - cameraX * 0.35) % (canvasWidth + 500) - 250);
      const bh = 100 + (i % 4) * 50;
      ctx.fillRect(bx, canvasHeight - 80 - bh, 90, bh);
      
      ctx.fillStyle = '#FBBF24';
      ctx.shadowColor = '#FCD34D';
      ctx.shadowBlur = 4;
      for (let wy = 20; wy < bh - 25; wy += 25) {
        for (let wx = 15; wx < 75; wx += 20) {
          if ((i + wx) % 2 === 0) {
            ctx.fillRect(bx + wx, canvasHeight - 80 - bh + wy, 10, 14);
          }
        }
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = nearColor;
    }
  }
  
  // Indoor scene decorations
  if (background === 'coworking' || background === 'meeting' || background === 'office') {
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvasWidth; i += 80) {
      const lineX = Math.floor(i - (cameraX * 0.1) % 80);
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, canvasHeight - 100);
      ctx.stroke();
    }
    
    const plantPositions = [100, 400, 700];
    plantPositions.forEach((px) => {
      const plantX = Math.floor((px - cameraX * 0.2) % (canvasWidth + 200));
      
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(plantX - 12, canvasHeight - 125, 24, 40);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(plantX - 15, canvasHeight - 130, 30, 8);
      
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(plantX - 20, canvasHeight - 160, 8, 30);
      ctx.fillRect(plantX + 12, canvasHeight - 155, 8, 25);
      ctx.fillRect(plantX - 4, canvasHeight - 170, 8, 40);
      ctx.fillStyle = '#66BB6A';
      ctx.fillRect(plantX - 8, canvasHeight - 165, 8, 35);
      ctx.fillRect(plantX + 4, canvasHeight - 160, 8, 30);
    });
  }
  
  // Happy hour disco effects
  if (background === 'happyhour') {
    const discoX = canvasWidth / 2;
    const discoY = 60;
    
    ctx.globalAlpha = 0.2;
    const colors = ['#FF1744', '#FFEA00', '#00E676', '#2979FF', '#D500F9', '#FF9100'];
    for (let i = 0; i < 8; i++) {
      const angle = (gameTime * 0.03 + i * Math.PI / 4);
      const rayLength = 180;
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(discoX, discoY);
      ctx.lineTo(
        discoX + Math.cos(angle - 0.15) * rayLength,
        discoY + Math.sin(angle - 0.15) * rayLength
      );
      ctx.lineTo(
        discoX + Math.cos(angle + 0.15) * rayLength,
        discoY + Math.sin(angle + 0.15) * rayLength
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(discoX - 15, discoY - 15, 30, 30);
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(discoX - 12, discoY - 12, 8, 8);
    ctx.fillRect(discoX + 4, discoY - 12, 8, 8);
    ctx.fillRect(discoX - 12, discoY + 4, 8, 8);
    ctx.fillRect(discoX + 4, discoY + 4, 8, 8);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(discoX - 4, discoY - 4, 8, 8);
    
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(discoX - 1, 0, 2, discoY - 15);
  }
};

// Draw pixel art platform
const drawPlatform = (
  ctx: CanvasRenderingContext2D,
  platform: { x: number; y: number; width: number; height: number; type: string },
  platX: number,
  gameTime: number
) => {
  const px = Math.floor(platX);
  const py = Math.floor(platform.y);
  
  switch (platform.type) {
    case 'ground':
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(px, py, platform.width, 8);
      ctx.fillStyle = '#388E3C';
      ctx.fillRect(px, py + 8, platform.width, 8);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(px, py + 16, platform.width, platform.height - 16);
      ctx.fillStyle = '#795548';
      for (let dx = 0; dx < platform.width; dx += 16) {
        for (let dy = 20; dy < platform.height; dy += 12) {
          if ((dx + dy) % 24 === 0) {
            ctx.fillRect(px + dx + 4, py + dy, 6, 4);
          }
        }
      }
      ctx.fillStyle = '#66BB6A';
      for (let gx = 8; gx < platform.width; gx += 20) {
        ctx.fillRect(px + gx, py - 4, 4, 6);
        ctx.fillRect(px + gx + 6, py - 2, 3, 4);
      }
      break;
      
    case 'platform':
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(px, py, platform.width, 4);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(px, py + 4, platform.width, platform.height - 8);
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(px, py + platform.height - 4, platform.width, 4);
      ctx.fillStyle = '#795548';
      for (let i = 0; i < platform.width; i += 24) {
        ctx.fillRect(px + i, py, 2, platform.height);
      }
      break;
      
    case 'moving':
      ctx.fillStyle = '#90A4AE';
      ctx.fillRect(px, py, platform.width, platform.height);
      ctx.fillStyle = '#B0BEC5';
      ctx.fillRect(px, py, platform.width, 4);
      ctx.fillStyle = '#607D8B';
      ctx.fillRect(px, py + platform.height - 4, platform.width, 4);
      ctx.fillStyle = '#4FC3F7';
      ctx.fillRect(px, py + platform.height - 2, platform.width, 2);
      ctx.fillStyle = '#CFD8DC';
      ctx.fillRect(px + 8, py + platform.height / 2 - 2, 8, 4);
      ctx.fillRect(px + platform.width - 16, py + platform.height / 2 - 2, 8, 4);
      break;
      
    case 'desk':
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(px, py, platform.width, 8);
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(px, py + 8, platform.width, platform.height - 8);
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(px + 8, py + platform.height, 12, 20);
      ctx.fillRect(px + platform.width - 20, py + platform.height, 12, 20);
      if (platform.width > 80) {
        ctx.fillStyle = '#37474F';
        ctx.fillRect(px + platform.width / 2 - 16, py - 28, 32, 24);
        ctx.fillStyle = '#4FC3F7';
        ctx.fillRect(px + platform.width / 2 - 13, py - 25, 26, 18);
        ctx.fillStyle = '#37474F';
        ctx.fillRect(px + platform.width / 2 - 4, py - 4, 8, 8);
      }
      break;
      
    case 'glass':
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#81D4FA';
      ctx.fillRect(px, py, platform.width, platform.height);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#E1F5FE';
      ctx.fillRect(px + 4, py + 2, platform.width * 0.5, 4);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#29B6F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, platform.width, platform.height);
      break;
      
    case 'rooftop':
      ctx.fillStyle = '#78909C';
      ctx.fillRect(px, py, platform.width, 6);
      ctx.fillStyle = '#546E7A';
      ctx.fillRect(px, py + 6, platform.width, platform.height - 6);
      ctx.fillStyle = '#90A4AE';
      ctx.fillRect(px, py, platform.width, 3);
      if (platform.width > 150) {
        for (let i = 0; i < Math.floor(platform.width / 120); i++) {
          const acX = px + 40 + i * 120;
          ctx.fillStyle = '#BDBDBD';
          ctx.fillRect(acX, py - 20, 32, 20);
          ctx.fillStyle = '#9E9E9E';
          ctx.fillRect(acX + 4, py - 16, 24, 3);
          ctx.fillRect(acX + 4, py - 10, 24, 3);
        }
      }
      break;
      
    case 'building':
      ctx.fillStyle = '#455A64';
      ctx.fillRect(px, py, platform.width, platform.height);
      ctx.fillStyle = '#37474F';
      ctx.fillRect(px, py, 4, platform.height);
      ctx.fillRect(px + platform.width - 4, py, 4, platform.height);
      ctx.fillStyle = '#FFF59D';
      for (let wy = 20; wy < platform.height - 80; wy += 35) {
        for (let wx = 20; wx < platform.width - 30; wx += 45) {
          ctx.fillRect(px + wx, py + wy, 25, 20);
        }
      }
      ctx.fillStyle = '#FF9800';
      ctx.fillRect(px + platform.width / 2 - 25, py + platform.height - 70, 50, 70);
      ctx.fillStyle = '#FFB74D';
      ctx.fillRect(px + platform.width / 2 - 20, py + platform.height - 65, 40, 60);
      break;
      
    case 'arena-wall':
      // Parede de arena - bloqueio visual
      ctx.fillStyle = '#F44336';
      ctx.fillRect(px, py, platform.width, platform.height);
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(px + 2, py, platform.width - 4, platform.height);
      // Stripes de perigo
      ctx.fillStyle = '#FFEB3B';
      for (let stripe = 0; stripe < platform.height; stripe += 20) {
        ctx.fillRect(px, py + stripe, platform.width, 10);
      }
      break;
  }
};

const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  characterId,
  onLevelComplete,
  onGameOver,
  onPause,
  onBossDefeated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  
  const character = characters.find(c => c.id === characterId)!;
  const modifiers = getCharacterModifiers(characterId);

  // Shoot state for muzzle flash
  const [shootState, setShootState] = useState<ShootState>({
    shootTimer: 0,
    shootCooldown: 0,
  });

  // Boss arena state
  const [bossArena, setBossArena] = useState<BossArena | null>(level.bossArena || null);

  // Collect effects
  const [collectEffects, setCollectEffects] = useState<CollectEffect[]>([]);

  // Load images
  const [images, setImages] = useState<{
    character: HTMLImageElement | null;
    sloth: HTMLImageElement | null;
    deadline: HTMLImageElement | null;
    spam: HTMLImageElement | null;
    boss: HTMLImageElement | null;
    coffee: HTMLImageElement | null;
    wifi: HTMLImageElement | null;
    networking: HTMLImageElement | null;
  }>({
    character: null,
    sloth: null,
    deadline: null,
    spam: null,
    boss: null,
    coffee: null,
    wifi: null,
    networking: null,
  });

  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    Promise.all([
      loadImage(character.sprite),
      loadImage(slothSprite),
      loadImage(deadlineSprite),
      loadImage(spamSprite),
      loadImage(bossSprite),
      loadImage(coffeeSprite),
      loadImage(wifiSprite),
      loadImage(networkingSprite),
    ]).then(([charImg, slothImg, deadlineImg, spamImg, bossImg, coffeeImg, wifiImg, networkingImg]) => {
      setImages({
        character: charImg,
        sloth: slothImg,
        deadline: deadlineImg,
        spam: spamImg,
        boss: bossImg,
        coffee: coffeeImg,
        wifi: wifiImg,
        networking: networkingImg,
      });
    });
  }, [character.sprite]);

  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: 400,
    width: 48,
    height: 64,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    isGrounded: false,
    facingRight: true,
    hasCoffee: false,
    hasWifi: modifiers.startsWithWifi,
    coffeeTimer: 0,
    networkingCollected: 0,
    canDoubleJump: modifiers.canDoubleJump,
    hasDoubleJumped: false,
    health: 3,
    maxHealth: 3,
    invincible: false,
    invincibleTimer: 0,
    coins: 0,
    shootCooldown: 0,
    isProgrammer: modifiers.isProgrammer,
  });

  const [enemies, setEnemies] = useState<Enemy[]>(() => 
    level.enemies.map(e => ({ ...e }))
  );
  
  const [powerUps, setPowerUps] = useState<PowerUp[]>(() => 
    level.powerUps.map(p => ({ ...p }))
  );

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [bossProjectiles, setBossProjectiles] = useState<Projectile[]>([]);
  const [cameraX, setCameraX] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [bossDefeated, setBossDefeated] = useState(false);

  // Reset game state when level changes
  useEffect(() => {
    setPlayer({
      x: 100,
      y: 400,
      width: 48,
      height: 64,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      isGrounded: false,
      facingRight: true,
      hasCoffee: false,
      hasWifi: modifiers.startsWithWifi,
      coffeeTimer: 0,
      networkingCollected: 0,
      canDoubleJump: modifiers.canDoubleJump,
      hasDoubleJumped: false,
      health: 3,
      maxHealth: 3,
      invincible: false,
      invincibleTimer: 0,
      coins: 0,
      shootCooldown: 0,
      isProgrammer: modifiers.isProgrammer,
    });
    setEnemies(level.enemies.map(e => ({ ...e, alive: true })));
    setPowerUps(level.powerUps.map(p => ({ ...p, collected: false })));
    setProjectiles([]);
    setBossProjectiles([]);
    setCameraX(0);
    setGameTime(0);
    setBossDefeated(false);
    setCollectEffects([]);
    setShootState({ shootTimer: 0, shootCooldown: 0 });
    setBossArena(level.bossArena || null);
  }, [level, modifiers.startsWithWifi, modifiers.canDoubleJump, modifiers.isProgrammer]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keysRef.current.has(e.code)) return;
      keysRef.current.add(e.code);
      
      if (e.code === 'Escape') {
        onPause();
      }
      
      // Jump logic with double jump and character-specific boost
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        setPlayer(prev => {
          if (prev.isGrounded) {
            let jumpForce = prev.hasCoffee ? JUMP_FORCE + COFFEE_JUMP_BOOST : JUMP_FORCE;
            jumpForce *= modifiers.jumpBoost;
            return {
              ...prev,
              velocityY: jumpForce,
              isJumping: true,
              isGrounded: false,
              hasDoubleJumped: false,
            };
          } else if (prev.canDoubleJump && !prev.hasDoubleJumped) {
            let jumpForce = prev.hasCoffee ? JUMP_FORCE + COFFEE_JUMP_BOOST : JUMP_FORCE;
            jumpForce *= modifiers.jumpBoost;
            return {
              ...prev,
              velocityY: jumpForce * 0.85,
              hasDoubleJumped: true,
            };
          }
          return prev;
        });
      }
      
      // Shoot projectile - with cooldown based on character
      if (e.code === 'KeyJ') {
        setPlayer(prev => {
          if (prev.hasWifi && (prev.shootCooldown || 0) <= 0) {
            setShootState(state => ({ ...state, shootTimer: 15 }));
            const newProjectile: Projectile = {
              id: `proj-${Date.now()}`,
              x: prev.x + (prev.facingRight ? prev.width : 0),
              y: prev.y + prev.height / 2,
              velocityX: prev.facingRight ? PROJECTILE_SPEED : -PROJECTILE_SPEED,
              active: true,
              type: 'wifi',
            };
            setProjectiles(projs => [...projs, newProjectile]);
            
            // Cooldown baseado no personagem
            const cooldown = prev.isProgrammer ? PROGRAMMER_SHOOT_COOLDOWN : NORMAL_SHOOT_COOLDOWN;
            return { ...prev, shootCooldown: cooldown };
          }
          return prev;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPause, modifiers.jumpBoost]);

  // Collision detection
  const checkCollision = useCallback((
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number
  ) => {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }, []);

  // Create collect effect
  const createCollectEffect = useCallback((x: number, y: number, type: 'coffee' | 'wifi' | 'networking' | 'coin') => {
    const particles = [];
    const particleCount = type === 'coin' ? 8 : 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * (3 + Math.random() * 2),
        vy: Math.sin(angle) * (3 + Math.random() * 2),
        size: 4 + Math.random() * 4,
        alpha: 1,
      });
    }
    
    setCollectEffects(prev => [...prev, {
      id: `effect-${Date.now()}-${Math.random()}`,
      x,
      y,
      type,
      timer: 30,
      particles,
    }]);
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      setGameTime(prev => prev + 1);

      // Update shoot timer and cooldown
      setShootState(prev => ({
        shootTimer: Math.max(0, prev.shootTimer - 1),
        shootCooldown: Math.max(0, prev.shootCooldown - 1),
      }));

      // Update player shoot cooldown
      setPlayer(prev => ({
        ...prev,
        shootCooldown: Math.max(0, (prev.shootCooldown || 0) - 1),
      }));

      // Update collect effects
      setCollectEffects(prev => {
        return prev
          .map(effect => ({
            ...effect,
            timer: effect.timer - 1,
            particles: effect.particles.map(p => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy + 0.2,
              alpha: p.alpha - 0.03,
            })),
          }))
          .filter(effect => effect.timer > 0);
      });

      // Check boss arena trigger
      if (bossArena && !bossArena.active && player.x > bossArena.triggerX) {
        setBossArena({ ...bossArena, active: true });
      }

      setPlayer(prevPlayer => {
        let newPlayer = { ...prevPlayer };
        const keys = keysRef.current;

        // Invincibility timer
        if (newPlayer.invincible && newPlayer.invincibleTimer !== undefined) {
          newPlayer.invincibleTimer--;
          if (newPlayer.invincibleTimer <= 0) {
            newPlayer.invincible = false;
          }
        }

        // Movement with character speed modifier
        const baseSpeed = newPlayer.hasCoffee ? MOVE_SPEED + COFFEE_SPEED_BOOST : MOVE_SPEED;
        const speed = baseSpeed * modifiers.speedMod;
        
        if (keys.has('ArrowLeft') || keys.has('KeyA')) {
          newPlayer.velocityX = -speed;
          newPlayer.facingRight = false;
        } else if (keys.has('ArrowRight') || keys.has('KeyD')) {
          newPlayer.velocityX = speed;
          newPlayer.facingRight = true;
        } else {
          newPlayer.velocityX = 0;
        }

        // Apply gravity with character modifier (designer floats)
        newPlayer.velocityY += GRAVITY * modifiers.gravityMod;

        // Update position
        newPlayer.x += newPlayer.velocityX;
        newPlayer.y += newPlayer.velocityY;

        // Boss arena bounds
        if (bossArena && bossArena.active) {
          if (newPlayer.x < bossArena.startX) {
            newPlayer.x = bossArena.startX;
            newPlayer.velocityX = 0;
          }
          if (newPlayer.x + newPlayer.width > bossArena.endX) {
            newPlayer.x = bossArena.endX - newPlayer.width;
            newPlayer.velocityX = 0;
          }
        }

        // Bounds checking
        if (newPlayer.x < 0) newPlayer.x = 0;
        if (newPlayer.x > level.width - newPlayer.width) {
          newPlayer.x = level.width - newPlayer.width;
        }

        // Platform collision
        newPlayer.isGrounded = false;
        level.platforms.forEach(platform => {
          if (platform.type === 'arena-wall') {
            // Skip arena walls if arena not active
            if (!bossArena || !bossArena.active) return;
            // Check if boss is defeated - remove walls
            if (bossDefeated) return;
          }
          
          let platX = platform.x;
          
          if (platform.type === 'moving' && platform.movingRange && platform.movingSpeed) {
            const range = platform.movingRange.max - platform.movingRange.min;
            const offset = Math.sin(gameTime * 0.02 * platform.movingSpeed) * range / 2;
            platX = platform.movingRange.min + range / 2 + offset;
          }

          if (checkCollision(
            newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height,
            platX, platform.y, platform.width, platform.height
          )) {
            if (newPlayer.velocityY > 0 && 
                prevPlayer.y + prevPlayer.height <= platform.y + 10) {
              newPlayer.y = platform.y - newPlayer.height;
              newPlayer.velocityY = 0;
              newPlayer.isGrounded = true;
              newPlayer.isJumping = false;
              newPlayer.hasDoubleJumped = false;
            }
            else if (newPlayer.velocityY < 0 && 
                     prevPlayer.y >= platform.y + platform.height - 10) {
              newPlayer.y = platform.y + platform.height;
              newPlayer.velocityY = 0;
            }
            else if (platform.type !== 'platform' && platform.type !== 'glass') {
              if (newPlayer.velocityX > 0) {
                newPlayer.x = platX - newPlayer.width;
              } else if (newPlayer.velocityX < 0) {
                newPlayer.x = platX + platform.width;
              }
            }
          }
        });

        // Fall death
        if (newPlayer.y > 650) {
          onGameOver();
          return prevPlayer;
        }

        // Coffee timer
        if (newPlayer.hasCoffee) {
          newPlayer.coffeeTimer--;
          if (newPlayer.coffeeTimer <= 0) {
            newPlayer.hasCoffee = false;
          }
        }

        // Goal check (only if boss is defeated or no boss)
        const boss = enemies.find(e => e.type === 'boss' && e.alive);
        if (!boss || bossDefeated) {
          if (checkCollision(
            newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height,
            level.goal.x, level.goal.y, 60, 100
          )) {
            onLevelComplete(newPlayer.networkingCollected, newPlayer.coins);
          }
        }

        return newPlayer;
      });

      // Update enemies with new AI system
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          if (!enemy.alive) return enemy;
          
          return updateEnemyAI(
            enemy,
            player,
            level.platforms,
            gameTime,
            (proj: EnemyProjectile) => {
              setBossProjectiles(prev => [...prev, proj]);
            }
          );
        });
      });

      // Player-enemy collision
      setPlayer(prevPlayer => {
        if (prevPlayer.invincible) return prevPlayer;
        
        let newPlayer = { ...prevPlayer };
        
        enemies.forEach((enemy, index) => {
          if (!enemy.alive) return;

          if (checkCollision(
            newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height,
            enemy.x, enemy.y, enemy.width, enemy.height
          )) {
            // Jumping on enemy
            if (newPlayer.velocityY > 0 && newPlayer.y + newPlayer.height < enemy.y + enemy.height / 2) {
              if (enemy.type === 'boss') {
                // Damage boss
                setEnemies(prev => prev.map((e, i) => {
                  if (i === index && e.health !== undefined) {
                    const newHealth = e.health - 1;
                    if (newHealth <= 0) {
                      setBossDefeated(true);
                      if (onBossDefeated) onBossDefeated();
                      return { ...e, alive: false, health: 0 };
                    }
                    return { ...e, health: newHealth, retreatTimer: 30 };
                  }
                  return e;
                }));
              } else {
                setEnemies(prev => prev.map((e, i) => 
                  i === index ? { ...e, alive: false } : e
                ));
              }
              newPlayer.velocityY = JUMP_FORCE / 2;
            } else {
              // Player takes damage
              if (newPlayer.health !== undefined && newPlayer.health > 0) {
                newPlayer.health--;
                newPlayer.invincible = true;
                newPlayer.invincibleTimer = 90;
                
                // Knockback
                newPlayer.velocityX = enemy.x > newPlayer.x ? -8 : 8;
                newPlayer.velocityY = -8;
                
                if (newPlayer.health <= 0) {
                  onGameOver();
                }
              } else {
                onGameOver();
              }
            }
          }
        });

        return newPlayer;
      });

      // Boss projectile collision
      setBossProjectiles(prev => {
        return prev.filter(proj => {
          if (!proj.active) return false;
          
          const newProj = {
            ...proj,
            x: proj.x + proj.velocityX,
            y: proj.y + (proj.velocityY || 0),
          };
          
          // Check collision with player
          if (!player.invincible && checkCollision(
            newProj.x - 10, newProj.y - 10, 20, 20,
            player.x, player.y, player.width, player.height
          )) {
            setPlayer(prev => {
              if (prev.health !== undefined && prev.health > 0) {
                const newHealth = prev.health - 1;
                if (newHealth <= 0) {
                  onGameOver();
                }
                return {
                  ...prev,
                  health: newHealth,
                  invincible: true,
                  invincibleTimer: 90,
                };
              }
              return prev;
            });
            return false;
          }
          
          // Remove if off screen
          if (newProj.x < cameraX - 100 || newProj.x > cameraX + 900 || newProj.y > 600 || newProj.y < -50) {
            return false;
          }
          
          return true;
        }).map(proj => ({
          ...proj,
          x: proj.x + proj.velocityX,
          y: proj.y + (proj.velocityY || 0),
        }));
      });

      // Update projectiles
      setProjectiles(prevProjectiles => {
        return prevProjectiles.filter(proj => {
          if (!proj.active) return false;
          
          const newProj = { ...proj, x: proj.x + proj.velocityX };
          
          enemies.forEach((enemy, index) => {
            if (enemy.alive && checkCollision(
              newProj.x, newProj.y - 10, 20, 20,
              enemy.x, enemy.y, enemy.width, enemy.height
            )) {
              if (enemy.type === 'boss') {
                setEnemies(prev => prev.map((e, i) => {
                  if (i === index && e.health !== undefined) {
                    const newHealth = e.health - 1;
                    if (newHealth <= 0) {
                      setBossDefeated(true);
                      if (onBossDefeated) onBossDefeated();
                      return { ...e, alive: false, health: 0 };
                    }
                    return { ...e, health: newHealth, retreatTimer: 30 };
                  }
                  return e;
                }));
              } else {
                setEnemies(prev => prev.map((e, i) => 
                  i === index ? { ...e, alive: false } : e
                ));
              }
              newProj.active = false;
            }
          });

          if (newProj.x < cameraX - 100 || newProj.x > cameraX + 900) {
            return false;
          }

          return newProj.active;
        }).map(proj => ({ ...proj, x: proj.x + proj.velocityX }));
      });

      // Power-up collection with social media's increased range
      const collectRadius = 32 * modifiers.collectRadius;
      setPowerUps(prevPowerUps => {
        return prevPowerUps.map(powerUp => {
          if (powerUp.collected) return powerUp;

          const playerCenterX = player.x + player.width / 2;
          const playerCenterY = player.y + player.height / 2;
          const powerUpCenterX = powerUp.x + 16;
          const powerUpCenterY = powerUp.y + 16;
          
          const distance = Math.sqrt(
            Math.pow(playerCenterX - powerUpCenterX, 2) + 
            Math.pow(playerCenterY - powerUpCenterY, 2)
          );

          if (distance < collectRadius + 20) {
            // Create collect effect
            createCollectEffect(powerUp.x + 16, powerUp.y + 16, powerUp.type);
            
            setPlayer(prev => {
              switch (powerUp.type) {
                case 'coffee':
                  return { ...prev, hasCoffee: true, coffeeTimer: COFFEE_DURATION };
                case 'wifi':
                  return { ...prev, hasWifi: true };
                case 'networking':
                  return { ...prev, networkingCollected: prev.networkingCollected + 1 };
                case 'coin':
                  return { ...prev, coins: prev.coins + 1 };
                default:
                  return prev;
              }
            });
            return { ...powerUp, collected: true };
          }

          return powerUp;
        });
      });

      // Update camera
      setCameraX(prevCamera => {
        const targetX = player.x - 400;
        const newCamera = prevCamera + (targetX - prevCamera) * 0.1;
        return Math.max(0, Math.min(newCamera, level.width - 800));
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [level, enemies, player, projectiles, bossProjectiles, cameraX, gameTime, checkCollision, onGameOver, onLevelComplete, onBossDefeated, modifiers, bossDefeated, createCollectEffect, bossArena]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable pixel art rendering
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw enhanced background
    drawBackground(ctx, level.background, cameraX, gameTime, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw platforms with enhanced graphics
    level.platforms.forEach(platform => {
      if (platform.type === 'arena-wall') {
        if (!bossArena || !bossArena.active) return;
        if (bossDefeated) return;
      }
      
      let platX = platform.x;
      
      if (platform.type === 'moving' && platform.movingRange && platform.movingSpeed) {
        const range = platform.movingRange.max - platform.movingRange.min;
        const offset = Math.sin(gameTime * 0.02 * platform.movingSpeed) * range / 2;
        platX = platform.movingRange.min + range / 2 + offset;
      }

      drawPlatform(ctx, platform, platX, gameTime);
    });

    // Draw goal with pixel art style
    const boss = enemies.find(e => e.type === 'boss' && e.alive);
    const goalAccessible = !boss || bossDefeated;
    
    const goalX = Math.floor(level.goal.x);
    const goalY = Math.floor(level.goal.y);
    
    // Door frame
    ctx.fillStyle = goalAccessible ? '#8B4513' : '#4A4A4A';
    ctx.fillRect(goalX, goalY, 60, 100);
    
    // Door
    ctx.fillStyle = goalAccessible ? '#FFD700' : '#6B6B6B';
    ctx.fillRect(goalX + 6, goalY + 6, 48, 88);
    
    // Door details
    ctx.fillStyle = goalAccessible ? '#FFA500' : '#5A5A5A';
    ctx.fillRect(goalX + 10, goalY + 10, 40, 35);
    ctx.fillRect(goalX + 10, goalY + 55, 40, 35);
    
    // Door handle
    ctx.fillStyle = goalAccessible ? '#CD853F' : '#3A3A3A';
    ctx.fillRect(goalX + 44, goalY + 50, 6, 12);
    
    // Glow effect if accessible
    if (goalAccessible) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.fillRect(goalX - 5, goalY - 5, 70, 110);
      ctx.shadowBlur = 0;
    }
    
    // Lock icon if boss alive
    if (!goalAccessible) {
      ctx.fillStyle = '#F44336';
      ctx.fillRect(goalX + 22, goalY - 20, 16, 12);
      ctx.fillRect(goalX + 18, goalY - 8, 24, 18);
    }

    // Draw power-ups with pixel art style and animation
    powerUps.forEach(powerUp => {
      if (powerUp.collected) return;

      const bounceY = Math.sin(gameTime * 0.1 + powerUp.x * 0.01) * 4;
      const size = powerUp.type === 'coin' ? 28 : 36;
      const px = Math.floor(powerUp.x);
      const py = Math.floor(powerUp.y + bounceY);
      
      if (powerUp.type === 'coin') {
        // Pixel art coin
        const rotation = Math.sin(gameTime * 0.15 + powerUp.x * 0.01);
        const coinWidth = Math.abs(rotation) * 20 + 8;
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(px + (28 - coinWidth) / 2, py, coinWidth, 28);
        ctx.fillStyle = '#FFA000';
        ctx.fillRect(px + (28 - coinWidth) / 2 + 2, py + 2, coinWidth - 4, 24);
        ctx.fillStyle = '#FFEB3B';
        ctx.fillRect(px + (28 - coinWidth) / 2 + 4, py + 4, 6, 6);
        
        // Glow
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(px + 14, py + 14, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        // Glow effect
        const glowColor = powerUp.type === 'coffee' ? 'rgba(255, 152, 0, 0.4)' : 
                         powerUp.type === 'wifi' ? 'rgba(33, 150, 243, 0.4)' : 'rgba(76, 175, 80, 0.4)';
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size / 2 + 8, 0, Math.PI * 2);
        ctx.fill();
        
        let sprite: HTMLImageElement | null = null;
        switch (powerUp.type) {
          case 'coffee': sprite = images.coffee; break;
          case 'wifi': sprite = images.wifi; break;
          case 'networking': sprite = images.networking; break;
        }

        if (sprite) {
          ctx.drawImage(sprite, px, py, size, size);
        }
      }
    });

    // Draw collect effects
    collectEffects.forEach(effect => {
      const effectColor = effect.type === 'coffee' ? '#FF9800' : 
                         effect.type === 'wifi' ? '#2196F3' : 
                         effect.type === 'coin' ? '#FFD700' : '#4CAF50';
      
      effect.particles.forEach(p => {
        if (p.alpha > 0) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = effectColor;
          ctx.fillRect(
            Math.floor(effect.x + p.x - p.size / 2),
            Math.floor(effect.y + p.y - p.size / 2),
            Math.floor(p.size),
            Math.floor(p.size)
          );
        }
      });
      
      // Ring effect
      const ringSize = (30 - effect.timer) * 3;
      ctx.globalAlpha = effect.timer / 30;
      ctx.strokeStyle = effectColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, ringSize, 0, Math.PI * 2);
      ctx.stroke();
      
      // Text popup
      ctx.globalAlpha = effect.timer / 30;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      const text = effect.type === 'coffee' ? '+SPEED!' : 
                   effect.type === 'wifi' ? '+WIFI!' : 
                   effect.type === 'coin' ? '+1' : '+1';
      ctx.fillText(text, effect.x, effect.y - 20 - (30 - effect.timer) * 1.5);
      ctx.textAlign = 'left';
      
      ctx.globalAlpha = 1;
    });

    // Draw enemies with pixel art style
    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      const ex = Math.floor(enemy.x);
      const ey = Math.floor(enemy.y);
      
      if (enemy.type === 'boss') {
        if (images.boss) {
          ctx.save();
          
          // Boss damage flash
          if (enemy.health !== undefined && enemy.maxHealth !== undefined) {
            if (gameTime % 10 < 5 && enemy.health < enemy.maxHealth) {
              ctx.globalAlpha = 0.6;
            }
          }
          
          // Direction flip
          if (enemy.velocityX < 0) {
            ctx.translate(ex + enemy.width, ey);
            ctx.scale(-1, 1);
            ctx.drawImage(images.boss, 0, 0, enemy.width, enemy.height);
          } else {
            ctx.drawImage(images.boss, ex, ey, enemy.width, enemy.height);
          }
          ctx.restore();
        }
        
        // Boss health bar
        if (enemy.health !== undefined && enemy.maxHealth !== undefined) {
          const healthPercent = enemy.health / enemy.maxHealth;
          const barWidth = 120;
          const barHeight = 14;
          const barX = ex + (enemy.width - barWidth) / 2;
          const barY = ey - 40;
          
          // Background
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
          ctx.fillStyle = '#424242';
          ctx.fillRect(barX, barY, barWidth, barHeight);
          
          // Health
          const healthColor = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
          ctx.fillStyle = healthColor;
          ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
          
          // Border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.strokeRect(barX, barY, barWidth, barHeight);
          
          // Boss name
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(enemy.bossName || 'BOSS', ex + enemy.width / 2, barY - 8);
          ctx.textAlign = 'left';
        }
      } else {
        // Regular enemies
        let sprite: HTMLImageElement | null = null;
        switch (enemy.type) {
          case 'sloth': sprite = images.sloth; break;
          case 'deadline': sprite = images.deadline; break;
          case 'spam': sprite = images.spam; break;
        }
        
        if (sprite) {
          ctx.save();
          // Direction flip based on velocity
          if (enemy.velocityX > 0) {
            ctx.translate(ex + enemy.width, ey);
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, -5, -5, enemy.width + 10, enemy.height + 10);
          } else {
            ctx.drawImage(sprite, ex - 5, ey - 5, enemy.width + 10, enemy.height + 10);
          }
          ctx.restore();
        }
      }
    });

    // Draw boss projectiles
    bossProjectiles.forEach(proj => {
      if (!proj.active) return;
      
      const px = Math.floor(proj.x);
      const py = Math.floor(proj.y);
      
      // Pixel art fireball
      ctx.fillStyle = '#FF5722';
      ctx.fillRect(px - 8, py - 8, 16, 16);
      ctx.fillStyle = '#FFEB3B';
      ctx.fillRect(px - 4, py - 4, 8, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(px - 2, py - 2, 4, 4);
    });

    // Draw player projectiles
    projectiles.forEach(proj => {
      if (!proj.active) return;
      
      const px = Math.floor(proj.x);
      const py = Math.floor(proj.y);
      
      // Pixel art wifi projectile
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(px - 8, py - 4, 16, 8);
      ctx.fillStyle = '#64B5F6';
      ctx.fillRect(px - 6, py - 2, 12, 4);
      ctx.fillStyle = '#BBDEFB';
      ctx.fillRect(px - 2, py - 1, 4, 2);
      
      // Trail effect
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#2196F3';
      const trailDir = proj.velocityX > 0 ? -1 : 1;
      ctx.fillRect(px + trailDir * 10, py - 2, 8, 4);
      ctx.globalAlpha = 0.3;
      ctx.fillRect(px + trailDir * 18, py - 1, 6, 2);
      ctx.globalAlpha = 1;
    });

    // Draw player with sprite and animations
    if (images.character) {
      ctx.save();
      
      const px = Math.floor(player.x);
      const py = Math.floor(player.y);
      
      // Invincibility flashing
      if (player.invincible && gameTime % 8 < 4) {
        ctx.globalAlpha = 0.4;
      }
      
      // Coffee effect aura
      if (player.hasCoffee) {
        ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
        const pulseSize = 10 + Math.sin(gameTime * 0.2) * 5;
        ctx.beginPath();
        ctx.arc(px + player.width / 2, py + player.height / 2, player.width / 2 + pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Speed lines
        ctx.strokeStyle = 'rgba(255, 152, 0, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const lineX = px - 10 - i * 8;
          const lineY = py + 15 + i * 15;
          ctx.beginPath();
          ctx.moveTo(lineX, lineY);
          ctx.lineTo(lineX - 15, lineY);
          ctx.stroke();
        }
      }

      // Double jump indicator
      if (player.canDoubleJump && !player.isGrounded && !player.hasDoubleJumped) {
        ctx.fillStyle = '#4CAF50';
        ctx.globalAlpha = 0.5 + Math.sin(gameTime * 0.3) * 0.3;
        ctx.fillRect(px + player.width / 2 - 6, py + player.height + 4, 12, 4);
        ctx.globalAlpha = player.invincible && gameTime % 8 < 4 ? 0.4 : 1;
      }

      // Draw character with direction flip
      if (!player.facingRight) {
        ctx.translate(px + player.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(images.character, 0, py, player.width, player.height);
      } else {
        ctx.drawImage(images.character, px, py, player.width, player.height);
      }
      
      // Shoot muzzle flash
      if (shootState.shootTimer > 10) {
        ctx.fillStyle = '#FFEB3B';
        const flashX = player.facingRight ? px + player.width + 5 : -15;
        const flashY = py + player.height / 2 - 4;
        ctx.fillRect(flashX, flashY, 10, 8);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(flashX + 2, flashY + 2, 6, 4);
      }
      
      ctx.restore();
    }

    ctx.restore();
    
    // ============ HUD - VIDA E MOEDAS (MAIOR) ============
    
    // Background for HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 200, 10, 190, 80);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 200, 10, 190, 80);
    
    // Draw player health bar - BIGGER hearts
    if (player.health !== undefined && player.maxHealth !== undefined) {
      const hearts = player.maxHealth;
      const heartSize = 28;
      const startX = canvas.width - 190;
      const heartY = 20;
      
      for (let i = 0; i < hearts; i++) {
        const heartX = startX + i * (heartSize + 8);
        
        // Pixel art heart shape - BIGGER
        if (i < player.health) {
          // Full heart
          ctx.fillStyle = '#F44336';
          ctx.fillRect(heartX + 3, heartY, 8, 8);
          ctx.fillRect(heartX + 17, heartY, 8, 8);
          ctx.fillRect(heartX, heartY + 5, 28, 10);
          ctx.fillRect(heartX + 3, heartY + 15, 22, 5);
          ctx.fillRect(heartX + 6, heartY + 20, 16, 4);
          ctx.fillRect(heartX + 10, heartY + 24, 8, 3);
          // Highlight
          ctx.fillStyle = '#EF9A9A';
          ctx.fillRect(heartX + 5, heartY + 3, 6, 5);
        } else {
          // Empty heart
          ctx.fillStyle = '#424242';
          ctx.fillRect(heartX + 3, heartY, 8, 8);
          ctx.fillRect(heartX + 17, heartY, 8, 8);
          ctx.fillRect(heartX, heartY + 5, 28, 10);
          ctx.fillRect(heartX + 3, heartY + 15, 22, 5);
          ctx.fillRect(heartX + 6, heartY + 20, 16, 4);
          ctx.fillRect(heartX + 10, heartY + 24, 8, 3);
        }
      }
    }
    
    // Draw coins counter - BIGGER
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(canvas.width - 190, 55, 20, 24);
    ctx.fillStyle = '#FFA000';
    ctx.fillRect(canvas.width - 188, 57, 16, 20);
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(canvas.width - 186, 59, 6, 6);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText(`× ${player.coins}`, canvas.width - 160, 73);
    
  }, [player, enemies, powerUps, projectiles, bossProjectiles, level, cameraX, gameTime, images, bossDefeated, shootState, collectEffects, bossArena]);

  const networkingTotal = level.powerUps.filter(p => p.type === 'networking').length;

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <GameHUD
        levelName={level.name}
        characterName={character.name}
        characterSprite={character.sprite}
        passiveName={character.passive.name}
        passiveIcon={character.passive.icon}
        networkingCollected={player.networkingCollected}
        networkingTotal={networkingTotal}
        hasCoffee={player.hasCoffee}
        coffeeTimer={player.coffeeTimer}
        hasWifi={player.hasWifi}
        canDoubleJump={player.canDoubleJump}
        hasDoubleJumped={player.hasDoubleJumped}
        isGrounded={player.isGrounded}
        onPause={onPause}
      />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas max-w-full max-h-full border-4 border-primary rounded-lg shadow-2xl"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default GameCanvas;
