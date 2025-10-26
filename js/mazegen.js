class MazeGenerator {
    constructor() {
        this.directions = [
            { x: 0, y: -2 },
            { x: 2, y: 0 },
            { x: 0, y: 2 },
            { x: -2, y: 0 }
        ];
    }

    generateMaze(width, height) {
        const maze = Array(height).fill().map(() => Array(width).fill(1));
        const startX = 1;
        const startY = 1;
        
        this.carvePassages(startX, startY, maze);
        
        maze[startY][startX] = 2;
        maze[height - 2][width - 2] = 3;
        
        return maze;
    }

    carvePassages(x, y, maze) {
        const dirs = [...this.directions].sort(() => Math.random() - 0.5);
        
        for (const dir of dirs) {
            const nx = x + dir.x;
            const ny = y + dir.y;
            
            if (nx > 0 && nx < maze[0].length - 1 && 
                ny > 0 && ny < maze.length - 1 && 
                maze[ny][nx] === 1) {
                
                maze[y + dir.y / 2][x + dir.x / 2] = 0;
                maze[ny][nx] = 0;
                
                this.carvePassages(nx, ny, maze);
            }
        }
    }

    placeTraps(maze, difficulty) {
        const traps = [];
        const fakeFloors = [];
        
        const trapProbability = 0.01 + (difficulty * 0.005);
        const fakeFloorProbability = 0.005 + (difficulty * 0.01);
        
        const safeCells = [];
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[0].length; x++) {
                if (maze[y][x] === 0) {
                    const startDist = Math.sqrt((x - 1) ** 2 + (y - 1) ** 2);
                    const exitDist = Math.sqrt((x - (maze[0].length - 2)) ** 2 + (y - (maze.length - 2)) ** 2);
                    
                    if (startDist > 3 && exitDist > 3) {
                        safeCells.push({ x, y });
                    }
                }
            }
        }
        
        safeCells.forEach(cell => {
            if (Math.random() < trapProbability) {
                traps.push({ x: cell.x, y: cell.y, type: 'spike' });
            }
            if (Math.random() < fakeFloorProbability) {
                fakeFloors.push({ x: cell.x, y: cell.y });
                maze[cell.y][cell.x] = 4;
            }
        });
        
        return { traps, fakeFloors };
    }

    spawnEnemies(maze, count, type = 'patrol') {
        const enemies = [];
        const safeCells = [];
        
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[0].length; x++) {
                if (maze[y][x] === 0) {
                    const startDist = Math.sqrt((x - 1) ** 2 + (y - 1) ** 2);
                    const exitDist = Math.sqrt((x - (maze[0].length - 2)) ** 2 + (y - (maze.length - 2)) ** 2);
                    
                    if (startDist > 4 && exitDist > 4) {
                        safeCells.push({ x, y });
                    }
                }
            }
        }
        
        const shuffled = [...safeCells].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            enemies.push({
                x: shuffled[i].x,
                y: shuffled[i].y,
                type: type,
                health: type === 'boss' ? 3 : 1,
                speed: type === 'flyer' ? 50 : 30
            });
        }
        
        return enemies;
    }

    placeKeysAndDoors(maze, keyCount) {
        const keys = [];
        const doors = [];
        const emptyCells = [];
        
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[0].length; x++) {
                if (maze[y][x] === 0) emptyCells.push({ x, y });
            }
        }
        
        const shuffledKeys = [...emptyCells].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(keyCount, shuffledKeys.length); i++) {
            keys.push({
                x: shuffledKeys[i].x,
                y: shuffledKeys[i].y,
                id: i
            });
        }
        
        const possibleDoorPositions = [];
        for (let y = 1; y < maze.length - 1; y++) {
            for (let x = 1; x < maze[0].length - 1; x++) {
                if (maze[y][x] === 1) {
                    const neighbors = [
                        { x: x, y: y - 1 }, { x: x, y: y + 1 },
                        { x: x - 1, y: y }, { x: x + 1, y: y }
                    ];
                    
                    if (neighbors.some(n => maze[n.y] && maze[n.y][n.x] === 0)) {
                        possibleDoorPositions.push({ x, y });
                    }
                }
            }
        }
        
        const shuffledDoors = [...possibleDoorPositions].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(keyCount, shuffledDoors.length); i++) {
            doors.push({
                x: shuffledDoors[i].x,
                y: shuffledDoors[i].y,
                keyId: i,
                isLocked: true
            });
        }
        
        return { keys, doors };
    }
}