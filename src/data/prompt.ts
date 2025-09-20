import { BrownBear } from './preset-textures/BrownBear'
import { Tree } from './preset-textures/Tree'
import { Villager } from './preset-textures/Villager'

interface ChatMessage {
  role: string
  content: string
}

function formatTextureJson(texture: TextureDescription): string {
  const layersStr = texture.layers.map((layer) => `    ${JSON.stringify(layer)}`).join(',\n')
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

  msgs.push({
    role: 'system',
    content: `Assistant's task is to create a new detailed texture based on the INPUT, by using the provided instructions and example(s).

# Texture Definition Guide

## Basic Structure
A texture definition is an object with three main properties:
\`\`\`typescript
{
  "name": "string",     // Unique identifier for the texture
  "size": "number",     // Canvas size (both width and height) in pixels
  "layers": "Layer[]"   // Array of shape layers to draw
}
\`\`\`

## Layers
Layers are drawn in order from first to last (bottom to top). Each layer represents a single shape and must have a \`type\` and \`color\` property.

### Supported Layer Types

#### 1. Rectangle (\`rect\`)
\`\`\`typescript
{
  "type": "rect",
  "color": "string",    // CSS color or hex code
  "x": "number",        // Left position
  "y": "number",        // Top position
  "width": "number",    // Rectangle width
  "height": "number"    // Rectangle height
}
\`\`\`

#### 2. Circle (\`circle\`)
\`\`\`typescript
{
  "type": "circle",
  "color": "string",    // CSS color or hex code
  "x": "number",        // Center X position
  "y": "number",        // Center Y position
  "radius": "number"    // Circle radius
}
\`\`\`

#### 3. Line (\`line\`)
\`\`\`typescript
{
  "type": "line",
  "color": "string",    // CSS color or hex code
  "x": "number",        // Start X position
  "y": "number",        // Start Y position
  "x2": "number",       // End X position
  "y2": "number",       // End Y position
  "lineWidth": "number" // Optional: Line thickness (default: 1)
}
\`\`\`

#### 4. Ellipse (\`ellipse\`)
\`\`\`typescript
{
  "type": "ellipse",
  "color": "string",    // CSS color or hex code
  "x": "number",        // Center X position
  "y": "number",        // Center Y position
  "width": "number",    // Ellipse width
  "height": "number"    // Ellipse height
}
\`\`\`

#### 5. Polygon (\`polygon\`)
\`\`\`typescript
{
  "type": "polygon",
  "color": "string",    // CSS color or hex code
  "points": "[[number, number], ...]", // Array of [x, y] points, closed shape
  "lineWidth": "number" // Optional: Outline thickness (default: 1)
}
\`\`\`
Example points: \`[[10,10], [20,30], [30,10], [20,0]]\`

#### 6. Path (\`path\`)
\`\`\`typescript
{
  "type": "path",
  "color": "string",    // Fill or stroke color
  "path": "string",     // SVG-like path data (e.g., "M10 10 L20 20 Q30 0 40 10 Z")
  "fill": "boolean",    // Whether to fill the path (default: true)
  "lineWidth": "number" // Optional: Stroke thickness if not filling
}
\`\`\`
Supported commands: M (move), L (line), Q (quadratic curve), Z (close).

## Colors
Colors can be specified in two formats:
1. Hex codes: \`"#FF0000"\`, \`"#8B4513"\`
2. Named colors: \`"red"\`, \`"blue"\`, \`"white"\`, \`"black"\`, \`"yellow"\`, \`"transparent"\`

## Coordinate System
- Canvas uses top-left coordinates (0,0 is the top-left corner)
- Specify the canvas size with the \`size\` property
- All coordinates are in pixels

## Best Practices
1. Carefully consider the user's input and earnestly attempt to create the request.
2. Build complex shapes by layering simpler shapes.
3. Keep the size reasonable (64x64 is common for simple sprites).
4. Use the provided examples to better understand good quality results.

## Example Structure
\`\`\`json
{
  "name": "example-sprite",
  "size": 64,
  "layers": [
    // Middle-ground elements
    { "type": "circle", "color": "#FF0000", "x": 32, "y": 32, "radius": 20 },
    // Ellipse for oval body
    { "type": "ellipse", "color": "#00FF00", "x": 32, "y": 40, "width": 30, "height": 40 },
    // Polygon for a star shape
    { "type": "polygon", "color": "#0000FF", "points": [[32,10], [38,30], [58,30], [42,42], [48,62], [32,50], [16,62], [22,42], [6,30], [26,30]] },
    // Finally, details and highlights
    { "type": "line", "color": "#FFFFFF", "x": 10, "y": 10, "x2": 54, "y2": 54, "lineWidth": 2 }
  ]
}
\`\`\`

----

Examples:

Tree: ${TreeJson}

Villager: ${VillagerJson}

Bear: ${BrownBearJson}

----

Assistant must respond with the resulting valid JSON object only and without comments.`,
  })

  msgs.push({
    role: 'user',
    content: `INPUT:\n\n${input}`,
  })

  return msgs
}
