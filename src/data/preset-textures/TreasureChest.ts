export const TreasureChest: TextureDescription = {
  id: 'treasure-chest-1',
  name: 'treasure-chest',
  size: 64,
  layers: [
    // Main chest body
    { type: 'rect', color: '#8B4513', x: 16, y: 24, width: 32, height: 24 },
    // Lid
    { type: 'rect', color: '#A0522D', x: 14, y: 16, width: 36, height: 8 },
    // Lock
    { type: 'rect', color: '#FFD700', x: 28, y: 20, width: 8, height: 6 },
    // Decorative bands
    { type: 'rect', color: '#DAA520', x: 16, y: 32, width: 32, height: 4 },
    { type: 'rect', color: '#DAA520', x: 16, y: 40, width: 32, height: 4 },
  ],
}
