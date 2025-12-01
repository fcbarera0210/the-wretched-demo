'use client';

import { useGameStore } from '@/stores/gameStore';
import { useState, useEffect } from 'react';

interface DiceOverlayProps {
  visible: boolean;
  value: number | null;
  label: string;
}

function DiceOverlay({ visible, value, label }: DiceOverlayProps) {
  if (!visible) return null;

  return (
    <div className="dice-overlay visible">
      <span className="dice-number">{value ?? '-'}</span>
      <span className="dice-label">{label}</span>
    </div>
  );
}

export default function CardDisplay() {
  const { currentCard, lastDiceRoll, diceType, isRollingDice } = useGameStore();
  const [diceVisible, setDiceVisible] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [diceLabel, setDiceLabel] = useState('DADO');

  useEffect(() => {
    // Si se está lanzando un dado, mostrar animación
    if (isRollingDice && diceType) {
      setDiceVisible(true);
      
      // Establecer etiqueta según el tipo de dado
      switch (diceType) {
        case 'day':
          setDiceLabel('DADO DE DÍA');
          break;
        case 'tower':
          setDiceLabel('PRUEBA DE TORRE');
          break;
        case 'beacon':
          setDiceLabel('SEÑAL DE BALIZA');
          break;
        default:
          setDiceLabel('DADO');
      }

      // Animación de números aleatorios
      let counter = 0;
      const interval = setInterval(() => {
        // Si ya tenemos el valor real del dado, usarlo en lugar de aleatorio
        if (lastDiceRoll !== null && counter > 5) {
          setDiceValue(lastDiceRoll);
        } else {
          setDiceValue(Math.ceil(Math.random() * 6));
        }
        counter++;
        if (counter > 10) {
          clearInterval(interval);
          // Asegurar que se muestre el valor real al final
          if (lastDiceRoll !== null) {
            setDiceValue(lastDiceRoll);
          }
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isRollingDice, diceType, lastDiceRoll]);

  useEffect(() => {
    // Cuando tenemos el resultado del dado, mostrarlo INMEDIATAMENTE
    // Esto asegura que el valor mostrado sea el mismo que se usa en la lógica
    if (lastDiceRoll !== null && diceVisible) {
      setDiceValue(lastDiceRoll);
    }
  }, [lastDiceRoll, diceVisible]);

  useEffect(() => {
    // Cuando se completa la animación y tenemos el resultado
    if (!isRollingDice && lastDiceRoll !== null && diceVisible) {
      // Mantener visible por más tiempo si es una prueba de torre
      const delay = diceType === 'tower' ? 2000 : 800;
      const timer = setTimeout(() => {
        setDiceVisible(false);
        setDiceValue(null);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isRollingDice, lastDiceRoll, diceVisible, diceType]);

  const cardTop = currentCard ? `${currentCard.value}${currentCard.data.symbol}` : '';
  const cardCenter = currentCard ? currentCard.data.symbol : '?';
  const cardName = currentCard ? currentCard.data.type : 'SISTEMAS EN ESPERA';
  const cardColor = currentCard ? currentCard.data.color : 'var(--main-color)';

  return (
    <div className="card-slot">
      <div className="card-top" style={{ color: cardColor }}>
        {cardTop}
      </div>
      <div className="card-center" style={{ color: cardColor }}>
        {cardCenter}
      </div>
      <div className="card-suit-name">{cardName}</div>
      <DiceOverlay visible={diceVisible} value={diceValue} label={diceLabel} />
    </div>
  );
}

