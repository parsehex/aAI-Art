import { parseColor } from './color'
import { getOffscreenScene, initGame } from '@/utils/OffscreenPhaserGame'

export class GameObject extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture)
    scene.add.existing(this)
    scene.physics.add.existing(this)
  }

  setInteractive(): this {
    super.setInteractive()
    return this
  }

  enablePhysics(isStatic: boolean = false): this {
    const body = this.body as Phaser.Physics.Arcade.Body
    if (body) {
      body.setCollideWorldBounds(true)
      if (isStatic) {
        body.setImmovable(true)
      }
    }
    return this
  }
}

export class TextureGenerator {
  private scene: Phaser.Scene
  public offscreenScene?: Phaser.Scene
  private textureCache: Map<string, string> = new Map()

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    initGame()
    setTimeout(() => {
      this.offscreenScene = getOffscreenScene()
    }, 100)
  }

  createGameObject(
    desc: TextureDescription,
    x: number,
    y: number,
    options: {
      isStatic?: boolean
      isInteractive?: boolean
      scale?: number
      name?: string
      background?: boolean // New option for background rendering
    } = {},
  ): GameObject {
    const targetScene = options.background && this.offscreenScene ? this.offscreenScene : this.scene
    const textureKey = this.getTextureKey(desc, targetScene)

    // Create the game object
    const gameObject = new GameObject(targetScene, x, y, textureKey)

    // Apply options
    if (options.scale) {
      gameObject.setScale(options.scale)
    }

    if (options.isInteractive) {
      gameObject.setInteractive()
    }

    if (options.name) {
      gameObject.setName(options.name)
    }

    gameObject.enablePhysics(options.isStatic)

    return gameObject
  }

  private getTextureKey(desc: TextureDescription, targetScene: Phaser.Scene): string {
    // Generate a unique key based on the texture description
    const descString = JSON.stringify(desc)
    const hash = this.hashString(descString)

    const cacheKey = `${targetScene.sys.settings.key}-${hash}`

    if (!this.textureCache.has(cacheKey)) {
      const graphics = targetScene.add.graphics()
      const size = desc.size

      desc.layers.forEach((layer) => {
        this.drawLayer(graphics, layer, size)
      })

      const textureKey = `texture-${hash}`
      graphics.generateTexture(textureKey, size, size)
      graphics.destroy()

      this.textureCache.set(cacheKey, textureKey)
    }

    return this.textureCache.get(cacheKey)!
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  createSprite(
    desc: TextureDescription,
    x: number,
    y: number,
    targetScene: Phaser.Scene,
  ): Phaser.GameObjects.Sprite {
    const graphics = targetScene.add.graphics()
    const size = desc.size

    desc.layers.forEach((layer) => {
      this.drawLayer(graphics, layer, size)
    })

    const textureKey = `texture-${Date.now()}-${desc.name}`
    graphics.generateTexture(textureKey, size, size)
    graphics.destroy()
    console.log('x, y', x, y)
    return targetScene.add.sprite(x, y, textureKey)
  }

  private drawLayer(
    graphics: Phaser.GameObjects.Graphics,
    layer: TextureLayer,
    size: number,
  ): void {
    switch (layer.type) {
      case 'circle':
        this.drawCircle(graphics, layer, size)
        break
      case 'rect':
        this.drawRect(graphics, layer, size)
        break
      case 'line':
        this.drawLine(graphics, layer, size)
        break
      case 'pattern':
        this.drawPattern(graphics, layer, size)
        break
    }
  }

  private drawCircle(
    graphics: Phaser.GameObjects.Graphics,
    layer: TextureLayer,
    size: number,
  ): void {
    const color = parseColor(layer.color as string)
    graphics.fillStyle(color, 1)
    const x = layer.x !== undefined ? layer.x : size / 2
    const y = layer.y !== undefined ? layer.y : size / 2
    const radius = layer.radius !== undefined ? layer.radius : Math.floor(size / 2)
    graphics.fillCircle(x, y, radius)
  }

  private drawRect(graphics: Phaser.GameObjects.Graphics, layer: TextureLayer, size: number): void {
    const color = parseColor(layer.color as string)
    graphics.fillStyle(color, 1)
    const x = layer.x !== undefined ? layer.x : (size - (layer.width || 0)) / 2
    const y = layer.y !== undefined ? layer.y : (size - (layer.height || 0)) / 2
    graphics.fillRect(x, y, layer.width || 0, layer.height || 0)
  }

  private drawLine(graphics: Phaser.GameObjects.Graphics, layer: TextureLayer, size: number): void {
    const color = parseColor(layer.color as string)
    const lineWidth = layer.lineWidth || 1

    graphics.lineStyle(lineWidth, color, 1)

    const x1 = layer.x !== undefined ? layer.x : 0
    const y1 = layer.y !== undefined ? layer.y : 0
    const x2 = layer.x2 !== undefined ? layer.x2 : size
    const y2 = layer.y2 !== undefined ? layer.y2 : size

    graphics.beginPath()
    graphics.moveTo(x1, y1)
    graphics.lineTo(x2, y2)
    graphics.strokePath()
  }

  private drawPattern(
    graphics: Phaser.GameObjects.Graphics,
    layer: TextureLayer,
    size: number,
  ): void {
    const { patternType, color1, x = 0, y = 0, width = size, height = size } = layer
    const patternSize = 8 // Pattern tile size

    if (color1) graphics.fillStyle(Phaser.Display.Color.ValueToColor(color1).color, 1)

    switch (patternType) {
      case 'checkerboard':
        for (let i = 0; i < width; i += patternSize) {
          for (let j = 0; j < height; j += patternSize) {
            if ((Math.floor(i / patternSize) + Math.floor(j / patternSize)) % 2 === 0) {
              graphics.fillRect(x + i, y + j, patternSize, patternSize)
            }
          }
        }
        break
      case 'stripes':
        for (let i = 0; i < width; i += patternSize) {
          graphics.fillRect(x + i, y, patternSize, height)
        }
        break
      case 'dots':
        const dotRadius = 3
        for (let i = 0; i < width; i += patternSize) {
          for (let j = 0; j < height; j += patternSize) {
            graphics.fillCircle(x + i + patternSize / 2, y + j + patternSize / 2, dotRadius)
          }
        }
        break
    }
  }
}
