class LevelManager {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: "Tutorial",
                gridSize: 11,
                enemies: 0,
                fakeFloors: 0,
                keys: 0,
                traps: 0,
                timeLimit: null,
                checkpoint: { x: 5, y: 5 }
            },
            {
                id: 2,
                name: "Easy Path",
                gridSize: 15,
                enemies: 1,
                fakeFloors: 2,
                keys: 1,
                traps: 1,
                timeLimit: 300,
                checkpoint: null
            },
            {
                id: 3,
                name: "Trap Zone",
                gridSize: 17,
                enemies: 1,
                fakeFloors: 3,
                keys: 1,
                traps: 2,
                timeLimit: 240,
                checkpoint: { x: 8, y: 8 }
            },
            {
                id: 4,
                name: "Button Maze",
                gridSize: 19,
                enemies: 2,
                fakeFloors: 4,
                keys: 1,
                traps: 3,
                timeLimit: 200,
                checkpoint: null
            },
            {
                id: 5,
                name: "Half Floors",
                gridSize: 21,
                enemies: 2,
                fakeFloors: 5,
                keys: 1,
                traps: 4,
                timeLimit: 180,
                checkpoint: { x: 10, y: 10 }
            },
            {
                id: 6,
                name: "Elevator Trap",
                gridSize: 23,
                enemies: 3,
                fakeFloors: 6,
                keys: 2,
                traps: 5,
                timeLimit: 160,
                checkpoint: null
            },
            {
                id: 7,
                name: "Night Maze",
                gridSize: 25,
                enemies: 3,
                fakeFloors: 7,
                keys: 2,
                traps: 6,
                timeLimit: 140,
                checkpoint: { x: 12, y: 12 }
            },
            {
                id: 8,
                name: "Puzzle Trap",
                gridSize: 27,
                enemies: 4,
                fakeFloors: 8,
                keys: 2,
                traps: 7,
                timeLimit: 120,
                checkpoint: null
            },
            {
                id: 9,
                name: "Before Boss",
                gridSize: 29,
                enemies: 4,
                fakeFloors: 9,
                keys: 3,
                traps: 8,
                timeLimit: 100,
                checkpoint: { x: 14, y: 14 }
            },
            {
                id: 10,
                name: "Final Boss",
                gridSize: 31,
                enemies: 5,
                fakeFloors: 10,
                keys: 3,
                traps: 9,
                timeLimit: 90,
                checkpoint: null,
                hasBoss: true
            }
        ];
        
        this.currentLevel = 0;
        this.progress = this.loadProgress();
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('mazeEscapeProgress');
            if (saved) {
                const progress = JSON.parse(saved);
                // Валидация данных прогресса
                if (!progress.completed || !Array.isArray(progress.completed)) {
                    progress.completed = [];
                }
                if (!progress.stars || typeof progress.stars !== 'object') {
                    progress.stars = {};
                }
                return progress;
            }
            return { completed: [], stars: {} };
        } catch {
            return { completed: [], stars: {} };
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('mazeEscapeProgress', JSON.stringify(this.progress));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }

    getCurrentLevel() {
        return this.levels[this.currentLevel];
    }

    nextLevel() {
        if (this.currentLevel < this.levels.length - 1) {
            this.currentLevel++;
            return true;
        }
        return false;
    }

    setLevel(levelId) {
        const levelIndex = this.levels.findIndex(l => l.id === levelId);
        if (levelIndex !== -1) {
            this.currentLevel = levelIndex;
            return true;
        }
        return false;
    }

    completeLevel(stars) {
        const levelId = this.levels[this.currentLevel].id;
        if (!this.progress.completed.includes(levelId)) {
            this.progress.completed.push(levelId);
        }
        // Гарантируем, что stars будет между 0 и 3
        const safeStars = Math.max(0, Math.min(3, stars));
        this.progress.stars[levelId] = Math.max(
            this.progress.stars[levelId] || 0, 
            safeStars
        );
        this.saveProgress();
    }

    getStars(levelId) {
        const stars = this.progress.stars[levelId];
        // Гарантируем, что возвращаемое значение всегда будет между 0 и 3
        if (stars === undefined || stars === null) {
            return 0;
        }
        return Math.max(0, Math.min(3, stars));
    }

    isCompleted(levelId) {
        return this.progress.completed.includes(levelId);
    }

    resetProgress() {
        this.progress = { completed: [], stars: {} };
        this.saveProgress();
    }
}