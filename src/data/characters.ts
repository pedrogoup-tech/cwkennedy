import { Character } from '@/types/game';

import entrepreneurSprite from '@/assets/sprites/entrepreneur.png';
import designerSprite from '@/assets/sprites/designer.png';
import programmerSprite from '@/assets/sprites/programmer.png';
import socialmediaSprite from '@/assets/sprites/socialmedia.png';
import gestorSprite from '@/assets/sprites/gestor.png';

export const characters: Character[] = [
  {
    id: 'entrepreneur',
    name: 'Empreendedor Visionário',
    description: 'Líder nato com visão ampla. Pode dar pulo duplo no ar!',
    color: 'hsl(210, 80%, 50%)',
    emoji: '💼',
    sprite: entrepreneurSprite,
    passive: {
      name: 'Visão Estratégica',
      description: 'Pode pular duas vezes no ar (pulo duplo)',
      icon: '🦅',
    },
  },
  {
    id: 'designer',
    name: 'Designer Criativo',
    description: 'Flutua graciosamente. Queda mais lenta e controlada.',
    color: 'hsl(320, 70%, 55%)',
    emoji: '🎨',
    sprite: designerSprite,
    passive: {
      name: 'Leveza Criativa',
      description: 'Cai mais devagar, permitindo maior controle no ar',
      icon: '🪶',
    },
  },
  {
    id: 'programmer',
    name: 'Programador Noturno',
    description: 'Já vem equipado com Wi-Fi. Atira desde o início!',
    color: 'hsl(260, 60%, 45%)',
    emoji: '💻',
    sprite: programmerSprite,
    passive: {
      name: 'Código Nativo',
      description: 'Começa o jogo já com o poder do Wi-Fi ativo',
      icon: '⚡',
    },
  },
  {
    id: 'socialmedia',
    name: 'Social Media Conectada',
    description: 'Networking magnético! Coleta itens de mais longe.',
    color: 'hsl(340, 80%, 55%)',
    emoji: '📱',
    sprite: socialmediaSprite,
    passive: {
      name: 'Influência Digital',
      description: 'Coleta power-ups e networking com alcance 2x maior',
      icon: '🧲',
    },
  },
  {
    id: 'gestor',
    name: 'Gestor de Negócios',
    description: 'Eficiência máxima! Velocidade base aumentada.',
    color: 'hsl(45, 70%, 50%)',
    emoji: '📊',
    sprite: gestorSprite,
    passive: {
      name: 'Eficiência Operacional',
      description: 'Velocidade de movimento 25% maior',
      icon: '⚡',
    },
  },
];
