// src/data/preset-textures/textureRegistry.ts
import { Cloud } from './Cloud'
import { Fence } from './Fence'
import { Goat } from './Goat'
import { GoryRottingZombie } from './GoryRottingZombie'
import { House } from './House'
import { TreasureChest } from './TreasureChest'
import { Tree } from './Tree'
import { Villager } from './Villager'
import { Warehouse } from './Warehouse'
import { Zombie } from './Zombie'
import { Zombie2 } from './Zombie2'

export const PatternTexture: TextureDescription = {
  name: 'pattern-texture',
  size: 64,
  layers: [
    {
      type: 'pattern',
      patternType: 'checkerboard',
      color1: '#FFFFFF',
      color2: '#000000',
      x: 0,
      y: 0,
      width: 64,
      height: 64,
    },
  ],
}

export const presetTextures: TextureDescription[] = [
  Cloud,
  Fence,
  House,
  TreasureChest,
  Tree,
  Villager,
  Warehouse,
  Zombie,
  // Zombie2,
  // Goat,
  PatternTexture,
  GoryRottingZombie,
]
