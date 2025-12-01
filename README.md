# THE WRETCHED - Digital Edition

Una implementación digital profesional del juego de rol en solitario "The Wretched" de Chris Bissette.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estado Global**: Zustand ^4.5.0 (con persistencia)
- **Estilos**: CSS puro (módulos + globals.css)
- **Audio**: Web Audio API (procedimental, sin archivos externos)
- **Responsive**: Diseño mobile-first con optimizaciones para pantallas pequeñas

## 📁 Estructura del Proyecto

```
the-wretched/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globales (estética terminal retro)
│   ├── layout.tsx         # Layout raíz
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── modals/           # Modales (Start, GameOver, Help, History)
│   ├── CardDisplay.tsx    # Visualización de cartas
│   ├── GameArea.tsx      # Área central del juego
│   ├── Header.tsx         # Barra superior
│   ├── Journal.tsx        # Diario del jugador
│   ├── Scanlines.tsx     # Efecto CRT
│   └── StatsPanel.tsx     # Panel de estadísticas
├── core/                  # Lógica del juego (independiente de UI)
│   ├── audio/            # Sistema de audio procedimental
│   │   └── audioEngine.ts
│   └── game/             # Motor del juego
│       ├── cards.ts      # Definición de cartas y eventos
│       ├── engine.ts     # Lógica principal del juego
│       └── types.ts      # Tipos TypeScript
└── stores/               # Estado global (Zustand)
    └── gameStore.ts      # Store con persistencia
```

## 🎮 Mecánicas del Juego

### Ciclo de Juego
1. **Inicio del Día**: Lanzar 1d6 para determinar cuántas cartas (eventos) resolver
2. **Fase de Operaciones**: Robar y resolver cartas del mazo
3. **Pruebas de Torre**: Algunos eventos requieren lanzar 1d6 vs. Tensión
4. **Registro**: Escribir en el diario
5. **Fin del Día**: Avanzar al siguiente día

### Condiciones de Victoria/Derrota
- **Victoria**: 
  - Activar la Baliza (As de Corazones) y reducir todos los contadores a 0
  - Al final de cada día, lanzar 1d6: con 6 (o 5/6 si la antena está reparada) ganas
- **Derrota**: 
  - La Torre cae (d6 <= Tensión en una prueba de torre)
  - Se roban 4 Reyes (La Criatura te encuentra)
  - Se agota el mazo

## 🎨 Estética

La interfaz mantiene una estética **"Cassette Futurism"** / **Terminal Retro**:
- Fuente monoespaciada (VT323)
- Colores de fósforo verde sobre fondo negro
- Efectos de scanlines CRT
- Alto contraste para legibilidad

## 🔊 Audio

El sistema de audio es **100% procedimental** usando Web Audio API:
- Drone atmosférico de fondo
- Efectos de sonido generados dinámicamente (click, dado, carta, alerta)
- Sin archivos de audio externos

## 💾 Persistencia

El estado del juego se guarda automáticamente en `localStorage`:
- Mazo actual
- Variables de estado (día, tensión, reyes, etc.)
- Diario del jugador
- Historial de eventos

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start
```

## 📦 Despliegue

El proyecto está configurado para desplegarse en **Vercel**:

1. Conecta tu repositorio a Vercel
2. El build se ejecutará automáticamente
3. ¡Listo!

### Repositorio

- **GitHub**: https://github.com/fcbarera0210/the-wretched-demo.git

## 📝 Notas de Arquitectura

### Separación de Responsabilidades
- **`core/game`**: Lógica pura del juego, independiente de React
- **`core/audio`**: Sistema de audio encapsulado
- **`stores`**: Estado global con Zustand
- **`components`**: UI pura, consume el store

### Extensibilidad
- Fácil añadir nuevas cartas/eventos en `core/game/cards.ts`
- Sistema de audio modular para nuevos SFX
- Componentes React reutilizables

## 📄 Licencia

Juego basado en "The Wretched" de Chris Bissette.
Esta implementación digital es para uso personal/educativo.

