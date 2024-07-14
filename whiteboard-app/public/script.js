const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

let painting = false;

const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    drawFromData(data);
};

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    context.beginPath();
}

function draw(e) {
    if (!painting) return;

    const data = {
        x: e.clientX - canvas.offsetLeft,
        y: e.clientY - canvas.offsetTop,
        color: document.getElementById('colorPicker').value,
        size: document.getElementById('sizePicker').value,
    };

    drawFromData(data);
    ws.send(JSON.stringify(data));
}

function drawFromData(data) {
    context.lineWidth = data.size;
    context.lineCap = 'round';
    context.strokeStyle = data.color;

    context.lineTo(data.x, data.y);
    context.stroke();
    context.beginPath();
    context.moveTo(data.x, data.y);
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

window.addEventListener('resize', () => {
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    context.putImageData(imgData, 0, 0);
});
