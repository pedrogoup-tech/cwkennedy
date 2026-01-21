import { Level, Platform, Enemy, PowerUp, EnemyType } from '@/types/game';

// Sloth - slow patrol enemy
const createSloth = (x: number, y: number, velocityX: number = -1): Enemy => ({
  id: `sloth-${x}-${y}`,
  x,
  y,
  width: 48,
  height: 40,
  velocityX,
  velocityY: 0,
  alive: true,
  type: 'sloth',
  patrolMin: x - 100,
  patrolMax: x + 100,
});

// Deadline - fast, jumping enemy that chases player
const createDeadline = (x: number, y: number): Enemy => ({
  id: `deadline-${x}-${y}`,
  x,
  y,
  width: 44,
  height: 48,
  velocityX: 0,
  velocityY: 0,
  alive: true,
  type: 'deadline',
  aggroRange: 250,
  isAggro: false,
  jumpCooldown: 0,
});

// Spam - shoots projectiles, medium speed
const createSpam = (x: number, y: number): Enemy => ({
  id: `spam-${x}-${y}`,
  x,
  y,
  width: 50,
  height: 52,
  velocityX: -1.5,
  velocityY: 0,
  alive: true,
  type: 'spam',
  attackCooldown: 120,
  patrolMin: x - 150,
  patrolMax: x + 150,
});

const createBoss = (x: number, y: number): Enemy => ({
  id: 'boss-micromanager',
  x,
  y,
  width: 120,
  height: 100,
  velocityX: 0,
  velocityY: 0,
  alive: true,
  type: 'boss',
  health: 10,
  maxHealth: 10,
  phase: 1,
  attackCooldown: 0,
});

const createPowerUp = (x: number, y: number, type: 'coffee' | 'wifi' | 'networking'): PowerUp => ({
  id: `powerup-${type}-${x}-${y}`,
  type,
  x,
  y,
  collected: false,
});

