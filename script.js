const smallGrid = document.getElementById('small-grid');
const mainGrid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const teleportButton = document.getElementById('teleport-button');
const smallGridSize = 5;
const mainGridSize = 20;
let blockPosition = { x: 0, y: 0 };
let trailPositions = [];
let moveDelay = 300; // Default delay in milliseconds for normal blocks
let rareMoveDelay = 1200; // Delay in milliseconds for rare blocks
let score = 0;
let isMoving = false; // Flag to indicate if the block is currently moving
const rareTileProbability = 0.05; // Probability of a cell being a rare tile
const ultraRareTileProbability = 1 / 2000; // Probability of a cell being an ultra-rare tile
let inSmallGrid = true; // Flag to indicate if the block is in the smaller grid

// Create small grid cells
for (let i = 0; i < smallGridSize * smallGridSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    smallGrid.appendChild(cell);
}

// Create main grid cells
for (let i = 0; i < mainGridSize * mainGridSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    if (Math.random() < ultraRareTileProbability) {
        cell.classList.add('ultra-rare');
    } else if (Math.random() < rareTileProbability) {
        cell.classList.add('rare');
    }
    mainGrid.appendChild(cell);
}

const smallCells = document.querySelectorAll('#small-grid .cell');
const mainCells = document.querySelectorAll('#grid .cell');

function updateBlockPosition() {
    const cells = inSmallGrid ? smallCells : mainCells;
    const gridSize = inSmallGrid ? smallGridSize : mainGridSize;

    if (!inSmallGrid) {
        trailPositions.forEach(pos => {
            const index = pos.y * gridSize + pos.x;
            cells[index].classList.add('trail');
        });
    }

    const index = blockPosition.y * gridSize + blockPosition.x;
    cells[index].classList.remove('trail'); // Remove trail class if present
    cells[index].classList.add('block');
}

function clearPreviousBlockPosition() {
    const cells = inSmallGrid ? smallCells : mainCells;
    const gridSize = inSmallGrid ? smallGridSize : mainGridSize;

    const index = blockPosition.y * gridSize + blockPosition.x;
    cells[index].classList.remove('block');
}

function teleportToOtherGrid() {
    clearPreviousBlockPosition();
    inSmallGrid = !inSmallGrid;
    blockPosition = { x: 0, y: 0 }; // Reset position in the other grid
    trailPositions = []; // Clear trail positions when transitioning
    updateBlockPosition();
}

function moveBlock(event) {
    if (isMoving) return; // Prevent multiple moves at the same time
    isMoving = true;

    const nextPosition = { ...blockPosition };
    const gridSize = inSmallGrid ? smallGridSize : mainGridSize;

    switch (event.key) {
        case 'ArrowUp':
            if (blockPosition.y > 0) nextPosition.y--;
            break;
        case 'ArrowDown':
            if (blockPosition.y < gridSize - 1) nextPosition.y++;
            break;
        case 'ArrowLeft':
            if (blockPosition.x > 0) nextPosition.x--;
            break;
        case 'ArrowRight':
            if (blockPosition.x < gridSize - 1) nextPosition.x++;
            break;
        case ' ':
            teleportToOtherGrid();
            isMoving = false;
            return;
        default:
            isMoving = false;
            return;
    }

    if (nextPosition.x !== blockPosition.x || nextPosition.y !== blockPosition.y) {
        const cells = inSmallGrid ? smallCells : mainCells;
        const nextIndex = nextPosition.y * gridSize + nextPosition.x;
        const hasTrail = cells[nextIndex].classList.contains('trail');
        const isRare = cells[nextIndex].classList.contains('rare');
        const isUltraRare = cells[nextIndex].classList.contains('ultra-rare');

        let delay = inSmallGrid ? 0 : moveDelay;
        if (isRare) {
            delay = rareMoveDelay;
        } else if (hasTrail) {
            delay = 0;
        }

        setTimeout(() => {
            if (!inSmallGrid) {
                trailPositions.push({ ...blockPosition });
            }
            clearPreviousBlockPosition();
            blockPosition = nextPosition;
            updateBlockPosition();
            if (isUltraRare) {
                score += 1000;
                cells[nextIndex].classList.remove('ultra-rare'); // Remove ultra-rare class after collecting
            } else if (isRare) {
                score += 50;
                cells[nextIndex].classList.remove('rare'); // Remove rare class after collecting
            } else if (!hasTrail && !inSmallGrid) {
                score++;
            }
            scoreDisplay.textContent = `Score: ${score}`;
            isMoving = false; // Allow the next move
        }, delay);
    } else {
        isMoving = false; // Allow the next move if no position change
    }
}

teleportButton.addEventListener('click', teleportToOtherGrid);
document.addEventListener('keydown', moveBlock);
updateBlockPosition();
