// src/data/preset-textures/textureRegistry.ts
import type { TextureDescription } from '@/types/Textures'
import Cloud from './cloud-1.json'
import BrownBear from './brown-bear-1.json'
import Fence from './fence-1.json'
import GoryRottingZombie from './gory-rotting-zombie.json'
import House from './house-1.json'
import TreasureChest from './treasure-chest-1.json'
import Tree from './tree-1.json'
import Villager from './villager-1.json'
import Warehouse from './abandoned-warehouse.json'
import Zombie from './zombie-1.json'
import RobotHead from './robot-head.json'
import WizardHat from './wizard-hat-2.json'

export const PatternTexture: TextureDescription = {
  id: 'pattern-1',
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

export const presetTextures = [
  Cloud,
  BrownBear,
  Fence,
  House,
  TreasureChest,
  Tree,
  Villager,
  Warehouse,
  Zombie,
  PatternTexture,
  GoryRottingZombie,
  RobotHead,
  WizardHat,
] as TextureDescription[]
