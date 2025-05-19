const video = document.getElementById('freezeVideo');
const canvas = document.getElementById('freezeCanvas');
const ctx = canvas.getContext('2d');
const modoSelect = document.getElementById('modo');
const startBtn = document.getElementById('startBtn');

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 360;
const LINE_SPEED = 1; // Más despacio

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
video.width = CANVAS_WIDTH;
video.height = CANVAS_HEIGHT;

let running = false;
let modo = 'horizontal';
let frozenImage = null;
let freezeLine = 0;

modoSelect.addEventListener('change', () => {
  modo = modoSelect.value;
});

startBtn.addEventListener('click', () => {
  if (!running) {
    running = true;
    startBtn.textContent = 'Detener';
    freezeLine = 0;
    frozenImage = ctx.createImageData(canvas.width, canvas.height);
    requestAnimationFrame(drawFrame);
  } else {
    running = false;
    startBtn.textContent = 'Iniciar';
  }
});

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve();
  });
}

function drawFrame() {
  if (!running) return;
  // Efecto espejo solo para horizontal
  if (modo === 'horizontal') {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  } else {
    // En vertical, aplicar también efecto espejo para que izquierda/derecha sean naturales
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }
  if (modo === 'horizontal') {
    freezeLine = Math.min(freezeLine + LINE_SPEED, CANVAS_HEIGHT);
    if (freezeLine > 0) {
      let liveData = ctx.getImageData(0, 0, CANVAS_WIDTH, freezeLine);
      for (let y = 0; y < freezeLine; y++) {
        for (let x = 0; x < CANVAS_WIDTH; x++) {
          let idx = (y * CANVAS_WIDTH + x) * 4;
          if (frozenImage.data[idx+3] === 0) {
            frozenImage.data[idx] = liveData.data[idx];
            frozenImage.data[idx+1] = liveData.data[idx+1];
            frozenImage.data[idx+2] = liveData.data[idx+2];
            frozenImage.data[idx+3] = liveData.data[idx+3];
          }
        }
      }
      ctx.putImageData(frozenImage, 0, 0, 0, 0, CANVAS_WIDTH, freezeLine);
    }
    ctx.save();
    ctx.strokeStyle = '#eebbc3';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, freezeLine);
    ctx.lineTo(CANVAS_WIDTH, freezeLine);
    ctx.stroke();
    ctx.restore();
  } else {
    freezeLine = Math.min(freezeLine + LINE_SPEED, CANVAS_WIDTH);
    if (freezeLine > 0) {
      let liveData = ctx.getImageData(0, 0, freezeLine, CANVAS_HEIGHT);
      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        for (let x = 0; x < freezeLine; x++) {
          let idx = (y * CANVAS_WIDTH + x) * 4;
          let srcIdx = (y * freezeLine + x) * 4;
          if (frozenImage.data[idx+3] === 0) {
            frozenImage.data[idx] = liveData.data[srcIdx];
            frozenImage.data[idx+1] = liveData.data[srcIdx+1];
            frozenImage.data[idx+2] = liveData.data[srcIdx+2];
            frozenImage.data[idx+3] = liveData.data[srcIdx+3];
          }
        }
      }
      ctx.putImageData(frozenImage, 0, 0, 0, 0, freezeLine, CANVAS_HEIGHT);
    }
    ctx.save();
    ctx.strokeStyle = '#eebbc3';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(freezeLine, 0);
    ctx.lineTo(freezeLine, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.restore();
  }
  if ((modo === 'horizontal' && freezeLine < CANVAS_HEIGHT) || (modo === 'vertical' && freezeLine < CANVAS_WIDTH)) {
    requestAnimationFrame(drawFrame);
  } else {
    running = false;
    startBtn.textContent = 'Iniciar';
  }
}

setupCamera();