export const levels: Level[] = [
  {
    id: 1,
    name: 'Ruas da Cidade',
    description: 'Introdução ao mundo do Coworking Kennedy',
    unlocked: true,
    completed: false,
    width: 3200,
    background: 'urban',
    goal: { x: 3100, y: 400 },
    platforms: [
      // Ground
      { x: 0, y: 520, width: 800, height: 80, type: 'ground' },
      { x: 900, y: 520, width: 600, height: 80, type: 'ground' },
      { x: 1600, y: 520, width: 400, height: 80, type: 'ground' },
      { x: 2100, y: 520, width: 1100, height: 80, type: 'ground' },
      
      // Platforms
      { x: 300, y: 400, width: 150, height: 24, type: 'platform' },
      { x: 550, y: 320, width: 120, height: 24, type: 'platform' },
      { x: 750, y: 420, width: 100, height: 24, type: 'platform' },
      { x: 1000, y: 380, width: 150, height: 24, type: 'platform' },
      { x: 1250, y: 300, width: 120, height: 24, type: 'platform' },
      { x: 1450, y: 400, width: 100, height: 24, type: 'platform' },
      { x: 1700, y: 380, width: 150, height: 24, type: 'platform' },
      { x: 1950, y: 420, width: 100, height: 24, type: 'platform' },
      { x: 2200, y: 380, width: 120, height: 24, type: 'platform' },
      { x: 2450, y: 320, width: 150, height: 24, type: 'platform' },
      { x: 2700, y: 400, width: 120, height: 24, type: 'platform' },
      { x: 2950, y: 350, width: 150, height: 24, type: 'platform' },
    ],
    enemies: [
      createSloth(500, 480),
      createSloth(1100, 480),
      createDeadline(1800, 480),
      createSloth(2400, 480),
      createSloth(2800, 480),
    ],
    powerUps: [
      createPowerUp(350, 350, 'coffee'),
      createPowerUp(1280, 250, 'wifi'),
      createPowerUp(600, 270, 'networking'),
      createPowerUp(1750, 330, 'networking'),
      createPowerUp(2500, 270, 'networking'),
    ],
  },
  {
    id: 2,
    name: 'Caminho ao Prédio',
    description: 'Obstáculos mais difíceis e plataformas móveis',
    unlocked: false,
    completed: false,
    width: 4000,
    background: 'sunset',
    goal: { x: 3900, y: 300 },
    platforms: [
      // Ground sections with gaps
      { x: 0, y: 520, width: 500, height: 80, type: 'ground' },
      { x: 700, y: 520, width: 400, height: 80, type: 'ground' },
      { x: 1300, y: 520, width: 500, height: 80, type: 'ground' },
      { x: 2000, y: 520, width: 400, height: 80, type: 'ground' },
      { x: 2600, y: 520, width: 600, height: 80, type: 'ground' },
      { x: 3400, y: 520, width: 600, height: 80, type: 'ground' },
      
      // Static platforms
      { x: 200, y: 400, width: 120, height: 24, type: 'platform' },
      { x: 450, y: 320, width: 100, height: 24, type: 'platform' },
      { x: 850, y: 380, width: 120, height: 24, type: 'platform' },
      { x: 1100, y: 300, width: 100, height: 24, type: 'platform' },
      { x: 1400, y: 400, width: 150, height: 24, type: 'platform' },
      { x: 1650, y: 350, width: 120, height: 24, type: 'platform' },
      { x: 2100, y: 380, width: 100, height: 24, type: 'platform' },
      { x: 2350, y: 300, width: 120, height: 24, type: 'platform' },
      { x: 2700, y: 400, width: 150, height: 24, type: 'platform' },
      { x: 2950, y: 320, width: 120, height: 24, type: 'platform' },
      { x: 3200, y: 380, width: 100, height: 24, type: 'platform' },
      
      // Moving platforms
      { x: 550, y: 420, width: 100, height: 24, type: 'moving', movingRange: { min: 500, max: 650 }, movingSpeed: 1 },
      { x: 1850, y: 380, width: 100, height: 24, type: 'moving', movingRange: { min: 1800, max: 2000 }, movingSpeed: 1.5 },
      { x: 2500, y: 350, width: 100, height: 24, type: 'moving', movingRange: { min: 2450, max: 2600 }, movingSpeed: 1 },
      
      // Building at end
      { x: 3700, y: 350, width: 200, height: 250, type: 'building' },
    ],
    enemies: [
      createSloth(400, 480),
      createDeadline(800, 480),
      createSloth(1200, 480),
      createSpam(1600, 480),
      createDeadline(2200, 480),
      createSloth(2800, 480),
      createSpam(3100, 480),
      createSloth(3500, 480),
    ],
    powerUps: [
      createPowerUp(250, 350, 'coffee'),
      createPowerUp(1150, 250, 'wifi'),
      createPowerUp(2400, 250, 'coffee'),
      createPowerUp(500, 270, 'networking'),
      createPowerUp(1700, 300, 'networking'),
      createPowerUp(3000, 270, 'networking'),
    ],
  },
  {
    id: 3,
    name: 'Coworking Kennedy',
    description: 'O desafio final dentro do coworking!',
    unlocked: false,
    completed: false,
    width: 3600,
    background: 'coworking',
    goal: { x: 3500, y: 400 },
    platforms: [
      // Floor
      { x: 0, y: 520, width: 3600, height: 80, type: 'ground' },
      
      // Desks as platforms
      { x: 150, y: 440, width: 180, height: 80, type: 'desk' },
      { x: 500, y: 400, width: 150, height: 24, type: 'platform' },
      { x: 750, y: 350, width: 120, height: 24, type: 'platform' },
      { x: 1000, y: 440, width: 200, height: 80, type: 'desk' },
      { x: 1300, y: 380, width: 150, height: 24, type: 'platform' },
      { x: 1550, y: 320, width: 120, height: 24, type: 'platform' },
      { x: 1800, y: 400, width: 180, height: 24, type: 'platform' },
      { x: 2100, y: 440, width: 200, height: 80, type: 'desk' },
      { x: 2400, y: 360, width: 150, height: 24, type: 'platform' },
      { x: 2650, y: 300, width: 120, height: 24, type: 'platform' },
      { x: 2900, y: 380, width: 150, height: 24, type: 'platform' },
      { x: 3150, y: 320, width: 120, height: 24, type: 'platform' },
      
      // Meeting room platforms
      { x: 900, y: 280, width: 100, height: 24, type: 'glass' },
      { x: 1700, y: 240, width: 100, height: 24, type: 'glass' },
      { x: 2500, y: 220, width: 100, height: 24, type: 'glass' },
      
      // Moving chairs
      { x: 400, y: 480, width: 80, height: 40, type: 'moving', movingRange: { min: 350, max: 500 }, movingSpeed: 1 },
      { x: 1200, y: 480, width: 80, height: 40, type: 'moving', movingRange: { min: 1150, max: 1300 }, movingSpeed: 1.2 },
      { x: 2000, y: 480, width: 80, height: 40, type: 'moving', movingRange: { min: 1950, max: 2100 }, movingSpeed: 0.8 },
      { x: 2800, y: 480, width: 80, height: 40, type: 'moving', movingRange: { min: 2750, max: 2900 }, movingSpeed: 1 },
    ],
    enemies: [
      createSloth(300, 480),
      createDeadline(650, 480),
      createSpam(950, 480),
      createSloth(1400, 480),
      createDeadline(1750, 480),
      createSpam(2250, 480),
      createDeadline(2600, 480),
      createSloth(3000, 480),
      createSpam(3300, 480),
    ],
    powerUps: [
      createPowerUp(200, 390, 'coffee'),
      createPowerUp(1050, 390, 'wifi'),
      createPowerUp(2150, 390, 'coffee'),
      createPowerUp(3200, 270, 'wifi'),
      createPowerUp(800, 300, 'networking'),
      createPowerUp(1600, 270, 'networking'),
      createPowerUp(2450, 310, 'networking'),
    ],
  },
  // FASE 4 - SALA DE REUNIÕES (COM BOSS!)
  {
    id: 4,
    name: 'Sala de Reuniões',
    description: 'Enfrente o terrível Gerente Micromanager!',
    unlocked: false,
    completed: false,
    width: 2400,
    background: 'meeting',
    goal: { x: 2300, y: 400 },
    hasBoss: true,
    bossId: 'boss-micromanager',
    platforms: [
      // Main floor
      { x: 0, y: 520, width: 2400, height: 80, type: 'ground' },
      
      // Conference table in center
      { x: 800, y: 420, width: 400, height: 100, type: 'desk' },
      
      // Side platforms
      { x: 100, y: 400, width: 150, height: 24, type: 'glass' },
      { x: 300, y: 320, width: 120, height: 24, type: 'platform' },
      { x: 500, y: 250, width: 100, height: 24, type: 'glass' },
      
      { x: 1400, y: 380, width: 150, height: 24, type: 'platform' },
      { x: 1600, y: 300, width: 120, height: 24, type: 'glass' },
      { x: 1800, y: 380, width: 150, height: 24, type: 'platform' },
      { x: 2000, y: 300, width: 120, height: 24, type: 'platform' },
      
      // Upper platforms for boss fight
      { x: 600, y: 200, width: 150, height: 24, type: 'platform' },
      { x: 900, y: 150, width: 200, height: 24, type: 'glass' },
      { x: 1250, y: 200, width: 150, height: 24, type: 'platform' },
    ],
    enemies: [
      createDeadline(200, 480),
      createSpam(400, 480),
      createBoss(900, 320),
    ],
    powerUps: [
      createPowerUp(150, 350, 'coffee'),
      createPowerUp(550, 200, 'wifi'),
      createPowerUp(1650, 250, 'coffee'),
      createPowerUp(350, 270, 'networking'),
      createPowerUp(1000, 100, 'networking'),
      createPowerUp(1850, 330, 'networking'),
    ],
  },
  // FASE 5 - ROOFTOP
  {
    id: 5,
    name: 'Rooftop',
    description: 'Vista panorâmica da cidade!',
    unlocked: false,
    completed: false,
    width: 4000,
    background: 'rooftop',
    goal: { x: 3900, y: 300 },
    platforms: [
      // Rooftop sections with gaps
      { x: 0, y: 520, width: 400, height: 80, type: 'rooftop' },
      { x: 500, y: 480, width: 300, height: 120, type: 'rooftop' },
      { x: 900, y: 520, width: 400, height: 80, type: 'rooftop' },
      { x: 1400, y: 450, width: 300, height: 150, type: 'rooftop' },
      { x: 1800, y: 520, width: 400, height: 80, type: 'rooftop' },
      { x: 2300, y: 480, width: 300, height: 120, type: 'rooftop' },
      { x: 2700, y: 520, width: 500, height: 80, type: 'rooftop' },
      { x: 3300, y: 450, width: 300, height: 150, type: 'rooftop' },
      { x: 3700, y: 520, width: 300, height: 80, type: 'rooftop' },
      
      // Floating glass platforms
      { x: 350, y: 380, width: 100, height: 20, type: 'glass' },
      { x: 750, y: 320, width: 100, height: 20, type: 'glass' },
      { x: 1200, y: 350, width: 120, height: 20, type: 'glass' },
      { x: 1650, y: 280, width: 100, height: 20, type: 'glass' },
      { x: 2100, y: 350, width: 120, height: 20, type: 'glass' },
      { x: 2550, y: 300, width: 100, height: 20, type: 'glass' },
      { x: 3050, y: 350, width: 120, height: 20, type: 'glass' },
      { x: 3550, y: 300, width: 100, height: 20, type: 'glass' },
      
      // Moving platforms between gaps
      { x: 420, y: 450, width: 80, height: 24, type: 'moving', movingRange: { min: 400, max: 500 }, movingSpeed: 1.2 },
      { x: 1320, y: 400, width: 80, height: 24, type: 'moving', movingRange: { min: 1300, max: 1400 }, movingSpeed: 1.5 },
      { x: 2220, y: 430, width: 80, height: 24, type: 'moving', movingRange: { min: 2200, max: 2300 }, movingSpeed: 1 },
      { x: 3220, y: 400, width: 80, height: 24, type: 'moving', movingRange: { min: 3200, max: 3300 }, movingSpeed: 1.3 },
    ],
    enemies: [
      createSloth(200, 480),
      createDeadline(600, 440),
      createSpam(1000, 480),
      createDeadline(1500, 410),
      createSloth(1900, 480),
      createSpam(2400, 440),
      createDeadline(2850, 480),
      createSpam(3400, 410),
      createSloth(3750, 480),
    ],
    powerUps: [
      createPowerUp(400, 330, 'coffee'),
      createPowerUp(1250, 300, 'wifi'),
      createPowerUp(2150, 300, 'coffee'),
      createPowerUp(3100, 300, 'wifi'),
      createPowerUp(800, 270, 'networking'),
      createPowerUp(1700, 230, 'networking'),
      createPowerUp(2600, 250, 'networking'),
    ],
  },
  // FASE 6 - HAPPY HOUR
  {
    id: 6,
    name: 'Happy Hour',
    description: 'A festa de celebração do coworking!',
    unlocked: false,
    completed: false,
    width: 4500,
    background: 'happyhour',
    goal: { x: 4400, y: 400 },
    platforms: [
      // Bar counter and floor
      { x: 0, y: 520, width: 600, height: 80, type: 'ground' },
      { x: 700, y: 520, width: 500, height: 80, type: 'ground' },
      { x: 1300, y: 520, width: 400, height: 80, type: 'ground' },
      { x: 1800, y: 520, width: 600, height: 80, type: 'ground' },
      { x: 2500, y: 520, width: 500, height: 80, type: 'ground' },
      { x: 3100, y: 520, width: 400, height: 80, type: 'ground' },
      { x: 3600, y: 520, width: 900, height: 80, type: 'ground' },
      
      // Bar stools and tables
      { x: 150, y: 460, width: 80, height: 60, type: 'desk' },
      { x: 350, y: 460, width: 80, height: 60, type: 'desk' },
      { x: 800, y: 420, width: 150, height: 100, type: 'desk' },
      { x: 1100, y: 460, width: 80, height: 60, type: 'desk' },
      { x: 1400, y: 440, width: 120, height: 80, type: 'desk' },
      { x: 1900, y: 420, width: 150, height: 100, type: 'desk' },
      { x: 2200, y: 460, width: 80, height: 60, type: 'desk' },
      { x: 2600, y: 440, width: 120, height: 80, type: 'desk' },
      { x: 2900, y: 460, width: 80, height: 60, type: 'desk' },
      { x: 3200, y: 420, width: 150, height: 100, type: 'desk' },
      { x: 3700, y: 440, width: 120, height: 80, type: 'desk' },
      { x: 4000, y: 460, width: 80, height: 60, type: 'desk' },
      
      // Upper platforms (speaker stands, decoration)
      { x: 200, y: 350, width: 100, height: 24, type: 'platform' },
      { x: 450, y: 280, width: 120, height: 24, type: 'platform' },
      { x: 950, y: 320, width: 100, height: 24, type: 'platform' },
      { x: 1250, y: 350, width: 120, height: 24, type: 'platform' },
      { x: 1550, y: 280, width: 100, height: 24, type: 'platform' },
      { x: 2050, y: 320, width: 120, height: 24, type: 'platform' },
      { x: 2350, y: 350, width: 100, height: 24, type: 'platform' },
      { x: 2750, y: 280, width: 120, height: 24, type: 'platform' },
      { x: 3050, y: 350, width: 100, height: 24, type: 'platform' },
      { x: 3450, y: 320, width: 120, height: 24, type: 'platform' },
      { x: 3850, y: 350, width: 100, height: 24, type: 'platform' },
      { x: 4150, y: 280, width: 120, height: 24, type: 'platform' },
      
      // Moving disco platforms
      { x: 600, y: 400, width: 80, height: 24, type: 'moving', movingRange: { min: 600, max: 700 }, movingSpeed: 1.5 },
      { x: 1700, y: 380, width: 80, height: 24, type: 'moving', movingRange: { min: 1700, max: 1800 }, movingSpeed: 1.2 },
      { x: 3000, y: 400, width: 80, height: 24, type: 'moving', movingRange: { min: 3000, max: 3100 }, movingSpeed: 1.3 },
      { x: 3500, y: 380, width: 80, height: 24, type: 'moving', movingRange: { min: 3500, max: 3600 }, movingSpeed: 1 },
    ],
    enemies: [
      createSloth(250, 480),
      createDeadline(500, 480),
      createSpam(850, 380),
      createDeadline(1150, 480),
      createSloth(1500, 480),
      createSpam(1950, 380),
      createDeadline(2300, 480),
      createSloth(2700, 480),
      createSpam(3000, 480),
      createDeadline(3250, 380),
      createSloth(3550, 480),
      createSpam(3850, 480),
      createDeadline(4100, 480),
    ],
    powerUps: [
      createPowerUp(180, 410, 'coffee'),
      createPowerUp(500, 230, 'wifi'),
      createPowerUp(1000, 270, 'coffee'),
      createPowerUp(1600, 230, 'wifi'),
      createPowerUp(2400, 300, 'coffee'),
      createPowerUp(3100, 270, 'wifi'),
      createPowerUp(3900, 300, 'coffee'),
      createPowerUp(300, 300, 'networking'),
      createPowerUp(1300, 300, 'networking'),
      createPowerUp(2800, 230, 'networking'),
    ],
  },
];

// Placeholder level for the map (future expansion)
export const futureLevels = [
  { id: 7, name: 'Demo Day', description: 'Em breve...' },
];
