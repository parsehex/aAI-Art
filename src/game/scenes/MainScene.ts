import { presetTextures } from '@/data/preset-textures';
import { TextureGenerator } from '@/utils/TextureGenerator';

export default class MainScene extends Phaser.Scene {
  private textureGenerator: TextureGenerator;
  private currentPage: number = 0;
  private itemsPerPage: number = 12;
  private prevButton: Phaser.GameObjects.Text | undefined;
  private nextButton: Phaser.GameObjects.Text | undefined;

  constructor() {
    super({ key: "MainScene" });
    this.textureGenerator = new TextureGenerator(this);
  }

  create() {
    this.loadPage();
    this.updateButtons();

    window.addEventListener('newTexture', (event: Event) => {
      const customEvent = event as CustomEvent<TextureDescription>;
      const newTexture = customEvent.detail;

      // Add the new sprite to the list
      presetTextures.push(newTexture);

      // Reload the scene to include the new sprite
      this.loadPage();
      this.updateButtons();
    });

  }

  loadPage() {
    this.children.removeAll();

    // Get the current slice of textures based on the current page
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageTextures = presetTextures.slice(start, end);

    // Place textures on the scene
    pageTextures.forEach((texture, index) => {
      const x = (index % 4) * 200 + 100;
      const y = Math.floor(index / 4) * 200 + 100;
      const sprite = this.textureGenerator.createGameObject(texture, x, y);

      sprite.setInteractive();
      sprite.on('pointerdown', () => {
        window.dispatchEvent(new CustomEvent('spriteSelected', { detail: texture }));
      });
    });
  }

  updateButtons() {
    // Remove previous buttons if they exist
    if (this.prevButton) this.prevButton.destroy();
    if (this.nextButton) this.nextButton.destroy();

    // Create the "Prev Page" button
    this.prevButton = this.add.text(50, 550, 'Prev Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.loadPage();
          this.updateButtons(); // Update button states after page change
        }
      });

    // Create the "Next Page" button
    this.nextButton = this.add.text(650, 550, 'Next Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if ((this.currentPage + 1) * this.itemsPerPage < presetTextures.length) {
          this.currentPage++;
          this.loadPage();
          this.updateButtons(); // Update button states after page change
        }
      });

    // Update the button states
    this.updateButtonStates();
  }

  updateButtonStates() {
    // Disable the "Prev Page" button if we are on the first page
    if (this.currentPage === 0) {
      this.prevButton?.setStyle({ fill: '#555' }).setInteractive(false);
    } else {
      this.prevButton?.setStyle({ fill: '#fff' }).setInteractive(true);
    }

    // Disable the "Next Page" button if there are no more pages
    if ((this.currentPage + 1) * this.itemsPerPage >= presetTextures.length) {
      this.nextButton?.setStyle({ fill: '#555' }).setInteractive(false);
    } else {
      this.nextButton?.setStyle({ fill: '#fff' }).setInteractive(true);
    }
  }
}
