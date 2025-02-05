import { parseColor } from '@/utils'
import type { TextureGenerator } from '@/utils/TextureGenerator'

export class SpriteViewer {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.GameObject[] = []
  private textureGenerator: TextureGenerator
  private currentPage: number = 0
  private itemsPerPage: number = 12
  private allTextures: TextureDescription[]
  private selectedSprite: TextureDescription | null = null
  private prevButton?: Phaser.GameObjects.Text
  private nextButton?: Phaser.GameObjects.Text
  private backButton?: Phaser.GameObjects.Text

  constructor(
    scene: Phaser.Scene,
    textureGenerator: TextureGenerator,
    allTextures: TextureDescription[],
  ) {
    this.scene = scene
    this.textureGenerator = textureGenerator
    this.allTextures = [...allTextures]

    this.createPaginationButtons()
    this.loadPage()

    window.addEventListener('spriteSelected', (event: Event) => {
      const customEvent = event as CustomEvent<TextureDescription>
      this.selectedSprite = customEvent.detail
      this.showSelectedSprite()
    })
  }

  public reload() {
    this.loadPage()
  }

  private clearScene() {
    this.sprites.forEach(obj => {
      if (!obj) return;
      obj.removeAllListeners();
      obj.destroy();
    });
    this.sprites = [];

    this.scene.children.each(child => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.destroy();
      }
    });
  }

  private loadPage() {
    this.clearScene();

    this.selectedSprite = null;
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageTextures = this.allTextures.slice(start, end);

    this.sprites = pageTextures.map((texture, index) => {
      const x = (index % 4) * 200 + 100;
      const y = Math.floor(index / 4) * 200 + 75;
      const sprite = this.textureGenerator.createGameObject(texture, x, y);

      if (texture.generated) {
        sprite.preFX?.addGlow(parseColor('#FDE047'), 4, 0, false);
      }

      sprite.setInteractive();
      sprite.on('pointerdown', () => {
        window.dispatchEvent(new CustomEvent('spriteSelected', { detail: texture }));
      });

      let label: Phaser.GameObjects.Text | null = null;
      sprite.on('pointerover', () => {
        label = this.scene.add.text(sprite.x - 50, sprite.y - 50, texture.name, {
          fontSize: '12px',
          backgroundColor: '#000',
          color: '#fff',
        });
        this.sprites.push(label);
      });
      sprite.on('pointerout', () => {
        label?.destroy();
      });

      this.sprites.push(sprite);
      return sprite;
    });

    this.updateButtonStates();
  }

  private showSelectedSprite() {
    if (!this.selectedSprite) return

    this.clearScene()
    const largeSprite = this.textureGenerator.createGameObject(this.selectedSprite, 400, 300, {
      scale: 3,
      isInteractive: false
    })
    this.sprites.push(largeSprite);

    this.createBackButton()
    this.createNavigationButtons()
  }

  private createBackButton() {
    this.backButton = this.scene.add
      .text(50, 50, 'Back to List', { fontSize: '18px', backgroundColor: '#222', color: '#fff', padding: { x: 10, y: 5 } })
      .setInteractive()
      .on('pointerdown', () => this.loadPage());

    this.sprites.push(this.backButton);
  }

  private createNavigationButtons() {
    const index = this.allTextures.indexOf(this.selectedSprite!);

    if (index > 0) {
      this.prevButton = this.scene.add
        .text(250, 550, 'Previous', { fontSize: '18px' })
        .setInteractive()
        .on('pointerdown', () => {
          this.selectedSprite = this.allTextures[index - 1];
          this.showSelectedSprite();
        });
      this.sprites.push(this.prevButton);
    }

    if (index < this.allTextures.length - 1) {
      this.nextButton = this.scene.add
        .text(550, 550, 'Next', { fontSize: '18px' })
        .setInteractive()
        .on('pointerdown', () => {
          this.selectedSprite = this.allTextures[index + 1];
          this.showSelectedSprite();
        });
      this.sprites.push(this.nextButton);
    }
  }

  private createPaginationButtons() {
    this.prevButton = this.scene.add
      .text(50, 550, 'Prev Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if (this.currentPage > 0) {
          this.currentPage--
          this.loadPage()
        }
      })
    this.sprites.push(this.prevButton);
    this.prevButton?.setStyle({ fill: this.currentPage === 0 ? '#555' : '#fff' })

    this.nextButton = this.scene.add
      .text(650, 550, 'Next Page', { fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => {
        if ((this.currentPage + 1) * this.itemsPerPage < this.allTextures.length) {
          this.currentPage++
          this.loadPage()
        }
      })
    this.sprites.push(this.nextButton);
    this.nextButton?.setStyle({ fill: (this.currentPage + 1) * this.itemsPerPage >= this.allTextures.length ? '#555' : '#fff' })
  }

  private updateButtonStates() {
    if (this.prevButton) this.prevButton.destroy()
    if (this.nextButton) this.nextButton.destroy()
    this.createPaginationButtons()
  }
}
