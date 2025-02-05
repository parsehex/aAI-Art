export const GoryRottingZombie: TextureDescription = {
  name: 'gory-rotting-zombie',
  size: 64,
  layers: [
    // Head shape - Rotten greenish face
    { type: 'circle', color: '#3A5A22', x: 32, y: 32, radius: 24 },

    // Eye sockets - Sunken black holes
    { type: 'circle', color: 'black', x: 22, y: 26, radius: 5 },
    { type: 'circle', color: 'black', x: 42, y: 26, radius: 5 },

    // Bloodshot eyeball in one socket
    { type: 'circle', color: 'white', x: 42, y: 26, radius: 3 },
    { type: 'circle', color: 'red', x: 42, y: 26, radius: 1 },

    // Mouth - Jagged and open with blood
    { type: 'rect', color: 'black', x: 24, y: 42, width: 16, height: 6 },
    { type: 'line', color: 'red', x: 24, y: 48, x2: 40, y2: 48, lineWidth: 2 },

    // Exposed skull cracks and wounds
    { type: 'line', color: '#9E9E9E', x: 18, y: 14, x2: 28, y2: 18, lineWidth: 2 },
    { type: 'rect', color: 'red', x: 36, y: 10, width: 8, height: 6 },

    // Dripping blood from mouth
    { type: 'line', color: 'red', x: 28, y: 48, x2: 28, y2: 58, lineWidth: 2 },
    { type: 'line', color: 'red', x: 36, y: 48, x2: 36, y2: 56, lineWidth: 2 },

    // Torn flesh details
    { type: 'rect', color: 'red', x: 20, y: 36, width: 6, height: 4 },
    { type: 'rect', color: 'red', x: 40, y: 38, width: 5, height: 3 },

    // Rotting patches
    { type: 'rect', color: '#5B7C3A', x: 28, y: 18, width: 6, height: 4 },
    { type: 'rect', color: '#5B7C3A', x: 38, y: 24, width: 5, height: 3 },
  ],
}
