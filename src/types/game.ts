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

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  alive: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'platform' | 'moving' | 'building';
  movingRange?: { min: number; max: number };
  movingSpeed?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  active: boolean;
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
}

export interface Level {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  platforms: Platform[];
  enemies: Enemy[];
  powerUps: PowerUp[];
  background: 'urban' | 'sunset' | 'coworking';
  width: number;
  goal: { x: number; y: number };
}

export type GameState = 'menu' | 'character-select' | 'level-select' | 'playing' | 'paused' | 'level-complete' | 'game-over';

export interface GameProgress {
  unlockedLevels: number[];
  completedLevels: number[];
  totalNetworking: number;
  selectedCharacter: CharacterId | null;
}
