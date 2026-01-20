import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Level, Player, Enemy, PowerUp, Projectile, CharacterId } from '@/types/game';
import { characters } from '@/data/characters';
import GameHUD from './GameHUD';

// Import sprites
import slothSprite from '@/assets/sprites/sloth.png';
import coffeeSprite from '@/assets/sprites/coffee.png';
import wifiSprite from '@/assets/sprites/wifi.png';
import networkingSprite from '@/assets/sprites/networking.png';

interface GameCanvasProps {
  level: Level;
  characterId: CharacterId;
  onLevelComplete: (networkingCollected: number) => void;
  onGameOver: () => void;
  onPause: () => void;
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

const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  characterId,
  onLevelComplete,
  onGameOver,
  onPause,
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
    coffee: HTMLImageElement | null;
    wifi: HTMLImageElement | null;
    networking: HTMLImageElement | null;
  }>({
    character: null,
    sloth: null,
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
      loadImage(coffeeSprite),
      loadImage(wifiSprite),
      loadImage(networkingSprite),
    ]).then(([charImg, slothImg, coffeeImg, wifiImg, networkingImg]) => {
      setImages({
        character: charImg,
        sloth: slothImg,
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
  });

  const [enemies, setEnemies] = useState<Enemy[]>(() => 
    level.enemies.map(e => ({ ...e }))
  );
  
  const [powerUps, setPowerUps] = useState<PowerUp[]>(() => 
    level.powerUps.map(p => ({ ...p }))
  );

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [cameraX, setCameraX] = useState(0);
  const [gameTime, setGameTime] = useState(0);

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
    });
    setEnemies(level.enemies.map(e => ({ ...e, alive: true })));
    setPowerUps(level.powerUps.map(p => ({ ...p, collected: false })));
    setProjectiles([]);
    setCameraX(0);
    setGameTime(0);
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
            else if (platform.type !== 'platform') {
              if (newPlayer.velocityX > 0) {
                newPlayer.x = platX - newPlayer.width;
              } else if (newPlayer.velocityX < 0) {
                newPlayer.x = platX + platform.width;
              }
            }
          }
        });

        // Fall death
        if (newPlayer.y > 600) {
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

        // Goal check
        if (checkCollision(
          newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height,
          level.goal.x, level.goal.y, 60, 100
        )) {
          onLevelComplete(newPlayer.networkingCollected);
        }

        return newPlayer;
      });

      // Update enemies
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          if (!enemy.alive) return enemy;

          let newEnemy = { ...enemy };
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
        let newPlayer = { ...prevPlayer };
        
        enemies.forEach((enemy, index) => {
          if (!enemy.alive) return;

          if (checkCollision(
            newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height,
            enemy.x, enemy.y, enemy.width, enemy.height
          )) {
            if (newPlayer.velocityY > 0 && newPlayer.y + newPlayer.height < enemy.y + enemy.height / 2) {
              setEnemies(prev => prev.map((e, i) => 
                i === index ? { ...e, alive: false } : e
              ));
              newPlayer.velocityY = JUMP_FORCE / 2;
            } else {
              onGameOver();
            }
          }
        });

        return newPlayer;
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
              setEnemies(prev => prev.map((e, i) => 
                i === index ? { ...e, alive: false } : e
              ));
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
  }, [level, enemies, player, projectiles, cameraX, gameTime, checkCollision, onGameOver, onLevelComplete, modifiers]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    switch (level.background) {
      case 'urban':
        bgGradient.addColorStop(0, '#64B5F6');
        bgGradient.addColorStop(1, '#90CAF9');
        break;
      case 'sunset':
        bgGradient.addColorStop(0, '#FF7043');
        bgGradient.addColorStop(0.5, '#EC407A');
        bgGradient.addColorStop(1, '#7E57C2');
        break;
      case 'coworking':
        bgGradient.addColorStop(0, '#F5F5DC');
        bgGradient.addColorStop(1, '#E8E4D4');
        break;
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background buildings
    if (level.background === 'urban' || level.background === 'sunset') {
      ctx.fillStyle = '#455A64';
      for (let i = 0; i < 10; i++) {
        const bx = (i * 200 - cameraX * 0.3) % (canvas.width + 200) - 100;
        const bh = 100 + Math.sin(i) * 50;
        ctx.fillRect(bx, canvas.height - 80 - bh, 80, bh);
        
        ctx.fillStyle = '#FFF59D';
        for (let wy = 0; wy < bh - 20; wy += 25) {
          for (let wx = 10; wx < 70; wx += 20) {
            if (Math.random() > 0.3) {
              ctx.fillRect(bx + wx, canvas.height - 80 - bh + 15 + wy, 10, 15);
            }
          }
        }
        ctx.fillStyle = '#455A64';
      }
    }

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw platforms
    level.platforms.forEach(platform => {
      let platX = platform.x;
      
      if (platform.type === 'moving' && platform.movingRange && platform.movingSpeed) {
        const range = platform.movingRange.max - platform.movingRange.min;
        const offset = Math.sin(gameTime * 0.02 * platform.movingSpeed) * range / 2;
        platX = platform.movingRange.min + range / 2 + offset;
      }

      switch (platform.type) {
        case 'ground':
          ctx.fillStyle = '#8D6E63';
          ctx.fillRect(platX, platform.y, platform.width, platform.height);
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(platX, platform.y, platform.width, 15);
          break;
        case 'platform':
          ctx.fillStyle = '#A1887F';
          ctx.fillRect(platX, platform.y, platform.width, platform.height);
          ctx.fillStyle = '#8D6E63';
          ctx.fillRect(platX, platform.y, platform.width, 5);
          break;
        case 'moving':
          ctx.fillStyle = '#78909C';
          ctx.fillRect(platX, platform.y, platform.width, platform.height);
          ctx.fillStyle = '#546E7A';
          ctx.fillRect(platX, platform.y, platform.width, 4);
          break;
        case 'building':
          ctx.fillStyle = '#37474F';
          ctx.fillRect(platX, platform.y, platform.width, platform.height);
          ctx.fillStyle = '#FF9800';
          ctx.fillRect(platX + platform.width / 2 - 25, platform.y + platform.height - 80, 50, 80);
          ctx.fillStyle = '#FFF59D';
          for (let wy = 20; wy < platform.height - 100; wy += 40) {
            for (let wx = 20; wx < platform.width - 30; wx += 50) {
              ctx.fillRect(platX + wx, platform.y + wy, 30, 25);
            }
          }
          break;
      }
    });

    // Draw goal
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(level.goal.x, level.goal.y, 60, 100);
    ctx.fillStyle = '#FFA000';
    ctx.font = '40px sans-serif';
    ctx.fillText('🚪', level.goal.x + 10, level.goal.y + 60);

    // Draw power-ups with sprites
    powerUps.forEach(powerUp => {
      if (powerUp.collected) return;

      const bounceY = Math.sin(gameTime * 0.1 + powerUp.x * 0.01) * 5;
      const size = 40;
      
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
    });

    // Draw enemies with sprites
    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
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
    });

    // Draw projectiles
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
      
      // Coffee effect glow
      if (player.hasCoffee) {
        ctx.globalAlpha = 0.3 + Math.sin(gameTime * 0.2) * 0.1;
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
        ctx.globalAlpha = 1;
      }

      // Double jump indicator
      if (player.canDoubleJump && !player.isGrounded && !player.hasDoubleJumped) {
        ctx.globalAlpha = 0.5 + Math.sin(gameTime * 0.3) * 0.2;
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height + 5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
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
  }, [player, enemies, powerUps, projectiles, level, cameraX, gameTime, images]);

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
