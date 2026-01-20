import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Level, Player, Enemy, PowerUp, Projectile, CharacterId } from '@/types/game';
import { characters } from '@/data/characters';
import GameHUD from './GameHUD';

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

  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: 400,
    width: 40,
    height: 56,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    isGrounded: false,
    facingRight: true,
    hasCoffee: false,
    hasWifi: false,
    coffeeTimer: 0,
    networkingCollected: 0,
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
      width: 40,
      height: 56,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      isGrounded: false,
      facingRight: true,
      hasCoffee: false,
      hasWifi: false,
      coffeeTimer: 0,
      networkingCollected: 0,
    });
    setEnemies(level.enemies.map(e => ({ ...e, alive: true })));
    setPowerUps(level.powerUps.map(p => ({ ...p, collected: false })));
    setProjectiles([]);
    setCameraX(0);
    setGameTime(0);
  }, [level]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      
      if (e.code === 'Escape') {
        onPause();
      }
      
      // Shoot projectile
      if (e.code === 'KeyJ' && player.hasWifi) {
        const newProjectile: Projectile = {
          id: `proj-${Date.now()}`,
          x: player.x + (player.facingRight ? player.width : 0),
          y: player.y + player.height / 2,
          velocityX: player.facingRight ? PROJECTILE_SPEED : -PROJECTILE_SPEED,
          active: true,
        };
        setProjectiles(prev => [...prev, newProjectile]);
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
  }, [player.hasWifi, player.facingRight, player.x, player.y, player.width, player.height, onPause]);

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

        // Movement
        const speed = newPlayer.hasCoffee ? MOVE_SPEED + COFFEE_SPEED_BOOST : MOVE_SPEED;
        
        if (keys.has('ArrowLeft') || keys.has('KeyA')) {
          newPlayer.velocityX = -speed;
          newPlayer.facingRight = false;
        } else if (keys.has('ArrowRight') || keys.has('KeyD')) {
          newPlayer.velocityX = speed;
          newPlayer.facingRight = true;
        } else {
          newPlayer.velocityX = 0;
        }

        // Jump
        if ((keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW')) && newPlayer.isGrounded) {
          const jumpForce = newPlayer.hasCoffee ? JUMP_FORCE + COFFEE_JUMP_BOOST : JUMP_FORCE;
          newPlayer.velocityY = jumpForce;
          newPlayer.isJumping = true;
          newPlayer.isGrounded = false;
        }

        // Apply gravity
        newPlayer.velocityY += GRAVITY;

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
          
          // Moving platform
          if (platform.type === 'moving' && platform.movingRange && platform.movingSpeed) {
            const range = platform.movingRange.max - platform.movingRange.min;
            const offset = Math.sin(gameTime * 0.02 * platform.movingSpeed) * range / 2;
            platX = platform.movingRange.min + range / 2 + offset;
          }

          if (checkCollision(
            newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height,
            platX, platform.y, platform.width, platform.height
          )) {
            // Top collision (landing)
            if (newPlayer.velocityY > 0 && 
                prevPlayer.y + prevPlayer.height <= platform.y + 10) {
              newPlayer.y = platform.y - newPlayer.height;
              newPlayer.velocityY = 0;
              newPlayer.isGrounded = true;
              newPlayer.isJumping = false;
            }
            // Bottom collision
            else if (newPlayer.velocityY < 0 && 
                     prevPlayer.y >= platform.y + platform.height - 10) {
              newPlayer.y = platform.y + platform.height;
              newPlayer.velocityY = 0;
            }
            // Side collision
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

          // Reverse direction at edges or after some distance
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
            // Stomp from above
            if (newPlayer.velocityY > 0 && newPlayer.y + newPlayer.height < enemy.y + enemy.height / 2) {
              setEnemies(prev => prev.map((e, i) => 
                i === index ? { ...e, alive: false } : e
              ));
              newPlayer.velocityY = JUMP_FORCE / 2;
            } else {
              // Hit from side - game over
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
          
          // Check collision with enemies
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

          // Remove if out of bounds
          if (newProj.x < cameraX - 100 || newProj.x > cameraX + 900) {
            return false;
          }

          return newProj.active;
        }).map(proj => ({ ...proj, x: proj.x + proj.velocityX }));
      });

      // Power-up collection
      setPowerUps(prevPowerUps => {
        return prevPowerUps.map(powerUp => {
          if (powerUp.collected) return powerUp;

          if (checkCollision(
            player.x, player.y, player.width, player.height,
            powerUp.x, powerUp.y, 32, 32
          )) {
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
  }, [level, enemies, player, projectiles, cameraX, gameTime, checkCollision, onGameOver, onLevelComplete]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
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

    // Draw background elements
    if (level.background === 'urban' || level.background === 'sunset') {
      // Buildings
      ctx.fillStyle = '#455A64';
      for (let i = 0; i < 10; i++) {
        const bx = (i * 200 - cameraX * 0.3) % (canvas.width + 200) - 100;
        const bh = 100 + Math.sin(i) * 50;
        ctx.fillRect(bx, canvas.height - 80 - bh, 80, bh);
        
        // Windows
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

    // Draw platforms
    ctx.save();
    ctx.translate(-cameraX, 0);

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
          // Door
          ctx.fillStyle = '#FF9800';
          ctx.fillRect(platX + platform.width / 2 - 25, platform.y + platform.height - 80, 50, 80);
          // Windows
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

    // Draw power-ups
    powerUps.forEach(powerUp => {
      if (powerUp.collected) return;

      const bounceY = Math.sin(gameTime * 0.1 + powerUp.x * 0.01) * 5;
      ctx.font = '28px sans-serif';
      
      switch (powerUp.type) {
        case 'coffee':
          ctx.fillText('☕', powerUp.x, powerUp.y + bounceY);
          break;
        case 'wifi':
          ctx.fillText('📶', powerUp.x, powerUp.y + bounceY);
          break;
        case 'networking':
          ctx.fillText('🤝', powerUp.x, powerUp.y + bounceY);
          break;
      }
    });

    // Draw enemies
    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      ctx.save();
      if (enemy.velocityX > 0) {
        ctx.translate(enemy.x + enemy.width, enemy.y);
        ctx.scale(-1, 1);
        ctx.font = '36px sans-serif';
        ctx.fillText('🦥', 0, enemy.height);
      } else {
        ctx.font = '36px sans-serif';
        ctx.fillText('🦥', enemy.x, enemy.y + enemy.height);
      }
      ctx.restore();
    });

    // Draw projectiles
    projectiles.forEach(proj => {
      if (!proj.active) return;
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64B5F6';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player
    ctx.save();
    if (!player.facingRight) {
      ctx.translate(player.x + player.width, player.y);
      ctx.scale(-1, 1);
      ctx.font = '44px sans-serif';
      ctx.fillText(character.emoji, 0, player.height);
    } else {
      ctx.font = '44px sans-serif';
      ctx.fillText(character.emoji, player.x, player.y + player.height);
    }
    ctx.restore();

    // Coffee effect glow
    if (player.hasCoffee) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(gameTime * 0.2) * 0.1;
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }, [player, enemies, powerUps, projectiles, level, cameraX, gameTime, character]);

  const networkingTotal = level.powerUps.filter(p => p.type === 'networking').length;

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <GameHUD
        levelName={level.name}
        characterName={character.name}
        characterEmoji={character.emoji}
        networkingCollected={player.networkingCollected}
        networkingTotal={networkingTotal}
        hasCoffee={player.hasCoffee}
        coffeeTimer={player.coffeeTimer}
        hasWifi={player.hasWifi}
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
