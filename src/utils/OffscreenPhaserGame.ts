import Phaser from 'phaser'

class OffscreenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OffscreenScene' })
  }

  preload() {
    // Preload any assets needed for offscreen rendering if necessary
  }

  create() {
    // Scene is created, ready for use
  }
}

let offscreenGame: Phaser.Game | null = null
let offscreenScene: OffscreenScene | null = null

export function initGame() {
  if (!offscreenGame) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS, // Use HEADLESS type for offscreen rendering
      width: 256,
      height: 256,
      scene: OffscreenScene,
      parent: null, // No parent element, as it's headless
      banner: false,
      audio: {
        noAudio: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
        },
      },
      callbacks: {
        postBoot: (game) => {
          game.loop.stop() // Stop the game loop, we only need it for rendering on demand
        },
      },
    }
    offscreenGame = new Phaser.Game(config)
  }
}

export function getOffscreenScene(): OffscreenScene {
  if (!offscreenGame) throw new Error('Called before game init')
  if (!offscreenScene) {
    offscreenScene = offscreenGame.scene.scenes[0] as OffscreenScene
  }
  return offscreenScene
}

export function destroyOffscreenGame() {
  if (offscreenGame) {
    offscreenGame.destroy(true)
    offscreenGame = null
    offscreenScene = null
  }
}
