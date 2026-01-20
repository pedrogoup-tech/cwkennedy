import { Level, Platform, Enemy, PowerUp } from '@/types/game';

const createEnemy = (x: number, y: number, velocityX: number = -1): Enemy => ({
  id: `enemy-${x}-${y}`,
  x,
  y,
  width: 48,
  height: 40,
  velocityX,
  alive: true,
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
      createEnemy(500, 480),
      createEnemy(1100, 480),
      createEnemy(1800, 480),
      createEnemy(2400, 480),
      createEnemy(2800, 480),
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
      createEnemy(400, 480),
      createEnemy(800, 480),
      createEnemy(1200, 480),
      createEnemy(1600, 480),
      createEnemy(2200, 480),
      createEnemy(2800, 480),
      createEnemy(3100, 480),
      createEnemy(3500, 480),
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
      { x: 150, y: 440, width: 180, height: 80, type: 'platform' },
      { x: 500, y: 400, width: 150, height: 24, type: 'platform' },
      { x: 750, y: 350, width: 120, height: 24, type: 'platform' },
      { x: 1000, y: 440, width: 200, height: 80, type: 'platform' },
      { x: 1300, y: 380, width: 150, height: 24, type: 'platform' },
      { x: 1550, y: 320, width: 120, height: 24, type: 'platform' },
      { x: 1800, y: 400, width: 180, height: 24, type: 'platform' },
      { x: 2100, y: 440, width: 200, height: 80, type: 'platform' },
      { x: 2400, y: 360, width: 150, height: 24, type: 'platform' },
      { x: 2650, y: 300, width: 120, height: 24, type: 'platform' },
      { x: 2900, y: 380, width: 150, height: 24, type: 'platform' },
      { x: 3150, y: 320, width: 120, height: 24, type: 'platform' },
      
      // Meeting room platforms
      { x: 900, y: 280, width: 100, height: 24, type: 'platform' },
      { x: 1700, y: 240, width: 100, height: 24, type: 'platform' },
      { x: 2500, y: 220, width: 100, height: 24, type: 'platform' },
      
      // Moving chairs
      { x: 400, y: 480, width: 80, height: 40, type: 'moving', movingRange: { min: 350, max: 500 }, movingSpeed: 1 },
      { x: 1200, y: 480, width: 80, height: 40, type: 'moving', movingRange: { min: 1150, max: 1300 }, movingSpeed: 1.2 },
      { x: 2000, y: 480, width: 80, height: 40, type: 'moving', movingRange: { min: 1950, max: 2100 }, movingSpeed: 0.8 },
      { x: 2800, y: 480, width: 80, height: 40, type: 'moving', movingRange: { min: 2750, max: 2900 }, movingSpeed: 1 },
    ],
    enemies: [
      createEnemy(300, 480),
      createEnemy(650, 480),
      createEnemy(950, 480),
      createEnemy(1400, 480),
      createEnemy(1750, 480),
      createEnemy(2250, 480),
      createEnemy(2600, 480),
      createEnemy(3000, 480),
      createEnemy(3300, 480),
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
];

// Placeholder levels for the map (not playable yet)
export const futureLevels = [
  { id: 4, name: 'Sala de Reuniões', description: 'Em breve...' },
  { id: 5, name: 'Rooftop', description: 'Em breve...' },
  { id: 6, name: 'Happy Hour', description: 'Em breve...' },
  { id: 7, name: 'Demo Day', description: 'Em breve...' },
];
