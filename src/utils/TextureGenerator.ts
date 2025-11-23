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

  public getTextureKey(desc: TextureDescription, targetScene: Phaser.Scene): string {
    if (!desc || !desc.size || !desc.layers) {
      console.error('Invalid texture description:', desc)
      return 'fallback-texture'
    }

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

  async generateThumbnail(desc: TextureDescription): Promise<string> {
    if (!this.offscreenScene) {
      await new Promise<void>((resolve) => {
        const check = () => {
          if (this.offscreenScene) resolve()
          else setTimeout(check, 50)
        }
        check()
      })
    }

    const scene = this.offscreenScene!
    const size = desc.size
    const graphics = scene.add.graphics()

    desc.layers.forEach((layer) => {
      this.drawLayer(graphics, layer, size)
    })

    const textureKey = `thumb-${Date.now()}-${Math.random()}`
    graphics.generateTexture(textureKey, size, size)
    graphics.destroy()

    const texture = scene.textures.get(textureKey)
    const canvas = texture.getSourceImage() as HTMLCanvasElement
    const dataUrl = canvas.toDataURL()

    scene.textures.remove(textureKey)

    return dataUrl
  }

  private hashString(str: string): string {
    if (!str || typeof str !== 'string') {
      return '0'
    }
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

  public drawLayer(graphics: Phaser.GameObjects.Graphics, layer: TextureLayer, size: number): void {
    // Skip invisible layers
    if (layer.visible === false) {
      console.log('Skipping invisible layer')
      return
    }

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
      case 'ellipse':
        this.drawEllipse(graphics, layer, size)
        break
      case 'polygon':
        this.drawPolygon(graphics, layer, size)
        break
      case 'path':
        this.drawPath(graphics, layer, size)
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

  private drawEllipse(
    graphics: Phaser.GameObjects.Graphics,
    layer: TextureLayer,
    size: number,
  ): void {
    const color = parseColor(layer.color as string)
    graphics.fillStyle(color, 1)
    const x = Math.max(0, Math.min(layer.x || size / 2, size))
    const y = Math.max(0, Math.min(layer.y || size / 2, size))
    const width = Math.max(1, Math.min(layer.width || size, size))
    const height = Math.max(1, Math.min(layer.height || size, size))
    graphics.fillEllipse(x, y, width, height)
  }

  private drawPolygon(
    graphics: Phaser.GameObjects.Graphics,
    layer: TextureLayer,
    size: number,
  ): void {
    const color = parseColor(layer.color as string)
    const points = layer.points || []
    if (points.length < 3) return // Need at least 3 points for polygon

    graphics.fillStyle(color, 1)
    graphics.beginPath()
    const [firstX, firstY] = points[0] || [0, 0]
    const clampedFirstX = Math.max(0, Math.min(firstX, size))
    const clampedFirstY = Math.max(0, Math.min(firstY, size))
    graphics.moveTo(clampedFirstX, clampedFirstY)
    for (let i = 1; i < points.length; i++) {
      const [px, py] = points[i]
      const clampedX = Math.max(0, Math.min(px, size))
      const clampedY = Math.max(0, Math.min(py, size))
      graphics.lineTo(clampedX, clampedY)
    }
    graphics.closePath()
    graphics.fillPath()

    // Optional outline
    if (layer.lineWidth && layer.lineWidth > 0) {
      const lineColor = parseColor(layer.color as string) // Reuse color or add strokeColor
      graphics.lineStyle(layer.lineWidth, lineColor, 1)
      graphics.strokePath()
    }
  }

  private drawPath(graphics: Phaser.GameObjects.Graphics, layer: TextureLayer, size: number): void {
    const pathData = layer.path || ''
    const color = parseColor(layer.color as string)
    const shouldFill = layer.fill !== undefined ? layer.fill : true
    const lineWidth = layer.lineWidth || 1

    if (!pathData) return

    // Simple SVG path parser supporting M, L, Z (basic lines and closes)
    graphics.beginPath()
    let currentX = 0,
      currentY = 0
    let i = 0
    while (i < pathData.length) {
      const char = pathData[i]
      i++
      if (char === 'M') {
        const mx = this.parseNumber(pathData, i)
        i += mx.length
        const my = this.parseNumber(pathData, i)
        i += my.length
        currentX = Math.max(0, Math.min(parseFloat(mx), size))
        currentY = Math.max(0, Math.min(parseFloat(my), size))
        graphics.moveTo(currentX, currentY)
      } else if (char === 'L') {
        const lx = this.parseNumber(pathData, i)
        i += lx.length
        const ly = this.parseNumber(pathData, i)
        i += ly.length
        currentX = Math.max(0, Math.min(parseFloat(lx), size))
        currentY = Math.max(0, Math.min(parseFloat(ly), size))
        graphics.lineTo(currentX, currentY)
      } else if (char === 'Z') {
        graphics.closePath()
      } else if (char === ' ') {
        // Skip whitespace
      } else {
        // Skip unknown commands (e.g., Q for curves - can add arc support later)
        i--
      }
    }

    if (shouldFill) {
      graphics.fillStyle(color, 1)
      graphics.fillPath()
    }
    if (lineWidth > 0) {
      graphics.lineStyle(lineWidth, color, 1)
      graphics.strokePath()
    }
  }

  private parseNumber(str: string, start: number): string {
    let i = start
    while (i < str.length && (/\d|\.|-/.test(str[i]) || str[i] === ' ')) {
      i++
    }
    return str.substring(start, i).trim()
  }
}
