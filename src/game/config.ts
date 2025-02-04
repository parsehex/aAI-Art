import { AUTO, Scale, Game as PhaserGame, type Types } from 'phaser'
import MainScene from './scenes/MainScene'

export const gameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#333333',
  scale: {
    mode: Scale.FIT,
    width: 800,
    height: 600,
  },
  scene: MainScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: true,
    },
  },
} as Types.Core.GameConfig

export default class Game extends PhaserGame {
  constructor() {
    super(gameConfig)
  }
}
