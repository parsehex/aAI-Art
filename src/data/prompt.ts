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

  // System prompt configuration
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
All layers support an optional "rotation" property (in degrees).

## Layer Types
- Rectangle: { "type": "rect", "color": string, "x": number, "y": number, "width": number, "height": number, "rotation"?: number }
- Circle:    { "type": "circle", "color": string, "x": number, "y": number, "radius": number }
- Line:      { "type": "line", "color": string, "x": number, "y": number, "x2": number, "y2": number, "lineWidth"?: number, "rotation"?: number }
- Ellipse:   { "type": "ellipse", "color": string, "x": number, "y": number, "width": number, "height": number, "rotation"?: number }
- Polygon:   { "type": "polygon", "color": string, "points": [[x,y],...], "lineWidth"?: number, "rotation"?: number }
- Path:      { "type": "path", "color": string, "path": string, "fill"?: boolean, "lineWidth"?: number, "rotation"?: number }

Colors: hex codes ("#FF0000") or names ("red","gray","transparent").

## Rules
1. Base the design on the INPUT concept.
2. Keep size reasonable (64 or 128).
3. Use multiple shapes to build details when desired.
4. Use rotation to add visual interest or create angled shapes.

## Examples

INPUT: tree
OUTPUT:
${TreeJson}

INPUT: villager
OUTPUT:
${VillagerJson}

INPUT: brown bear
OUTPUT:
${BrownBearJson}`,
  })

  msgs.push({
    role: 'user',
    content: `INPUT:\n\n${input}`,
  })

  return msgs
}
