const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const socket = io.connect();

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

let drawing = false;
let lastX = 0;
let lastY = 0;
let color = context.strokeStyle;
let penSize = context.lineWidth;
let eraserSize = context.lineWidth;
let isErasing = false;

socket.on('draw', (data) => {
    const { x0, y0, x1, y1, color, penSize } = data;
    drawLine(x0, y0, x1, y1, color, penSize, false);
});

socket.on('erase', (data) => {
    const { x, y, eraserSize } = data;
    eraseSpot(x, y, eraserSize, false);
});

socket.on('clear', () => {
    clearCanvasAll(false);
});

/* ********************* Listeners ********************* */

canvas.addEventListener('mousedown', (event) => {
    drawing = true;
    if (isErasing) {
        erase(event);
    } else {
        [lastX, lastY] = getMousePos(event);
    }
});

canvas.addEventListener('mouseup', () => drawing = false);

canvas.addEventListener('mouseout', () => drawing = false);

canvas.addEventListener('mousemove', (event) => {
    if (drawing && isErasing) {
        erase(event);
    } else if (drawing) {
        draw(event);
    }
});

document.getElementById('colorPicker').addEventListener('change', () => {
    context.strokeStyle = document.getElementById('colorPicker').value;
    color = context.strokeStyle;
});

document.getElementById('eraserToggle').addEventListener('change', (event) => {
    isErasing = event.target.checked;
});

document.getElementById('sizePicker').addEventListener('change', () => {
    context.lineWidth = document.getElementById('sizePicker').value;
    penSize = context.lineWidth;
});

document.getElementById('gridToggle').addEventListener('change', () => {
    const canvas = document.getElementById('whiteboard');
    canvas.classList.toggle('grid-overlay');
});

document.getElementById('eraserToggle').addEventListener('change', (event) => {
    isErasing = event.target.checked;
});

/* ********************* Functions ********************* */
//Tracks the pen movements
function draw(event) {
    if (!drawing || isErasing) return;
    const [x, y] = getMousePos(event);
    drawLine(lastX, lastY, x, y, color, penSize, true);
    [lastX, lastY] = [x, y];
}
//Draws
function drawLine(x0, y0, x1, y1, color, penSize, emit = true) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = penSize;
    context.lineCap = 'round';
    context.stroke();
    context.closePath();

    if (!emit) return;

    socket.emit('draw', { x0, y0, x1, y1, color, penSize });
}

function eraseSpot(x, y, eraserSize, emit = true) {

    context.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize)


    if (!emit) return;

    socket.emit('erase', { x, y, eraserSize });
}
//Erases the pen drawings
function erase(event) {
    const [x, y] = getMousePos(event);
    eraserSize = context.lineWidth;
    eraseSpot(x, y, eraserSize, true);
}

//clears the Canvas
function clearCanvas(clearCanvas = true) {
    clearCanvasAll(emit = true);

}

//Clears the canvas
function clearCanvasAll(emit = true) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!emit) return;
    socket.emit('clear');
}


//Get mouse Position
function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}
