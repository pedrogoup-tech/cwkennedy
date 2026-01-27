import { Enemy, Player, Projectile, Platform } from '@/types/game';

const GRAVITY = 0.6;
const SLOTH_SPEED = 1.2;
const DEADLINE_SPEED = 4.5;
const DEADLINE_JUMP_FORCE = -13;
const SPAM_SPEED = 1.8;

export interface EnemyProjectile extends Projectile {
  damage?: number;
}

export const updateEnemyAI = (
  enemy: Enemy,
  player: Player,
  platforms: Platform[],
  gameTime: number,
  addProjectile: (proj: EnemyProjectile) => void
): Enemy => {
  if (!enemy.alive) return enemy;
  
  let newEnemy = { ...enemy };
  
  switch (enemy.type) {
    case 'sloth':
      newEnemy = updateSlothAI(newEnemy, player, platforms, gameTime);
      break;
    case 'deadline':
      newEnemy = updateDeadlineAI(newEnemy, player, platforms, gameTime);
      break;
    case 'spam':
      newEnemy = updateSpamAI(newEnemy, player, platforms, gameTime, addProjectile);
      break;
    case 'boss':
      newEnemy = updateBossAI(newEnemy, player, platforms, gameTime, addProjectile);
      break;
  }
  
  return newEnemy;
};

// Sloth - patrulha com comportamento de emboscada
const updateSlothAI = (enemy: Enemy, player: Player, platforms: Platform[], gameTime: number): Enemy => {
  let newEnemy = { ...enemy };
  
  const distanceToPlayer = Math.abs(player.x - enemy.x);
  
  // Detecta jogador próximo e aumenta velocidade temporariamente
  if (distanceToPlayer < 150) {
    const direction = player.x > enemy.x ? 1 : -1;
    newEnemy.velocityX = direction * SLOTH_SPEED * 1.8;
  } else {
    // Patrulha normal
    if (Math.abs(newEnemy.velocityX) < SLOTH_SPEED * 0.5) {
      newEnemy.velocityX = SLOTH_SPEED * (newEnemy.velocityX >= 0 ? 1 : -1);
    }
  }
  
  newEnemy.x += newEnemy.velocityX;
  
  // Verifica bordas da plataforma
  const onPlatform = platforms.some(p => 
    newEnemy.x >= p.x - 10 && 
    newEnemy.x + newEnemy.width <= p.x + p.width + 10 &&
    Math.abs(newEnemy.y + newEnemy.height - p.y) < 15
  );
  
  const atPatrolEdge = enemy.patrolMin && enemy.patrolMax && 
    (newEnemy.x <= enemy.patrolMin || newEnemy.x >= enemy.patrolMax);
    
  if (!onPlatform || atPatrolEdge || newEnemy.x < 0) {
    newEnemy.velocityX *= -1;
  }
  
  return newEnemy;
};

// Deadline - perseguidor inteligente com pulos precisos e dash
const updateDeadlineAI = (
  enemy: Enemy, 
  player: Player, 
  platforms: Platform[],
  gameTime: number
): Enemy => {
  let newEnemy = { ...enemy };
  
  const distanceToPlayer = Math.sqrt(
    Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
  );
  
  const aggroRange = enemy.aggroRange || 300;
  newEnemy.isAggro = distanceToPlayer < aggroRange;
  
  // Gravidade
  newEnemy.velocityY = (newEnemy.velocityY || 0) + GRAVITY;
  
  // Verifica se está no chão
  let isGrounded = false;
  platforms.forEach(platform => {
    if (
      newEnemy.x + newEnemy.width > platform.x &&
      newEnemy.x < platform.x + platform.width &&
      newEnemy.y + newEnemy.height >= platform.y &&
      newEnemy.y + newEnemy.height <= platform.y + platform.height + 10 &&
      newEnemy.velocityY >= 0
    ) {
      newEnemy.y = platform.y - newEnemy.height;
      newEnemy.velocityY = 0;
      isGrounded = true;
    }
  });
  
  // Cooldown de dash
  let dashCooldown = newEnemy.dashCooldown || 0;
  if (dashCooldown > 0) {
    newEnemy.dashCooldown = dashCooldown - 1;
  }
  
  if (newEnemy.isAggro) {
    const horizontalDist = Math.abs(player.x - newEnemy.x);
    
    // Dash rápido quando jogador está perto
    if (horizontalDist < 80 && horizontalDist > 30 && dashCooldown <= 0 && isGrounded) {
      const dashDir = player.x > newEnemy.x ? 1 : -1;
      newEnemy.velocityX = dashDir * DEADLINE_SPEED * 2.5;
      newEnemy.dashCooldown = 120;
    } else {
      // Perseguição normal com aceleração
      if (player.x > newEnemy.x + newEnemy.width) {
        newEnemy.velocityX = Math.min(newEnemy.velocityX + 0.3, DEADLINE_SPEED);
      } else if (player.x + player.width < newEnemy.x) {
        newEnemy.velocityX = Math.max(newEnemy.velocityX - 0.3, -DEADLINE_SPEED);
      } else {
        newEnemy.velocityX *= 0.9;
      }
    }
    
    // Pulo inteligente - pula para alcançar jogador em plataformas
    const jumpCooldown = newEnemy.jumpCooldown || 0;
    const playerAbove = player.y < newEnemy.y - 40;
    const playerOnSameLevel = Math.abs(player.y - newEnemy.y) < 60;
    const obstacleAhead = platforms.some(p => 
      p.type !== 'platform' && p.type !== 'glass' &&
      Math.abs(p.x - newEnemy.x) < 80 && 
      p.y < newEnemy.y && p.y > newEnemy.y - 100
    );
    
    if (isGrounded && jumpCooldown <= 0) {
      if (playerAbove || obstacleAhead) {
        // Pulo mais alto para alcançar plataformas
        newEnemy.velocityY = DEADLINE_JUMP_FORCE * (playerAbove ? 1.1 : 0.9);
        newEnemy.jumpCooldown = 60;
      }
    }
    
    if (jumpCooldown > 0) {
      newEnemy.jumpCooldown = jumpCooldown - 1;
    }
  } else {
    // Patrulha quando não está agressivo
    if (Math.abs(newEnemy.velocityX) < 0.5) {
      newEnemy.velocityX = SLOTH_SPEED * (Math.random() > 0.5 ? 1 : -1);
    }
    
    const onPlatform = platforms.some(p => 
      newEnemy.x >= p.x - 10 && 
      newEnemy.x + newEnemy.width <= p.x + p.width + 10 &&
      Math.abs(newEnemy.y + newEnemy.height - p.y) < 15
    );
    
    if (!onPlatform && isGrounded) {
      newEnemy.velocityX *= -1;
    }
  }
  
  newEnemy.x += newEnemy.velocityX;
  newEnemy.y += newEnemy.velocityY;
  
  return newEnemy;
};

