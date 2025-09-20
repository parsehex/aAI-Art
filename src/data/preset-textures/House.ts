export const House: TextureDescription = {
  id: 'house-1',
  name: 'house',
  size: 64,
  layers: [
    // Roof
    { type: 'rect', color: '#8B4513', x: 8, y: 8, width: 48, height: 20 },
    { type: 'rect', color: '#A52A2A', x: 4, y: 16, width: 56, height: 12 },
    // Main building
    { type: 'rect', color: '#DEB887', x: 12, y: 28, width: 40, height: 32 },
    // Door
    { type: 'rect', color: '#8B4513', x: 24, y: 40, width: 16, height: 20 },
    // Window
    { type: 'rect', color: '#87CEEB', x: 16, y: 32, width: 8, height: 8 },
    { type: 'rect', color: '#87CEEB', x: 40, y: 32, width: 8, height: 8 },
  ],
}
