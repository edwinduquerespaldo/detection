// Carga dinámica de TensorFlow.js y pose-detection
async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const video = document.createElement('video');
video.setAttribute('autoplay', '');
video.setAttribute('playsinline', '');
video.style.display = 'none';
document.body.appendChild(video);
const canvas = document.getElementById('canvas');
const statusDiv = document.getElementById('status');
const ctx = canvas.getContext('2d');
const mazeCanvas = document.getElementById('maze');
const mazeCtx = mazeCanvas.getContext('2d');
let detector = null;
let player = { x: 30, y: 30, size: 20 };
// Laberinto con salida en la esquina inferior derecha
let maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,0,1,0,0,1,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
  [1,1,1,1,0,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,0,1,1,1,1,1,1,1,1,1,1,0,0] // salida en (14,8)
];
let cellSize = 20;
let lastMove = 0;
let moveDelay = 200; // ms

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve();
    };
  });
}

function drawMaze() {
  mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 1) {
        mazeCtx.fillStyle = '#222';
        mazeCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
  // Salida
  mazeCtx.fillStyle = '#0f0';
  mazeCtx.fillRect((maze[0].length-1)*cellSize, (maze.length-1)*cellSize, cellSize, cellSize);
  // Jugador
  mazeCtx.fillStyle = '#00f';
  mazeCtx.beginPath();
  mazeCtx.arc(player.x, player.y, player.size/2, 0, 2*Math.PI);
  mazeCtx.fill();
}

function movePlayer(dx, dy) {
  let newX = player.x + dx;
  let newY = player.y + dy;
  let gridX = Math.floor(newX / cellSize);
  let gridY = Math.floor(newY / cellSize);
  if (maze[gridY] && maze[gridY][gridX] === 0) {
    player.x = newX;
    player.y = newY;
  }
  drawMaze();
  // Verifica si llegó a la salida
  if (gridX === maze[0].length-1 && gridY === maze.length-1) {
    setTimeout(()=>alert('¡Felicidades! Has salido del laberinto.'), 100);
  }
}

function detectHeadDirection(keypoints, cWidth, cHeight, vWidth, vHeight) {
  const nose = keypoints.find(k => k.name === 'nose');
  if (!nose || nose.score < 0.5) return null;
  const scaleX = cWidth / vWidth;
  const scaleY = cHeight / vHeight;
  // Reflejar X respecto al canvas
  const noseX = cWidth - (nose.x * scaleX);
  const noseY = nose.y * scaleY;
  if (!detectHeadDirection.cx) detectHeadDirection.cx = noseX;
  if (!detectHeadDirection.cy) detectHeadDirection.cy = noseY;
  const cx = detectHeadDirection.cx;
  const cy = detectHeadDirection.cy;
  const dx = noseX - cx;
  const dy = noseY - cy;
  const thresholdX = 30;
  const thresholdY = 20;
  if (dx > thresholdX) return 'right';
  if (dx < -thresholdX) return 'left';
  if (dy > thresholdY) return 'down';
  if (dy < -thresholdY) return 'up';
  return null;
}

// Permitir recalibrar el centro con doble click
canvas.addEventListener('dblclick', () => {
  detectHeadDirection.cx = undefined;
  detectHeadDirection.cy = undefined;
});

async function detectFrame() {
  // Efecto espejo: voltear el canvas horizontalmente antes de dibujar el video
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();
  const poses = await detector.estimatePoses(video);
  if (poses.length > 0) {
    const keypoints = poses[0].keypoints;
    // Ajustar coordenadas de la nariz al tamaño del canvas y reflejar en X
    const nose = keypoints.find(k => k.name === 'nose');
    if (nose && nose.score > 0.5) {
      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;
      // Reflejar X respecto al canvas
      const noseX = canvas.width - (nose.x * scaleX);
      const noseY = nose.y * scaleY;
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.arc(noseX, noseY, 8, 0, 2 * Math.PI);
      ctx.fill();
      // Actualizar centro de referencia para el control
      if (!detectHeadDirection.cx) detectHeadDirection.cx = noseX;
      if (!detectHeadDirection.cy) detectHeadDirection.cy = noseY;
    }
    // Detecta dirección
    const now = Date.now();
    // Pasar noseX y noseY reflejados a la función de control
    const dir = detectHeadDirection(keypoints, canvas.width, canvas.height, video.videoWidth, video.videoHeight);
    if (dir && now - lastMove > moveDelay) {
      if (dir === 'right') movePlayer(cellSize, 0);
      if (dir === 'left') movePlayer(-cellSize, 0);
      if (dir === 'up') movePlayer(0, -cellSize);
      if (dir === 'down') movePlayer(0, cellSize);
      lastMove = now;
    }
  }
  requestAnimationFrame(detectFrame);
}

async function main() {
  await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.18.0/dist/tf-core.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.18.0/dist/tf-converter.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.18.0/dist/tf-backend-webgl.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection');
  await setupCamera();
  video.width = 320;
  video.height = 240;
  canvas.width = 320;
  canvas.height = 240;
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {modelType: 'SinglePose.Lightning'});
  statusDiv.textContent = '¡Controla con tu cabeza!';
  drawMaze();
  detectFrame();
}

main();
