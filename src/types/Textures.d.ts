type TextureLayer = {
  type: 'circle' | 'rect' | 'line' | 'gradient' | 'pattern'
  color?: string
  colorStart?: string // For gradient
  colorEnd?: string // For gradient
  color1?: string // For pattern
  color2?: string // For pattern
  patternType?: string // For pattern
  direction?: 'horizontal' | 'vertical' // For gradient
  x?: number
  y?: number
  x2?: number // End x coordinate for line
  y2?: number // End y coordinate for line
  width?: number
  height?: number
  radius?: number
  lineWidth?: number // Optional line thickness
}

interface TextureDescription {
  size: number
  layers: TextureLayer[]
  name: string
}
