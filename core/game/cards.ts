/**
 * Definición de cartas y eventos del juego
 */

import { CardData, CardCode, Card, Suit, CardValue } from './types';

export const CARD_DATA: Record<Suit, CardData> = {
  'H': { type: 'SISTEMAS', color: '#ff3333', symbol: '♥' },
  'D': { type: 'ESTRUCTURA', color: '#33ffff', symbol: '♦' },
  'C': { type: 'TRIPULACIÓN', color: '#33ff33', symbol: '♣' },
  'S': { type: 'CRIATURA', color: '#ffff33', symbol: '♠' }
};

export const EVENTS: Record<CardCode, string> = {
  // HEARTS
  'AH': "HAS LOGRADO ACTIVAR LA BALIZA DE SOCORRO. El sistema se reinicia. (Coloca 10 contadores. El contador baja después de cada carta. Al final del día tira 1d6, con un 6 ganas el juego).",
  '2H': "El sistema de agua funciona, pero sabe a químicos industriales.",
  '3H': "Los extintores se dispararon solos. ¿Qué provocó el error? PRUEBA DE TORRE.",
  '4H': "Transmisión fantasma en la radio. ¿Era una voz humana?",
  '5H': "Fallo en el soporte vital. Te faltó el aire por minutos. PRUEBA DE TORRE.",
  '6H': "El radar muestra un objeto grande acercándose. Luego desaparece.",
  '7H': "Tuviste que arrastrarte por los conductos de ventilación. PRUEBA DE TORRE.",
  '8H': "Miras los monitores por horas. Solo hay estática.",
  '9H': "Alarmas de movimiento. Tuviste que salir a resetearlas manualmente. PRUEBA DE TORRE.",
  '10H': "El generador hace un ruido rítmico, casi como un latido.",
  'JH': "Pasas el día recalibrando motores sin éxito. PRUEBA DE TORRE.",
  'QH': "Una puerta se cerró y te atrapó por horas. PRUEBA DE TORRE.",
  'KH': "¡INTRUSIÓN! La Criatura está en los conductos. (REYES: +1)",

  // DIAMONDS
  'AD': "ANTENA REPARADA. La señal de la baliza es más fuerte. (El contador baja de 2 en 2 y puedes ganar con 5 o 6).",
  '2D': "Micro-meteoritos golpearon el casco. Fugas menores selladas. PRUEBA DE TORRE.",
  '3D': "Reforzaste las ventanas del puente. Tienes miedo de que algo entre. PRUEBA DE TORRE.",
  '4D': "La nave cruje bajo tensión. Pasas el día soldando grietas. PRUEBA DE TORRE.",
  '5D': "La Criatura dañó un módulo. Tuviste que sellarlo para siempre. PRUEBA DE TORRE.",
  '6D': "Incendio en la bahía de carga. Tuviste que ventilar el oxígeno. PRUEBA DE TORRE.",
  '7D': "La cápsula de escape está destruida. No hay salida fácil. PRUEBA DE TORRE.",
  '8D': "Fallo de gravedad artificial. Todo flota, incluidos los escombros. PRUEBA DE TORRE.",
  '9D': "El sistema de residuos se desbordó. El olor es insoportable. PRUEBA DE TORRE.",
  '10D': "La comida tiene moho. Tuviste que tirar la mitad. PRUEBA DE TORRE.",
  'JD': "Apagón total. Reinicio manual del núcleo requerido. PRUEBA DE TORRE.",
  'QD': "Intentaste arreglar el motor y lo empeoraste. PRUEBA DE TORRE.",
  'KD': "¡INTRUSIÓN! La Criatura rasguña la puerta de tu refugio. (REYES: +1)",

  // CLUBS
  'AC': "Encuentras una herramienta útil o un arma improvisada. (Puedes ignorar la próxima Prueba de Torre).",
  '2C': "Lees el diario de un compañero muerto. ¿Qué extrañaba?",
  '3C': "Usas la tarjeta de acceso de un oficial muerto. ¿Por qué?",
  '4C': "Recuerdas a alguien que amabas en la tripulación.",
  '5C': "¿Dónde te escondiste cuando empezó la masacre?",
  '6C': "¿Quién murió para que tú vivieras?",
  '7C': "Encuentras un arma, pero solo tiene una carga. ¿La usarás?",
  '8C': "Haces un inventario de los lugares seguros de la nave.",
  '9C': "Un tripulante predijo esto. Nadie le creyó.",
  '10C': "Encuentras un objeto personal de un niño que viajaba a bordo.",
  'JC': "Debes mover los cuerpos de la esclusa. Pesan demasiado. PRUEBA DE TORRE.",
  'QC': "Limpias sangre seca para hacer espacio para dormir. PRUEBA DE TORRE.",
  'KC': "¡INTRUSIÓN! Ves a la Criatura alimentándose de los cadáveres. (REYES: +1)",

  // SPADES
  'AS': "Logras distraer a la Criatura momentáneamente. (Si ya salió el Rey de Picas, barájalo de nuevo al mazo).",
  '2S': "El miedo te paraliza. No haces nada productivo hoy. PRUEBA DE TORRE.",
  '3S': "La ves reptando por el exterior de la nave a través del cristal. PRUEBA DE TORRE.",
  '4S': "Susurra tu nombre por el intercomunicador. PRUEBA DE TORRE.",
  '5S': "Huellas de sangre y aceite frente a tu puerta. PRUEBA DE TORRE.",
  '6S': "No la ves, pero hueles su presencia. Ozono y carne podrida. PRUEBA DE TORRE.",
  '7S': "Las luces parpadean en código cuando se acerca. PRUEBA DE TORRE.",
  '8S': "Sientes su mente rozando la tuya. Dolor de cabeza intenso. PRUEBA DE TORRE.",
  '9S': "Te descubres dibujando su forma en las paredes. PRUEBA DE TORRE.",
  '10S': "Encuentras piel mudada de la cosa. Es translúcida y dura. PRUEBA DE TORRE.",
  'JS': "¿Quiere matarte o está jugando contigo? PRUEBA DE TORRE.",
  'QS': "¿Cómo crees que se llama a sí misma? PRUEBA DE TORRE.",
  'KS': "¡INTRUSIÓN! Pesadillas hechas realidad. Está aquí. (REYES: +1)"
};

/**
 * Crea un mazo completo y barajado
 */
export function createDeck(): CardCode[] {
  const suits: Suit[] = ['H', 'D', 'C', 'S'];
  const values: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: CardCode[] = [];
  
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push(`${value}${suit}` as CardCode);
    });
  });
  
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

/**
 * Parsea un código de carta y retorna su información completa
 */
export function parseCard(code: CardCode): Card {
  const value = code.slice(0, -1) as CardValue;
  const suit = code.slice(-1) as Suit;
  const data = CARD_DATA[suit];
  const event = EVENTS[code] || "Evento desconocido.";
  
  return {
    code,
    value,
    suit,
    data,
    event
  };
}

/**
 * Verifica si un evento requiere prueba de torre
 */
export function requiresTowerCheck(event: string): boolean {
  return event.toUpperCase().includes("PRUEBA DE TORRE");
}

/**
 * Lanza un dado de 6 caras
 */
export function rollD6(): number {
  return Math.ceil(Math.random() * 6);
}

