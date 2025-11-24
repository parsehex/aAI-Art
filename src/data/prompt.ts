import type { TextureDescription, TextureLayer } from '@/types/Textures'
import { BrownBear } from './preset-textures/BrownBear'
import { Tree } from './preset-textures/Tree'
import { Villager } from './preset-textures/Villager'

interface ChatMessage {
  role: string
  content: string
}

function formatTextureJson(texture: TextureDescription): string {
  const layersStr = texture.layers
    .map((layer: TextureLayer) => `    ${JSON.stringify(layer)}`)
    .join(',\n')
  return `{
  "name": "${texture.name}",
  "size": ${texture.size},
  "layers": [
${layersStr}
  ]
}`
}

const TreeJson = formatTextureJson(Tree)
const VillagerJson = formatTextureJson(Villager)
const BrownBearJson = formatTextureJson(BrownBear)

export const GenerateSpriteMessages = (input: string) => {
  const msgs: ChatMessage[] = []

  // TODO update this to match the new schema
  // - shouldn't need to mention "visible" -- dont know what use invisible layers would be & it defaults to true, saves on tokens
  // - "rotation" -- this is optional and can be used on all layer types, defaults is 0 when not specified
  msgs.push({
    role: 'system',
    content: `Assistant's task is to create a new detailed texture based on the INPUT, by using the provided instructions and example(s).

# Texture Schema
{
  "name": "string",
  "size": number,
  "layers": Layer[]
}

Each layer is drawn in order and must have a "type" and "color".

## Layer Types
- Rectangle: { "type": "rect", "color": string, "x": number, "y": number, "width": number, "height": number }
- Circle:    { "type": "circle", "color": string, "x": number, "y": number, "radius": number }
- Line:      { "type": "line", "color": string, "x": number, "y": number, "x2": number, "y2": number, "lineWidth"?: number }
- Ellipse:   { "type": "ellipse", "color": string, "x": number, "y": number, "width": number, "height": number }
- Polygon:   { "type": "polygon", "color": string, "points": [[x,y],...], "lineWidth"?: number }
- Path:      { "type": "path", "color": string, "path": string, "fill"?: boolean, "lineWidth"?: number }

Colors: hex codes ("#FF0000") or names ("red","gray","transparent").

## Rules
1. Base the design on the INPUT concept.
2. Keep size reasonable (64 or 128).
3. Use multiple shapes to build details when desired.

## Example
INPUT: tree
OUTPUT:
{
  "name": "tree",
  "size": 64,
  "layers": [
    { "type": "rect", "color": "#8B4513", "x": 28, "y": 40, "width": 8, "height": 20 },
    { "type": "circle", "color": "#228B22", "x": 32, "y": 24, "radius": 16 },
    { "type": "circle", "color": "#006400", "x": 24, "y": 32, "radius": 12 },
    { "type": "circle", "color": "#228B22", "x": 40, "y": 28, "radius": 14 },
    { "type": "circle", "color": "#006400", "x": 32, "y": 20, "radius": 15 }
  ]
}`,
  })

  msgs.push({
    role: 'user',
    content: `INPUT:\n\n${input}`,
  })

  return msgs
}
