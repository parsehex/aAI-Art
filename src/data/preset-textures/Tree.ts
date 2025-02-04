export const Tree: TextureDescription = {
  name: 'tree',
  size: 64,
  layers: [
    // Trunk
    { type: 'rect', color: '#8B4513', x: 28, y: 40, width: 8, height: 20 },
    // Leaves
    { type: 'circle', color: '#228B22', radius: 16, x: 32, y: 24 },
    { type: 'circle', color: '#006400', radius: 12, x: 24, y: 32 },
    { type: 'circle', color: '#228B22', radius: 14, x: 40, y: 28 },
    { type: 'circle', color: '#006400', radius: 15, x: 32, y: 20 },
  ],
}
