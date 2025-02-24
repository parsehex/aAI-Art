import { AUTO, Scale, Game as PhaserGame, type Types } from 'phaser'
import MainScene from './scenes/MainScene'

export const gameConfig = {
  type: AUTO,
  parent: 'game-container',
  pixelArt: true,
  transparent: true,
  scale: {
    mode: Scale.RESIZE,
    width: '100%',
    height: 600,
  },
  scene: MainScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
    },
  },
} as Types.Core.GameConfig

export default class Game extends PhaserGame {
  constructor() {
    super(gameConfig)
  }
}
