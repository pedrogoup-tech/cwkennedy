import { Enemy, Player, Projectile, Platform } from '@/types/game';

const GRAVITY = 0.6;
const SLOTH_SPEED = 1;
const DEADLINE_SPEED = 4;
const DEADLINE_JUMP_FORCE = -12;
const SPAM_SPEED = 1.5;

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
      newEnemy = updateSlothAI(newEnemy, platforms);
      break;
    case 'deadline':
      newEnemy = updateDeadlineAI(newEnemy, player, platforms, gameTime);
      break;
    case 'spam':
      newEnemy = updateSpamAI(newEnemy, player, platforms, gameTime, addProjectile);
      break;
    case 'boss':
      newEnemy = updateBossAI(newEnemy, player, gameTime, addProjectile);
      break;
  }
  
  return newEnemy;
};

// Sloth - slow patrol, reverses at edges
const updateSlothAI = (enemy: Enemy, platforms: Platform[]): Enemy => {
  let newEnemy = { ...enemy };
  
  // Apply movement
  newEnemy.x += newEnemy.velocityX;
  
  // Check if on platform edge or hitting wall
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

// Deadline - fast, chases player when in range, can jump
const updateDeadlineAI = (
  enemy: Enemy, 
  player: Player, 
  platforms: Platform[],
  gameTime: number
): Enemy => {
  let newEnemy = { ...enemy };
  
  // Check distance to player
  const distanceToPlayer = Math.sqrt(
    Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
  );
  
  const aggroRange = enemy.aggroRange || 250;
  newEnemy.isAggro = distanceToPlayer < aggroRange;
  
  // Apply gravity
  newEnemy.velocityY = (newEnemy.velocityY || 0) + GRAVITY;
  
  // Check if grounded
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
  
  if (newEnemy.isAggro) {
    // Chase player
    if (player.x > newEnemy.x + newEnemy.width) {
      newEnemy.velocityX = DEADLINE_SPEED;
    } else if (player.x + player.width < newEnemy.x) {
      newEnemy.velocityX = -DEADLINE_SPEED;
    } else {
      newEnemy.velocityX = 0;
    }
    
    // Jump if player is above and grounded
    const jumpCooldown = newEnemy.jumpCooldown || 0;
    if (isGrounded && player.y < newEnemy.y - 50 && jumpCooldown <= 0) {
      newEnemy.velocityY = DEADLINE_JUMP_FORCE;
      newEnemy.jumpCooldown = 90; // 1.5 seconds cooldown
    }
    
    if (jumpCooldown > 0) {
      newEnemy.jumpCooldown = jumpCooldown - 1;
    }
  } else {
    // Patrol slowly when not aggroed
    if (newEnemy.velocityX === 0) {
      newEnemy.velocityX = SLOTH_SPEED;
    }
    
    // Check platform edges
    const onPlatform = platforms.some(p => 
      newEnemy.x >= p.x - 10 && 
      newEnemy.x + newEnemy.width <= p.x + p.width + 10 &&
      Math.abs(newEnemy.y + newEnemy.height - p.y) < 15
    );
    
    if (!onPlatform && isGrounded) {
      newEnemy.velocityX *= -1;
    }
  }
  
  // Apply movement
  newEnemy.x += newEnemy.velocityX;
  newEnemy.y += newEnemy.velocityY;
  
  return newEnemy;
};

// Spam - shoots projectiles at player periodically
const updateSpamAI = (
  enemy: Enemy, 
  player: Player, 
  platforms: Platform[],
  gameTime: number,
  addProjectile: (proj: EnemyProjectile) => void
): Enemy => {
  let newEnemy = { ...enemy };
  
  // Patrol movement
  newEnemy.x += newEnemy.velocityX;
  
  // Check platform edges
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
  
  // Shooting logic
  const attackCooldown = newEnemy.attackCooldown || 0;
  const distanceToPlayer = Math.abs(player.x - enemy.x);
  
  if (attackCooldown <= 0 && distanceToPlayer < 400) {
    // Fire projectile towards player
    const directionX = player.x > enemy.x ? 1 : -1;
    const projectile: EnemyProjectile = {
      id: `spam-proj-${Date.now()}-${Math.random()}`,
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 2,
      velocityX: directionX * 5,
      velocityY: (player.y - enemy.y) * 0.01,
      active: true,
      type: 'boss',
      damage: 1,
    };
    addProjectile(projectile);
    newEnemy.attackCooldown = 150; // 2.5 seconds
  } else if (attackCooldown > 0) {
    newEnemy.attackCooldown = attackCooldown - 1;
  }
  
  return newEnemy;
};

// Boss - multi-phase behavior
const updateBossAI = (
  enemy: Enemy, 
  player: Player,
  gameTime: number,
  addProjectile: (proj: EnemyProjectile) => void
): Enemy => {
  let newEnemy = { ...enemy };
  
  const bossPhase = enemy.phase || 1;
  const moveSpeed = 1.5 + bossPhase * 0.5;
  
  // Move towards player with some randomness
  if (player.x > newEnemy.x + newEnemy.width + 50) {
    newEnemy.velocityX = moveSpeed;
  } else if (player.x + player.width < newEnemy.x - 50) {
    newEnemy.velocityX = -moveSpeed;
  } else {
    // Random strafe when close to player
    if (gameTime % 60 === 0) {
      newEnemy.velocityX = (Math.random() - 0.5) * moveSpeed * 2;
    }
  }
  
  newEnemy.x += newEnemy.velocityX;
  
  // Boss attack - shoots in patterns based on phase
  let attackCooldown = newEnemy.attackCooldown || 0;
  if (attackCooldown <= 0) {
    const projectileCount = bossPhase; // More projectiles in later phases
    
    for (let i = 0; i < projectileCount; i++) {
      const angle = (i / projectileCount) * Math.PI * 0.5 - Math.PI * 0.25;
      const baseVelX = player.x > newEnemy.x ? 6 : -6;
      
      const projectile: EnemyProjectile = {
        id: `boss-proj-${Date.now()}-${i}`,
        x: newEnemy.x + newEnemy.width / 2,
        y: newEnemy.y + newEnemy.height / 2,
        velocityX: baseVelX + Math.sin(angle) * 2,
        velocityY: (player.y - newEnemy.y) * 0.02 + Math.cos(angle) * 2,
        active: true,
        type: 'boss',
        damage: 1,
      };
      addProjectile(projectile);
    }
    
    newEnemy.attackCooldown = Math.max(60, 120 - bossPhase * 20);
  } else {
    newEnemy.attackCooldown = attackCooldown - 1;
  }
  
  // Update phase based on health
  const healthPercent = (enemy.health || 0) / (enemy.maxHealth || 10);
  if (healthPercent <= 0.3) {
    newEnemy.phase = 3;
  } else if (healthPercent <= 0.6) {
    newEnemy.phase = 2;
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
    case 'boss': return 10;
    default: return 1;
  }
};
