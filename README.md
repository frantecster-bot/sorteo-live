# 🎯 Sorteo Live

Mini web app para sorteos en vivo con animación de casino, estadísticas y overlay para OBS.

## Características

| Feature | Descripción |
|---|---|
| 🎲 **Sorteo inteligente** | Animación casino-style: los números se iluminan hasta frenar en el ganador |
| 🔥 **Números calientes/fríos** | Stats de cuántas veces ganó cada número — más participación |
| 🏆 **Sistema de puntos** | Jugadores acumulan puntos por participar y ganar. Umbral VIP configurable |
| 🏅 **Ranking** | Tabla de posiciones por puntos y victorias |
| 🎮 **Torneos (rondas)** | Configurable: N rondas con premio acumulado al final |
| 📺 **Overlay para OBS** | `overlay.html` como Browser Source muestra grilla + alerta ganador en tiempo real |

## Uso rápido

1. Abrir `index.html` en el navegador (o servir con cualquier servidor estático)
2. Cada jugador ingresa su nombre y elige un número
3. Presionar **INICIAR SORTEO** — la animación selecciona el ganador
4. Revisar **Estadísticas** y **Ranking** en las pestañas

## OBS / Stream

Agregar un **Browser Source** en OBS apuntando a `overlay.html` (ruta absoluta o URL local):

```
file:///ruta/a/sorteo-live/overlay.html
```

El overlay se actualiza automáticamente cada 500 ms via `localStorage`.

## Configuración (`config.js`)

```js
const CONFIG = {
  totalNumbers: 20,    // cantidad de números
  minPlayers: 2,       // mínimo de jugadores para iniciar
  drawSpeed: 120,      // ms entre frames de animación
  animDuration: 4000,  // duración total de la animación (ms)
  totalRounds: 5,      // rondas por torneo
  pointsPerWin: 100,   // puntos al ganar
  pointsPerPick: 10,   // puntos por elegir número
  vipThreshold: 300,   // puntos para badge VIP
  hotThreshold: 3      // victorias para "número caliente"
};
```
