export const Zombie2: TextureDescription = {
  name: 'rotting-zombie',
  size: 64,
  layers: [
    // Background shape (base body)
    { type: 'rect', color: '#321E0D', x: 0, y: 0, width: 64, height: 64 },

    // Upper arm missing
    { type: 'rect', color: '#FFFFFF', x: 18, y: 9, width: 18, height: 25 },

    // Lower arm missing
    { type: 'rect', color: '#FFFFFF', x: 34, y: 27, width: 20, height: 25 },

    // Head with decayed skin
    { type: 'circle', color: '#8B4513', x: 32, y: 6, radius: 18 },

    // Eye holes (missing eyes)
    { type: 'rect', color: '#FFFFFF', x: 27, y: 9, width: 4, height: 4 },
    { type: 'rect', color: '#FFFFFF', x: 35, y: 10, width: 4, height: 4 },

    // Mouth with decayed lips
    { type: 'line', color: '#8B4513', x: 26, y: 27, x2: 38, y2: 34, lineWidth: 2 },

    // Decay marks on the skin (optional for more detail)
    { type: 'rect', color: '#8B0000', x: 15, y: 25, width: 12, height: 6 }
  ]
}
