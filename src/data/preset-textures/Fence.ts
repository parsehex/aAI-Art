export const Fence: TextureDescription = {
  name: 'fence',
  size: 64,
  layers: [
    // Vertical posts
    { type: 'line', color: '#8B4513', x: 16, y: 16, x2: 16, y2: 48, lineWidth: 4 },
    { type: 'line', color: '#8B4513', x: 48, y: 16, x2: 48, y2: 48, lineWidth: 4 },
    // Horizontal boards
    { type: 'line', color: '#8B4513', x: 8, y: 24, x2: 56, y2: 24, lineWidth: 3 },
    { type: 'line', color: '#8B4513', x: 8, y: 40, x2: 56, y2: 40, lineWidth: 3 },
  ],
}
