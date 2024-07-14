const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const socket = io.connect();

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

let drawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousedown', (event) => {
    drawing = true;
    [lastX, lastY] = getMousePos(event);
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', draw);

socket.on('draw', (data) => {
    const { x0, y0, x1, y1, color } = data;
    drawLine(x0, y0, x1, y1, color, false);
});

let isErasing = false;

document.getElementById('colorPicker').addEventListener('change', () => {
    context.strokeStyle = document.getElementById('colorPicker').value;
    if (color === '#ffffff' || color.toLowerCase() === 'white') {
        isErasing = true;
    } else {
        isErasing = false;
        context.strokeStyle = color;
    }
});

document.getElementById('eraserToggle').addEventListener('change', (event) => {
    isErasing = event.target.checked;
    if (isErasing) {
        context.strokeStyle = '#fff'; // Use white color for erasing
    } else {
        context.strokeStyle = document.getElementById('colorPicker').value;
    }
});


document.getElementById('sizePicker').addEventListener('change', () => {
    context.lineWidth = document.getElementById('sizePicker').value;
});

function draw(event) {
    if (!drawing) return;

/*    const data = {
        x: e.clientX - canvas.offsetLeft,
        y: e.clientY - canvas.offsetTop,
        color: document.getElementById('colorPicker').value,
        size: document.getElementById('sizePicker').value,
    };
*/
    const [x, y] = getMousePos(event);
    if (isErasing) {
        drawLine(lastX, lastY, x, y, '#fff', true); // Use background color for erasing
    } else {
        drawLine(lastX, lastY, x, y, context.strokeStyle, true);
    }
    [lastX, lastY] = [x, y];
}

function drawLine(x0, y0, x1, y1, color, emit = true) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = context.color;
    context.lineWidth = context.lineWidth;
    context.lineCap = 'round';
    context.stroke();
    context.closePath();

    if (!emit) return;

    socket.emit('draw', { x0, y0, x1, y1, color });
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}

document.getElementById('gridToggle').addEventListener('change', () => {
    const canvas = document.getElementById('whiteboard');
    canvas.classList.toggle('grid-overlay');
});
/*
const gridSize = 50; // Size of each grid cell
let showGrid = false;

// Event listener for grid toggle
document.getElementById('gridToggle').addEventListener('change', () => {
    showGrid = document.getElementById('gridToggle').checked;
    redrawCanvas(); // Redraw canvas to show/hide grid
});

function drawGrid() {
    context.strokeStyle = '#ddd';
    context.lineWidth = 1;

    // Vertical lines
    for (let x = gridSize; x < canvas.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
    }

    // Horizontal lines
    for (let y = gridSize; y < canvas.height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);   
        context.lineTo(canvas.width, y);
        context.stroke();
    }
    context.strokeStyle = context.color;
}

function redrawCanvas() {
    //context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Redraw grid if showGrid is true
    if (showGrid) {
        drawGrid();
    }
}

redrawCanvas();

*/
