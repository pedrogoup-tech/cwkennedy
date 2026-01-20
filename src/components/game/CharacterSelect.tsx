import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { characters } from '@/data/characters';
import { CharacterId } from '@/types/game';

interface CharacterSelectProps {
  selectedCharacter: CharacterId | null;
  onSelectCharacter: (id: CharacterId) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selectedCharacter,
  onSelectCharacter,
  onConfirm,
  onBack,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--gradient-night)' }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Back button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Title */}
      <div className="relative z-10 text-center mb-8 animate-slide-up">
        <h1 className="font-pixel text-2xl md:text-3xl text-white mb-2">
          ESCOLHA SEU
        </h1>
        <h2 className="game-title text-3xl md:text-4xl">
          PERSONAGEM
        </h2>
      </div>

      {/* Character grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto relative z-10 animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        {characters.map((character) => (
          <div
            key={character.id}
            onClick={() => onSelectCharacter(character.id)}
            className={`character-card ${selectedCharacter === character.id ? 'selected' : ''}`}
            style={{
              '--character-color': character.color,
            } as React.CSSProperties}
          >
            {/* Character avatar */}
            <div 
              className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center text-5xl relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${character.color}, ${character.color}88)`,
              }}
            >
              {character.emoji}
              
              {/* Selected indicator */}
              {selectedCharacter === character.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Character info */}
            <h3 className="font-game font-bold text-white text-center text-sm leading-tight mb-1">
              {character.name}
            </h3>
            <p className="text-xs text-white/60 text-center line-clamp-2 hidden md:block">
              {character.description}
            </p>
          </div>
        ))}
      </div>

      {/* Selected character details (mobile) */}
      {selectedCharacter && (
        <div className="md:hidden mt-6 text-center text-white/80 text-sm max-w-xs animate-fade-in">
          {characters.find(c => c.id === selectedCharacter)?.description}
        </div>
      )}

      {/* Confirm button */}
      <div className="mt-8 relative z-10">
        <button
          onClick={onConfirm}
          disabled={!selectedCharacter}
          className={`game-button flex items-center gap-3 min-w-[200px] justify-center transition-opacity ${
            !selectedCharacter ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Check className="w-5 h-5" />
          CONFIRMAR
        </button>
      </div>

      {/* Floor decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-purple-900/50 to-transparent" />
    </div>
  );
};

export default CharacterSelect;
