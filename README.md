# aAI Art

> alternative AI Art

This is an app that explores using AI to create procedural graphics, in contrast to using traditional image models. Instead of generating images directly, we prompt an LLM to return JSON instructions that define sprites, which are then rendered using [Phaser.js](https://phaser.io).

## Features

<!-- TODO replace section with examples -->

- **AI-Powered Sprite Generation**: Use LLMs to create procedural sprite definitions
- **SVG Generation**: SVGs can also be generated from a text description.
- **Preset Library**: Collection of pre-defined sprites and textures

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://parsehex/aAI-Art
```

2. Install dependencies:

```bash
cd aAI-Art
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser to `http://localhost:5173`

## Tech Stack

- **Vue 3** - Frontend framework
- **TypeScript** - Type safety
- **Phaser.js** - Game engine for sprite rendering
- **Tailwind CSS** - Styling
- **Vite** - Build tool and dev server

## Project Structure

```
src/
├── components/     # Vue components
├── data/          # Preset sprites and prompts
├── game/          # Phaser game logic
├── stores/        # State management
├── types/         # TypeScript definitions
└── utils/         # Utility functions
```

## License

MIT License - see LICENSE file for details.
