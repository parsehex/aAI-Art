// import type { TextureDescription } from '@/types/Textures';

export class GameObject extends Phaser.GameObjects.Sprite {
    protected speed: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        // Enable physics if you need it
        scene.physics.add.existing(this);
    }

    // Basic movement methods
    setSpeed(speed: number): this {
        this.speed = speed;
        return this;
    }

    moveLeft(): this {
        this.x -= this.speed;
        return this;
    }

    moveRight(): this {
        this.x += this.speed;
        return this;
    }

    moveUp(): this {
        this.y -= this.speed;
        return this;
    }

    moveDown(): this {
        this.y += this.speed;
        return this;
    }
}
