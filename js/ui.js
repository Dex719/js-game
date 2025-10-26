class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
    }

    createMainMenu() {
        this.clearUI();
        
        this.elements.background = this.scene.add.rectangle(600, 600, 1200, 1200, 0x1a1a2e);
        this.elements.menuPanel = this.scene.add.rectangle(800, 600, 400, 1000, 0x0a0a1a, 0.9)
            .setStrokeStyle(2, 0x4a4a8a);
        
        this.elements.title = this.scene.add.text(800, 150, 'MAZE ESCAPE', {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#8a8aff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        const buttons = [
            { text: 'START', y: 300, callback: () => this.scene.startGame() },
            { text: 'LEVELS', y: 380, callback: () => this.showLevelSelect() },
            { text: 'SETTINGS', y: 460, callback: () => this.showSettings() },
            { text: 'INFO', y: 540, callback: () => this.showInfo() }
        ];
        
        this.elements.buttons = buttons.map(btn => {
            const button = this.scene.add.text(800, btn.y, btn.text, {
                fontFamily: 'Courier New',
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#4a4a8a',
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setBackgroundColor('#6a6aaa');
                this.scene.tweens.add({
                    targets: button,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100,
                    ease: 'Power2'
                });
            })
            .on('pointerout', () => {
                button.setBackgroundColor('#4a4a8a');
                this.scene.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: 'Power2'
                });
            })
            .on('pointerdown', btn.callback);
            
            return button;
        });
        
        this.animateMenuEntrance();
    }

    animateMenuEntrance() {
        this.scene.tweens.add({
            targets: this.elements.title,
            y: 150,
            duration: 1000,
            ease: 'Bounce.out',
            delay: 200
        });
        
        this.elements.buttons.forEach((button, index) => {
            button.y = 800;
            this.scene.tweens.add({
                targets: button,
                y: 300 + (index * 80),
                duration: 800,
                ease: 'Back.out',
                delay: 400 + (index * 100)
            });
        });
    }

    createGameHUD(levelData) {
        this.clearUI();
        
        this.elements.topPanel = this.scene.add.rectangle(600, 20, 1200, 60, 0x000000, 0.7)
            .setDepth(10);
        
        this.elements.timer = this.scene.add.text(50, 20, 'TIME: 00:00', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(11);
        
        this.elements.level = this.scene.add.text(600, 20, `LEVEL ${levelData.id}`, {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#8a8aff'
        }).setOrigin(0.5).setDepth(11);
        
        this.elements.health = this.scene.add.text(1150, 20, 'HP: ♥♥♥♥♥', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#ff4444'
        }).setOrigin(1, 0.5).setDepth(11);
        
        this.elements.keys = this.scene.add.text(50, 1160, 'KEYS: 0', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#ffcc00'
        }).setOrigin(0, 0.5).setDepth(11);
        
        this.elements.menuButton = this.createTextButton(1100, 1160, 'MENU', () => {
            this.showPauseMenu();
        }).setDepth(11);
    }

    showPauseMenu() {
        this.scene.isGameActive = false;
        
        this.elements.pauseOverlay = this.scene.add.rectangle(600, 600, 1200, 1200, 0x000000, 0.7);
        this.elements.pausePanel = this.scene.add.rectangle(600, 600, 400, 300, 0x1a1a2e)
            .setStrokeStyle(2, 0x4a4a8a);
        
        this.elements.pauseTitle = this.scene.add.text(600, 500, 'PAUSED', {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#8a8aff'
        }).setOrigin(0.5);
        
        this.elements.resumeButton = this.createTextButton(600, 580, 'RESUME', () => {
            this.resumeGame();
        });
        
        this.elements.restartButton = this.createTextButton(600, 640, 'RESTART', () => {
            this.scene.startGame();
        });
        
        this.elements.menuButtonPause = this.createTextButton(600, 700, 'MAIN MENU', () => {
            this.scene.returnToMainMenu();
        });
    }

    resumeGame() {
        this.elements.pauseOverlay.destroy();
        this.elements.pausePanel.destroy();
        this.elements.pauseTitle.destroy();
        this.elements.resumeButton.destroy();
        this.elements.restartButton.destroy();
        this.elements.menuButtonPause.destroy();
        this.scene.isGameActive = true;
    }

    updateHUD(data) {
        if (this.elements.timer && data.time !== undefined) {
            const minutes = Math.floor(data.time / 60);
            const seconds = Math.floor(data.time % 60);
            this.elements.timer.setText(`TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            
            if (data.time < 30) {
                this.elements.timer.setColor('#ff4444');
                if (data.time % 1 < 0.5) {
                    this.elements.timer.setScale(1.1);
                } else {
                    this.elements.timer.setScale(1);
                }
            }
        }
        
        if (this.elements.health && data.health !== undefined) {
            const hearts = '♥'.repeat(data.health) + '♡'.repeat(5 - data.health);
            this.elements.health.setText(`HP: ${hearts}`);
            
            if (data.health === 1) {
                if (Math.floor(Date.now() / 200) % 2 === 0) {
                    this.elements.health.setColor('#ff4444');
                } else {
                    this.elements.health.setColor('#ffffff');
                }
            }
        }
        
        if (this.elements.keys && data.keys !== undefined) {
            this.elements.keys.setText(`KEYS: ${data.keys}`);
        }
    }

    showLevelSelect() {
        this.clearUI();
        
        this.elements.background = this.scene.add.rectangle(600, 600, 1200, 1200, 0x1a1a2e);
        this.elements.title = this.scene.add.text(600, 100, 'SELECT LEVEL', {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#8a8aff'
        }).setOrigin(0.5);
        
        const levelManager = this.scene.levelManager;
        const levelsPerRow = 5;
        const buttonSize = 150;
        const startX = 600 - (levelsPerRow * buttonSize) / 2 + buttonSize / 2;
        
        levelManager.levels.forEach((level, index) => {
            const row = Math.floor(index / levelsPerRow);
            const col = index % levelsPerRow;
            const x = startX + col * buttonSize;
            const y = 250 + row * buttonSize;
            
            const button = this.scene.add.rectangle(x, y, 120, 120, 
                levelManager.isCompleted(level.id) ? 0x4a8a4a : 0x4a4a8a)
                .setStrokeStyle(2, 0x8a8aff)
                .setInteractive({ useHandCursor: true });
            
            const levelText = this.scene.add.text(x, y - 10, level.id.toString(), {
                fontFamily: 'Courier New',
                fontSize: '32px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            const stars = levelManager.getStars(level.id);
            // Защита от отрицательных значений
            const safeStars = Math.max(0, Math.min(3, stars));
            const starText = this.scene.add.text(x, y + 20, '★'.repeat(safeStars) + '☆'.repeat(3 - safeStars), {
                fontFamily: 'Courier New',
                fontSize: '20px',
                color: '#ffcc00'
            }).setOrigin(0.5);
            
            const nameText = this.scene.add.text(x, y + 50, level.name, {
                fontFamily: 'Courier New',
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            button.on('pointerdown', () => {
                if (levelManager.setLevel(level.id)) {
                    this.scene.startGame();
                }
            });
            
            button.on('pointerover', () => {
                button.setFillStyle(0x6a6aaa);
                this.scene.tweens.add({
                    targets: [button, levelText, starText, nameText],
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100
                });
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(levelManager.isCompleted(level.id) ? 0x4a8a4a : 0x4a4a8a);
                this.scene.tweens.add({
                    targets: [button, levelText, starText, nameText],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });
            
            if (!this.elements.levelButtons) this.elements.levelButtons = [];
            this.elements.levelButtons.push(button, levelText, starText, nameText);
        });
        
        this.elements.backButton = this.createTextButton(600, 1100, 'BACK', () => {
            this.createMainMenu();
        });
    }

    createTextButton(x, y, text, callback) {
        const button = this.scene.add.text(x, y, text, {
            fontFamily: 'Courier New',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#4a4a8a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            button.setBackgroundColor('#6a6aaa');
            button.setScale(1.1);
        })
        .on('pointerout', () => {
            button.setBackgroundColor('#4a4a8a');
            button.setScale(1);
        })
        .on('pointerdown', callback);
        
        return button;
    }

    showSettings() {
        this.clearUI();
        
        this.elements.background = this.scene.add.rectangle(600, 600, 1200, 1200, 0x1a1a2e);
        this.elements.title = this.scene.add.text(600, 100, 'SETTINGS', {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#8a8aff'
        }).setOrigin(0.5);
        
        this.elements.backButton = this.createTextButton(600, 1100, 'BACK', () => {
            this.createMainMenu();
        });
    }

    showInfo() {
        this.clearUI();
        
        this.elements.background = this.scene.add.rectangle(600, 600, 1200, 1200, 0x1a1a2e);
        this.elements.title = this.scene.add.text(600, 100, 'HOW TO PLAY', {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#8a8aff'
        }).setOrigin(0.5);
        
        const instructions = [
            'CONTROLS:',
            'WASD or Arrow Keys - Move',
            'SPACE - Jump',
            'E - Interact with objects',
            'SHIFT - Run (hold to move faster)',
            'ESC - Pause Game',
            '',
            'OBJECTIVE:',
            'Find the exit in each maze',
            'Avoid traps and enemies',
            'Collect keys to open doors',
            'Watch out for fake floors!'
        ];
        
        instructions.forEach((line, index) => {
            this.scene.add.text(600, 200 + index * 40, line, {
                fontFamily: 'Courier New',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        });
        
        this.elements.backButton = this.createTextButton(600, 1100, 'BACK', () => {
            this.createMainMenu();
        });
    }

    showLevelComplete(stars, time, levelId) {
        // Защита от отрицательных значений звезд
        const safeStars = Math.max(0, Math.min(3, stars));
        
        this.elements.overlay = this.scene.add.rectangle(600, 600, 1200, 1200, 0x000000, 0.7);
        this.elements.completePanel = this.scene.add.rectangle(600, 600, 600, 400, 0x1a1a2e)
            .setStrokeStyle(4, 0x8a8aff);
        
        this.elements.completeTitle = this.scene.add.text(600, 450, 'LEVEL COMPLETE!', {
            fontFamily: 'Courier New',
            fontSize: '48px',
            color: '#8a8aff'
        }).setOrigin(0.5);
        
        this.elements.stars = this.scene.add.text(600, 520, '★'.repeat(safeStars) + '☆'.repeat(3 - safeStars), {
            fontFamily: 'Courier New',
            fontSize: '64px',
            color: '#ffcc00'
        }).setOrigin(0.5);
        
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        this.elements.timeText = this.scene.add.text(600, 580, `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
            fontFamily: 'Courier New',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.elements.nextButton = this.createTextButton(450, 680, 'NEXT', () => {
            if (this.scene.levelManager.nextLevel()) {
                this.scene.startGame();
            } else {
                this.scene.returnToMainMenu();
            }
        });
        
        this.elements.replayButton = this.createTextButton(600, 680, 'REPLAY', () => {
            this.scene.startGame();
        });
        
        this.elements.levelsButton = this.createTextButton(750, 680, 'LEVELS', () => {
            this.showLevelSelect();
        });
        
        this.elements.completePanel.scaleY = 0;
        this.scene.tweens.add({
            targets: this.elements.completePanel,
            scaleY: 1,
            duration: 500,
            ease: 'Back.out'
        });
    }

    clearUI() {
        Object.values(this.elements).forEach(element => {
            if (Array.isArray(element)) {
                element.forEach(el => el.destroy && el.destroy());
            } else if (element && element.destroy) {
                element.destroy();
            }
        });
        this.elements = {};
    }
}   