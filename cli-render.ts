#!/usr/bin/env node
import 'konva/skia-backend'
import Konva from 'konva'
import { TextureGenerator } from './src/utils/TextureGenerator'
import { presetTextures } from './src/data/preset-textures'
import type { TextureDescription } from './src/types/Textures'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, basename } from 'path'

interface CliOptions {
  input: string
  output?: string
  overwrite: boolean
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: npm run render <input> [--output <path>] [--overwrite]')
    console.error('  <input>: Path to JSON file or "preset:{id}"')
    console.error('  --output: Optional output path (default: current directory)')
    console.error('  --overwrite: Overwrite existing files without prompting')
    console.error('\nExamples:')
    console.error('  npm run render preset:cloud-1')
    console.error('  npm run render sprite.json --output ./output/sprite.png')
    console.error('  npm run render preset:all --output docs/assets/ai-sprites.png --overwrite')
    process.exit(1)
  }

  const options: CliOptions = {
    input: args[0],
    overwrite: false,
  }

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      options.output = args[i + 1]
      i++
    } else if (args[i] === '--overwrite') {
      options.overwrite = true
    }
  }

  return options
}

function loadSpriteData(input: string): TextureDescription | 'ALL_PRESETS' {
  // Check if it's a preset reference
  if (input.startsWith('preset:')) {
    const presetId = input.substring(7) // Remove 'preset:' prefix

    // Special case: render all presets
    if (presetId === 'all') {
      return 'ALL_PRESETS'
    }

    const preset = presetTextures.find((p) => p.id === presetId)

    if (!preset) {
      console.error(`Error: Preset "${presetId}" not found`)
      console.error('\nAvailable presets:')
      presetTextures.forEach((p) => console.error(`  - ${p.id} (${p.name})`))
      console.error('\nSpecial commands:')
      console.error('  - preset:all (render all presets in a grid)')
      process.exit(1)
    }

    return preset
  }

  // Otherwise, load from JSON file
  try {
    const filePath = resolve(input)
    const fileContent = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent) as TextureDescription

    // Validate required fields
    if (!data.size || !data.layers || !data.id) {
      console.error('Error: Invalid sprite data. Required fields: size, layers, id')
      process.exit(1)
    }

    return data
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Error: File not found: ${input}`)
    } else if (error instanceof SyntaxError) {
      console.error(`Error: Invalid JSON in file: ${input}`)
    } else {
      console.error(`Error loading sprite data: ${(error as Error).message}`)
    }
    process.exit(1)
  }
}

async function renderSprite(spriteData: TextureDescription): Promise<Buffer> {
  const size = spriteData.size

  // Create an offscreen stage
  const stage = new Konva.Stage({
    width: size,
    height: size,
  })

  const layer = new Konva.Layer()
  stage.add(layer)

  // Use TextureGenerator to draw all layers
  const generator = new TextureGenerator()
  spriteData.layers.forEach((layerDesc) => {
    if (layerDesc.visible !== false) {
      generator.drawLayer(layer, layerDesc, size)
    }
  })

  layer.draw()

  // Export to buffer using skia-canvas
  // When using skia-backend, toCanvas() returns a skia-canvas Canvas instance
  const canvas = stage.toCanvas() as any
  const buffer = canvas.toBuffer('png')

  // Clean up
  stage.destroy()

  return buffer
}

async function renderAllPresets(): Promise<Buffer> {
  // Find the maximum sprite size among all presets
  const maxSpriteSize = Math.max(...presetTextures.map((p) => p.size))
  const cellSize = maxSpriteSize // Use max size for cell dimensions
  const padding = 8
  const columns = 4
  const rows = Math.ceil(presetTextures.length / columns)

  const canvasWidth = columns * (cellSize + padding) + padding
  const canvasHeight = rows * (cellSize + padding) + padding

  // Create a large stage for the sprite sheet
  const stage = new Konva.Stage({
    width: canvasWidth,
    height: canvasHeight,
  })

  const layer = new Konva.Layer()
  stage.add(layer)

  // Add background
  const background = new Konva.Rect({
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
    fill: '#1a1a1a',
  })
  layer.add(background)

  // Render each preset sprite
  const generator = new TextureGenerator()
  presetTextures.forEach((preset, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)
    const cellX = padding + col * (cellSize + padding)
    const cellY = padding + row * (cellSize + padding)

    // Create a group for this sprite
    const spriteGroup = new Konva.Group({
      x: cellX,
      y: cellY,
    })

    // Draw sprite layers
    preset.layers.forEach((layerDesc) => {
      if (layerDesc.visible !== false) {
        generator.drawLayer(spriteGroup, layerDesc, preset.size)
      }
    })

    // If sprite is smaller than cell, center it
    // If sprite is larger, it will fit because cellSize = maxSpriteSize
    if (preset.size < cellSize) {
      const offset = (cellSize - preset.size) / 2
      spriteGroup.x(cellX + offset)
      spriteGroup.y(cellY + offset)
    }

    layer.add(spriteGroup)
  })

  layer.draw()

  // Export to buffer
  const canvas = stage.toCanvas() as any
  const buffer = canvas.toBuffer('png')

  // Clean up
  stage.destroy()

  return buffer
}

function getOutputPath(
  spriteData: TextureDescription | 'ALL_PRESETS',
  customOutput?: string,
): string {
  if (customOutput) {
    return resolve(customOutput)
  }

  // Default: use sprite ID as filename in current directory
  const filename = spriteData === 'ALL_PRESETS' ? 'all-presets.png' : `${spriteData.id}.png`
  return resolve(process.cwd(), filename)
}

async function main() {
  const options = parseArgs()

  console.log(`Loading sprite data from: ${options.input}`)
  const spriteData = loadSpriteData(options.input)

  let imageBuffer: Buffer

  if (spriteData === 'ALL_PRESETS') {
    console.log(`Rendering all ${presetTextures.length} preset sprites in a grid...`)
    imageBuffer = await renderAllPresets()
  } else {
    console.log(`Rendering sprite: ${spriteData.name} (${spriteData.size}x${spriteData.size})`)
    imageBuffer = await renderSprite(spriteData)
  }

  const outputPath = getOutputPath(spriteData, options.output)

  // Check if file exists and handle overwrite
  if (!options.overwrite && existsSync(outputPath)) {
    console.error(`Error: File already exists: ${outputPath}`)
    console.error('Use --overwrite flag to overwrite existing files')
    process.exit(1)
  }

  writeFileSync(outputPath, imageBuffer)

  console.log(`✓ Sprite saved to: ${outputPath}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
