import Konva from 'konva'
import { parseColor } from './color'
import type { TextureDescription, TextureLayer } from '@/types/Textures'

export class TextureGenerator {
  private textureCache: Map<string, string> = new Map()

  constructor() {
    // No scene needed for Konva!
  }

  /**
   * Generate a data URL (base64 image) from a texture description
   * This is the main method for rendering sprites
   */
  async generateImage(desc: TextureDescription): Promise<string> {
    const cacheKey = this.getTextureKey(desc)

    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!
    }

    const dataUrl = await this.renderToDataUrl(desc)
    this.textureCache.set(cacheKey, dataUrl)
    return dataUrl
  }

  /**
   * Generate a thumbnail (same as generateImage, but kept for API compatibility)
   */
  async generateThumbnail(desc: TextureDescription): Promise<string> {
    return this.generateImage(desc)
  }

  /**
   * Render a texture description to a data URL
   * This creates an offscreen Konva stage and exports it
   */
  private async renderToDataUrl(desc: TextureDescription): Promise<string> {
    const size = desc.size

    // Create an offscreen stage (not attached to DOM)
    const stage = new Konva.Stage({
      container: document.createElement('div'),
      width: size,
      height: size,
    })

    const layer = new Konva.Layer()
    stage.add(layer)

    // Draw all layers
    desc.layers.forEach((layerDesc) => {
      if (layerDesc.visible !== false) {
        this.drawLayer(layer, layerDesc, size)
      }
    })

    layer.draw()

    // Export to data URL
    const dataUrl = stage.toDataURL()

    // Clean up
    stage.destroy()

    return dataUrl
  }

  /**
   * Get a unique cache key for a texture description
   */
  public getTextureKey(desc: TextureDescription): string {
    if (!desc || !desc.size || !desc.layers) {
      console.error('Invalid texture description:', desc)
      return 'fallback-texture'
    }

    // Only hash properties that affect rendering
    const renderProps = {
      size: desc.size,
      layers: desc.layers,
    }

    const descString = JSON.stringify(renderProps)
    const hash = this.hashString(descString)
    return `texture-${hash}`
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

  /**
   * Draw a single layer to the Konva layer
   */
  public drawLayer(layer: Konva.Container, layerDesc: TextureLayer, size: number): void {
    // Skip invisible layers
    if (layerDesc.visible === false) return

    switch (layerDesc.type) {
      case 'circle':
        this.drawCircle(layer, layerDesc, size)
        break
      case 'rect':
        this.drawRect(layer, layerDesc, size)
        break
      case 'line':
        this.drawLine(layer, layerDesc, size)
        break
      case 'pattern':
        this.drawPattern(layer, layerDesc, size)
        break
      case 'ellipse':
        this.drawEllipse(layer, layerDesc, size)
        break
      case 'polygon':
        this.drawPolygon(layer, layerDesc, size)
        break
      case 'path':
        this.drawPath(layer, layerDesc, size)
        break
    }
  }

  private drawCircle(layer: Konva.Container, layerDesc: TextureLayer, size: number): void {
    const color = parseColor(layerDesc.color as string)
    const x = layerDesc.x !== undefined ? layerDesc.x : size / 2
    const y = layerDesc.y !== undefined ? layerDesc.y : size / 2
    const radius = layerDesc.radius !== undefined ? layerDesc.radius : Math.floor(size / 2)

    const circle = new Konva.Circle({
      x,
      y,
      radius,
      fill: this.colorToHex(color),
      rotation: layerDesc.rotation || 0,
    })

    layer.add(circle)
  }

  private drawRect(layer: Konva.Container, layerDesc: TextureLayer, size: number): void {
    const color = parseColor(layerDesc.color as string)
    const width = layerDesc.width || 0
    const height = layerDesc.height || 0
    const x = layerDesc.x !== undefined ? layerDesc.x : (size - width) / 2
    const y = layerDesc.y !== undefined ? layerDesc.y : (size - height) / 2

    // To rotate around center while keeping x,y as top-left:
    // Place at center, set offset to half width/height
    const rect = new Konva.Rect({
      x: x + width / 2,
      y: y + height / 2,
      width,
      height,
      fill: this.colorToHex(color),
      offsetX: width / 2,
      offsetY: height / 2,
      rotation: layerDesc.rotation || 0,
    })

    layer.add(rect)
  }

  private drawLine(layer: Konva.Container, layerDesc: TextureLayer, size: number): void {
    const color = parseColor(layerDesc.color as string)
    const lineWidth = layerDesc.lineWidth || 1

    const x1 = layerDesc.x !== undefined ? layerDesc.x : 0
    const y1 = layerDesc.y !== undefined ? layerDesc.y : 0
    const x2 = layerDesc.x2 !== undefined ? layerDesc.x2 : size
    const y2 = layerDesc.y2 !== undefined ? layerDesc.y2 : size

    // Calculate center of the line
    const cx = (x1 + x2) / 2
    const cy = (y1 + y2) / 2

    const line = new Konva.Line({
      points: [x1, y1, x2, y2],
      stroke: this.colorToHex(color),
      strokeWidth: lineWidth,
      rotation: layerDesc.rotation || 0,
      // Rotate around center
      x: cx,
      y: cy,
      offsetX: cx,
      offsetY: cy,
    })

    layer.add(line)
  }

  private drawPattern(layer: Konva.Container, layerDesc: TextureLayer, size: number): void {
    const {
      patternType,
      color1,
      x = 0,
      y = 0,
      width = size,
      height = size,
      rotation = 0,
    } = layerDesc
    const patternSize = 8 // Pattern tile size

    const color = color1 ? this.colorToHex(color1) : '#000000'

    // Create a group for the pattern to handle rotation
    const group = new Konva.Group({
      x: x + width / 2, // Rotate around center
      y: y + height / 2,
      rotation: rotation,
    })

    // Offset for drawing inside the group (centered)
    const offsetX = -width / 2
    const offsetY = -height / 2

    switch (patternType) {
      case 'checkerboard':
        for (let i = 0; i < width; i += patternSize) {
          for (let j = 0; j < height; j += patternSize) {
            if ((Math.floor(i / patternSize) + Math.floor(j / patternSize)) % 2 === 0) {
              const rect = new Konva.Rect({
                x: offsetX + i,
                y: offsetY + j,
                width: patternSize,
                height: patternSize,
                fill: color,
              })
              group.add(rect)
            }
          }
        }
        break
      case 'stripes':
        for (let i = 0; i < width; i += patternSize) {
          const rect = new Konva.Rect({
            x: offsetX + i,
            y: offsetY,
            width: patternSize,
            height: height,
            fill: color,
          })
          group.add(rect)
        }
        break
      case 'dots':
        const dotRadius = 3
        for (let i = 0; i < width; i += patternSize) {
          for (let j = 0; j < height; j += patternSize) {
            const circle = new Konva.Circle({
              x: offsetX + i + patternSize / 2,
              y: offsetY + j + patternSize / 2,
              radius: dotRadius,
              fill: color,
            })
            group.add(circle)
          }
        }
        break
    }

    layer.add(group)
  }

  private drawEllipse(layer: Konva.Container, layerDesc: TextureLayer, size: number): void {
    const color = parseColor(layerDesc.color as string)
    const x = Math.max(0, Math.min(layerDesc.x || size / 2, size))
    const y = Math.max(0, Math.min(layerDesc.y || size / 2, size))
    const width = Math.max(1, Math.min(layerDesc.width || size, size))
    const height = Math.max(1, Math.min(layerDesc.height || size, size))

    const ellipse = new Konva.Ellipse({
      x,
      y,
      radiusX: width / 2,
      radiusY: height / 2,
      fill: this.colorToHex(color),
      rotation: layerDesc.rotation || 0,
    })

    layer.add(ellipse)
  }

  private drawPolygon(layer: Konva.Container, layerDesc: TextureLayer, size: number): void {
    const color = parseColor(layerDesc.color as string)
    const points = layerDesc.points || []
    if (points.length < 3) return // Need at least 3 points for polygon

    // Flatten points array for Konva
    const flatPoints: number[] = []
    points.forEach(([px, py]) => {
      const clampedX = Math.max(0, Math.min(px, size))
      const clampedY = Math.max(0, Math.min(py, size))
      flatPoints.push(clampedX, clampedY)
    })

    const polygon = new Konva.Line({
      points: flatPoints,
      fill: this.colorToHex(color),
      closed: true,
      rotation: layerDesc.rotation || 0,
    })

    // Optional outline
    if (layerDesc.lineWidth && layerDesc.lineWidth > 0) {
      polygon.stroke(this.colorToHex(color))
      polygon.strokeWidth(layerDesc.lineWidth)
    }

    layer.add(polygon)
  }

  private drawPath(layer: Konva.Container, layerDesc: TextureLayer, size: number): void {
    const pathData = layerDesc.path || ''
    const color = parseColor(layerDesc.color as string)
    const shouldFill = layerDesc.fill !== undefined ? layerDesc.fill : true
    const lineWidth = layerDesc.lineWidth || 1

    if (!pathData) return

    // Simple SVG path parser supporting M, L, Z (basic lines and closes)
    const points: number[] = []
    let i = 0
    while (i < pathData.length) {
      const char = pathData[i]
      i++
      if (char === 'M' || char === 'L') {
        const mx = this.parseNumber(pathData, i)
        i += mx.length
        const my = this.parseNumber(pathData, i)
        i += my.length
        const currentX = Math.max(0, Math.min(parseFloat(mx), size))
        const currentY = Math.max(0, Math.min(parseFloat(my), size))
        points.push(currentX, currentY)
      } else if (char === 'Z') {
        // Close path - Konva handles this with closed: true
      } else if (char === ' ') {
        // Skip whitespace
      }
    }

    if (points.length > 0) {
      const line = new Konva.Line({
        points,
        closed: pathData.includes('Z'),
        rotation: layerDesc.rotation || 0,
      })

      if (shouldFill) {
        line.fill(this.colorToHex(color))
      }
      if (lineWidth > 0) {
        line.stroke(this.colorToHex(color))
        line.strokeWidth(lineWidth)
      }

      layer.add(line)
    }
  }

  private parseNumber(str: string, start: number): string {
    let i = start
    while (i < str.length && (/\d|\.|-/.test(str[i]) || str[i] === ' ')) {
      i++
    }
    return str.substring(start, i).trim()
  }

  /**
   * Convert a numeric color to hex string
   */
  private colorToHex(color: number | string): string {
    if (typeof color === 'string') {
      return color
    }
    return '#' + color.toString(16).padStart(6, '0')
  }
}
