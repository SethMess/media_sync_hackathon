const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const socket = io.connect();

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

function draw(event) {
    if (!drawing) return;

    const [x, y] = getMousePos(event);
    drawLine(lastX, lastY, x, y, 'black', true);
    [lastX, lastY] = [x, y];
}

function drawLine(x0, y0, x1, y1, color, emit = true) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) return;

    socket.emit('draw', { x0, y0, x1, y1, color });
}

function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}
