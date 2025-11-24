export type TextureLayer = {
  type: 'circle' | 'rect' | 'line' | 'gradient' | 'pattern' | 'ellipse' | 'polygon' | 'path'
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
  points?: [number, number][] // For polygon: array of [x, y] points
  path?: string // For path: SVG-like path data (e.g., "M10 10 L20 20")
  fill?: boolean // For path: whether to fill the shape
  /** Layer visibility, undefined/unspecified defaults to visible/true */
  visible?: boolean | undefined
  rotation?: number // Rotation in degrees
}

export interface TextureDescription {
  size: number
  layers: TextureLayer[]
  name: string
  id: string
  generated?: boolean
  thumbnail?: string
  prompt?: string
}
