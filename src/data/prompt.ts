import { Fence } from './preset-textures/Fence'
import { TreasureChest } from './preset-textures/TreasureChest'
import { Tree } from './preset-textures/Tree'
import { Villager } from './preset-textures/Villager'

interface ChatMessage {
  role: string
  content: string
}

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

## Colors
Colors can be specified in two formats:
1. Hex codes: \`"#FF0000"\`, \`"#8B4513"\`
2. Named colors: \`"red"\`, \`"blue"\`, \`"white"\`, \`"black"\`, \`"yellow"\`, \`"transparent"\`

## Coordinate System
- The canvas uses a top-left coordinate system (0,0 is top-left corner)
- The default canvas size is specified by the \`size\` property
- All coordinates are in pixels

## Best Practices
1. Build complex shapes by layering simpler shapes.
2. Use meaningful color names or hex codes for clarity.
3. Keep the size reasonable (64x64 is common for simple sprites).
4. Use descriptive names for your textures.

## Example Structure
\`\`\`json
{
  "name": "example-sprite",
  "size": 64,
  "layers": [
    // Middle-ground elements
    { "type": "circle", "color": "#FF0000", "x": 32, "y": 32, "radius": 20 },
    // Finally, details and highlights
    { "type": "line", "color": "#FFFFFF", "x": 10, "y": 10, "x2": 54, "y2": 54, "lineWidth": 2 }
  ]
}
\`\`\`

----

Examples:
Tree: ${JSON.stringify(Tree, null, 2)}

Treasure Chest: ${JSON.stringify(TreasureChest, null, 2)}

Villager: ${JSON.stringify(Villager, null, 2)}

Fence: ${JSON.stringify(Fence, null, 2)}

----

Assistant must respond with the resulting valid JSON object only and without comments.`,
  })

  msgs.push({
    role: 'user',
    content: `INPUT:\n\n${input}`,
  })

  return msgs
}
