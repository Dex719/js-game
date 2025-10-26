class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.mazeGenerator = new MazeGenerator();
        this.levelManager = new LevelManager();
        this.uiManager = null;
        
        this.player = null;
        this.cursors = null;
        this.enemies = [];
        this.traps = [];
        this.keys = [];
        this.doors = [];
        this.fakeFloors = [];
        this.collectedKeys = 0;
        this.playerHealth = 5;
        this.levelTime = 0;
        this.levelTimer = null;
        this.isGameActive = false;
        this.levelGrid = null;
        this.tileSize = 0;
        this.exit = null;
        
        this.escKey = null;
        this.startPosition = null;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = null;
    }

    create() {
        // Сброс прогресса при ошибках (можно убрать после тестирования)
        try {
            this.levelManager.loadProgress();
        } catch (e) {
            console.error('Error loading progress, resetting...', e);
            this.levelManager.resetProgress();
        }
        
        this.uiManager = new UIManager(this);
        this.uiManager.createMainMenu();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    // ... остальной код без изменений ...
    startGame() {
        this.uiManager.clearUI();
        
        const levelData = this.levelManager.getCurrentLevel();
        this.generateLevel(levelData);
        this.uiManager.createGameHUD(levelData);
        
        this.levelTime = 0;
        this.levelTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        this.isGameActive = true;
    }

    generateLevel(levelData) {
        this.enemies = [];
        this.traps = [];
        this.keys = [];
        this.doors = [];
        this.fakeFloors = [];
        this.collectedKeys = 0;
        this.playerHealth = 5;
        this.exit = null;
        this.startPosition = null;
        
        this.children.removeAll();
        
        const maze = this.mazeGenerator.generateMaze(
            levelData.gridSize, 
            levelData.gridSize
        );
        
        const { traps, fakeFloors } = this.mazeGenerator.placeTraps(maze, levelData.id);
        this.traps = traps;
        this.fakeFloors = fakeFloors;
        
        this.enemies = this.mazeGenerator.spawnEnemies(maze, levelData.enemies);
        
        const { keys, doors } = this.mazeGenerator.placeKeysAndDoors(maze, levelData.keys);
        this.keys = keys;
        this.doors = doors;
        
        this.createGameField(maze, levelData);
    }

    createGameField(maze, levelData) {
        this.levelGrid = maze;
        
        const tileSize = Math.min(1200 / maze[0].length, 1200 / maze.length);
        this.tileSize = tileSize;
        
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[0].length; x++) {
                const worldX = x * tileSize + tileSize / 2;
                const worldY = y * tileSize + tileSize / 2;
                
                switch (maze[y][x]) {
                    case 1:
                        this.add.rectangle(worldX, worldY, tileSize, tileSize, 0x4a4a8a).setDepth(0);
                        break;
                    case 2:
                        this.add.rectangle(worldX, worldY, tileSize, tileSize, 0x4a8a4a).setDepth(0);
                        this.startPosition = { x: worldX, y: worldY };
                        break;
                    case 3:
                        this.add.rectangle(worldX, worldY, tileSize, tileSize, 0x8a4a4a).setDepth(0);
                        this.exit = { x: worldX, y: worldY, radius: tileSize / 2 };
                        break;
                    case 4:
                        const fakeFloor = this.add.rectangle(worldX, worldY, tileSize, tileSize, 0x8a8a4a)
                            .setAlpha(0.7)
                            .setDepth(0);
                        this.fakeFloors.push({ 
                            x: worldX, 
                            y: worldY, 
                            radius: tileSize / 2, 
                            sprite: fakeFloor,
                            isActive: true 
                        });
                        break;
                    default:
                        this.add.rectangle(worldX, worldY, tileSize, tileSize, 0x2a2a4a).setDepth(0);
                        break;
                }
            }
        }
        
        if (this.startPosition) {
            this.createPlayer(this.startPosition.x, this.startPosition.y, tileSize);
        }
        
        this.traps.forEach(trap => {
            const worldX = trap.x * tileSize + tileSize / 2;
            const worldY = trap.y * tileSize + tileSize / 2;
            
            const trapSprite = this.add.rectangle(worldX, worldY, tileSize * 0.7, tileSize * 0.7, 0xff4444)
                .setDepth(1);
            trap.sprite = trapSprite;
            trap.x = worldX;
            trap.y = worldY;
            trap.radius = tileSize * 0.35;
        });
        
        this.enemies.forEach(enemy => {
            const worldX = enemy.x * tileSize + tileSize / 2;
            const worldY = enemy.y * tileSize + tileSize / 2;
            
            const enemySprite = this.add.rectangle(worldX, worldY, tileSize * 0.8, tileSize * 0.8, 0xff8844)
                .setDepth(1);
            enemy.sprite = enemySprite;
            enemy.x = worldX;
            enemy.y = worldY;
            enemy.radius = tileSize * 0.4;
            enemy.direction = { x: 1, y: 0 };
            enemy.lastDirectionChange = 0;
        });
        
        this.keys.forEach(key => {
            const worldX = key.x * tileSize + tileSize / 2;
            const worldY = key.y * tileSize + tileSize / 2;
            
            const keySprite = this.add.rectangle(worldX, worldY, tileSize * 0.5, tileSize * 0.5, 0xffcc00)
                .setDepth(1);
            key.sprite = keySprite;
            key.x = worldX;
            key.y = worldY;
            key.radius = tileSize * 0.25;
            key.isCollected = false;
        });
        
        this.doors.forEach(door => {
            const worldX = door.x * tileSize + tileSize / 2;
            const worldY = door.y * tileSize + tileSize / 2;
            
            const doorSprite = this.add.rectangle(worldX, worldY, tileSize, tileSize, 0x8a4a4a)
                .setDepth(1);
            door.sprite = doorSprite;
            door.x = worldX;
            door.y = worldY;
            door.radius = tileSize / 2;
            door.isLocked = true;
        });
    }

    createPlayer(x, y, size) {
        this.player = {
            x: x,
            y: y,
            radius: size * 0.25,
            speed: 300,
            isMoving: false,
            sprite: this.add.rectangle(x, y, size * 0.5, size * 0.5, 0xffff00)
                .setDepth(2)
        };
    }

    updateTimer() {
        if (this.isGameActive) {
            this.levelTime++;
            this.uiManager.updateHUD({ time: this.levelTime });
        }
    }

    update(time, delta) {
        if (!this.isGameActive || !this.player) return;
        
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.uiManager.showPauseMenu();
            return;
        }
        
        this.handleInput(delta);
        this.updateEnemies(time, delta);
        this.checkCollisions();
        this.checkWinCondition();
    }

    handleInput(delta) {
        let moveX = 0;
        let moveY = 0;
        
        if (this.cursors.left.isDown || this.wasd.left.isDown) moveX = -1;
        if (this.cursors.right.isDown || this.wasd.right.isDown) moveX = 1;
        if (this.cursors.up.isDown || this.wasd.up.isDown) moveY = -1;
        if (this.cursors.down.isDown || this.wasd.down.isDown) moveY = 1;
        
        let currentSpeed = this.player.speed;
        if (this.shiftKey.isDown) {
            currentSpeed *= 1.5;
        }
        
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }
        
        if (moveX !== 0 || moveY !== 0) {
            const newX = this.player.x + moveX * currentSpeed * (delta / 1000);
            const newY = this.player.y + moveY * currentSpeed * (delta / 1000);
            
            if (this.canMoveTo(newX, this.player.y)) {
                this.player.x = newX;
            }
            if (this.canMoveTo(this.player.x, newY)) {
                this.player.y = newY;
            }
            
            this.player.isMoving = true;
            
            this.player.sprite.x = this.player.x;
            this.player.sprite.y = this.player.y;
        } else {
            this.player.isMoving = false;
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.handleJump();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.handleInteraction();
        }
    }

    canMoveTo(x, y) {
        const tileSize = this.tileSize;
        const gridX = Math.floor(x / tileSize);
        const gridY = Math.floor(y / tileSize);
        
        if (gridX < 0 || gridX >= this.levelGrid[0].length || 
            gridY < 0 || gridY >= this.levelGrid.length) {
            return false;
        }
        
        const cellType = this.levelGrid[gridY][gridX];
        
        if (cellType === 1) {
            const door = this.doors.find(d => 
                Math.floor(d.x / tileSize) === gridX && 
                Math.floor(d.y / tileSize) === gridY
            );
            if (door && door.isLocked) {
                return false;
            }
            return door ? !door.isLocked : false;
        }
        
        return true;
    }

    handleJump() {
        console.log('Jump!');
    }

    handleInteraction() {
        this.doors.forEach(door => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, door.x, door.y
            );
            
            if (distance < this.player.radius + door.radius + 20) {
                this.tryOpenDoor(door);
            }
        });
    }

    tryOpenDoor(door) {
        if (door.isLocked && this.collectedKeys > 0) {
            door.isLocked = false;
            this.collectedKeys--;
            door.sprite.setFillStyle(0x4a8a4a);
            this.uiManager.updateHUD({ keys: this.collectedKeys });
        }
    }

    updateEnemies(time, delta) {
        this.enemies.forEach(enemy => {
            const enemySpeed = enemy.type === 'flyer' ? 50 : 30;
            
            if (time - enemy.lastDirectionChange > 3000) {
                enemy.direction.x = Phaser.Math.FloatBetween(-1, 1);
                enemy.direction.y = Phaser.Math.FloatBetween(-1, 1);
                enemy.lastDirectionChange = time;
            }
            
            const length = Math.sqrt(enemy.direction.x * enemy.direction.x + enemy.direction.y * enemy.direction.y);
            if (length > 0) {
                enemy.direction.x /= length;
                enemy.direction.y /= length;
            }
            
            const newX = enemy.x + enemy.direction.x * enemySpeed * (delta / 1000);
            const newY = enemy.y + enemy.direction.y * enemySpeed * (delta / 1000);
            
            if (this.canMoveTo(newX, enemy.y)) {
                enemy.x = newX;
            }
            if (this.canMoveTo(enemy.x, newY)) {
                enemy.y = newY;
            }
            
            enemy.sprite.x = enemy.x;
            enemy.sprite.y = enemy.y;
        });
    }

    checkCollisions() {
        if (this.isInvulnerable) return;
        
        this.enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, enemy.x, enemy.y
            );
            
            if (distance < this.player.radius + enemy.radius) {
                this.takeDamage(1);
                
                const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                this.player.x += Math.cos(angle) * 40;
                this.player.y += Math.sin(angle) * 40;
                
                this.activateInvulnerability();
            }
        });
        
        this.traps.forEach(trap => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, trap.x, trap.y
            );
            
            if (distance < this.player.radius + trap.radius) {
                this.takeDamage(1);
                this.activateInvulnerability();
            }
        });
        
        this.fakeFloors.forEach(floor => {
            if (floor.isActive) {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y, floor.x, floor.y
                );
                
                if (distance < this.player.radius + floor.radius) {
                    floor.isActive = false;
                    floor.sprite.setAlpha(0.3);
                    
                    this.takeDamage(1);
                    this.activateInvulnerability();
                }
            }
        });
        
        this.keys.forEach(key => {
            if (!key.isCollected) {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y, key.x, key.y
                );
                
                if (distance < this.player.radius + key.radius) {
                    key.isCollected = true;
                    key.sprite.destroy();
                    this.collectedKeys++;
                    this.uiManager.updateHUD({ keys: this.collectedKeys });
                }
            }
        });
    }

    activateInvulnerability() {
        this.isInvulnerable = true;
        
        const blink = this.tweens.add({
            targets: this.player.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.player.sprite.setAlpha(1);
                this.isInvulnerable = false;
            }
        });
        
        if (this.invulnerabilityTimer) {
            this.invulnerabilityTimer.remove();
        }
        this.invulnerabilityTimer = this.time.delayedCall(1500, () => {
            this.isInvulnerable = false;
            this.player.sprite.setAlpha(1);
        });
    }

    takeDamage(amount) {
        if (this.isInvulnerable) return;
        
        this.playerHealth -= amount;
        this.uiManager.updateHUD({ health: this.playerHealth });
        
        this.cameras.main.shake(100, 0.005);
        this.cameras.main.flash(100, 255, 0, 0);
        
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    checkWinCondition() {
        if (this.exit) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, this.exit.x, this.exit.y
            );
            
            if (distance < this.player.radius + this.exit.radius) {
                this.completeLevel();
            }
        }
    }

    completeLevel() {
        this.isGameActive = false;
        
        if (this.levelTimer) {
            this.levelTimer.remove();
        }
        
        let stars = 1;
        const levelData = this.levelManager.getCurrentLevel();
        
        if (levelData.timeLimit) {
            const timeRatio = this.levelTime / levelData.timeLimit;
            if (timeRatio < 0.5) stars++;
            if (timeRatio < 0.25) stars++;
        }
        
        if (this.playerHealth === 5) stars++;
        
        this.levelManager.completeLevel(stars);
        this.uiManager.showLevelComplete(stars, this.levelTime, levelData.id);
    }

    gameOver() {
        this.isGameActive = false;
        
        if (this.levelTimer) {
            this.levelTimer.remove();
        }
        
        const overlay = this.add.rectangle(600, 600, 1200, 1200, 0x000000, 0.7);
        const gameOverText = this.add.text(600, 500, 'GAME OVER', {
            fontFamily: 'Courier New',
            fontSize: '72px',
            color: '#ff4444'
        }).setOrigin(0.5);
        
        const restartButton = this.uiManager.createTextButton(600, 650, 'RETRY', () => {
            this.startGame();
        });
        
        const menuButton = this.uiManager.createTextButton(600, 750, 'MENU', () => {
            this.returnToMainMenu();
        });
        
        gameOverText.setScale(0);
        this.tweens.add({
            targets: gameOverText,
            scaleX: 1,
            scaleY: 1,
            duration: 1000,
            ease: 'Bounce.out'
        });
    }

    returnToMainMenu() {
        this.isGameActive = false;
        
        if (this.levelTimer) {
            this.levelTimer.remove();
        }
        
        if (this.player && this.player.sprite) {
            this.player.sprite.destroy();
        }
        
        this.enemies.forEach(enemy => enemy.sprite && enemy.sprite.destroy());
        this.traps.forEach(trap => trap.sprite && trap.sprite.destroy());
        this.keys.forEach(key => key.sprite && key.sprite.destroy());
        this.doors.forEach(door => door.sprite && door.sprite.destroy());
        this.fakeFloors.forEach(floor => floor.sprite && floor.sprite.destroy());
        
        this.children.removeAll();
        this.uiManager.clearUI();
        this.uiManager.createMainMenu();
    }
}