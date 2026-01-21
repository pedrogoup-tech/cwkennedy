export type CharacterId = 'entrepreneur' | 'designer' | 'programmer' | 'socialmedia' | 'gestor';

export interface CharacterPassive {
  name: string;
  description: string;
  icon: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  description: string;
  color: string;
  emoji: string;
  sprite: string;
  passive: CharacterPassive;
}

export type PowerUpType = 'coffee' | 'wifi' | 'networking';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  collected: boolean;
}

export type EnemyType = 'sloth' | 'deadline' | 'spam' | 'boss';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  alive: boolean;
  type: EnemyType;
  health?: number;
  maxHealth?: number;
  phase?: number;
  attackCooldown?: number;
  jumpCooldown?: number;
  patrolMin?: number;
  patrolMax?: number;
  aggroRange?: number;
  isAggro?: boolean;
  stunned?: boolean;
  stunnedTimer?: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'platform' | 'moving' | 'building' | 'desk' | 'glass' | 'rooftop';
  movingRange?: { min: number; max: number };
  movingSpeed?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY?: number;
  active: boolean;
  type?: 'wifi' | 'boss';
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isGrounded: boolean;
  facingRight: boolean;
  hasCoffee: boolean;
  hasWifi: boolean;
  coffeeTimer: number;
  networkingCollected: number;
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  health?: number;
  maxHealth?: number;
  invincible?: boolean;
  invincibleTimer?: number;
}

export type BackgroundType = 'urban' | 'sunset' | 'coworking' | 'meeting' | 'rooftop' | 'happyhour';

export interface Level {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  platforms: Platform[];
  enemies: Enemy[];
  powerUps: PowerUp[];
  background: BackgroundType;
  width: number;
  goal: { x: number; y: number };
  hasBoss?: boolean;
  bossId?: string;
}

export type GameState = 'menu' | 'character-select' | 'level-select' | 'playing' | 'paused' | 'level-complete' | 'game-over' | 'boss-defeated';

export interface GameProgress {
  unlockedLevels: number[];
  completedLevels: number[];
  totalNetworking: number;
  selectedCharacter: CharacterId | null;
}