// Spam - atirador com mira preditiva e rajadas
const updateSpamAI = (
  enemy: Enemy, 
  player: Player, 
  platforms: Platform[],
  gameTime: number,
  addProjectile: (proj: EnemyProjectile) => void
): Enemy => {
  let newEnemy = { ...enemy };
  
  const distanceToPlayer = Math.abs(player.x - enemy.x);
  const playerInRange = distanceToPlayer < 450;
  
  // Para de mover quando está atirando
  if (playerInRange && distanceToPlayer > 100) {
    newEnemy.velocityX *= 0.8;
  } else {
    // Patrulha
    if (Math.abs(newEnemy.velocityX) < SPAM_SPEED * 0.5) {
      newEnemy.velocityX = SPAM_SPEED * (newEnemy.velocityX >= 0 ? 1 : -1);
    }
    newEnemy.x += newEnemy.velocityX;
  }
  
  // Verifica bordas
  const onPlatform = platforms.some(p => 
    newEnemy.x >= p.x - 10 && 
    newEnemy.x + newEnemy.width <= p.x + p.width + 10 &&
    Math.abs(newEnemy.y + newEnemy.height - p.y) < 15
  );
  
  const atPatrolEdge = enemy.patrolMin && enemy.patrolMax && 
    (newEnemy.x <= enemy.patrolMin || newEnemy.x >= enemy.patrolMax);
  
  if (!onPlatform || atPatrolEdge || newEnemy.x < 0) {
    newEnemy.velocityX *= -1;
  }
  
  // Sistema de tiro com rajadas
  let attackCooldown = newEnemy.attackCooldown || 0;
  let burstCount = newEnemy.burstCount || 0;
  
  if (attackCooldown <= 0 && playerInRange) {
    // Mira preditiva - calcula onde o jogador estará
    const timeToHit = distanceToPlayer / 6;
    const predictedX = player.x + player.velocityX * timeToHit;
    const predictedY = player.y + player.velocityY * timeToHit * 0.5;
    
    const directionX = predictedX > enemy.x ? 1 : -1;
    const angleToPlayer = Math.atan2(predictedY - enemy.y, Math.abs(predictedX - enemy.x));
    
    const projectile: EnemyProjectile = {
      id: `spam-proj-${Date.now()}-${Math.random()}`,
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 3,
      velocityX: directionX * 6,
      velocityY: Math.sin(angleToPlayer) * 3,
      active: true,
      type: 'boss',
      damage: 1,
    };
    addProjectile(projectile);
    
    burstCount++;
    
    if (burstCount >= 2) {
      newEnemy.attackCooldown = 180; // Pausa maior após rajada
      newEnemy.burstCount = 0;
    } else {
      newEnemy.attackCooldown = 25; // Tiro rápido na rajada
      newEnemy.burstCount = burstCount;
    }
  } else if (attackCooldown > 0) {
    newEnemy.attackCooldown = attackCooldown - 1;
  }
  
  return newEnemy;
};

