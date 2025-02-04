// A tree
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

// A simple cloud
export const Cloud: TextureDescription = {
  name: 'cloud',
  size: 64,
  layers: [
    { type: 'circle', color: '#FFFFFF', radius: 12, x: 24, y: 32 },
    { type: 'circle', color: '#FFFFFF', radius: 16, x: 32, y: 28 },
    { type: 'circle', color: '#FFFFFF', radius: 14, x: 44, y: 32 },
    { type: 'circle', color: '#FFFFFF', radius: 10, x: 36, y: 36 },
  ],
}

// A simple treasure chest
export const TreasureChest: TextureDescription = {
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
