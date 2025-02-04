import { presetTextures } from '@/data/preset-textures';
import { TextureGenerator } from '@/utils/TextureGenerator';

export default class MainScene extends Phaser.Scene {
  private textureGenerator: TextureGenerator;
  // You can still have other arrays (e.g., villagers) if needed

  constructor() {
    super({ key: "MainScene" });
    this.textureGenerator = new TextureGenerator(this);
  }

  create() {
    const canvasWidth = this.game.config.width as number;
      const canvasHeight = this.game.config.height as number;
      const spriteSize = Math.min(canvasWidth, canvasHeight) * 0.3; // Adjust sprite size dynamically based on canvas dimensions

      presetTextures.forEach((texture, index) => {
        const x = (index % 4) * 200 + 100;  // Adjust based on desired layout
        const y = Math.floor(index / 4) * 200 + 100;

        const sprite = this.textureGenerator.createGameObject(texture, x, y, {
          width: spriteSize,
          height: spriteSize,  // Adjust the size to take up more space
        });

        sprite.setInteractive();
        sprite.on('pointerdown', () => {
          window.dispatchEvent(new CustomEvent('spriteSelected', { detail: texture }));
        });
      });

    window.addEventListener('newTexture', (event: Event) => {
      // TypeScript casting for the custom event detail:
      const customEvent = event as CustomEvent;
      const newTexture = customEvent.detail as TextureDescription;

      // For demonstration, add the new texture at a fixed position.
      // In a more complex app you might decide where to put it.
      this.textureGenerator.createGameObject(newTexture, 400, 400, {
        isInteractive: true,
        name: newTexture.name,
      });
      console.log('New texture added:', newTexture.name);
    });
  }

  update() {
    // Update logic if needed.
  }
}