// Boss - comportamento multi-fase avançado
const updateBossAI = (
  enemy: Enemy, 
  player: Player,
  platforms: Platform[],
  gameTime: number,
  addProjectile: (proj: EnemyProjectile) => void
): Enemy => {
  let newEnemy = { ...enemy };
  
  const bossPhase = enemy.phase || 1;
  const healthPercent = (enemy.health || 0) / (enemy.maxHealth || 10);
  
  // Atualiza fase baseado na vida
  if (healthPercent <= 0.25) {
    newEnemy.phase = 3;
  } else if (healthPercent <= 0.55) {
    newEnemy.phase = 2;
  }
  
  const currentPhase = newEnemy.phase || 1;
  const moveSpeed = 1.5 + currentPhase * 0.7;
  
  // Retreat timer - recua após tomar dano
  let retreatTimer = newEnemy.retreatTimer || 0;
  if (retreatTimer > 0) {
    const retreatDir = player.x > newEnemy.x ? -1 : 1;
    newEnemy.velocityX = retreatDir * moveSpeed * 2;
    newEnemy.retreatTimer = retreatTimer - 1;
  } else {
    // Movimento estratégico baseado na fase
    const distanceToPlayer = Math.abs(player.x - newEnemy.x);
    
    if (currentPhase === 1) {
      // Fase 1: Aproxima lentamente
      if (distanceToPlayer > 200) {
        newEnemy.velocityX = player.x > newEnemy.x ? moveSpeed : -moveSpeed;
      } else if (distanceToPlayer < 100) {
        newEnemy.velocityX = player.x > newEnemy.x ? -moveSpeed * 0.5 : moveSpeed * 0.5;
      } else {
        newEnemy.velocityX *= 0.9;
      }
    } else if (currentPhase === 2) {
      // Fase 2: Mais agressivo, faz strafes
      if (gameTime % 120 < 60) {
        newEnemy.velocityX = player.x > newEnemy.x ? moveSpeed * 1.5 : -moveSpeed * 1.5;
      } else {
        newEnemy.velocityX = (Math.sin(gameTime * 0.05) * moveSpeed * 2);
      }
    } else {
      // Fase 3: Muito agressivo e imprevisível
      if (gameTime % 60 < 30) {
        newEnemy.velocityX = player.x > newEnemy.x ? moveSpeed * 2 : -moveSpeed * 2;
      } else {
        newEnemy.velocityX = (Math.random() - 0.5) * moveSpeed * 4;
      }
    }
  }
  
  newEnemy.x += newEnemy.velocityX;
  
  // Limita movimento na arena
  if (newEnemy.x < 50) newEnemy.x = 50;
  if (newEnemy.x > 1800) newEnemy.x = 1800;
  
  // Sistema de ataque por fase
  let attackCooldown = newEnemy.attackCooldown || 0;
  if (attackCooldown <= 0) {
    const baseProjectiles = currentPhase + 1;
    const spreadAngle = 0.3 + currentPhase * 0.15;
    
    for (let i = 0; i < baseProjectiles; i++) {
      const angleOffset = (i - (baseProjectiles - 1) / 2) * spreadAngle;
      const baseDir = player.x > newEnemy.x ? 1 : -1;
      
      // Velocidade do projétil aumenta com a fase
      const projSpeed = 4 + currentPhase * 1.5;
      
      const projectile: EnemyProjectile = {
        id: `boss-proj-${Date.now()}-${i}`,
        x: newEnemy.x + newEnemy.width / 2,
        y: newEnemy.y + newEnemy.height / 3,
        velocityX: baseDir * projSpeed * Math.cos(angleOffset),
        velocityY: (player.y - newEnemy.y) * 0.015 + Math.sin(angleOffset) * 2,
        active: true,
        type: 'boss',
        damage: 1,
      };
      addProjectile(projectile);
    }
    
    // Ataque especial na fase 3
    if (currentPhase === 3 && gameTime % 180 < 60) {
      // Chuva de projéteis
      for (let i = 0; i < 5; i++) {
        const projectile: EnemyProjectile = {
          id: `boss-rain-${Date.now()}-${i}`,
          x: player.x + (Math.random() - 0.5) * 200,
          y: 50,
          velocityX: (Math.random() - 0.5) * 2,
          velocityY: 4 + Math.random() * 2,
          active: true,
          type: 'boss',
          damage: 1,
        };
        addProjectile(projectile);
      }
    }
    
    // Cooldown diminui com a fase
    newEnemy.attackCooldown = Math.max(45, 100 - currentPhase * 20);
  } else {
    newEnemy.attackCooldown = attackCooldown - 1;
  }
  
  return newEnemy;
};

export const getEnemySpeed = (type: string): number => {
  switch (type) {
    case 'sloth': return SLOTH_SPEED;
    case 'deadline': return DEADLINE_SPEED;
    case 'spam': return SPAM_SPEED;
    case 'boss': return 2;
    default: return SLOTH_SPEED;
  }
};

export const getEnemyHealth = (type: string): number => {
  switch (type) {
    case 'sloth': return 1;
    case 'deadline': return 1;
    case 'spam': return 2;
    case 'boss': return 15;
    default: return 1;
  }
};
