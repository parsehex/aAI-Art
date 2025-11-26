import type { TextureDescription, TextureLayer } from '@/types/Textures'

// Update examples used in the prompt here
import example1Json from './preset-textures/cloud-2.json'
import example2Json from './preset-textures/tree-2.json'
import example3Json from './preset-textures/restaurant-1.json'

interface ChatMessage {
  role: string
  content: string
}

function formatTextureJson(texture: TextureDescription): string {
  if (!texture.prompt) {
    texture.prompt = texture.name.replace(/-/g, ' ')
    console.warn(`Texture ${texture.name} has no prompt`)
  }
  const layersStr = texture.layers
    .map((layer: TextureLayer) => `    ${JSON.stringify(layer)}`)
    .join(',\n')
  return `INPUT: ${texture.prompt}
OUTPUT:
{
  "name": "${texture.name}",
  "size": ${texture.size},
  "layers": [
${layersStr}
  ]
}`
}

const Example1 = formatTextureJson(example1Json as TextureDescription)
const Example2 = formatTextureJson(example2Json as TextureDescription)
const Example3 = formatTextureJson(example3Json as TextureDescription)

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
- Rectangle: { "type": "rect", "color": string, "x": number, "y": number, "width": number, "height": number }
- Circle:    { "type": "circle", "color": string, "x": number, "y": number, "radius": number }
- Line:      { "type": "line", "color": string, "x": number, "y": number, "x2": number, "y2": number, "lineWidth": number }
- Ellipse:   { "type": "ellipse", "color": string, "x": number, "y": number, "width": number, "height": number }
- Polygon:   { "type": "polygon", "color": string, "points": [[x,y],...], "lineWidth": number }
- Path:      { "type": "path", "color": string, "path": string, "fill": boolean, "lineWidth": number }

Colors: hex codes ("#FF0000") or names ("red","gray","transparent").

## Rules
1. Base the design on the INPUT concept.
2. Use multiple shapes to build details when desired.
3. Use rotation to add visual interest or create angled shapes.
4. IMPORTANT: Output must be VALID JSON -- for example, there should be no comments.
5. Note that layer order matters -- layers are drawn in order.
6. Any size up to 1024 is acceptable. Larger sizes should be used if needed to create more detail.

## Examples

${Example1}

${Example2}

${Example3}`,
  })

  msgs.push({
    role: 'user',
    content: `INPUT:\n\n${input}`,
  })

  return msgs
}
