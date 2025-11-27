# aAI Art

> alternative AI Art

This is an app that explores using AI to create procedural graphics, in contrast to using traditional image models. Instead of generating images directly, we prompt an LLM to return JSON instructions that define sprites, which are then rendered using [Konva](https://konvajs.org/). You can now also **Edit** sprites created in this app.

Here are some examples of sprites created by LLMs:

![Preview image of sprites generated with aAI-Art](./docs/assets/ai-sprites.png)

> [!NOTE]
> **See any potential here? Let me know / Spread the word!**
>
> I've been restoring + refurbishing my projects but I need users and feedback. If you have any interest in using this project, please get in touch via the _**Issues**_ tab or one of the links under _**Sponsor this project**_ to the right. [My profile](https://github.com/parsehex) may have updated contact info.

![Preview image of the aAI-Art web app](./aai-art-preview.png)

## Getting Started

[Try the app here](https://parsehex.github.io/aAI-Art/)

### Prerequisites

- Node.js
- pnpm

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
- **Konva** - Canvas engine for sprite rendering
- **Tailwind CSS** - Styling
- **Vite** - Build tool and dev server

## Sprite Drawing Animation

The app renders sprites incrementally shile they're being generated, and you can also click to re-draw a sprite to see the effect again.

https://github.com/user-attachments/assets/8d69e98b-bdb4-4608-92cb-09212b98079c

## License

MIT License - see LICENSE file for details.
