const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 1200,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: GameScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);