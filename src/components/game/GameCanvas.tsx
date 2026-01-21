import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Level, Player, Enemy, PowerUp, Projectile, CharacterId, BackgroundType } from '@/types/game';
import { characters } from '@/data/characters';
import GameHUD from './GameHUD';

// Import sprites
import slothSprite from '@/assets/sprites/sloth.png';
import bossSprite from '@/assets/sprites/boss.png';
import coffeeSprite from '@/assets/sprites/coffee.png';
import wifiSprite from '@/assets/sprites/wifi.png';
import networkingSprite from '@/assets/sprites/networking.png';

interface GameCanvasProps {
  level: Level;
  characterId: CharacterId;
  onLevelComplete: (networkingCollected: number) => void;
  onGameOver: () => void;
  onPause: () => void;
  onBossDefeated?: () => void;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -14;
const MOVE_SPEED = 5;
const COFFEE_SPEED_BOOST = 2;
const COFFEE_JUMP_BOOST = -3;
const COFFEE_DURATION = 300;
const PROJECTILE_SPEED = 12;

// Character-specific modifiers
const getCharacterModifiers = (characterId: CharacterId) => {
  switch (characterId) {
    case 'entrepreneur':
      return { canDoubleJump: true, gravityMod: 1, speedMod: 1, collectRadius: 1, startsWithWifi: false };
    case 'designer':
      return { canDoubleJump: false, gravityMod: 0.65, speedMod: 1, collectRadius: 1, startsWithWifi: false };
    case 'programmer':
      return { canDoubleJump: false, gravityMod: 1, speedMod: 1, collectRadius: 1, startsWithWifi: true };
    case 'socialmedia':
      return { canDoubleJump: false, gravityMod: 1, speedMod: 1, collectRadius: 2, startsWithWifi: false };
    case 'gestor':
      return { canDoubleJump: false, gravityMod: 1, speedMod: 1.25, collectRadius: 1, startsWithWifi: false };
    default:
      return { canDoubleJump: false, gravityMod: 1, speedMod: 1, collectRadius: 1, startsWithWifi: false };
  }
};

// Enhanced background drawing with parallax
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
      bgGradient.addColorStop(0, '#4FC3F7');
      bgGradient.addColorStop(0.5, '#81D4FA');
      bgGradient.addColorStop(1, '#B3E5FC');
      break;
    case 'sunset':
      bgGradient.addColorStop(0, '#FF6B35');
      bgGradient.addColorStop(0.3, '#F7931E');
      bgGradient.addColorStop(0.6, '#FF5E78');
      bgGradient.addColorStop(1, '#9C27B0');
      break;
    case 'coworking':
      bgGradient.addColorStop(0, '#FAFAFA');
      bgGradient.addColorStop(0.5, '#F5F5F5');
      bgGradient.addColorStop(1, '#EEEEEE');
      break;
    case 'meeting':
      bgGradient.addColorStop(0, '#E3F2FD');
      bgGradient.addColorStop(0.5, '#BBDEFB');
      bgGradient.addColorStop(1, '#90CAF9');
      break;
    case 'rooftop':
      bgGradient.addColorStop(0, '#1A237E');
      bgGradient.addColorStop(0.4, '#303F9F');
      bgGradient.addColorStop(0.7, '#5C6BC0');
      bgGradient.addColorStop(1, '#7986CB');
      break;
    case 'happyhour':
      bgGradient.addColorStop(0, '#4A148C');
      bgGradient.addColorStop(0.3, '#7B1FA2');
      bgGradient.addColorStop(0.6, '#9C27B0');
      bgGradient.addColorStop(1, '#E040FB');
      break;
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw stars for night scenes
  if (background === 'rooftop' || background === 'happyhour') {
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const starX = (i * 47 + Math.sin(gameTime * 0.01 + i) * 2) % canvasWidth;
      const starY = (i * 23) % (canvasHeight * 0.5);
      const starSize = (Math.sin(gameTime * 0.05 + i) + 1) * 1.5 + 0.5;
      ctx.globalAlpha = 0.5 + Math.sin(gameTime * 0.03 + i * 0.5) * 0.3;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  
  // Draw clouds for day scenes with parallax
  if (background === 'urban' || background === 'sunset') {
    ctx.fillStyle = background === 'sunset' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 8; i++) {
      const cloudX = ((i * 150 - cameraX * 0.1) % (canvasWidth + 200)) - 100;
      const cloudY = 30 + (i % 3) * 40;
      const cloudWidth = 80 + (i % 4) * 30;
      
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 25, 0, Math.PI * 2);
      ctx.arc(cloudX + 30, cloudY - 10, 20, 0, Math.PI * 2);
      ctx.arc(cloudX + 60, cloudY, 25, 0, Math.PI * 2);
      ctx.arc(cloudX + 30, cloudY + 5, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw far background buildings with parallax
  if (background === 'urban' || background === 'sunset' || background === 'rooftop') {
    // Far layer
    ctx.fillStyle = background === 'rooftop' ? '#1A237E' : '#546E7A';
    for (let i = 0; i < 12; i++) {
      const bx = (i * 150 - cameraX * 0.15) % (canvasWidth + 300) - 150;
      const bh = 80 + Math.sin(i * 1.5) * 40;
      ctx.fillRect(bx, canvasHeight - 80 - bh, 60, bh);
    }
    
    // Mid layer
    ctx.fillStyle = background === 'rooftop' ? '#283593' : '#455A64';
    for (let i = 0; i < 10; i++) {
      const bx = (i * 180 - cameraX * 0.25) % (canvasWidth + 360) - 180;
      const bh = 100 + Math.sin(i * 2) * 50;
      ctx.fillRect(bx, canvasHeight - 80 - bh, 80, bh);
      
      // Windows with glow effect
      if (background === 'rooftop' || background === 'sunset') {
        ctx.fillStyle = '#FFEB3B';
        ctx.globalAlpha = 0.8;
      } else {
        ctx.fillStyle = '#FFF59D';
        ctx.globalAlpha = 1;
      }
      for (let wy = 15; wy < bh - 20; wy += 25) {
        for (let wx = 10; wx < 70; wx += 20) {
          if ((i + wx + wy) % 3 !== 0) {
            ctx.fillRect(bx + wx, canvasHeight - 80 - bh + wy, 10, 15);
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = background === 'rooftop' ? '#283593' : '#455A64';
    }
    
    // Near layer
    ctx.fillStyle = background === 'rooftop' ? '#3949AB' : '#37474F';
    for (let i = 0; i < 8; i++) {
      const bx = (i * 220 - cameraX * 0.35) % (canvasWidth + 440) - 220;
      const bh = 120 + Math.sin(i * 2.5) * 60;
      ctx.fillRect(bx, canvasHeight - 80 - bh, 100, bh);
      
      // Detailed windows
      ctx.fillStyle = background === 'rooftop' ? '#FFCA28' : '#FFF176';
      for (let wy = 20; wy < bh - 30; wy += 30) {
        for (let wx = 15; wx < 85; wx += 25) {
          if ((i + wx) % 2 === 0) {
            ctx.fillRect(bx + wx, canvasHeight - 80 - bh + wy, 15, 20);
          }
        }
      }
      ctx.fillStyle = background === 'rooftop' ? '#3949AB' : '#37474F';
    }
  }
  
  // Indoor backgrounds decorations
  if (background === 'coworking' || background === 'meeting') {
    // Wall pattern
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvasWidth; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i - cameraX * 0.1 % 100, 0);
      ctx.lineTo(i - cameraX * 0.1 % 100, canvasHeight - 100);
      ctx.stroke();
    }
    
    // Window light effects
    ctx.fillStyle = 'rgba(255, 235, 59, 0.1)';
    for (let i = 0; i < 3; i++) {
      const lightX = 100 + i * 300 - cameraX * 0.05;
      ctx.beginPath();
      ctx.moveTo(lightX, 0);
      ctx.lineTo(lightX + 150, canvasHeight - 100);
      ctx.lineTo(lightX + 50, canvasHeight - 100);
      ctx.lineTo(lightX - 50, 0);
      ctx.fill();
    }
    
    // Plants decoration
    const plantPositions = [50, 350, 650];
    ctx.fillStyle = '#4CAF50';
    plantPositions.forEach((px, i) => {
      const plantX = (px - cameraX * 0.3) % (canvasWidth + 200);
      // Pot
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(plantX - 15, canvasHeight - 130, 30, 50);
      // Leaves
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(plantX, canvasHeight - 150, 25 + Math.sin(gameTime * 0.05 + i) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(plantX - 15, canvasHeight - 160, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(plantX + 15, canvasHeight - 165, 20, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  // Happy hour special effects
  if (background === 'happyhour') {
    // Disco ball effect
    const discoX = (canvasWidth / 2 + Math.sin(gameTime * 0.02) * 50);
    const discoY = 80;
    
    // Disco rays
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 12; i++) {
      const angle = (gameTime * 0.02 + i * Math.PI / 6);
      const rayLength = 200 + Math.sin(gameTime * 0.05 + i) * 50;
      
      const gradient = ctx.createLinearGradient(
        discoX, discoY,
        discoX + Math.cos(angle) * rayLength,
        discoY + Math.sin(angle) * rayLength
      );
      
      const colors = ['#FF1744', '#FFEA00', '#00E676', '#2979FF', '#D500F9', '#FF9100'];
      gradient.addColorStop(0, colors[i % colors.length]);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(discoX, discoY);
      ctx.lineTo(
        discoX + Math.cos(angle - 0.1) * rayLength,
        discoY + Math.sin(angle - 0.1) * rayLength
      );
      ctx.lineTo(
        discoX + Math.cos(angle + 0.1) * rayLength,
        discoY + Math.sin(angle + 0.1) * rayLength
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Disco ball
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.arc(discoX, discoY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Disco ball sparkles
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 8; i++) {
      const sparkleAngle = gameTime * 0.1 + i * Math.PI / 4;
      const sparkleX = discoX + Math.cos(sparkleAngle) * 15;
      const sparkleY = discoY + Math.sin(sparkleAngle) * 15;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // String to ceiling
    ctx.strokeStyle = '#BDBDBD';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(discoX, discoY - 25);
    ctx.lineTo(discoX, 0);
    ctx.stroke();
  }
};

// Draw enhanced platform
const drawPlatform = (
  ctx: CanvasRenderingContext2D,
  platform: { x: number; y: number; width: number; height: number; type: string },
  platX: number,
  gameTime: number
) => {
  switch (platform.type) {
    case 'ground':
      // Rich ground with layers
      const groundGradient = ctx.createLinearGradient(platX, platform.y, platX, platform.y + platform.height);
      groundGradient.addColorStop(0, '#66BB6A');
      groundGradient.addColorStop(0.15, '#4CAF50');
      groundGradient.addColorStop(0.2, '#8D6E63');
      groundGradient.addColorStop(0.5, '#795548');
      groundGradient.addColorStop(1, '#5D4037');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(platX, platform.y, platform.width, platform.height);
      
      // Grass tufts
      ctx.fillStyle = '#81C784';
      for (let gx = 0; gx < platform.width; gx += 15) {
        const grassHeight = 8 + Math.sin(gx * 0.3 + gameTime * 0.05) * 3;
        ctx.beginPath();
        ctx.moveTo(platX + gx, platform.y);
        ctx.lineTo(platX + gx + 4, platform.y - grassHeight);
        ctx.lineTo(platX + gx + 8, platform.y);
        ctx.fill();
      }
      break;
      
    case 'platform':
      // Wooden platform with texture
      const woodGradient = ctx.createLinearGradient(platX, platform.y, platX, platform.y + platform.height);
      woodGradient.addColorStop(0, '#A1887F');
      woodGradient.addColorStop(0.3, '#8D6E63');
      woodGradient.addColorStop(1, '#6D4C41');
      ctx.fillStyle = woodGradient;
      ctx.fillRect(platX, platform.y, platform.width, platform.height);
      
      // Wood grain
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 1;
      for (let i = 0; i < platform.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(platX + i, platform.y);
        ctx.lineTo(platX + i, platform.y + platform.height);
        ctx.stroke();
      }
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(platX, platform.y, platform.width, 4);
      break;
      
    case 'moving':
      // Metallic moving platform
      const metalGradient = ctx.createLinearGradient(platX, platform.y, platX, platform.y + platform.height);
      metalGradient.addColorStop(0, '#90A4AE');
      metalGradient.addColorStop(0.3, '#78909C');
      metalGradient.addColorStop(1, '#546E7A');
      ctx.fillStyle = metalGradient;
      ctx.fillRect(platX, platform.y, platform.width, platform.height);
      
      // Glow effect
      ctx.shadowColor = '#64B5F6';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#64B5F6';
      ctx.fillRect(platX, platform.y + platform.height - 3, platform.width, 3);
      ctx.shadowBlur = 0;
      
      // Arrows indicating movement
      ctx.fillStyle = '#B0BEC5';
      const arrowY = platform.y + platform.height / 2;
      ctx.beginPath();
      ctx.moveTo(platX + 10, arrowY);
      ctx.lineTo(platX + 20, arrowY - 5);
      ctx.lineTo(platX + 20, arrowY + 5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(platX + platform.width - 10, arrowY);
      ctx.lineTo(platX + platform.width - 20, arrowY - 5);
      ctx.lineTo(platX + platform.width - 20, arrowY + 5);
      ctx.fill();
      break;
      
    case 'building':
      // Modern building
      const buildingGradient = ctx.createLinearGradient(platX, platform.y, platX + platform.width, platform.y);
      buildingGradient.addColorStop(0, '#37474F');
      buildingGradient.addColorStop(0.5, '#455A64');
      buildingGradient.addColorStop(1, '#37474F');
      ctx.fillStyle = buildingGradient;
      ctx.fillRect(platX, platform.y, platform.width, platform.height);
      
      // Door
      ctx.fillStyle = '#FF9800';
      ctx.fillRect(platX + platform.width / 2 - 30, platform.y + platform.height - 90, 60, 90);
      ctx.fillStyle = '#FFB74D';
      ctx.fillRect(platX + platform.width / 2 - 25, platform.y + platform.height - 85, 50, 80);
      
      // Windows
      ctx.fillStyle = '#FFF59D';
      ctx.shadowColor = '#FFEB3B';
      ctx.shadowBlur = 5;
      for (let wy = 25; wy < platform.height - 100; wy += 45) {
        for (let wx = 25; wx < platform.width - 40; wx += 55) {
          ctx.fillRect(platX + wx, platform.y + wy, 35, 30);
        }
      }
      ctx.shadowBlur = 0;
      break;
      
    case 'desk':
      // Office desk
      const deskGradient = ctx.createLinearGradient(platX, platform.y, platX, platform.y + platform.height);
      deskGradient.addColorStop(0, '#8D6E63');
      deskGradient.addColorStop(0.1, '#6D4C41');
      deskGradient.addColorStop(1, '#5D4037');
      ctx.fillStyle = deskGradient;
      ctx.fillRect(platX, platform.y, platform.width, platform.height);
      
      // Desk surface shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(platX + 5, platform.y + 5, platform.width - 10, 8);
      
      // Desk legs
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(platX + 10, platform.y + platform.height - 20, 15, 20);
      ctx.fillRect(platX + platform.width - 25, platform.y + platform.height - 20, 15, 20);
      
      // Computer monitor
      if (platform.width > 100) {
        ctx.fillStyle = '#424242';
        ctx.fillRect(platX + platform.width / 2 - 20, platform.y - 35, 40, 30);
        ctx.fillStyle = '#64B5F6';
        ctx.fillRect(platX + platform.width / 2 - 17, platform.y - 32, 34, 24);
        ctx.fillStyle = '#424242';
        ctx.fillRect(platX + platform.width / 2 - 5, platform.y - 5, 10, 10);
      }
      break;
      
    case 'glass':
      // Glass platform
      ctx.fillStyle = 'rgba(144, 202, 249, 0.5)';
      ctx.fillRect(platX, platform.y, platform.width, platform.height);
      
      // Shine effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(platX + 5, platform.y + 2, platform.width * 0.6, platform.height / 3);
      
      // Border
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(platX, platform.y, platform.width, platform.height);
      break;
      
    case 'rooftop':
      // Rooftop with industrial look
      const roofGradient = ctx.createLinearGradient(platX, platform.y, platX, platform.y + platform.height);
      roofGradient.addColorStop(0, '#616161');
      roofGradient.addColorStop(0.1, '#757575');
      roofGradient.addColorStop(0.15, '#546E7A');
      roofGradient.addColorStop(1, '#37474F');
      ctx.fillStyle = roofGradient;
      ctx.fillRect(platX, platform.y, platform.width, platform.height);
      
      // Rooftop edge
      ctx.fillStyle = '#78909C';
      ctx.fillRect(platX, platform.y, platform.width, 8);
      
      // Air conditioning units
      if (platform.width > 200) {
        for (let i = 0; i < Math.floor(platform.width / 150); i++) {
          const acX = platX + 50 + i * 150;
          ctx.fillStyle = '#90A4AE';
          ctx.fillRect(acX, platform.y - 25, 40, 25);
          ctx.fillStyle = '#78909C';
          for (let line = 0; line < 4; line++) {
            ctx.fillRect(acX + 5, platform.y - 20 + line * 6, 30, 2);
          }
        }
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

  // Load images
  const [images, setImages] = useState<{
    character: HTMLImageElement | null;
    sloth: HTMLImageElement | null;
    boss: HTMLImageElement | null;
    coffee: HTMLImageElement | null;
    wifi: HTMLImageElement | null;
    networking: HTMLImageElement | null;
  }>({
    character: null,
    sloth: null,
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
      loadImage(bossSprite),
      loadImage(coffeeSprite),
      loadImage(wifiSprite),
      loadImage(networkingSprite),
    ]).then(([charImg, slothImg, bossImg, coffeeImg, wifiImg, networkingImg]) => {
      setImages({
        character: charImg,
        sloth: slothImg,
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
    });
    setEnemies(level.enemies.map(e => ({ ...e, alive: true })));
    setPowerUps(level.powerUps.map(p => ({ ...p, collected: false })));
    setProjectiles([]);
    setBossProjectiles([]);
    setCameraX(0);
    setGameTime(0);
    setBossDefeated(false);
  }, [level, modifiers.startsWithWifi, modifiers.canDoubleJump]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keysRef.current.has(e.code)) return;
      keysRef.current.add(e.code);
      
      if (e.code === 'Escape') {
        onPause();
      }
      
      // Jump logic with double jump
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        setPlayer(prev => {
          if (prev.isGrounded) {
            const jumpForce = prev.hasCoffee ? JUMP_FORCE + COFFEE_JUMP_BOOST : JUMP_FORCE;
            return {
              ...prev,
              velocityY: jumpForce,
              isJumping: true,
              isGrounded: false,
              hasDoubleJumped: false,
            };
          } else if (prev.canDoubleJump && !prev.hasDoubleJumped) {
            const jumpForce = prev.hasCoffee ? JUMP_FORCE + COFFEE_JUMP_BOOST : JUMP_FORCE;
            return {
              ...prev,
              velocityY: jumpForce * 0.85,
              hasDoubleJumped: true,
            };
          }
          return prev;
        });
      }
      
      // Shoot projectile
      if (e.code === 'KeyJ') {
        setPlayer(prev => {
          if (prev.hasWifi) {
            const newProjectile: Projectile = {
              id: `proj-${Date.now()}`,
              x: prev.x + (prev.facingRight ? prev.width : 0),
              y: prev.y + prev.height / 2,
              velocityX: prev.facingRight ? PROJECTILE_SPEED : -PROJECTILE_SPEED,
              active: true,
              type: 'wifi',
            };
            setProjectiles(projs => [...projs, newProjectile]);
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
  }, [onPause]);

  // Collision detection
  const checkCollision = useCallback((
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number
  ) => {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      setGameTime(prev => prev + 1);

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

        // Bounds checking
        if (newPlayer.x < 0) newPlayer.x = 0;
        if (newPlayer.x > level.width - newPlayer.width) {
          newPlayer.x = level.width - newPlayer.width;
        }

        // Platform collision
        newPlayer.isGrounded = false;
        level.platforms.forEach(platform => {
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
            onLevelComplete(newPlayer.networkingCollected);
          }
        }

        return newPlayer;
      });

      // Update enemies and boss
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          if (!enemy.alive) return enemy;

          let newEnemy = { ...enemy };
          
          // Boss behavior
          if (enemy.type === 'boss') {
            // Boss movement pattern
            const bossPhase = enemy.phase || 1;
            const moveSpeed = 1.5 + bossPhase * 0.5;
            
            // Move towards player
            if (player.x > newEnemy.x + newEnemy.width) {
              newEnemy.velocityX = moveSpeed;
            } else if (player.x + player.width < newEnemy.x) {
              newEnemy.velocityX = -moveSpeed;
            } else {
              newEnemy.velocityX = 0;
            }
            
            newEnemy.x += newEnemy.velocityX;
            
            // Boss attack
            if (newEnemy.attackCooldown !== undefined) {
              newEnemy.attackCooldown--;
              if (newEnemy.attackCooldown <= 0) {
                // Fire projectile at player
                const bossProjectile: Projectile = {
                  id: `boss-proj-${Date.now()}`,
                  x: newEnemy.x + newEnemy.width / 2,
                  y: newEnemy.y + newEnemy.height / 2,
                  velocityX: player.x > newEnemy.x ? 6 : -6,
                  velocityY: (player.y - newEnemy.y) * 0.02,
                  active: true,
                  type: 'boss',
                };
                setBossProjectiles(prev => [...prev, bossProjectile]);
                newEnemy.attackCooldown = 120 - bossPhase * 20; // Faster attacks in later phases
              }
            }
            
            // Change phase based on health
            const healthPercent = (enemy.health || 0) / (enemy.maxHealth || 10);
            if (healthPercent <= 0.3) {
              newEnemy.phase = 3;
            } else if (healthPercent <= 0.6) {
              newEnemy.phase = 2;
            }
            
            return newEnemy;
          }
          
          // Regular sloth enemy behavior
          newEnemy.x += newEnemy.velocityX;

          const onPlatform = level.platforms.some(p => 
            newEnemy.x >= p.x && newEnemy.x + newEnemy.width <= p.x + p.width &&
            Math.abs(newEnemy.y + newEnemy.height - p.y) < 10
          );

          if (!onPlatform || newEnemy.x < 0 || newEnemy.x > level.width - newEnemy.width) {
            newEnemy.velocityX *= -1;
          }

          return newEnemy;
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
                    return { ...e, health: newHealth };
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
                newPlayer.invincibleTimer = 90; // 1.5 seconds of invincibility
                
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
          if (newProj.x < cameraX - 100 || newProj.x > cameraX + 900 || newProj.y > 600) {
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
                    return { ...e, health: newHealth };
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
            setPlayer(prev => {
              switch (powerUp.type) {
                case 'coffee':
                  return { ...prev, hasCoffee: true, coffeeTimer: COFFEE_DURATION };
                case 'wifi':
                  return { ...prev, hasWifi: true };
                case 'networking':
                  return { ...prev, networkingCollected: prev.networkingCollected + 1 };
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
  }, [level, enemies, player, projectiles, bossProjectiles, cameraX, gameTime, checkCollision, onGameOver, onLevelComplete, onBossDefeated, modifiers, bossDefeated]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw enhanced background
    drawBackground(ctx, level.background, cameraX, gameTime, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw platforms with enhanced graphics
    level.platforms.forEach(platform => {
      let platX = platform.x;
      
      if (platform.type === 'moving' && platform.movingRange && platform.movingSpeed) {
        const range = platform.movingRange.max - platform.movingRange.min;
        const offset = Math.sin(gameTime * 0.02 * platform.movingSpeed) * range / 2;
        platX = platform.movingRange.min + range / 2 + offset;
      }

      drawPlatform(ctx, platform, platX, gameTime);
    });

    // Draw goal with enhanced graphics
    const boss = enemies.find(e => e.type === 'boss' && e.alive);
    const goalAccessible = !boss || bossDefeated;
    
    // Goal glow
    if (goalAccessible) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
    }
    
    const goalGradient = ctx.createLinearGradient(level.goal.x, level.goal.y, level.goal.x, level.goal.y + 100);
    goalGradient.addColorStop(0, goalAccessible ? '#FFD700' : '#9E9E9E');
    goalGradient.addColorStop(1, goalAccessible ? '#FFA000' : '#616161');
    ctx.fillStyle = goalGradient;
    ctx.fillRect(level.goal.x, level.goal.y, 60, 100);
    ctx.shadowBlur = 0;
    
    // Door frame
    ctx.strokeStyle = goalAccessible ? '#FF6F00' : '#424242';
    ctx.lineWidth = 4;
    ctx.strokeRect(level.goal.x + 5, level.goal.y + 5, 50, 90);
    
    // Door handle
    ctx.fillStyle = goalAccessible ? '#FFEB3B' : '#757575';
    ctx.beginPath();
    ctx.arc(level.goal.x + 45, level.goal.y + 55, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Locked indicator if boss is alive
    if (!goalAccessible) {
      ctx.fillStyle = '#F44336';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('🔒', level.goal.x + 18, level.goal.y - 10);
    }

    // Draw power-ups with sprites and enhanced effects
    powerUps.forEach(powerUp => {
      if (powerUp.collected) return;

      const bounceY = Math.sin(gameTime * 0.1 + powerUp.x * 0.01) * 5;
      const size = 40;
      
      // Glow effect
      ctx.shadowColor = powerUp.type === 'coffee' ? '#FF9800' : powerUp.type === 'wifi' ? '#2196F3' : '#4CAF50';
      ctx.shadowBlur = 15;
      
      let sprite: HTMLImageElement | null = null;
      switch (powerUp.type) {
        case 'coffee':
          sprite = images.coffee;
          break;
        case 'wifi':
          sprite = images.wifi;
          break;
        case 'networking':
          sprite = images.networking;
          break;
      }

      if (sprite) {
        ctx.drawImage(sprite, powerUp.x - 4, powerUp.y + bounceY - 8, size, size);
      }
      ctx.shadowBlur = 0;
    });

    // Draw enemies with sprites
    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      if (enemy.type === 'boss') {
        // Boss rendering with health bar
        if (images.boss) {
          ctx.save();
          
          // Boss damage flash
          if (enemy.health !== undefined && enemy.maxHealth !== undefined) {
            const damageFlash = (enemy.maxHealth - enemy.health) % 2 === 1;
            if (damageFlash && gameTime % 10 < 5) {
              ctx.globalAlpha = 0.7;
            }
          }
          
          // Phase-based color tint
          if (enemy.phase === 3) {
            ctx.filter = 'hue-rotate(30deg) saturate(1.5)';
          } else if (enemy.phase === 2) {
            ctx.filter = 'saturate(1.2)';
          }
          
          if (enemy.velocityX < 0) {
            ctx.translate(enemy.x + enemy.width, enemy.y);
            ctx.scale(-1, 1);
            ctx.drawImage(images.boss, 0, 0, enemy.width, enemy.height);
          } else {
            ctx.drawImage(images.boss, enemy.x, enemy.y, enemy.width, enemy.height);
          }
          ctx.restore();
        }
        
        // Boss health bar
        if (enemy.health !== undefined && enemy.maxHealth !== undefined) {
          const healthPercent = enemy.health / enemy.maxHealth;
          const barWidth = 100;
          const barHeight = 10;
          const barX = enemy.x + (enemy.width - barWidth) / 2;
          const barY = enemy.y - 25;
          
          // Background
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
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('MICROMANAGER', enemy.x + enemy.width / 2, barY - 5);
          ctx.textAlign = 'left';
        }
      } else {
        // Regular sloth enemy
        if (images.sloth) {
          ctx.save();
          if (enemy.velocityX > 0) {
            ctx.translate(enemy.x + enemy.width, enemy.y);
            ctx.scale(-1, 1);
            ctx.drawImage(images.sloth, 0, 0, enemy.width + 10, enemy.height + 10);
          } else {
            ctx.drawImage(images.sloth, enemy.x, enemy.y, enemy.width + 10, enemy.height + 10);
          }
          ctx.restore();
        }
      }
    });

    // Draw boss projectiles
    bossProjectiles.forEach(proj => {
      if (!proj.active) return;
      
      // Red dangerous projectile
      const gradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, 15);
      gradient.addColorStop(0, '#FFEB3B');
      gradient.addColorStop(0.3, '#FF5722');
      gradient.addColorStop(1, 'rgba(244, 67, 54, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player projectiles
    projectiles.forEach(proj => {
      if (!proj.active) return;
      
      // Glowing wifi projectile
      const gradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, 12);
      gradient.addColorStop(0, '#64B5F6');
      gradient.addColorStop(0.5, '#2196F3');
      gradient.addColorStop(1, 'rgba(33, 150, 243, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#BBDEFB';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player with sprite
    if (images.character) {
      ctx.save();
      
      // Invincibility flashing
      if (player.invincible && gameTime % 10 < 5) {
        ctx.globalAlpha = 0.5;
      }
      
      // Coffee effect glow
      if (player.hasCoffee) {
        ctx.globalAlpha = Math.min(ctx.globalAlpha, 0.3 + Math.sin(gameTime * 0.2) * 0.1);
        const coffeeGlow = ctx.createRadialGradient(
          player.x + player.width / 2, player.y + player.height / 2, 0,
          player.x + player.width / 2, player.y + player.height / 2, 50
        );
        coffeeGlow.addColorStop(0, '#FF9800');
        coffeeGlow.addColorStop(1, 'rgba(255, 152, 0, 0)');
        ctx.fillStyle = coffeeGlow;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = player.invincible && gameTime % 10 < 5 ? 0.5 : 1;
      }

      // Double jump indicator
      if (player.canDoubleJump && !player.isGrounded && !player.hasDoubleJumped) {
        ctx.globalAlpha = 0.5 + Math.sin(gameTime * 0.3) * 0.2;
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height + 5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = player.invincible && gameTime % 10 < 5 ? 0.5 : 1;
      }

      if (!player.facingRight) {
        ctx.translate(player.x + player.width, player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(images.character, 0, 0, player.width, player.height);
      } else {
        ctx.drawImage(images.character, player.x, player.y, player.width, player.height);
      }
      ctx.restore();
    }

    ctx.restore();
    
    // Draw player health bar (fixed position)
    if (player.health !== undefined && player.maxHealth !== undefined) {
      const hearts = player.maxHealth;
      const heartSize = 24;
      const startX = canvas.width - hearts * (heartSize + 5) - 15;
      const heartY = 15;
      
      for (let i = 0; i < hearts; i++) {
        const heartX = startX + i * (heartSize + 5);
        if (i < player.health) {
          // Full heart
          ctx.fillStyle = '#F44336';
          ctx.font = `${heartSize}px sans-serif`;
          ctx.fillText('❤️', heartX, heartY + heartSize);
        } else {
          // Empty heart
          ctx.fillStyle = '#757575';
          ctx.font = `${heartSize}px sans-serif`;
          ctx.fillText('🖤', heartX, heartY + heartSize);
        }
      }
    }
    
  }, [player, enemies, powerUps, projectiles, bossProjectiles, level, cameraX, gameTime, images, bossDefeated]);

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
      />
    </div>
  );
};

export default GameCanvas;
